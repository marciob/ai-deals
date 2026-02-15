"use client";

import type { Task } from "@/types/task";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SLATimer } from "./SLATimer";
import { formatCurrency } from "@/lib/formatting";

interface TaskInboxProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
  selectedTaskId: string | null;
}

export function TaskInbox({
  tasks,
  onSelectTask,
  selectedTaskId,
}: TaskInboxProps) {
  if (tasks.length === 0) {
    return (
      <Card className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-surface-highlight/30 flex items-center justify-center">
            <span className="text-text-muted/40 text-lg">0</span>
          </div>
          <p className="text-sm text-text-muted/60">
            No tasks in your inbox
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
        Task Inbox
      </h3>
      {tasks.map((task) => {
        const deadline = task.createdAt + task.contract.slaSeconds * 1000;
        const isSelected = selectedTaskId === task.id;
        return (
          <Card
            key={task.id}
            hover
            className={isSelected ? "!border-accent/40 glow-accent-sm" : ""}
            onClick={() => onSelectTask(task.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 min-w-0">
                <p className="text-sm font-medium text-text-primary leading-snug">
                  {task.contract.goal}
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <StatusBadge status={task.status} />
                  <span className="text-xs text-text-muted font-mono">
                    {formatCurrency(
                      task.escrowAmount ?? task.contract.maxBudget,
                      task.contract.currency
                    )}
                  </span>
                  {task.contract.urgent && (
                    <span className="text-[10px] font-bold text-status-proof-submitted bg-status-proof-submitted/10 px-1.5 py-0.5 rounded">
                      URGENT
                    </span>
                  )}
                </div>
              </div>
              <SLATimer deadline={deadline} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
