"use client";

import { useState } from "react";
import type { TaskContract } from "@/types/task";
import { CAPABILITIES } from "@/data/capabilities";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface TaskCreatorProps {
  onCreateTask: (contract: TaskContract) => void;
}

export function TaskCreator({ onCreateTask }: TaskCreatorProps) {
  const [goal, setGoal] = useState("");
  const [capability, setCapability] = useState(CAPABILITIES[0].id);
  const [urgent, setUrgent] = useState(false);
  const [maxBudget] = useState(25);

  const handleSubmit = () => {
    if (!goal.trim()) return;
    onCreateTask({
      capability,
      goal: goal.trim(),
      maxBudget,
      currency: "USDC",
      slaSeconds: urgent ? 1800 : 3600,
      urgent,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <Textarea
        label="Task Goal"
        placeholder="Book a table for 4 at Nobu Malibu, Friday 8pm..."
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        rows={3}
      />

      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-medium text-text-secondary tracking-wide uppercase">
          Capability
        </label>
        <div className="flex gap-2.5">
          {CAPABILITIES.map((cap) => (
            <button
              key={cap.id}
              onClick={() => setCapability(cap.id)}
              className={`cursor-pointer rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
                capability === cap.id
                  ? "border-accent/50 bg-accent/10 text-accent glow-accent-sm"
                  : "border-border bg-surface-base/40 text-text-muted hover:border-border-hover hover:text-text-secondary"
              }`}
            >
              {cap.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-surface-base/30 px-4 py-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={urgent}
            onClick={() => setUrgent(!urgent)}
            className={`relative h-6 w-11 rounded-full transition-colors duration-250 ease-[var(--ease-snappy)] cursor-pointer ${
              urgent ? "bg-accent glow-accent-sm" : "bg-surface-highlight"
            }`}
          >
            <div
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-250 ease-[var(--ease-spring)] ${
                urgent ? "translate-x-5.5" : "translate-x-1"
              }`}
            />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">Urgent</span>
            <span className="text-[10px] text-text-muted">Higher stake, faster providers</span>
          </div>
        </label>

        <div className="flex flex-col items-end">
          <span className="text-xs text-text-muted">Budget</span>
          <span className="text-sm font-semibold text-text-primary font-mono">
            {maxBudget} <span className="text-text-muted text-xs">USDC</span>
          </span>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!goal.trim()}>
        Create Task Contract
      </Button>
    </div>
  );
}
