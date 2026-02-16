import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, created, badRequest, conflict, serverError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("capabilities")
      .select("*")
      .order("created_at");

    if (error) return serverError(error.message);
    return ok(data);
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Internal server error");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body");

    const { name, description, inputsSchema, proofPolicy } = body;

    if (!name || !description) {
      return badRequest("name and description are required");
    }

    const id = String(name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data: existing } = await supabase
      .from("capabilities")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (existing) {
      return conflict(`Capability "${id}" already exists`);
    }

    const { data, error } = await supabase
      .from("capabilities")
      .insert({
        id,
        name: String(name).trim(),
        description: String(description).trim(),
        inputs_schema: inputsSchema ?? {},
        proof_policy: proofPolicy ?? "photo_confirmation",
      })
      .select()
      .single();

    if (error) return serverError(error.message);
    return created(data);
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Internal server error");
  }
}
