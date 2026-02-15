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
      <Card className="min-h-[220px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-surface-highlight/30 flex items-center justify-center">
            <span className="text-text-muted/40 font-mono text-lg">{"{ }"}</span>
          </div>
          <p className="text-sm text-text-muted/60">
            Create a task to see the contract preview
          </p>
        </div>
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
          Task Contract
        </h3>
        <StatusBadge status={task.status} />
      </div>
      <pre className="overflow-auto rounded-xl bg-surface-base/50 border border-border/50 p-4 text-xs font-mono text-text-secondary leading-relaxed">
        {JSON.stringify(preview, null, 2)}
      </pre>
    </Card>
  );
}
