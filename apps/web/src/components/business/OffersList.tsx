"use client";

import { PROVIDERS } from "@/data/providers";
import { Card } from "@/components/ui/Card";
import { formatCurrency, truncateAddress } from "@/lib/formatting";

export function OffersList() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-text-primary">Your Offers</h3>
      {PROVIDERS.map((provider) => (
        <Card key={provider.id} hover>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-text-primary">
                {provider.name}
              </span>
              <span className="text-xs text-text-muted font-mono">
                {truncateAddress(provider.address)}
              </span>
              <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                <span>{formatCurrency(provider.price)}</span>
                <span>{provider.etaMinutes}m ETA</span>
                <span>{provider.rating} rating</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded-full bg-status-verified/15 px-2 py-0.5 text-[10px] text-status-verified font-medium">
                Active
              </span>
              <span className="text-xs text-text-muted">
                Staked: {formatCurrency(provider.stakeAmount)}
              </span>
              <span className="text-xs text-text-muted">
                {(provider.successRate * 100).toFixed(0)}% success
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
