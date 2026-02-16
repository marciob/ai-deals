import {
  createPublicClient,
  createWalletClient,
  http,
  getAddress,
  keccak256,
  toHex,
  type Address,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import TaskEscrowABI from "./abis/TaskEscrow.json";

const monad = defineChain({
  id: 143,
  name: "Monad",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_CHAIN_RPC ?? "https://rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "Monadscan", url: "https://monadscan.com" },
  },
});

export const publicClient = createPublicClient({
  chain: monad,
  transport: http(),
});

const escrowAddress = (process.env.TASK_ESCROW_ADDRESS?.trim() ??
  "0x0000000000000000000000000000000000000000") as Address;

// ── Utilities ───────────────────────────────────────────────

export function taskIdToBytes32(taskId: string): `0x${string}` {
  return keccak256(toHex(taskId));
}

// ── Read helpers ────────────────────────────────────────────

export async function escrowExists(taskId: string): Promise<boolean> {
  if (escrowAddress === "0x0000000000000000000000000000000000000000") return false;
  const result = await publicClient.readContract({
    address: escrowAddress,
    abi: TaskEscrowABI,
    functionName: "escrowExists",
    args: [taskIdToBytes32(taskId)],
  });
  return result as boolean;
}

export interface OnChainEscrow {
  requester: Address;
  provider: Address;
  amount: bigint;
  status: number;
  createdAt: bigint;
  taskHash: `0x${string}`;
  proofHash: `0x${string}`;
}

export async function getEscrow(taskId: string): Promise<OnChainEscrow> {
  const result = await publicClient.readContract({
    address: escrowAddress,
    abi: TaskEscrowABI,
    functionName: "getEscrow",
    args: [taskIdToBytes32(taskId)],
  });
  return result as OnChainEscrow;
}

// ── Server-side write helpers (owner only) ──────────────────

function getServerWallet() {
  const pk = process.env.SERVER_PRIVATE_KEY?.trim();
  if (!pk) throw new Error("SERVER_PRIVATE_KEY not set");
  const account = privateKeyToAccount(pk as `0x${string}`);
  return createWalletClient({
    account,
    chain: monad,
    transport: http(),
  });
}

export async function releaseEscrow(
  taskId: string,
  providerAddress: string,
  proofHash: `0x${string}`
): Promise<Hash> {
  const wallet = getServerWallet();
  const normalized = getAddress(providerAddress.toLowerCase());
  const hash = await wallet.writeContract({
    address: escrowAddress,
    abi: TaskEscrowABI,
    functionName: "release",
    args: [taskIdToBytes32(taskId), normalized, proofHash],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function refundEscrow(taskId: string): Promise<Hash> {
  const wallet = getServerWallet();
  const hash = await wallet.writeContract({
    address: escrowAddress,
    abi: TaskEscrowABI,
    functionName: "refund",
    args: [taskIdToBytes32(taskId)],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

// ── Contract address export (for frontend hooks) ────────────

export const TASK_ESCROW_ADDRESS = escrowAddress;
export { TaskEscrowABI };
