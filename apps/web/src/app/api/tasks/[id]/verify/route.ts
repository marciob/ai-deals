import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, badRequest, notFound, conflict, serverError } from "@/lib/apiResponse";
import { transition } from "@/lib/stateMachine";
import type { TaskStatus, TaskAction } from "@/types/task";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  const approved = body?.approved ?? true;
  const verificationNotes = body?.notes ?? "";

  const { data: task, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !task) return notFound("Task not found");

  if (approved) {
    // PROOF_SUBMITTED → VERIFIED → PAID → CLOSED
    let status = task.status as TaskStatus;
    const steps: { action: TaskAction; from: TaskStatus; to: TaskStatus }[] = [];

    for (const action of ["VERIFY", "PAY", "CLOSE"] as TaskAction[]) {
      try {
        const next = transition(status, action);
        steps.push({ action, from: status, to: next });
        status = next;
      } catch {
        return conflict(`Cannot ${action} from status ${status}`);
      }
    }

    // Update proof verification status
    await supabase
      .from("proofs")
      .update({
        verification_status: "approved",
        verification_notes: verificationNotes,
      })
      .eq("task_id", id);

    // Update task to final status
    const { error: updateErr } = await supabase
      .from("tasks")
      .update({
        status,
        payout_tx: body?.payoutTx ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) return serverError(updateErr.message);

    // Record all events
    await supabase.from("task_events").insert(
      steps.map((s) => ({
        task_id: id,
        action: s.action,
        from_status: s.from,
        to_status: s.to,
        tx_hash: s.action === "PAY" ? (body?.payoutTx ?? null) : null,
      }))
    );

    return ok({ id, status });
  } else {
    // Reject: PROOF_SUBMITTED → PROOF_REJECTED
    let nextStatus: TaskStatus;
    try {
      nextStatus = transition(task.status as TaskStatus, "REJECT_PROOF" as TaskAction);
    } catch {
      return conflict(`Cannot reject proof from status ${task.status}`);
    }

    await supabase
      .from("proofs")
      .update({
        verification_status: "rejected",
        verification_notes: verificationNotes,
      })
      .eq("task_id", id);

    const { error: updateErr } = await supabase
      .from("tasks")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateErr) return serverError(updateErr.message);

    await supabase.from("task_events").insert({
      task_id: id,
      action: "REJECT_PROOF",
      from_status: task.status,
      to_status: nextStatus,
      metadata: { notes: verificationNotes },
    });

    return ok({ id, status: nextStatus });
  }
}
