"use client";

import { useState, useEffect, useRef } from "react";

export function useCountdown(targetTimestamp: number) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((targetTimestamp - Date.now()) / 1000))
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(Math.max(0, Math.floor((targetTimestamp - Date.now()) / 1000)));

    intervalRef.current = setInterval(() => {
      const next = Math.max(
        0,
        Math.floor((targetTimestamp - Date.now()) / 1000)
      );
      setRemaining(next);
      if (next <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetTimestamp]);

  return {
    remaining,
    isExpired: remaining <= 0,
    isUrgent: remaining > 0 && remaining <= 300,
  };
}
