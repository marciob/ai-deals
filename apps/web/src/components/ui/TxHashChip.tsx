import { truncateAddress } from "@/lib/formatting";

const EXPLORER_BASE = "https://monadscan.com/tx/";

interface TxHashChipProps {
  hash: string;
  className?: string;
}

export function TxHashChip({ hash, className = "" }: TxHashChipProps) {
  return (
    <a
      href={`${EXPLORER_BASE}${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-md bg-surface-overlay px-2 py-0.5 font-mono text-[11px] text-text-muted transition-colors hover:text-accent ${className}`}
      title={hash}
    >
      <span className="text-accent font-medium">tx</span>
      {truncateAddress(hash, 6)}
      <svg
        width="10"
        height="10"
        viewBox="0 0 12 12"
        fill="none"
        className="opacity-60"
      >
        <path
          d="M3.5 1.5H2C1.72386 1.5 1.5 1.72386 1.5 2V10C1.5 10.2761 1.72386 10.5 2 10.5H10C10.2761 10.5 10.5 10.2761 10.5 10V8.5M7 1.5H10.5V5M10.25 1.75L5.5 6.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
