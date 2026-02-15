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
    <div className="flex flex-col gap-4 animate-fade-in">
      <Card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary leading-snug">
              {task.contract.goal}
            </h3>
            <div className="mt-2 flex items-center gap-2.5 flex-wrap">
              <StatusBadge status={task.status} />
              <span className="text-xs text-text-muted font-mono">
                {formatCurrency(
                  task.escrowAmount ?? task.contract.maxBudget,
                  task.contract.currency
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-text-muted/60 uppercase tracking-wide font-medium">SLA</span>
            <SLATimer deadline={deadline} />
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl bg-surface-base/30 px-4 py-2.5 text-xs text-text-secondary">
          <span>
            <span className="text-text-muted mr-1">Capability</span>
            {task.contract.capability}
          </span>
          {task.providerId && (
            <span>
              <span className="text-text-muted mr-1">Provider</span>
              {task.providerId}
            </span>
          )}
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
          <h4 className="text-xs font-semibold text-text-secondary tracking-wide uppercase mb-4">
            Event History
          </h4>
          <EventTimeline events={task.events} />
        </Card>
      )}
    </div>
  );
}
