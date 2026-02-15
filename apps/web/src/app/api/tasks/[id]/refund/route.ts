import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, notFound, conflict, serverError } from "@/lib/apiResponse";
import { transition } from "@/lib/stateMachine";
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

    // Check SLA expiry
    const createdAt = new Date(task.created_at).getTime();
    const slaMs = (task.sla_seconds ?? 3600) * 1000;
    const now = Date.now();

    if (now < createdAt + slaMs) {
      return conflict(
        `SLA has not expired yet. ${Math.ceil((createdAt + slaMs - now) / 1000)}s remaining`
      );
    }

    // TIMEOUT first, then REFUND
    let status = task.status as TaskStatus;
    const steps: { action: TaskAction; from: TaskStatus; to: TaskStatus }[] = [];

    // If not already timed out, apply TIMEOUT
    if (status !== "TIMED_OUT") {
      try {
        const next = transition(status, "TIMEOUT" as TaskAction);
        steps.push({ action: "TIMEOUT" as TaskAction, from: status, to: next });
        status = next;
      } catch {
        return conflict(`Cannot timeout from status ${status}`);
      }
    }

    // TIMED_OUT → REFUNDED
    try {
      const next = transition(status, "REFUND" as TaskAction);
      steps.push({ action: "REFUND" as TaskAction, from: status, to: next });
      status = next;
    } catch {
      return conflict(`Cannot refund from status ${status}`);
    }

    const { error: updateErr } = await supabase
      .from("tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateErr) return serverError(updateErr.message);

    await supabase.from("task_events").insert(
      steps.map((s) => ({
        task_id: id,
        action: s.action,
        from_status: s.from,
        to_status: s.to,
      }))
    );

    return ok({ id, status });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Internal server error");
  }
}
