"use client";

import { Button } from "./Button";

interface DecisionPanelProps {
  title: string;
  description?: string;
  confirmLabel: string;
  rejectLabel?: string;
  onConfirm: () => void;
  onReject?: () => void;
  loading?: boolean;
}

export function DecisionPanel({
  title,
  description,
  confirmLabel,
  rejectLabel,
  onConfirm,
  onReject,
  loading = false,
}: DecisionPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-raised p-4">
      <div>
        <h4 className="text-sm font-medium text-text-primary">{title}</h4>
        {description && (
          <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onConfirm} disabled={loading}>
          {loading ? "Processing..." : confirmLabel}
        </Button>
        {onReject && rejectLabel && (
          <Button
            variant="danger"
            size="sm"
            onClick={onReject}
            disabled={loading}
          >
            {rejectLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
