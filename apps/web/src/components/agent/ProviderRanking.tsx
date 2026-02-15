"use client";

import type { Provider } from "@/types/provider";
import { Card } from "@/components/ui/Card";
import { formatCurrency, truncateAddress } from "@/lib/formatting";

interface ProviderRankingProps {
  providers: Provider[];
  selectedId?: string;
}

export function ProviderRanking({ providers, selectedId }: ProviderRankingProps) {
  if (providers.length === 0) {
    return (
      <Card>
        <p className="text-sm text-text-muted">
          No providers available for this capability
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Provider Ranking
      </h3>
      <div className="flex flex-col gap-2">
        {providers.map((p, i) => (
          <div
            key={p.id}
            className={`relative flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-150 ${
              p.id === selectedId
                ? "bg-accent/5 border border-accent/20"
                : "border border-transparent hover:bg-surface-overlay"
            }`}
          >
            {/* Rank badge */}
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                i === 0
                  ? "bg-accent/10 text-accent"
                  : "bg-surface-highlight text-text-muted"
              }`}
            >
              {i + 1}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {p.name}
                </span>
                {p.id === selectedId && (
                  <span className="text-[10px] font-semibold text-accent bg-accent/8 px-1.5 py-0.5 rounded">
                    SELECTED
                  </span>
                )}
              </div>
              <span className="font-mono text-[11px] text-text-muted">
                {truncateAddress(p.address)}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-5 text-xs">
              <Stat label="Price" value={formatCurrency(p.price)} />
              <Stat label="ETA" value={`${p.etaMinutes}m`} />
              <Stat label="Rating" value={p.rating.toFixed(1)} highlight={p.rating >= 4.5} />
              <Stat label="Stake" value={formatCurrency(p.stakeAmount)} />
              <Stat
                label="Success"
                value={`${(p.successRate * 100).toFixed(0)}%`}
                highlight={p.successRate >= 0.95}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] text-text-muted">{label}</span>
      <span
        className={`font-mono font-medium ${
          highlight ? "text-status-verified" : "text-text-secondary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
