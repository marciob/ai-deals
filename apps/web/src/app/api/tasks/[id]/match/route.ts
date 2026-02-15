import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, badRequest, notFound, conflict, serverError } from "@/lib/apiResponse";
import { transition } from "@/lib/stateMachine";
import { isEligible } from "@/lib/chain";
import type { Address } from "viem";
import type { TaskStatus, TaskAction } from "@/types/task";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.providerId) return badRequest("providerId is required");

  // Load task
  const { data: task, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !task) return notFound("Task not found");

  // Validate state transition: POSTED → MATCHED
  let nextStatus: TaskStatus;
  try {
    nextStatus = transition(task.status as TaskStatus, "MATCH" as TaskAction);
  } catch {
    return conflict(`Cannot match from status ${task.status}`);
  }

  // Load provider
  const { data: provider } = await supabase
    .from("providers")
    .select("*")
    .eq("id", body.providerId)
    .single();

  if (!provider) return notFound("Provider not found");

  // On-chain eligibility check
  const eligible = await isEligible(
    provider.wallet_address as Address,
    BigInt(Math.floor((task.min_stake ?? 0) * 1e18))
  );
  if (!eligible) return conflict("Provider does not meet minimum stake requirement");

  // Transition MATCHED → ESCROWED automatically
  let escrowedStatus: TaskStatus;
  try {
    escrowedStatus = transition(nextStatus, "ESCROW" as TaskAction);
  } catch {
    return conflict(`Cannot escrow from status ${nextStatus}`);
  }

  // Update task
  const { error: updateErr } = await supabase
    .from("tasks")
    .update({
      status: escrowedStatus,
      provider_id: body.providerId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateErr) return serverError(updateErr.message);

  // Record events
  await supabase.from("task_events").insert([
    {
      task_id: id,
      action: "MATCH",
      from_status: task.status,
      to_status: nextStatus,
      metadata: { provider_id: body.providerId },
    },
    {
      task_id: id,
      action: "ESCROW",
      from_status: nextStatus,
      to_status: escrowedStatus,
      tx_hash: body.escrowTx ?? null,
    },
  ]);

  return ok({ id, status: escrowedStatus, providerId: body.providerId });
}
