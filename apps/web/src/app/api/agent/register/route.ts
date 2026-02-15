import { type NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { supabase } from "@/lib/supabase";
import { created, badRequest, serverError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.agentName) return badRequest("agentName is required");

  const apiKey = `aih_${randomBytes(24).toString("hex")}`;

  const { data, error } = await supabase
    .from("agent_keys")
    .insert({
      api_key: apiKey,
      agent_name: body.agentName,
    })
    .select()
    .single();

  if (error) return serverError(error.message);

  const claimUrl = `${req.nextUrl.origin}/api/agent/claim?key=${apiKey}`;

  return created({
    id: data.id,
    apiKey,
    agentName: data.agent_name,
    claimUrl,
  });
}
