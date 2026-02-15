"use client";

import { useState, useEffect } from "react";
import type { TaskContract } from "@/types/task";
import type { ProviderCapability } from "@/types/provider";
import * as api from "@/lib/api";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface TaskCreatorProps {
  onCreateTask: (contract: TaskContract) => void;
}

export function TaskCreator({ onCreateTask }: TaskCreatorProps) {
  const [goal, setGoal] = useState("");
  const [capabilities, setCapabilities] = useState<ProviderCapability[]>([]);
  const [capability, setCapability] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [maxBudget, setMaxBudget] = useState(25);

  useEffect(() => {
    api.fetchCapabilities().then((data) => {
      const mapped: ProviderCapability[] = data.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
      }));
      setCapabilities(mapped);
      if (mapped.length > 0 && !capability) {
        setCapability(mapped[0].id);
      }
    }).catch(() => {});
  }, []);

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
        label="Task goal"
        placeholder="Book a table for 4 at Nobu Malibu, Friday 8pm..."
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        rows={3}
      />

      {/* Capability pills */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-primary">
          Capability
        </span>
        <div className="flex gap-2">
          {capabilities.map((cap) => (
            <button
              key={cap.id}
              onClick={() => setCapability(cap.id)}
              className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-all duration-150 ${
                capability === cap.id
                  ? "border-accent bg-accent/8 text-accent"
                  : "border-border bg-surface-raised text-text-secondary hover:border-border-hover"
              }`}
            >
              {cap.name}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency + Budget row */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-4 py-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={urgent}
            onClick={() => setUrgent(!urgent)}
            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ease-[var(--ease-snappy)] cursor-pointer ${
              urgent ? "bg-accent" : "bg-surface-highlight"
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[var(--ease-spring)] ${
                urgent ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary">Urgent</span>
            <span className="text-xs text-text-muted">Higher stake, faster providers</span>
          </div>
        </label>

        <div className="flex items-center gap-2">
          <label className="text-sm text-text-muted">Budget</label>
          <div className="flex items-center rounded-lg border border-border bg-surface-base">
            <input
              type="number"
              min={1}
              max={1000}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value) || 0)}
              className="w-16 bg-transparent px-2.5 py-1.5 text-sm font-medium text-text-primary text-right outline-none font-mono"
            />
            <span className="border-l border-border px-2.5 py-1.5 text-xs text-text-muted font-medium">
              USDC
            </span>
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!goal.trim() || !capability}>
        Create Task Contract
      </Button>
    </div>
  );
}
