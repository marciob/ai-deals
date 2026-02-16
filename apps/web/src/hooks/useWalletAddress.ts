"use client";

import { useAccount } from "wagmi";

/**
 * Returns the connected wallet address, or undefined when
 * no wallet is connected.
 */
export function useWalletAddress(): `0x${string}` | undefined {
  const { address } = useAccount();
  return address;
}
