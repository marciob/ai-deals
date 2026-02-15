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
    <div className="glass inner-light rounded-2xl p-5 border-l-2 border-l-accent/50">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        {description && (
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
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
