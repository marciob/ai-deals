const BASE = "/api";

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...opts?.headers },
    ...opts,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Request failed: ${res.status}`);
  return json as T;
}

// ── Capabilities ────────────────────────────────────────────

export interface ApiCapability {
  id: string;
  name: string;
  description: string;
  inputs_schema: Record<string, unknown>;
  proof_policy: string;
  created_at: string;
}

export function fetchCapabilities() {
  return request<ApiCapability[]>("/capabilities");
}

export function createCapability(body: {
  name: string;
  description: string;
  inputsSchema?: Record<string, unknown>;
  proofPolicy?: string;
}) {
  return request<ApiCapability>("/capabilities", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Providers ───────────────────────────────────────────────

export interface ApiProvider {
  id: string;
  name: string;
  business_name: string;
  description: string;
  ai_instructions: string;
  wallet_address: string;
  type: string;
  capability_ids: string[];
  price: number;
  eta_minutes: number;
  rating: number;
  success_rate: number;
  stake_amount: number;
  created_at: string;
}

export function fetchProviders(capability?: string, urgent?: boolean) {
  const params = new URLSearchParams();
  if (capability) params.set("capability", capability);
  if (urgent) params.set("urgent", "true");
  const qs = params.toString();
  return request<ApiProvider[]>(`/providers${qs ? `?${qs}` : ""}`);
}

// ── Tasks ───────────────────────────────────────────────────

export interface ApiTask {
  id: string;
  status: string;
  capability_id: string;
  goal: string;
  budget_amount: number;
  currency: string;
  sla_seconds: number;
  urgent: boolean;
  task_hash: string;
  provider_id: string | null;
  escrow_tx: string | null;
  payout_tx: string | null;
  refund_tx: string | null;
  requester_address: string | null;
  claimed_by: string | null;
  target: "human" | "business";
  created_at: string;
  updated_at: string;
}

export interface ApiTaskEvent {
  id: string;
  task_id: string;
  action: string;
  from_status: string;
  to_status: string;
  tx_hash: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ApiProof {
  id: string;
  task_id: string;
  artifacts: unknown[];
  proof_hash: string;
  notes: string;
  verification_status: string;
  verification_notes: string | null;
  created_at: string;
}

export interface ApiTaskDetail extends ApiTask {
  events: ApiTaskEvent[];
  proof: ApiProof | null;
}

export function fetchTasks(status?: string, target?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (target) params.set("target", target);
  const qs = params.toString();
  return request<ApiTask[]>(`/tasks${qs ? `?${qs}` : ""}`);
}

export function fetchTask(id: string) {
  return request<ApiTaskDetail>(`/tasks/${id}`);
}

export function createTask(body: {
  capability: string;
  goal: string;
  budgetAmount: number;
  slaSeconds?: number;
  urgent?: boolean;
  currency?: string;
  requesterAddress?: string;
  target?: "human" | "business";
}) {
  return request<ApiTask>("/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function claimTask(id: string, walletAddress: string) {
  return request<{ id: string; status: string; claimedBy: string }>(
    `/tasks/${id}/claim`,
    { method: "POST", body: JSON.stringify({ walletAddress }) }
  );
}

export function createProvider(body: {
  name: string;
  businessName?: string;
  description?: string;
  aiInstructions?: string;
  walletAddress: string;
  capabilityIds?: string[];
  price?: number;
  etaMinutes?: number;
}) {
  return request<ApiProvider>("/providers", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Task actions ────────────────────────────────────────────

export function matchTask(id: string, providerId: string, escrowTx?: string) {
  return request<{ id: string; status: string; providerId: string }>(
    `/tasks/${id}/match`,
    { method: "POST", body: JSON.stringify({ providerId, escrowTx }) }
  );
}

export function acceptTask(id: string) {
  return request<{ id: string; status: string }>(`/tasks/${id}/accept`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function submitProof(
  id: string,
  artifacts: unknown[],
  notes: string
) {
  return request<{ id: string; status: string; proofHash: string }>(
    `/tasks/${id}/proof`,
    { method: "POST", body: JSON.stringify({ artifacts, notes }) }
  );
}

export function verifyTask(
  id: string,
  approved: boolean,
  notes?: string,
  payoutTx?: string
) {
  return request<{ id: string; status: string }>(`/tasks/${id}/verify`, {
    method: "POST",
    body: JSON.stringify({ approved, notes, payoutTx }),
  });
}

export function refundTask(id: string) {
  return request<{ id: string; status: string }>(`/tasks/${id}/refund`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function fundEscrow(id: string, depositTxHash: string) {
  return request<{ id: string; status: string; escrowTx: string }>(
    `/tasks/${id}/fund`,
    { method: "POST", body: JSON.stringify({ depositTxHash }) }
  );
}

export function recordEscrowTx(id: string, txHash: string) {
  return request<{ id: string; escrowTx: string }>(`/tasks/${id}/escrow-tx`, {
    method: "POST",
    body: JSON.stringify({ txHash }),
  });
}

// ── Agent ───────────────────────────────────────────────────

export function registerAgent(agentName: string) {
  return request<{
    id: string;
    apiKey: string;
    agentName: string;
    claimUrl: string;
  }>("/agent/register", {
    method: "POST",
    body: JSON.stringify({ agentName }),
  });
}

export function claimAgent(apiKey: string, walletAddress: string) {
  return request<{
    id: string;
    agentName: string;
    walletAddress: string;
    claimed: boolean;
  }>("/agent/claim", {
    method: "POST",
    body: JSON.stringify({ apiKey, walletAddress }),
  });
}
