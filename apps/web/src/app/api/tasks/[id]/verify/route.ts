import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, notFound, conflict, serverError } from "@/lib/apiResponse";
import { transition } from "@/lib/stateMachine";
import { releaseEscrow, escrowExists } from "@/lib/chain";
import type { TaskStatus, TaskAction } from "@/types/task";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

      // On-chain release if task has budget
      let payoutTx: string | null = null;
      if (task.budget_amount > 0) {
        const hasEscrow = await escrowExists(id);
        if (hasEscrow) {
          // Load provider wallet address
          const { data: provider } = await supabase
            .from("providers")
            .select("wallet_address")
            .eq("id", task.provider_id)
            .single();

          if (!provider?.wallet_address) {
            return serverError("Provider wallet address not found");
          }

          // Get proof hash from proofs table
          const { data: proof } = await supabase
            .from("proofs")
            .select("proof_hash")
            .eq("task_id", id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const proofHash = (proof?.proof_hash ?? "0x" + "0".repeat(64)) as `0x${string}`;

          payoutTx = await releaseEscrow(id, provider.wallet_address, proofHash);
        }
      }

      // Update task to final status
      const { error: updateErr } = await supabase
        .from("tasks")
        .update({
          status,
          payout_tx: payoutTx,
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
          tx_hash: s.action === "PAY" ? payoutTx : null,
        }))
      );

      return ok({ id, status, payoutTx });
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
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Internal server error");
  }
}
