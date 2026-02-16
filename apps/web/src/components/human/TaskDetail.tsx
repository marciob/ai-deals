"use client";

import { useState } from "react";
import type { Task } from "@/types/task";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EscrowBadge } from "@/components/ui/EscrowBadge";
import { EventTimeline } from "@/components/ui/EventTimeline";
import { DecisionPanel } from "@/components/ui/DecisionPanel";
import { ProofSubmission } from "./ProofSubmission";
import { SLATimer } from "./SLATimer";
import { formatCurrency } from "@/lib/formatting";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as api from "@/lib/api";

interface TaskDetailProps {
  task: Task;
  onAction?: (action?: string) => void;
  walletAddress?: string;
}

export function TaskDetail({ task, onAction, walletAddress }: TaskDetailProps) {
  const deadline = task.createdAt + task.contract.slaSeconds * 1000;
  const [busy, setBusy] = useState(false);

  const handleClaim = async () => {
    if (!walletAddress) return;
    setBusy(true);
    try {
      await api.claimTask(task.id, walletAddress);
      onAction?.("claim");
    } catch {
      // TODO: show error toast
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async () => {
    setBusy(true);
    try {
      await api.acceptTask(task.id);
      onAction?.();
    } catch {
      // TODO: show error toast
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitProof = async (data: {
    confirmationCode: string;
    notes: string;
  }) => {
    setBusy(true);
    try {
      await api.submitProof(
        task.id,
        [{ type: "confirmation_code", label: "Confirmation", value: data.confirmationCode }],
        data.notes
      );
      onAction?.();
    } catch {
      // TODO: show error toast
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <Card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary leading-snug">
              {task.contract.goal}
            </h3>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <StatusBadge status={task.status} />
              <span className="text-xs text-text-muted font-mono">
                {formatCurrency(
                  task.escrowAmount ?? task.contract.maxBudget,
                  task.contract.currency
                )}
              </span>
              {task.contract.maxBudget > 0 && (
                <EscrowBadge funded={!!task.escrowTx} />
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[10px] text-text-muted uppercase tracking-wide font-medium">SLA</span>
            <SLATimer deadline={deadline} />
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl bg-surface-overlay px-4 py-2.5 text-xs text-text-secondary">
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

      {task.status === "POSTED" && walletAddress && (
        <DecisionPanel
          title="Claim This Task"
          description={`Claim to start working immediately. Budget: ${formatCurrency(task.contract.maxBudget, task.contract.currency)} · SLA: ${task.contract.slaSeconds / 60}m`}
          confirmLabel={busy ? "Claiming..." : "Claim Task"}
          onConfirm={handleClaim}
          loading={busy}
        />
      )}

      {task.status === "POSTED" && !walletAddress && (
        <Card>
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-text-primary">
              Connect Wallet to Claim
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              {`Budget: ${formatCurrency(task.contract.maxBudget, task.contract.currency)} · SLA: ${task.contract.slaSeconds / 60}m`}
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal, mounted }) => (
                <button
                  type="button"
                  onClick={openConnectModal}
                  disabled={!mounted}
                  className="cursor-pointer self-start rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </Card>
      )}

      {task.status === "ACCEPTED" && (
        <DecisionPanel
          title="Start Working"
          description="Accept this task and begin work. The SLA timer is running."
          confirmLabel={busy ? "Starting..." : "Start Task"}
          onConfirm={handleAccept}
        />
      )}

      {task.status === "IN_PROGRESS" && (
        <ProofSubmission taskId={task.id} onSubmit={handleSubmitProof} />
      )}

      {task.events.length > 0 && (
        <Card>
          <h4 className="text-sm font-semibold text-text-primary mb-4">
            Event History
          </h4>
          <EventTimeline events={task.events} />
        </Card>
      )}
    </div>
  );
}
