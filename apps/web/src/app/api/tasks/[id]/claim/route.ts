import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, badRequest, notFound, conflict, serverError } from "@/lib/apiResponse";
import { transition } from "@/lib/stateMachine";
import type { TaskStatus, TaskAction } from "@/types/task";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body?.walletAddress) return badRequest("walletAddress is required");

    // Load task
    const { data: task, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !task) return notFound("Task not found");

    // Only human-targeted tasks can be claimed
    if (task.target !== "human") {
      return conflict("Only human-targeted tasks can be claimed");
    }

    // Validate state transition: POSTED → IN_PROGRESS via CLAIM
    let nextStatus: TaskStatus;
    try {
      nextStatus = transition(task.status as TaskStatus, "CLAIM" as TaskAction);
    } catch {
      return conflict(`Cannot claim from status ${task.status}`);
    }

    // Update task
    const { error: updateErr } = await supabase
      .from("tasks")
      .update({
        status: nextStatus,
        claimed_by: body.walletAddress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) return serverError(updateErr.message);

    // Record CLAIM event
    await supabase.from("task_events").insert({
      task_id: id,
      action: "CLAIM",
      from_status: task.status,
      to_status: nextStatus,
      metadata: { claimed_by: body.walletAddress },
    });

    return ok({ id, status: nextStatus, claimedBy: body.walletAddress });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Internal server error");
  }
}
