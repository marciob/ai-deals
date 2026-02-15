import { createPublicClient, http, getAddress, type Address } from "viem";
import { defineChain } from "viem";
import StakeRegistryABI from "./abis/StakeRegistry.json";

const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_CHAIN_RPC ?? "https://testnet-rpc.monad.xyz"] },
  },
});

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

export async function isEligible(
  providerAddress: string,
  minStake: bigint
): Promise<boolean> {
  const registryAddress = process.env.STAKE_REGISTRY_ADDRESS?.trim();
  if (!registryAddress || registryAddress === "0x0000000000000000000000000000000000000000") {
    // Contracts not deployed yet — skip on-chain check
    return true;
  }

  const normalized = getAddress(providerAddress.toLowerCase());
  const result = await publicClient.readContract({
    address: registryAddress as Address,
    abi: StakeRegistryABI,
    functionName: "isEligible",
    args: [normalized, minStake],
  });
  return result as boolean;
}
