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
      <h4 className="text-sm font-medium text-text-primary mb-3">
        Submit Proof
      </h4>
      <div className="flex flex-col gap-3">
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
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-dashed border-border bg-surface-base p-4 text-center">
            <p className="text-xs text-text-muted">
              File upload placeholder — drag & drop or click
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
