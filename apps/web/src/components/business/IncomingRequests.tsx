"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/types/task";
import * as api from "@/lib/api";
import { apiTaskToTask } from "@/lib/mappers";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DecisionPanel } from "@/components/ui/DecisionPanel";
import { formatCurrency } from "@/lib/formatting";

export function IncomingRequests() {
  const [requests, setRequests] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const tasks = await api.fetchTasks("POSTED");
      setRequests(tasks.map(apiTaskToTask));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (taskId: string) => {
    try {
      // Match with the first available provider, then accept
      const providers = await api.fetchProviders();
      if (providers.length > 0) {
        await api.matchTask(taskId, providers[0].id);
        await api.acceptTask(taskId);
      }
      await loadRequests();
    } catch {
      // TODO: show error toast
    }
  };

  const handleDecline = async (_taskId: string) => {
    // No decline API yet — just remove from view
    await loadRequests();
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-primary">Incoming Requests</h3>
        <Card className="flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-text-muted">Loading requests...</p>
        </Card>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-text-muted">
          No incoming requests
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-text-primary">
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
                <div className="flex items-center gap-2">
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
              onConfirm={() => handleAccept(task.id)}
              onReject={() => handleDecline(task.id)}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
