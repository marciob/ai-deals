import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, created, badRequest, serverError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const capability = searchParams.get("capability");
  const urgent = searchParams.get("urgent");

  let query = supabase.from("providers").select("*");

  if (capability) {
    query = query.contains("capability_ids", [capability]);
  }

  const { data, error } = await query.order("rating", { ascending: false });

  if (error) return serverError(error.message);

  let providers = data ?? [];

  // If urgent, favour faster providers (lower eta) with higher success rate
  if (urgent === "true") {
    providers = providers.sort((a, b) => {
      const scoreA = a.success_rate * 100 - a.eta_minutes;
      const scoreB = b.success_rate * 100 - b.eta_minutes;
      return scoreB - scoreA;
    });
  }

  return ok(providers);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body");

    const { name, businessName, description, aiInstructions, walletAddress, capabilityIds, price, etaMinutes } = body;

    if (!name || !walletAddress) {
      return badRequest("name and walletAddress are required");
    }

    const { data: provider, error } = await supabase
      .from("providers")
      .insert({
        name,
        business_name: businessName ?? "",
        description: description ?? "",
        ai_instructions: aiInstructions ?? "",
        wallet_address: walletAddress,
        type: "human",
        capability_ids: capabilityIds ?? [],
        price: price ?? 0,
        eta_minutes: etaMinutes ?? 60,
        rating: 5.0,
        success_rate: 1.0,
        stake_amount: 0,
      })
      .select()
      .single();

    if (error) return serverError(error.message);

    return created(provider);
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Internal server error");
  }
}
