"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletPrompt() {
  return (
    <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-text-primary">
          Connect your wallet to claim tasks
        </span>
        <span className="text-xs text-text-secondary">
          Link your wallet to start picking up work and earning rewards.
        </span>
      </div>
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => (
          <button
            type="button"
            onClick={openConnectModal}
            disabled={!mounted}
            className="cursor-pointer flex-shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            Connect Wallet
          </button>
        )}
      </ConnectButton.Custom>
    </div>
  );
}
