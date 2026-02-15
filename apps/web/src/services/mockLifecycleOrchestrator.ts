import type { TaskContract } from "@/types/task";
import type { Provider } from "@/types/provider";
import { createTask } from "./mockTaskService";
import { getProviders } from "./mockProviderService";
import { lockEscrow } from "./mockEscrowService";

export interface OrchestratorCallbacks {
  onTaskCreated: (taskId: string) => void;
  onProvidersRanked: (providers: Provider[]) => void;
  onProviderSelected: (provider: Provider) => void;
  onEscrowLocked: (amount: number, txHash: string) => void;
  onStep: (action: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

export async function runLifecycle(
  contract: TaskContract,
  callbacks: OrchestratorCallbacks
): Promise<void> {
  try {
    // 1. Create task
    callbacks.onStep("Creating task...");
    const task = await createTask(contract);
    callbacks.onTaskCreated(task.id);

    // 2. Find and rank providers
    callbacks.onStep("Finding providers...");
    const providers = await getProviders(
      contract.capability,
      contract.urgent
    );
    callbacks.onProvidersRanked(providers);

    if (providers.length === 0) {
      callbacks.onError("No providers available for this capability");
      return;
    }

    // 3. Select best provider
    const selected = providers[0];
    callbacks.onProviderSelected(selected);

    // 4. Lock escrow
    callbacks.onStep("Locking escrow...");
    const escrow = await lockEscrow(selected.price, selected.currency);
    callbacks.onEscrowLocked(escrow.amount, escrow.txHash);

    callbacks.onComplete();
  } catch (err) {
    callbacks.onError(
      err instanceof Error ? err.message : "Orchestration failed"
    );
  }
}
