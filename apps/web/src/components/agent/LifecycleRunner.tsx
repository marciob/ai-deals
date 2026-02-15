"use client";

import { useState, useCallback } from "react";
import type { TaskContract } from "@/types/task";
import type { Provider } from "@/types/provider";
import { useTask } from "@/hooks/useTask";
import { useWalletAddress } from "@/hooks/useWalletAddress";
import { useLifecycleRunner } from "@/hooks/useLifecycleRunner";
import * as api from "@/lib/api";
import { apiTaskToTask, apiProviderToProvider } from "@/lib/mappers";
import { TaskCreator } from "./TaskCreator";
import { TaskContractPreview } from "./TaskContractPreview";
import { ProviderRanking } from "./ProviderRanking";
import { ReceiptView } from "./ReceiptView";
import { EventTimeline } from "@/components/ui/EventTimeline";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function LifecycleRunner() {
  const address = useWalletAddress();
  const { state, dispatch } = useTask();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [phase, setPhase] = useState<
    "create" | "providers" | "running" | "complete"
  >("create");

  const activeTask = activeTaskId
    ? state.tasks.find((t) => t.id === activeTaskId) ?? null
    : null;

  const lifecycle = useLifecycleRunner(activeTaskId ?? "", selectedProvider);

  const handleCreateTask = useCallback(
    async (contract: TaskContract) => {
      const apiTask = await api.createTask({
        capability: contract.capability,
        goal: contract.goal,
        budgetAmount: contract.maxBudget,
        slaSeconds: contract.slaSeconds,
        urgent: contract.urgent,
        currency: contract.currency,
        requesterAddress: address,
      });
      const task = apiTaskToTask(apiTask);
      dispatch({ type: "ADD_TASK", task });
      setActiveTaskId(task.id);

      const apiProviders = await api.fetchProviders(
        contract.capability,
        contract.urgent
      );
      const ranked = apiProviders.map(apiProviderToProvider);
      setProviders(ranked);

      if (ranked.length > 0) {
        setSelectedProvider(ranked[0]);
      }
      setPhase("providers");
    },
    [dispatch, address]
  );

  const handleRunAgent = useCallback(async () => {
    if (!activeTaskId || !selectedProvider) return;
    setPhase("running");
    await lifecycle.run();
    setPhase("complete");
  }, [activeTaskId, selectedProvider, lifecycle]);

  const handleReset = useCallback(() => {
    setActiveTaskId(null);
    setProviders([]);
    setSelectedProvider(null);
    setPhase("create");
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {phase === "create" && (
            <Card>
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Define Task
              </h3>
              <TaskCreator onCreateTask={handleCreateTask} />
            </Card>
          )}

          {phase === "providers" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <ProviderRanking
                providers={providers}
                selectedId={selectedProvider?.id}
              />
              <div className="flex gap-3">
                <Button onClick={handleRunAgent} disabled={!selectedProvider}>
                  Run Agent Lifecycle
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {phase === "running" && (
            <Card glow>
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Agent Running
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse-subtle" />
                  <span className="text-sm text-text-primary font-medium">
                    Step {lifecycle.currentStep + 1} of {lifecycle.totalSteps}
                  </span>
                  {lifecycle.currentAction && (
                    <span className="text-xs text-text-muted font-mono bg-surface-overlay px-2 py-0.5 rounded-md">
                      {lifecycle.currentAction}
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-surface-highlight overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500 ease-[var(--ease-snappy)]"
                    style={{
                      width: `${((lifecycle.currentStep + 1) / lifecycle.totalSteps) * 100}%`,
                    }}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={lifecycle.cancel}
                  className="self-start"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {phase === "complete" && activeTask && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <ReceiptView task={activeTask} provider={selectedProvider} />
              <Button variant="secondary" onClick={handleReset}>
                Start New Task
              </Button>
            </div>
          )}

          {lifecycle.error && (
            <Card className="!border-status-timed-out/30">
              <p className="text-sm text-status-timed-out">
                {lifecycle.error}
              </p>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <TaskContractPreview task={activeTask} />
          {activeTask && activeTask.events.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Event Log
              </h3>
              <EventTimeline events={activeTask.events} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
