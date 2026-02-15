"use client";

import { useRef, useState, useEffect } from "react";
import type { AppMode } from "@/types/mode";
import { useMode } from "@/hooks/useMode";

const MODES: { value: AppMode; label: string }[] = [
  { value: "agent", label: "Agent" },
  { value: "human", label: "Human" },
  { value: "business", label: "Business" },
];

export function SegmentedToggle() {
  const { mode, setMode } = useMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const idx = MODES.findIndex((m) => m.value === mode);
    const buttons = container.querySelectorAll<HTMLButtonElement>("button");
    const btn = buttons[idx];
    if (btn) {
      setHighlight({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  }, [mode]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex rounded-full border border-border bg-surface-base p-1"
    >
      {/* Sliding highlight */}
      <div
        className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-accent transition-all duration-300 ease-[var(--ease-spring)]"
        style={{ left: highlight.left, width: highlight.width }}
      />
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => setMode(m.value)}
          className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
            mode === m.value ? "text-white" : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
