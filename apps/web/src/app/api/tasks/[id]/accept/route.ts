import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, notFound, conflict, serverError } from "@/lib/apiResponse";
import { transition } from "@/lib/stateMachine";
import { isEligible } from "@/lib/chain";
import type { Address } from "viem";
import type { TaskStatus, TaskAction } from "@/types/task";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: task, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !task) return notFound("Task not found");

    // Validate: ESCROWED → ACCEPTED
    let acceptedStatus: TaskStatus;
    try {
      acceptedStatus = transition(task.status as TaskStatus, "ACCEPT" as TaskAction);
    } catch {
      return conflict(`Cannot accept from status ${task.status}`);
    }

    // Re-check provider eligibility
    if (task.provider_id) {
      const { data: provider } = await supabase
        .from("providers")
        .select("wallet_address")
        .eq("id", task.provider_id)
        .single();

      if (provider) {
        const eligible = await isEligible(
          provider.wallet_address as Address,
          BigInt(Math.floor((task.min_stake ?? 0) * 1e18))
        );
        if (!eligible) return conflict("Provider no longer meets stake requirement");
      }
    }

    // Auto-transition ACCEPTED → IN_PROGRESS
    let inProgressStatus: TaskStatus;
    try {
      inProgressStatus = transition(acceptedStatus, "START" as TaskAction);
    } catch {
      return conflict(`Cannot start from status ${acceptedStatus}`);
    }

    const { error: updateErr } = await supabase
      .from("tasks")
      .update({ status: inProgressStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateErr) return serverError(updateErr.message);

    await supabase.from("task_events").insert([
      {
        task_id: id,
        action: "ACCEPT",
        from_status: task.status,
        to_status: acceptedStatus,
      },
      {
        task_id: id,
        action: "START",
        from_status: acceptedStatus,
        to_status: inProgressStatus,
      },
    ]);

    return ok({ id, status: inProgressStatus });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Internal server error");
  }
}
