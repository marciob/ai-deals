import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, created, badRequest, serverError } from "@/lib/apiResponse";
import { computeTaskHash } from "@/lib/taskHash";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");

  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return serverError(error.message);
  return ok(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const { capability, goal, budgetAmount, slaSeconds, urgent, requesterAddress } = body;

  if (!capability || !goal) {
    return badRequest("capability and goal are required");
  }

  const taskHash = computeTaskHash({
    capability,
    goal,
    budgetAmount: budgetAmount ?? 0,
    currency: body.currency ?? "MON",
    slaSeconds: slaSeconds ?? 3600,
    urgent: urgent ?? false,
  });

  // Compute minStake as 2x budget (simple heuristic)
  const minStake = (budgetAmount ?? 0) * 2;

  // Insert as DRAFT then auto-transition to POSTED
  const { data: task, error: insertErr } = await supabase
    .from("tasks")
    .insert({
      status: "POSTED",
      capability_id: capability,
      goal,
      budget_amount: budgetAmount ?? 0,
      currency: body.currency ?? "MON",
      sla_seconds: slaSeconds ?? 3600,
      urgent: urgent ?? false,
      min_stake: minStake,
      task_hash: taskHash,
      requester_address: requesterAddress ?? null,
    })
    .select()
    .single();

  if (insertErr) return serverError(insertErr.message);

  // Record the two transition events: DRAFT→POSTED
  await supabase.from("task_events").insert([
    {
      task_id: task.id,
      action: "POST",
      from_status: "DRAFT",
      to_status: "POSTED",
    },
  ]);

  return created(task);
}
