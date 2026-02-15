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
        <p className="text-sm text-text-muted/60">
          No providers available for this capability
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-xs font-semibold text-text-secondary tracking-wide uppercase mb-4">
        Provider Ranking
      </h3>
      <div className="flex flex-col gap-2.5">
        {providers.map((p, i) => (
          <div
            key={p.id}
            className={`relative flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200 ${
              p.id === selectedId
                ? "bg-accent/8 border border-accent/25 glow-accent-sm"
                : "bg-surface-base/30 border border-transparent hover:bg-surface-base/50"
            }`}
          >
            {/* Rank badge */}
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                i === 0
                  ? "bg-gradient-to-b from-accent/30 to-accent/10 text-accent"
                  : "bg-surface-highlight/30 text-text-muted"
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
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                    SELECTED
                  </span>
                )}
              </div>
              <span className="font-mono text-[10px] text-text-muted/60">
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
      <span className="text-[10px] text-text-muted/60">{label}</span>
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
