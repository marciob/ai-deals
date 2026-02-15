"use client";

import type { Task } from "@/types/task";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EventTimeline } from "@/components/ui/EventTimeline";
import { DecisionPanel } from "@/components/ui/DecisionPanel";
import { ProofSubmission } from "./ProofSubmission";
import { SLATimer } from "./SLATimer";
import { formatCurrency } from "@/lib/formatting";
import { useTask } from "@/hooks/useTask";

interface TaskDetailProps {
  task: Task;
}

export function TaskDetail({ task }: TaskDetailProps) {
  const { dispatch } = useTask();
  const deadline = task.createdAt + task.contract.slaSeconds * 1000;

  const handleAccept = () => {
    if (task.status === "ACCEPTED") {
      dispatch({ type: "TRANSITION", taskId: task.id, action: "START" });
    }
  };

  const handleSubmitProof = (data: {
    confirmationCode: string;
    notes: string;
  }) => {
    dispatch({
      type: "TRANSITION",
      taskId: task.id,
      action: "SUBMIT_PROOF",
      metadata: data,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-medium text-text-primary">
              {task.contract.goal}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={task.status} />
              <span className="text-xs text-text-muted">
                {formatCurrency(
                  task.escrowAmount ?? task.contract.maxBudget,
                  task.contract.currency
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-text-muted">SLA</span>
            <SLATimer deadline={deadline} />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs text-text-secondary">
          <span>Capability: {task.contract.capability}</span>
          {task.providerId && <span>Provider: {task.providerId}</span>}
        </div>
      </Card>

      {task.status === "ACCEPTED" && (
        <DecisionPanel
          title="Start Working"
          description="Accept this task and begin work. The SLA timer is running."
          confirmLabel="Start Task"
          onConfirm={handleAccept}
        />
      )}

      {task.status === "IN_PROGRESS" && (
        <ProofSubmission taskId={task.id} onSubmit={handleSubmitProof} />
      )}

      {task.events.length > 0 && (
        <Card>
          <h4 className="text-sm font-medium text-text-primary mb-3">
            Event History
          </h4>
          <EventTimeline events={task.events} />
        </Card>
      )}
    </div>
  );
}
