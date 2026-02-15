"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { formatTimeRemaining } from "@/lib/formatting";

interface SLATimerProps {
  deadline: number;
  className?: string;
}

export function SLATimer({ deadline, className = "" }: SLATimerProps) {
  const { remaining, isExpired, isUrgent } = useCountdown(deadline);

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs ${
        isExpired
          ? "bg-status-timed-out/10 text-status-timed-out"
          : isUrgent
            ? "bg-status-proof-submitted/10 text-status-proof-submitted animate-pulse"
            : "bg-surface-highlight/20 text-text-secondary"
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${
        isExpired
          ? "bg-status-timed-out"
          : isUrgent
            ? "bg-status-proof-submitted"
            : "bg-text-muted"
      }`} />
      {formatTimeRemaining(remaining)}
    </div>
  );
}
