"use client";

import { useState, useEffect, useRef } from "react";
import { useTask } from "@/hooks/useTask";
import { SAMPLE_HUMAN_TASKS } from "@/data/sampleTasks";
import { TaskInbox } from "@/components/human/TaskInbox";
import { TaskDetail } from "@/components/human/TaskDetail";

export function HumanPanel() {
  const { state, dispatch } = useTask();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    for (const task of SAMPLE_HUMAN_TASKS) {
      dispatch({ type: "ADD_TASK", task });
    }
  }, [dispatch]);

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
    <section className="w-full max-w-5xl mx-auto px-4 animate-fade-in">
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
            <div className="glass inner-light rounded-2xl flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-surface-highlight/20 flex items-center justify-center">
                  <span className="text-text-muted/30 text-xl">?</span>
                </div>
                <p className="text-sm text-text-muted/50">
                  Select a task to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
