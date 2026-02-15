"use client";

import { useRef, useState, useEffect } from "react";
import type { AppMode } from "@/types/mode";
import { useMode } from "@/hooks/useMode";

const MODES: { value: AppMode; label: string; icon: string }[] = [
  { value: "agent", label: "Agent", icon: "A" },
  { value: "human", label: "Human", icon: "H" },
  { value: "business", label: "Business", icon: "B" },
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
      className="relative inline-flex glass rounded-full p-1.5"
    >
      {/* Sliding highlight with gradient */}
      <div
        className="absolute top-1.5 h-[calc(100%-12px)] rounded-full bg-gradient-to-r from-accent to-[oklch(0.58_0.22_300)] transition-all duration-400 ease-[var(--ease-spring)] glow-accent-sm"
        style={{ left: highlight.left, width: highlight.width }}
      />
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => setMode(m.value)}
          className={`relative z-10 cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold tracking-[-0.01em] transition-colors duration-200 ${
            mode === m.value
              ? "text-white"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
