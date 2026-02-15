"use client";

import { SAMPLE_BUSINESS_TASKS } from "@/data/sampleTasks";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DecisionPanel } from "@/components/ui/DecisionPanel";
import { formatCurrency } from "@/lib/formatting";

export function IncomingRequests() {
  const requests = SAMPLE_BUSINESS_TASKS;

  if (requests.length === 0) {
    return (
      <Card className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-text-muted/60">
          No incoming requests
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
        Incoming Requests
      </h3>
      {requests.map((task) => (
        <Card key={task.id}>
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text-primary leading-snug">
                  {task.contract.goal}
                </p>
                <div className="flex items-center gap-2.5">
                  <StatusBadge status={task.status} />
                  <span className="text-[11px] text-text-muted font-mono">
                    {task.contract.capability}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-text-primary font-mono flex-shrink-0">
                {formatCurrency(task.contract.maxBudget, task.contract.currency)}
              </span>
            </div>
            <DecisionPanel
              title="Respond to Request"
              description={`Budget: up to ${formatCurrency(task.contract.maxBudget, task.contract.currency)} · SLA: ${task.contract.slaSeconds / 60}m`}
              confirmLabel="Accept"
              rejectLabel="Decline"
              onConfirm={() => {}}
              onReject={() => {}}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
