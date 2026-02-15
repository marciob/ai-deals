"use client";

import { PROVIDERS } from "@/data/providers";
import { Card } from "@/components/ui/Card";
import { formatCurrency, truncateAddress } from "@/lib/formatting";

const accentColors = [
  "from-accent/30 to-accent/10",
  "from-status-in-progress/30 to-status-in-progress/10",
  "from-status-verified/30 to-status-verified/10",
];

export function OffersList() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
        Your Offers
      </h3>
      {PROVIDERS.map((provider, i) => (
        <Card key={provider.id} hover>
          <div className="flex items-start gap-4">
            {/* Colored icon badge */}
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-b ${accentColors[i % accentColors.length]}`}
            >
              <span className="text-sm font-bold text-text-primary">
                {provider.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-text-primary">
                  {provider.name}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-status-verified/10 px-2.5 py-1 text-[10px] font-semibold text-status-verified">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-verified" />
                  Active
                </span>
              </div>
              <span className="text-[11px] text-text-muted/60 font-mono">
                {truncateAddress(provider.address)}
              </span>

              <div className="mt-3 grid grid-cols-4 gap-3">
                <MiniStat label="Price" value={formatCurrency(provider.price)} />
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-text-muted/50">{label}</span>
      <span className="text-xs font-medium text-text-secondary font-mono">
        {value}
      </span>
    </div>
  );
}
