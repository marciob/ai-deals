import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, notFound } from "@/lib/apiResponse";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [taskRes, eventsRes, proofRes] = await Promise.all([
    supabase.from("tasks").select("*").eq("id", id).single(),
    supabase
      .from("task_events")
      .select("*")
      .eq("task_id", id)
      .order("created_at"),
    supabase
      .from("proofs")
      .select("*")
      .eq("task_id", id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (taskRes.error) return notFound("Task not found");

  return ok({
    ...taskRes.data,
    events: eventsRes.data ?? [],
    proof: proofRes.data?.[0] ?? null,
  });
}
