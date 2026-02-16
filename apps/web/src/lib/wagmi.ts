import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

export const monad = defineChain({
  id: 143,
  name: "Monad",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_CHAIN_RPC ?? "https://rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "Monadscan", url: "https://monadscan.com" },
  },
});

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

/** true when WalletConnect relay is available (full wallet list) */
export const walletConnectEnabled = Boolean(projectId);

/**
 * Wallet is always enabled — without a WalletConnect project ID
 * we fall back to injected wallets only (MetaMask, Rabby, etc.).
 */
export const walletEnabled = true;

export const wagmiConfig = projectId
  ? getDefaultConfig({
      appName: "AI Deals",
      projectId,
      chains: [monad],
      ssr: true,
    })
  : createConfig({
      chains: [monad],
      connectors: [injected()],
      transports: {
        [monad.id]: http(),
      },
      ssr: true,
    });
