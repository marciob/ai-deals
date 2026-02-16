import type { Task, TaskEvent, TaskStatus, TaskAction } from "@/types/task";
import type { Provider } from "@/types/provider";
import type { ApiTask, ApiTaskDetail, ApiTaskEvent, ApiProvider } from "./api";

export function apiTaskToTask(t: ApiTask | ApiTaskDetail): Task {
  const events: TaskEvent[] = "events" in t && Array.isArray(t.events)
    ? t.events.map(apiEventToEvent)
    : [];

  return {
    id: t.id,
    status: t.status as TaskStatus,
    contract: {
      capability: t.capability_id,
      goal: t.goal,
      maxBudget: t.budget_amount,
      currency: t.currency,
      slaSeconds: t.sla_seconds,
      urgent: t.urgent,
    },
    target: t.target ?? "human",
    providerId: t.provider_id ?? undefined,
    claimedBy: t.claimed_by ?? undefined,
    escrowAmount: t.budget_amount,
    events,
    createdAt: new Date(t.created_at).getTime(),
    updatedAt: new Date(t.updated_at).getTime(),
  };
}

export function apiEventToEvent(e: ApiTaskEvent): TaskEvent {
  return {
    id: e.id,
    action: e.action as TaskAction,
    from: e.from_status as TaskStatus,
    to: e.to_status as TaskStatus,
    timestamp: new Date(e.created_at).getTime(),
    txHash: e.tx_hash ?? undefined,
    metadata: e.metadata,
  };
}

export function apiProviderToProvider(p: ApiProvider): Provider {
  return {
    id: p.id,
    name: p.name,
    businessName: p.business_name ?? "",
    description: p.description ?? "",
    aiInstructions: p.ai_instructions ?? "",
    capabilities: p.capability_ids,
    price: p.price,
    currency: "USDC",
    etaMinutes: p.eta_minutes,
    rating: p.rating,
    stakeAmount: p.stake_amount,
    successRate: p.success_rate,
    address: p.wallet_address,
  };
}
