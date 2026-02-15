"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/types/task";
import * as api from "@/lib/api";
import { apiTaskToTask } from "@/lib/mappers";
import { TaskInbox } from "@/components/human/TaskInbox";
import { TaskDetail } from "@/components/human/TaskDetail";

export function HumanPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const apiTasks = await api.fetchTasks();
      setTasks(apiTasks.map(apiTaskToTask));
    } catch {
      // silently fail — tasks will be empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const humanStatuses = new Set([
    "ACCEPTED",
    "IN_PROGRESS",
    "PROOF_SUBMITTED",
    "PROOF_REJECTED",
  ]);
  const humanTasks = tasks.filter((t) => humanStatuses.has(t.status));
  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) ?? null
    : null;

  const handleTaskAction = async () => {
    // Reload tasks after any action
    await loadTasks();
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="card-elevated rounded-2xl flex items-center justify-center min-h-[200px]">
            <p className="text-sm text-text-muted">Loading tasks...</p>
          </div>
        ) : (
          <TaskInbox
            tasks={humanTasks}
            onSelectTask={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
          />
        )}
        <div>
          {selectedTask ? (
            <TaskDetail task={selectedTask} onAction={handleTaskAction} />
          ) : (
            <div className="card-elevated rounded-2xl flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-surface-highlight flex items-center justify-center">
                  <span className="text-text-muted text-xl">?</span>
                </div>
                <p className="text-sm text-text-muted">
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
