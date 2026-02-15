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
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-primary">
          Task Receipt
        </h3>
        <StatusBadge status={task.status} />
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <Row label="Task ID" value={task.id} mono />
        <Row label="Goal" value={task.contract.goal} />
        <Row label="Capability" value={task.contract.capability} />
        {provider && <Row label="Provider" value={provider.name} />}
        {task.escrowAmount != null && (
          <Row
            label="Amount"
            value={formatCurrency(task.escrowAmount, task.contract.currency)}
          />
        )}
        <Row label="Events" value={String(task.events.length)} />
        {lastEvent?.txHash && (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Last TX</span>
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
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-text-muted flex-shrink-0">{label}</span>
      <span
        className={`text-text-secondary text-right ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
