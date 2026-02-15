"use client";

import { useState, useCallback } from "react";
import type { TaskContract } from "@/types/task";
import type { Provider } from "@/types/provider";
import { useTask } from "@/hooks/useTask";
import { useLifecycleRunner } from "@/hooks/useLifecycleRunner";
import { getProviders } from "@/services/mockProviderService";
import { createTask } from "@/services/mockTaskService";
import { TaskCreator } from "./TaskCreator";
import { TaskContractPreview } from "./TaskContractPreview";
import { ProviderRanking } from "./ProviderRanking";
import { ReceiptView } from "./ReceiptView";
import { EventTimeline } from "@/components/ui/EventTimeline";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function LifecycleRunner() {
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
      const task = await createTask(contract);
      dispatch({ type: "ADD_TASK", task });
      setActiveTaskId(task.id);

      const ranked = await getProviders(contract.capability, contract.urgent);
      setProviders(ranked);

      if (ranked.length > 0) {
        setSelectedProvider(ranked[0]);
      }
      setPhase("providers");
    },
    [dispatch]
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
              <h3 className="text-xs font-semibold text-text-secondary tracking-wide uppercase mb-4">
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
              <Button onClick={handleRunAgent} disabled={!selectedProvider}>
                Run Agent Lifecycle
              </Button>
            </div>
          )}

          {phase === "running" && (
            <Card glow className="animate-pulse-glow">
              <h3 className="text-xs font-semibold text-text-secondary tracking-wide uppercase mb-4">
                Agent Running
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-3 w-3">
                    <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-40" />
                    <div className="relative h-3 w-3 rounded-full bg-accent" />
                  </div>
                  <span className="text-sm text-text-primary font-medium">
                    Step {lifecycle.currentStep + 1} of {lifecycle.totalSteps}
                  </span>
                  {lifecycle.currentAction && (
                    <span className="text-xs text-text-muted font-mono bg-surface-base/50 px-2 py-0.5 rounded">
                      {lifecycle.currentAction}
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-surface-base/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-[oklch(0.60_0.24_300)] transition-all duration-500 ease-[var(--ease-snappy)]"
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
            <Card className="border-status-timed-out/30">
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
              <h3 className="text-xs font-semibold text-text-secondary tracking-wide uppercase mb-4">
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
