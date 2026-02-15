import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, serverError } from "@/lib/apiResponse";

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
