"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AppMode } from "@/types/mode";

const STORAGE_KEY = "ai-deals-mode";

export interface ModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("agent");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "agent" || stored === "human" || stored === "business") {
      setModeState(stored);
    }
    setHydrated(true);
  }, []);

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  if (!hydrated) {
    return null;
  }

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}
