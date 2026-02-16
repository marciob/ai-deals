import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, badRequest, notFound, conflict, serverError } from "@/lib/apiResponse";
import {
  escrowExists,
  verifyDeposit,
  createServerEscrow,
} from "@/lib/chain";
import { parseEther, type Hash } from "viem";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);

    if (!body?.depositTxHash) {
      return badRequest("depositTxHash is required");
    }

    const depositTxHash = body.depositTxHash as Hash;

    // Load task
    const { data: task, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !task) return notFound("Task not found");

    if (task.status !== "POSTED") {
      return conflict(`Task is not in POSTED status (current: ${task.status})`);
    }

    if (!task.budget_amount || task.budget_amount <= 0) {
      return badRequest("Task has no budget — escrow not needed");
    }

    // Check if escrow already exists
    const hasEscrow = await escrowExists(id);
    if (hasEscrow) {
      return conflict("Escrow already funded for this task");
    }

    // Verify the deposit transaction on-chain
    const budgetWei = parseEther(String(task.budget_amount));
    const deposit = await verifyDeposit(depositTxHash, budgetWei);

    if (!deposit.valid) {
      return badRequest(
        "Deposit verification failed: transaction must be successful, sent to the server wallet, and cover the full budget amount"
      );
    }

    // Create on-chain escrow forwarding the MON
    const escrowTx = await createServerEscrow(
      id,
      task.task_hash as `0x${string}`,
      budgetWei
    );

    // Update task with escrow tx
    const { error: updateErr } = await supabase
      .from("tasks")
      .update({
        escrow_tx: escrowTx,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) return serverError(updateErr.message);

    // Record fund event
    await supabase.from("task_events").insert({
      task_id: id,
      action: "FUND",
      from_status: task.status,
      to_status: task.status,
      tx_hash: escrowTx,
      metadata: { depositTxHash, funder: deposit.from },
    });

    return ok({ id, status: task.status, escrowTx });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Internal server error");
  }
}
