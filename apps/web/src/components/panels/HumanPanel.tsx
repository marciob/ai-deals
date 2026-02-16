"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task } from "@/types/task";
import * as api from "@/lib/api";
import { apiTaskToTask } from "@/lib/mappers";
import { useWalletAddress } from "@/hooks/useWalletAddress";
import { TaskInbox } from "@/components/human/TaskInbox";
import { TaskDetail } from "@/components/human/TaskDetail";
import { Card } from "@/components/ui/Card";
import { WalletPrompt } from "@/components/human/WalletPrompt";

type Tab = "available" | "my";

export function HumanPanel() {
  const walletAddress = useWalletAddress();
  const [tab, setTab] = useState<Tab>("available");
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimBanner, setClaimBanner] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const [postedRaw, allRaw] = await Promise.all([
        api.fetchTasks("POSTED", "human"),
        api.fetchTasks(undefined, "human"),
      ]);
      setAvailableTasks(postedRaw.map(apiTaskToTask));

      if (walletAddress) {
        const activeStatuses = new Set([
          "IN_PROGRESS",
          "PROOF_SUBMITTED",
          "PROOF_REJECTED",
        ]);
        setMyTasks(
          allRaw
            .map(apiTaskToTask)
            .filter(
              (t) =>
                t.claimedBy === walletAddress && activeStatuses.has(t.status)
            )
        );
      } else {
        setMyTasks([]);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const tasks = tab === "available" ? availableTasks : myTasks;
  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) ?? null
    : null;

  const handleTaskAction = async (action?: string) => {
    const currentTaskId = selectedTaskId;
    await loadTasks();

    if (action === "claim" && currentTaskId) {
      setTab("my");
      setSelectedTaskId(currentTaskId);
      setClaimBanner("Task claimed! You can now submit proof of completion.");
      setTimeout(() => setClaimBanner(null), 5000);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "available", label: "Available Tasks" },
    { key: "my", label: "My Tasks" },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 animate-fade-in">
      {/* Wallet banner */}
      {!walletAddress && <WalletPrompt />}

      {/* Claim success banner */}
      {claimBanner && (
        <div className="mb-4 rounded-xl border border-status-verified/20 bg-status-verified/8 px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-status-verified">
            {claimBanner}
          </span>
          <button
            type="button"
            onClick={() => setClaimBanner(null)}
            className="cursor-pointer text-xs text-text-muted hover:text-text-primary"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setSelectedTaskId(null);
            }}
            className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-all duration-150 ${
              tab === t.key
                ? "border-accent bg-accent/8 text-accent"
                : "border-border bg-surface-raised text-text-secondary hover:border-border-hover"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-[10px] opacity-60">
              {t.key === "available" ? availableTasks.length : myTasks.length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="card-elevated rounded-2xl flex items-center justify-center min-h-[200px]">
            <p className="text-sm text-text-muted">Loading tasks...</p>
          </div>
        ) : (
          <TaskInbox
            tasks={tasks}
            onSelectTask={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
            title={tab === "available" ? "Available Tasks" : "My Tasks"}
            mode={tab}
          />
        )}
        <div>
          {selectedTask ? (
            <TaskDetail
              task={selectedTask}
              onAction={handleTaskAction}
              walletAddress={walletAddress}
            />
          ) : (
            <Card className="flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-surface-highlight flex items-center justify-center">
                  <span className="text-text-muted text-xl">?</span>
                </div>
                <p className="text-sm text-text-muted">
                  {tab === "available"
                    ? "Select a task to see details and claim it"
                    : "Select a task to continue working"}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
