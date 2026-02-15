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
      <Card>
        <p className="text-sm text-text-muted italic">
          No incoming requests
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-text-primary">
        Incoming Requests
      </h3>
      {requests.map((task) => (
        <Card key={task.id}>
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-text-primary">
                  {task.contract.goal}
                </p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status} />
                  <span className="text-xs text-text-muted">
                    {task.contract.capability}
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium text-text-secondary">
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
