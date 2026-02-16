"use client";

import { useState, useRef, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";

function WalletButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-accent-hover active:scale-[0.97]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
              Connect Wallet
            </button>
          );
        }

        return (
          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-3.5 py-2 transition-all duration-150 hover:border-border-hover hover:bg-surface-overlay"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-verified opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-status-verified" />
              </span>
              <span className="font-mono text-xs font-medium text-text-primary">
                {account.displayName}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-surface-raised shadow-lg z-50 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs text-text-muted">Connected</p>
                  <p className="text-xs font-mono text-text-primary mt-0.5 truncate">
                    {account.displayName}
                  </p>
                  {account.balanceFormatted && (
                    <p className="text-[10px] text-text-muted mt-1">
                      {account.balanceFormatted} {account.balanceSymbol}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    disconnect();
                    setOpen(false);
                  }}
                  className="cursor-pointer w-full px-4 py-2.5 text-left text-xs font-medium text-status-proof-submitted hover:bg-surface-overlay transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-surface-raised border-b border-border">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-xs font-bold text-white tracking-tight">AI</span>
        </div>
        <span className="text-sm font-semibold text-text-primary tracking-tight">
          ai-deals
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-status-verified" />
          <span className="text-xs font-medium text-text-secondary">
            Monad
          </span>
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
