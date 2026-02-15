import { truncateAddress } from "@/lib/formatting";

interface TxHashChipProps {
  hash: string;
  className?: string;
}

export function TxHashChip({ hash, className = "" }: TxHashChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md bg-surface-overlay px-2 py-0.5 font-mono text-[11px] text-text-muted transition-colors hover:text-text-secondary ${className}`}
      title={hash}
    >
      <span className="text-accent font-medium">tx</span>
      {truncateAddress(hash, 6)}
    </span>
  );
}
