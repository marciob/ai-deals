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
        <p className="text-sm text-text-muted italic">
          No providers available
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-medium text-text-primary mb-3">
        Provider Ranking
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-text-muted border-b border-border">
              <th className="pb-2 text-left font-medium">#</th>
              <th className="pb-2 text-left font-medium">Provider</th>
              <th className="pb-2 text-right font-medium">Price</th>
              <th className="pb-2 text-right font-medium">ETA</th>
              <th className="pb-2 text-right font-medium">Rating</th>
              <th className="pb-2 text-right font-medium">Stake</th>
              <th className="pb-2 text-right font-medium">Success</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p, i) => (
              <tr
                key={p.id}
                className={`border-b border-border/50 last:border-0 ${
                  p.id === selectedId
                    ? "bg-accent/5"
                    : ""
                }`}
              >
                <td className="py-2 text-text-muted">{i + 1}</td>
                <td className="py-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-text-primary">
                      {p.name}
                      {p.id === selectedId && (
                        <span className="ml-1.5 text-accent text-[10px]">
                          SELECTED
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-text-muted text-[10px]">
                      {truncateAddress(p.address)}
                    </span>
                  </div>
                </td>
                <td className="py-2 text-right text-text-secondary">
                  {formatCurrency(p.price)}
                </td>
                <td className="py-2 text-right text-text-secondary">
                  {p.etaMinutes}m
                </td>
                <td className="py-2 text-right text-text-secondary">
                  {p.rating.toFixed(1)}
                </td>
                <td className="py-2 text-right text-text-secondary">
                  {formatCurrency(p.stakeAmount)}
                </td>
                <td className="py-2 text-right text-text-secondary">
                  {(p.successRate * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
