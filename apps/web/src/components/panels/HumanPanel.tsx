"use client";

import { useState, useEffect } from "react";
import { useTask } from "@/hooks/useTask";
import { SAMPLE_HUMAN_TASKS } from "@/data/sampleTasks";
import { TaskInbox } from "@/components/human/TaskInbox";
import { TaskDetail } from "@/components/human/TaskDetail";

export function HumanPanel() {
  const { state, dispatch } = useTask();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  // Seed sample tasks on first mount
  useEffect(() => {
    if (seeded) return;
    for (const task of SAMPLE_HUMAN_TASKS) {
      const exists = state.tasks.some((t) => t.id === task.id);
      if (!exists) {
        dispatch({ type: "ADD_TASK", task });
      }
    }
    setSeeded(true);
  }, [seeded, state.tasks, dispatch]);

  // Filter tasks relevant to human role (accepted, in-progress, proof states)
  const humanStatuses = new Set([
    "ACCEPTED",
    "IN_PROGRESS",
    "PROOF_SUBMITTED",
    "PROOF_REJECTED",
  ]);
  const humanTasks = state.tasks.filter((t) => humanStatuses.has(t.status));
  const selectedTask = selectedTaskId
    ? state.tasks.find((t) => t.id === selectedTaskId) ?? null
    : null;

  return (
    <section className="w-full max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskInbox
          tasks={humanTasks}
          onSelectTask={setSelectedTaskId}
          selectedTaskId={selectedTaskId}
        />
        <div>
          {selectedTask ? (
            <TaskDetail task={selectedTask} />
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-border border-dashed bg-surface-raised p-12 text-sm text-text-muted">
              Select a task to view details
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
