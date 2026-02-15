import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_CHAIN_RPC ?? "https://testnet-rpc.monad.xyz"],
    },
  },
});

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const walletEnabled = Boolean(projectId);

export const wagmiConfig = projectId
  ? getDefaultConfig({
      appName: "AI Deals",
      projectId,
      chains: [monadTestnet],
      ssr: true,
    })
  : null;
