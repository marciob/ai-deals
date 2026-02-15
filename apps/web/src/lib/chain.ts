import { createPublicClient, http, type Address } from "viem";
import { defineChain } from "viem";
import StakeRegistryABI from "./abis/StakeRegistry.json";

const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_CHAIN_RPC!] },
  },
});

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

export async function isEligible(
  providerAddress: Address,
  minStake: bigint
): Promise<boolean> {
  const registryAddress = process.env.STAKE_REGISTRY_ADDRESS as Address;
  if (!registryAddress || registryAddress === "0x0000000000000000000000000000000000000000") {
    // Contracts not deployed yet — skip on-chain check
    return true;
  }

  const result = await publicClient.readContract({
    address: registryAddress,
    abi: StakeRegistryABI,
    functionName: "isEligible",
    args: [providerAddress, minStake],
  });
  return result as boolean;
}
