"use client";

import type { Task } from "@/types/task";
import type { Provider } from "@/types/provider";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TxHashChip } from "@/components/ui/TxHashChip";
import { formatCurrency } from "@/lib/formatting";

interface ReceiptViewProps {
  task: Task;
  provider: Provider | null;
}

export function ReceiptView({ task, provider }: ReceiptViewProps) {
  const lastEvent = task.events[task.events.length - 1];

  return (
    <Card glow>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-text-primary">
          Task Receipt
        </h3>
        <StatusBadge status={task.status} />
      </div>

      <div className="flex flex-col gap-3">
        <Row label="Task ID" value={task.id} mono />
        <Row label="Goal" value={task.contract.goal} />
        <Row label="Capability" value={task.contract.capability} />
        {provider && <Row label="Provider" value={provider.name} />}
        {task.escrowAmount != null && (
          <Row
            label="Amount"
            value={formatCurrency(task.escrowAmount, task.contract.currency)}
            highlight
          />
        )}
        <Row label="Events" value={String(task.events.length)} />
        {lastEvent?.txHash && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-text-muted">Last TX</span>
            <TxHashChip hash={lastEvent.txHash} />
          </div>
        )}
      </div>
    </Card>
  );
}

function Row({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-xs text-text-muted flex-shrink-0">{label}</span>
      <span
        className={`text-sm text-right ${mono ? "font-mono text-xs text-text-muted" : ""} ${
          highlight ? "font-semibold text-status-paid" : "text-text-secondary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
