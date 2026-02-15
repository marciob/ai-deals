import type { Task, TaskAction, TaskEvent } from "@/types/task";
import { transition } from "@/lib/stateMachine";
import { generateId, generateTxHash } from "@/lib/formatting";

export type TaskReducerAction =
  | { type: "ADD_TASK"; task: Task }
  | {
      type: "TRANSITION";
      taskId: string;
      action: TaskAction;
      metadata?: Record<string, unknown>;
    }
  | { type: "SET_PROVIDER"; taskId: string; providerId: string }
  | { type: "SET_ESCROW"; taskId: string; amount: number }
  | { type: "RESET" };

export type TaskState = {
  tasks: Task[];
};

export const initialTaskState: TaskState = {
  tasks: [],
};

export function taskReducer(
  state: TaskState,
  action: TaskReducerAction
): TaskState {
  switch (action.type) {
    case "ADD_TASK":
      if (state.tasks.some((t) => t.id === action.task.id)) return state;
      return { tasks: [...state.tasks, action.task] };

    case "TRANSITION": {
      return {
        tasks: state.tasks.map((task) => {
          if (task.id !== action.taskId) return task;
          const nextStatus = transition(task.status, action.action);
          const event: TaskEvent = {
            id: generateId(),
            action: action.action,
            from: task.status,
            to: nextStatus,
            timestamp: Date.now(),
            txHash: generateTxHash(),
            metadata: action.metadata,
          };
          return {
            ...task,
            status: nextStatus,
            events: [...task.events, event],
            updatedAt: Date.now(),
          };
        }),
      };
    }

    case "SET_PROVIDER":
      return {
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? { ...task, providerId: action.providerId, updatedAt: Date.now() }
            : task
        ),
      };

    case "SET_ESCROW":
      return {
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? { ...task, escrowAmount: action.amount, updatedAt: Date.now() }
            : task
        ),
      };

    case "RESET":
      return initialTaskState;

    default:
      return state;
  }
}
