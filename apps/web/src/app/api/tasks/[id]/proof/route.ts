import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, badRequest, notFound, conflict, serverError } from "@/lib/apiResponse";
import { transition } from "@/lib/stateMachine";
import { computeProofHash } from "@/lib/taskHash";
import type { TaskStatus, TaskAction } from "@/types/task";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);

    if (!body?.artifacts && !body?.notes) {
      return badRequest("artifacts or notes required");
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !task) return notFound("Task not found");

    // Validate: IN_PROGRESS → PROOF_SUBMITTED
    let nextStatus: TaskStatus;
    try {
      nextStatus = transition(task.status as TaskStatus, "SUBMIT_PROOF" as TaskAction);
    } catch {
      return conflict(`Cannot submit proof from status ${task.status}`);
    }

    const artifacts = body.artifacts ?? [];
    const notes = body.notes ?? "";
    const proofHash = computeProofHash(artifacts, notes);

    // Insert proof
    const { error: proofErr } = await supabase.from("proofs").insert({
      task_id: id,
      artifacts,
      proof_hash: proofHash,
      notes,
    });

    if (proofErr) return serverError(proofErr.message);

    // Update task status
    const { error: updateErr } = await supabase
      .from("tasks")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateErr) return serverError(updateErr.message);

    await supabase.from("task_events").insert({
      task_id: id,
      action: "SUBMIT_PROOF",
      from_status: task.status,
      to_status: nextStatus,
      metadata: { proof_hash: proofHash },
    });

    return ok({ id, status: nextStatus, proofHash });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Internal server error");
  }
}
