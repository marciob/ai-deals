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
      <Card>
        <p className="text-sm text-text-muted italic">
          No tasks in your inbox
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-text-primary">Task Inbox</h3>
      {tasks.map((task) => {
        const deadline = task.createdAt + task.contract.slaSeconds * 1000;
        return (
          <Card
            key={task.id}
            hover
            className={`cursor-pointer ${
              selectedTaskId === task.id ? "border-accent/50" : ""
            }`}
            onClick={() => onSelectTask(task.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm text-text-primary truncate">
                  {task.contract.goal}
                </p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status} />
                  <span className="text-xs text-text-muted">
                    {formatCurrency(
                      task.escrowAmount ?? task.contract.maxBudget,
                      task.contract.currency
                    )}
                  </span>
                  {task.contract.urgent && (
                    <span className="text-[10px] text-status-proof-submitted font-medium">
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
