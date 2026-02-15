"use client";

import { useState, useCallback, useRef } from "react";
import type { TaskAction } from "@/types/task";
import type { Provider } from "@/types/provider";
import { useTask } from "./useTask";
import { STEP_DURATIONS } from "@/lib/constants";

const LIFECYCLE_STEPS: TaskAction[] = [
  "POST",
  "MATCH",
  "ESCROW",
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
    if (!provider) return;
    cancelRef.current = false;

    setState({
      isRunning: true,
      currentStep: 0,
      totalSteps: LIFECYCLE_STEPS.length,
      currentAction: null,
      completed: false,
      error: null,
    });

    // Set provider and escrow before running
    dispatch({ type: "SET_PROVIDER", taskId, providerId: provider.id });
    dispatch({ type: "SET_ESCROW", taskId, amount: provider.price });

    for (let i = 0; i < LIFECYCLE_STEPS.length; i++) {
      if (cancelRef.current) break;

      const action = LIFECYCLE_STEPS[i];
      setState((s) => ({ ...s, currentStep: i, currentAction: action }));

      const delay = STEP_DURATIONS[action] ?? 800;
      await new Promise((r) => setTimeout(r, delay));

      if (cancelRef.current) break;

      try {
        dispatch({ type: "TRANSITION", taskId, action });
      } catch (err) {
        setState((s) => ({
          ...s,
          isRunning: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }));
        return;
      }
    }

    if (!cancelRef.current) {
      setState((s) => ({
        ...s,
        isRunning: false,
        currentStep: LIFECYCLE_STEPS.length,
        currentAction: null,
        completed: true,
      }));
    }
  }, [taskId, provider, dispatch]);

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setState((s) => ({ ...s, isRunning: false }));
  }, []);

  return { ...state, run, cancel };
}
