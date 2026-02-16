"use client";

import type { Task } from "@/types/task";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SLATimer } from "./SLATimer";
import { formatCurrency } from "@/lib/formatting";

type ListMode = "available" | "my";

interface TaskInboxProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
  selectedTaskId: string | null;
  title?: string;
  mode?: ListMode;
}

export function TaskInbox({
  tasks,
  onSelectTask,
  selectedTaskId,
  title = "Task Inbox",
  mode = "my",
}: TaskInboxProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <Card className="flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-surface-highlight flex items-center justify-center">
              <span className="text-text-muted text-lg">0</span>
            </div>
            <p className="text-sm text-text-muted">
              {mode === "available"
                ? "No tasks available to claim right now"
                : "You haven\u2019t claimed any tasks yet"}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-text-primary">
        {title}
      </h3>
      {tasks.map((task) => {
        const deadline = task.createdAt + task.contract.slaSeconds * 1000;
        const isSelected = selectedTaskId === task.id;
        return (
          <Card
            key={task.id}
            hover
            className={isSelected ? "!border-accent/30" : ""}
            onClick={() => onSelectTask(task.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 min-w-0">
                <p className="text-sm font-medium text-text-primary leading-snug">
                  {task.contract.goal}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {mode === "available" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide bg-accent/10 text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      Open
                    </span>
                  ) : (
                    <StatusBadge status={task.status} />
                  )}
                  <span className="text-xs text-text-muted font-mono">
                    {formatCurrency(
                      task.escrowAmount ?? task.contract.maxBudget,
                      task.contract.currency
                    )}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {task.contract.capability}
                  </span>
                  {task.contract.urgent && (
                    <span className="text-[10px] font-semibold text-status-proof-submitted bg-status-proof-submitted/8 px-1.5 py-0.5 rounded">
                      URGENT
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <SLATimer deadline={deadline} />
                {mode === "available" && (
                  <span className="text-[10px] text-accent font-medium">
                    Claim &rarr;
                  </span>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
