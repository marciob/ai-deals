import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, badRequest, notFound, conflict, serverError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.apiKey || !body?.walletAddress) {
    return badRequest("apiKey and walletAddress are required");
  }

  const { data: key, error } = await supabase
    .from("agent_keys")
    .select("*")
    .eq("api_key", body.apiKey)
    .single();

  if (error || !key) return notFound("API key not found");
  if (key.claimed) return conflict("API key already claimed");

  const { error: updateErr } = await supabase
    .from("agent_keys")
    .update({
      wallet_address: body.walletAddress,
      claimed: true,
    })
    .eq("id", key.id);

  if (updateErr) return serverError(updateErr.message);

  return ok({
    id: key.id,
    agentName: key.agent_name,
    walletAddress: body.walletAddress,
    claimed: true,
  });
}
