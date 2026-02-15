"use client";

import { useState, useCallback } from "react";
import type { Task, TaskContract } from "@/types/task";
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

      // Fetch providers
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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Creator / Controls */}
        <div className="flex flex-col gap-4">
          {phase === "create" && (
            <Card>
              <h3 className="text-sm font-medium text-text-primary mb-3">
                Define Task
              </h3>
              <TaskCreator onCreateTask={handleCreateTask} />
            </Card>
          )}

          {phase === "providers" && (
            <>
              <ProviderRanking
                providers={providers}
                selectedId={selectedProvider?.id}
              />
              <Button onClick={handleRunAgent} disabled={!selectedProvider}>
                Run Agent Lifecycle
              </Button>
            </>
          )}

          {phase === "running" && (
            <Card>
              <h3 className="text-sm font-medium text-text-primary mb-3">
                Agent Running
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm text-text-secondary">
                    Step {lifecycle.currentStep + 1} of {lifecycle.totalSteps}
                    {lifecycle.currentAction &&
                      ` — ${lifecycle.currentAction}`}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-surface-base overflow-hidden">
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
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {phase === "complete" && activeTask && (
            <>
              <ReceiptView task={activeTask} provider={selectedProvider} />
              <Button variant="secondary" onClick={handleReset}>
                Start New Task
              </Button>
            </>
          )}

          {lifecycle.error && (
            <Card className="border-status-timed-out/30">
              <p className="text-sm text-status-timed-out">
                {lifecycle.error}
              </p>
            </Card>
          )}
        </div>

        {/* Right column: Preview + Timeline */}
        <div className="flex flex-col gap-4">
          <TaskContractPreview task={activeTask} />
          {activeTask && activeTask.events.length > 0 && (
            <Card>
              <h3 className="text-sm font-medium text-text-primary mb-3">
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
