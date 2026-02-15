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
    <span
      className={`font-mono text-xs ${
        isExpired
          ? "text-status-timed-out"
          : isUrgent
            ? "text-status-proof-submitted animate-pulse"
            : "text-text-secondary"
      } ${className}`}
    >
      {formatTimeRemaining(remaining)}
    </span>
  );
}
