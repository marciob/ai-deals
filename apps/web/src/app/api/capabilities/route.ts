import { supabase } from "@/lib/supabase";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET() {
  const { data, error } = await supabase
    .from("capabilities")
    .select("*")
    .order("created_at");

  if (error) return serverError(error.message);
  return ok(data);
}
