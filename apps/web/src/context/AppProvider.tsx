"use client";

import type { ReactNode } from "react";
import { ModeProvider } from "./ModeContext";
import { TaskProvider } from "./TaskContext";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ModeProvider>
      <TaskProvider>{children}</TaskProvider>
    </ModeProvider>
  );
}
