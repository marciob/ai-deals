"use client";

import { useState, useCallback, useRef } from "react";
import type { TaskAction } from "@/types/task";
import type { Provider } from "@/types/provider";
import { useTask } from "./useTask";
import { STEP_DURATIONS } from "@/lib/constants";
import * as api from "@/lib/api";
import { apiTaskToTask } from "@/lib/mappers";

const LIFECYCLE_STEPS: TaskAction[] = [
  "MATCH",
  "ACCEPT",
  "START",
  "SUBMIT_PROOF",
  "VERIFY",
  "PAY",
  "CLOSE",
];

export interface LifecycleRunnerState {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  currentAction: TaskAction | null;
  completed: boolean;
  error: string | null;
}

export function useLifecycleRunner(taskId: string, provider: Provider | null) {
  const { dispatch } = useTask();
  const [state, setState] = useState<LifecycleRunnerState>({
    isRunning: false,
    currentStep: 0,
    totalSteps: LIFECYCLE_STEPS.length,
    currentAction: null,
    completed: false,
    error: null,
  });
  const cancelRef = useRef(false);

  const run = useCallback(async () => {
    if (!provider || !taskId) return;
    cancelRef.current = false;

    setState({
      isRunning: true,
      currentStep: 0,
      totalSteps: LIFECYCLE_STEPS.length,
      currentAction: null,
      completed: false,
      error: null,
    });

    try {
      for (let i = 0; i < LIFECYCLE_STEPS.length; i++) {
        if (cancelRef.current) break;

        const action = LIFECYCLE_STEPS[i];
        setState((s) => ({ ...s, currentStep: i, currentAction: action }));

        // Visual delay for UX
        const delay = STEP_DURATIONS[action] ?? 800;
        await new Promise((r) => setTimeout(r, delay));

        if (cancelRef.current) break;

        // Call the real API for each step
        switch (action) {
          case "MATCH":
            // match + escrow happen together in the API
            await api.matchTask(taskId, provider.id);
            break;
          case "ACCEPT":
            // accept + start happen together in the API
            await api.acceptTask(taskId);
            break;
          case "START":
            // Already handled by accept, just a visual step
            break;
          case "SUBMIT_PROOF":
            await api.submitProof(
              taskId,
              [{ type: "auto", label: "Agent proof" }],
              "Completed by autonomous agent"
            );
            break;
          case "VERIFY":
            // verify + pay + close happen together in the API
            await api.verifyTask(taskId, true, "Auto-verified by agent");
            break;
          case "PAY":
            // Already handled by verify
            break;
          case "CLOSE":
            // Already handled by verify
            break;
        }
      }

      if (!cancelRef.current) {
        // Fetch final task state and sync to context
        const finalTask = await api.fetchTask(taskId);
        const mapped = apiTaskToTask(finalTask);
        dispatch({ type: "ADD_TASK", task: mapped });

        setState((s) => ({
          ...s,
          isRunning: false,
          currentStep: LIFECYCLE_STEPS.length,
          currentAction: null,
          completed: true,
        }));
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        isRunning: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, [taskId, provider, dispatch]);

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setState((s) => ({ ...s, isRunning: false }));
  }, []);

  return { ...state, run, cancel };
}
