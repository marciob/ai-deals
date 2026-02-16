import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, badRequest, notFound, serverError } from "@/lib/apiResponse";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const status = req.nextUrl.searchParams.get("status");

    if (!status) {
      return badRequest("status query parameter is required");
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .select("id, status, updated_at")
      .eq("id", id)
      .single();

    if (error || !task) return notFound("Task not found");

    if (task.status === status) {
      // Fetch full task when ready
      const { data: fullTask, error: fullErr } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (fullErr || !fullTask) return serverError("Failed to fetch task");

      return ok({ ready: true, task: fullTask });
    }

    return ok({ ready: false, currentStatus: task.status });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Internal server error");
  }
}
