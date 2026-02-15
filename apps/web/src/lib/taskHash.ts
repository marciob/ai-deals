import { keccak256, toHex } from "viem";

export interface TaskHashInput {
  capability: string;
  goal: string;
  budgetAmount: number;
  currency: string;
  slaSeconds: number;
  urgent: boolean;
}

export function computeTaskHash(input: TaskHashInput): string {
  const canonical = JSON.stringify({
    capability: input.capability,
    goal: input.goal,
    budgetAmount: input.budgetAmount,
    currency: input.currency,
    slaSeconds: input.slaSeconds,
    urgent: input.urgent,
  });
  return keccak256(toHex(canonical));
}

export function computeProofHash(artifacts: unknown[], notes: string): string {
  const canonical = JSON.stringify({ artifacts, notes });
  return keccak256(toHex(canonical));
}
