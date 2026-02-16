import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { badRequest, serverError } from "@/lib/apiResponse";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;
const BUCKET = "proofs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const taskId = formData.get("taskId");

    if (!taskId || typeof taskId !== "string") {
      return badRequest("taskId is required");
    }

    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return badRequest("At least one file is required");
    }

    if (files.length > MAX_FILES) {
      return badRequest(`Maximum ${MAX_FILES} files allowed`);
    }

    // Validate file sizes
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return badRequest(`File "${file.name}" exceeds 10MB limit`);
      }
    }

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((b) => b.name === BUCKET)) {
      const { error: bucketErr } = await supabase.storage.createBucket(BUCKET, {
        public: true,
      });
      if (bucketErr && !bucketErr.message.includes("already exists")) {
        return serverError(`Failed to create bucket: ${bucketErr.message}`);
      }
    }

    const urls: string[] = [];

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const ext = file.name.split(".").pop() ?? "bin";
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${taskId}/${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadErr) {
        return serverError(`Upload failed: ${uploadErr.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      urls.push(urlData.publicUrl);
    }

    return NextResponse.json({ urls }, { status: 200 });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : "Upload failed");
  }
}
