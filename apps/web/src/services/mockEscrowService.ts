import { generateTxHash } from "@/lib/formatting";

export interface EscrowResult {
  txHash: string;
  amount: number;
  currency: string;
  lockedAt: number;
}

export async function lockEscrow(
  amount: number,
  currency = "USDC"
): Promise<EscrowResult> {
  await delay(800);
  return {
    txHash: generateTxHash(),
    amount,
    currency,
    lockedAt: Date.now(),
  };
}

export async function releaseEscrow(
  txHash: string
): Promise<{ releaseTxHash: string; releasedAt: number }> {
  await delay(600);
  return {
    releaseTxHash: generateTxHash(),
    releasedAt: Date.now(),
  };
}

export async function refundEscrow(
  txHash: string
): Promise<{ refundTxHash: string; refundedAt: number }> {
  await delay(600);
  return {
    refundTxHash: generateTxHash(),
    refundedAt: Date.now(),
  };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
