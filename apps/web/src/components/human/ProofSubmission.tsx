"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ProofSubmissionProps {
  taskId: string;
  onSubmit: (data: {
    confirmationCode: string;
    notes: string;
  }) => void;
}

export function ProofSubmission({ onSubmit }: ProofSubmissionProps) {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!confirmationCode.trim()) return;
    onSubmit({ confirmationCode: confirmationCode.trim(), notes: notes.trim() });
  };

  return (
    <Card>
      <h4 className="text-xs font-semibold text-text-secondary tracking-wide uppercase mb-4">
        Submit Proof
      </h4>
      <div className="flex flex-col gap-4">
        <Input
          label="Confirmation Code"
          placeholder="e.g., RES-2024-1234"
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
        />
        <Textarea
          label="Notes"
          placeholder="Additional details about task completion..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
        <div className="rounded-xl border border-dashed border-border/60 bg-surface-base/20 p-6 text-center transition-colors hover:border-border-hover/60 hover:bg-surface-base/30 cursor-pointer">
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-8 w-8 rounded-lg bg-surface-highlight/30 flex items-center justify-center text-text-muted/40 text-sm">
              +
            </div>
            <p className="text-xs text-text-muted/60">
              Drag & drop files or click to upload
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!confirmationCode.trim()}
          size="sm"
        >
          Submit Proof
        </Button>
      </div>
    </Card>
  );
}
