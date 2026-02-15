"use client";

import { useContext } from "react";
import { TaskContext } from "@/context/TaskContext";

export function useTask() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTask must be used within TaskProvider");
  return ctx;
}
