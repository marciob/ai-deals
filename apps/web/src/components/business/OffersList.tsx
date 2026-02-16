"use client";

import { useState, useEffect } from "react";
import type { Provider } from "@/types/provider";
import * as api from "@/lib/api";
import { apiProviderToProvider } from "@/lib/mappers";
import { Card } from "@/components/ui/Card";
import { formatCurrency, truncateAddress } from "@/lib/formatting";

export function OffersList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .fetchProviders()
      .then((data) => setProviders(data.map(apiProviderToProvider)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-primary">Your Offers</h3>
        <Card className="flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-text-muted">Loading providers...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-text-primary">
        Your Offers
      </h3>
      {providers.map((provider) => (
        <Card key={provider.id} hover>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface-highlight">
              <span className="text-sm font-semibold text-text-secondary">
                {provider.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-text-primary">
                  {provider.name}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-status-verified/8 px-2.5 py-1 text-[10px] font-semibold text-status-verified">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-verified" />
                  Active
                </span>
              </div>
              {provider.businessName && (
                <span className="text-[11px] text-text-secondary">
                  {provider.businessName}
                </span>
              )}
              <span className="text-[11px] text-text-muted font-mono">
                {truncateAddress(provider.address)}
              </span>

              {provider.description && (
                <p className="mt-2 text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {provider.description}
                </p>
              )}

              <div className="mt-3 grid grid-cols-4 gap-3">
                <MiniStat
                  label="Price"
                  value={provider.price === 0 ? "Free" : formatCurrency(provider.price)}
                  highlight={provider.price === 0}
                />
                <MiniStat label="ETA" value={`${provider.etaMinutes}m`} />
                <MiniStat label="Stake" value={formatCurrency(provider.stakeAmount)} />
                <MiniStat label="Success" value={`${(provider.successRate * 100).toFixed(0)}%`} />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-text-muted">{label}</span>
      <span className={`text-xs font-medium font-mono ${highlight ? "text-status-verified" : "text-text-secondary"}`}>
        {value}
      </span>
    </div>
  );
}
