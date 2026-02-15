"use client";

import { useAccount } from "wagmi";
import { walletEnabled } from "@/lib/wagmi";

/**
 * Returns the connected wallet address, or undefined when
 * wallet is not configured (no WalletConnect project ID).
 */
export function useWalletAddress(): `0x${string}` | undefined {
  if (!walletEnabled) return undefined;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { address } = useAccount();
  return address;
}
