import { truncateAddress } from "@/lib/formatting";

interface TxHashChipProps {
  hash: string;
  className?: string;
}

export function TxHashChip({ hash, className = "" }: TxHashChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-surface-overlay px-2 py-0.5 font-mono text-xs text-text-muted ${className}`}
      title={hash}
    >
      <span className="text-accent/60">tx</span>
      {truncateAddress(hash, 6)}
    </span>
  );
}
