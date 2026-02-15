"use client";

import { createContext, useReducer, type ReactNode } from "react";
import {
  taskReducer,
  initialTaskState,
  type TaskState,
  type TaskReducerAction,
} from "@/reducers/taskReducer";

export interface TaskContextValue {
  state: TaskState;
  dispatch: React.Dispatch<TaskReducerAction>;
}

export const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}
