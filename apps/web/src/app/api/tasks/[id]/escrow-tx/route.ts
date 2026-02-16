import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, badRequest, notFound, serverError } from "@/lib/apiResponse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body?.txHash) return badRequest("txHash is required");

    const { data: task, error } = await supabase
      .from("tasks")
      .select("id")
      .eq("id", id)
      .single();

    if (error || !task) return notFound("Task not found");

    const { error: updateErr } = await supabase
      .from("tasks")
      .update({
        escrow_tx: body.txHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) return serverError(updateErr.message);

    return ok({ id, escrowTx: body.txHash });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Internal server error");
  }
}
