"use client";

import type { Task } from "@/types/task";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface TaskContractPreviewProps {
  task: Task | null;
}

export function TaskContractPreview({ task }: TaskContractPreviewProps) {
  if (!task) {
    return (
      <Card className="min-h-[200px] flex items-center justify-center">
        <p className="text-sm text-text-muted italic">
          Create a task to see the contract preview
        </p>
      </Card>
    );
  }

  const preview = {
    id: task.id,
    status: task.status,
    contract: task.contract,
    providerId: task.providerId ?? null,
    escrowAmount: task.escrowAmount ?? null,
    eventsCount: task.events.length,
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">
          Task Contract
        </h3>
        <StatusBadge status={task.status} />
      </div>
      <pre className="overflow-auto rounded-lg bg-surface-base p-3 text-xs font-mono text-text-secondary leading-relaxed">
        {JSON.stringify(preview, null, 2)}
      </pre>
    </Card>
  );
}
