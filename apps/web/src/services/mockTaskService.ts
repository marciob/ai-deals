import type { Task, TaskContract } from "@/types/task";
import { generateId } from "@/lib/formatting";

export async function createTask(contract: TaskContract): Promise<Task> {
  await delay(200);
  const now = Date.now();
  return {
    id: generateId(),
    status: "DRAFT",
    contract,
    events: [],
    createdAt: now,
    updatedAt: now,
  };
}

export async function getTaskById(
  tasks: Task[],
  id: string
): Promise<Task | undefined> {
  await delay(50);
  return tasks.find((t) => t.id === id);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
