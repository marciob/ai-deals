import { truncateAddress } from "@/lib/formatting";

interface TxHashChipProps {
  hash: string;
  className?: string;
}

export function TxHashChip({ hash, className = "" }: TxHashChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg bg-surface-highlight/40 px-2.5 py-1 font-mono text-[11px] text-text-muted transition-colors hover:text-text-secondary ${className}`}
      title={hash}
    >
      <span className="text-accent/70 font-semibold">tx</span>
      {truncateAddress(hash, 6)}
    </span>
  );
}
