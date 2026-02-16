"use client";

import { useState, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = "image/*,.pdf";

interface ProofSubmissionProps {
  taskId: string;
  onSubmit: (data: {
    notes: string;
    artifacts: { type: string; value: string }[];
  }) => void;
}

export function ProofSubmission({ taskId, onSubmit }: ProofSubmissionProps) {
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: File[]) => {
      setError(null);
      const total = files.length + incoming.length;
      if (total > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed`);
        return;
      }
      for (const f of incoming) {
        if (f.size > MAX_SIZE) {
          setError(`"${f.name}" exceeds 10 MB limit`);
          return;
        }
      }
      const newFiles = [...files, ...incoming];
      setFiles(newFiles);

      // Generate previews for images
      const newPreviews = [...previews];
      for (const f of incoming) {
        if (f.type.startsWith("image/")) {
          newPreviews.push(URL.createObjectURL(f));
        } else {
          newPreviews.push(""); // non-image placeholder
        }
      }
      setPreviews(newPreviews);
    },
    [files, previews]
  );

  const removeFile = (index: number) => {
    const url = previews[index];
    if (url) URL.revokeObjectURL(url);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  };

  const handleSubmit = async () => {
    if (!notes.trim() && files.length === 0) return;
    setError(null);

    let artifacts: { type: string; value: string }[] = [];

    if (files.length > 0) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("taskId", taskId);
        for (const f of files) {
          formData.append("files", f);
        }
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Upload failed");
          setUploading(false);
          return;
        }
        artifacts = (json.urls as string[]).map((url) => ({
          type: "url",
          value: url,
        }));
      } catch {
        setError("Upload failed. Please try again.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onSubmit({ notes: notes.trim(), artifacts });
  };

  const canSubmit = notes.trim() || files.length > 0;

  return (
    <Card>
      <h4 className="text-sm font-semibold text-text-primary mb-4">
        Submit Proof
      </h4>
      <div className="flex flex-col gap-4">
        <Textarea
          label="Proof details"
          placeholder="Describe what was done, include any reference codes, links, or details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        {/* File upload area */}
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className={`rounded-xl border border-dashed p-6 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-border bg-surface-overlay hover:border-border-hover"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(Array.from(e.target.files));
              e.target.value = "";
            }}
          />
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-8 w-8 rounded-lg bg-surface-highlight flex items-center justify-center text-text-muted text-sm">
              +
            </div>
            <p className="text-xs text-text-muted">
              Drag & drop files or click to upload
            </p>
            <p className="text-[10px] text-text-muted/60">
              Images or PDF. Max 5 files, 10 MB each.
            </p>
          </div>
        </div>

        {/* File previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="relative group rounded-lg overflow-hidden border border-border bg-surface-overlay"
              >
                {previews[i] ? (
                  <img
                    src={previews[i]}
                    alt={f.name}
                    className="h-16 w-16 object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center text-[10px] text-text-muted px-1 text-center">
                    {f.name.length > 12
                      ? f.name.slice(0, 9) + "..." + f.name.split(".").pop()
                      : f.name}
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || uploading}
          size="sm"
        >
          {uploading ? "Uploading..." : "Submit Proof"}
        </Button>
      </div>
    </Card>
  );
}
