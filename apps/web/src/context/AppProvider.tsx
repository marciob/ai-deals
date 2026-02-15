"use client";

import type { ReactNode } from "react";
import { WalletProvider } from "./WalletProvider";
import { ModeProvider } from "./ModeContext";
import { TaskProvider } from "./TaskContext";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <ModeProvider>
        <TaskProvider>{children}</TaskProvider>
      </ModeProvider>
    </WalletProvider>
  );
}
