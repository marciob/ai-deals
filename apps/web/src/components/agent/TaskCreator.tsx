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
    <div className="flex flex-col gap-4">
      <Textarea
        label="Task Goal"
        placeholder="Book a table for 4 at Nobu Malibu, Friday 8pm..."
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        rows={3}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-text-secondary">Capability</label>
        <div className="flex gap-2">
          {CAPABILITIES.map((cap) => (
            <button
              key={cap.id}
              onClick={() => setCapability(cap.id)}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-150 ${
                capability === cap.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface-base text-text-secondary hover:border-border-hover"
              }`}
            >
              {cap.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setUrgent(!urgent)}
            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
              urgent ? "bg-accent" : "bg-surface-highlight"
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-[var(--ease-spring)] ${
                urgent ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm text-text-secondary">Urgent</span>
        </label>

        <span className="text-xs text-text-muted">
          Budget: up to {maxBudget} USDC
        </span>
      </div>

      <Button onClick={handleSubmit} disabled={!goal.trim()}>
        Create Task Contract
      </Button>
    </div>
  );
}
