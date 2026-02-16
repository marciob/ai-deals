"use client";

import { Tooltip } from "./Tooltip";

interface EscrowBadgeProps {
  funded: boolean;
  className?: string;
}

export function EscrowBadge({ funded, className = "" }: EscrowBadgeProps) {
  if (funded) {
    return (
      <Tooltip content="Escrow is funded on-chain. Payment is guaranteed by the smart contract.">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-status-escrowed/10 text-status-escrowed cursor-default ${className}`}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="h-3 w-3"
            aria-hidden="true"
          >
            <path
              d="M8 1.5a.5.5 0 0 1 .5.5v1.03A4.5 4.5 0 0 1 12.47 7H13.5a.5.5 0 0 1 0 1h-1.03A4.5 4.5 0 0 1 8.5 11.97V13a.5.5 0 0 1-1 0v-1.03A4.5 4.5 0 0 1 3.53 8H2.5a.5.5 0 0 1 0-1h1.03A4.5 4.5 0 0 1 7.5 3.03V2a.5.5 0 0 1 .5-.5ZM8 4.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
              fill="currentColor"
            />
          </svg>
          Funded
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip content="Escrow is not funded yet. If you claim this task, you are trusting the AI agent to pay you — there is no on-chain guarantee.">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-status-timed-out/10 text-status-timed-out cursor-default ${className}`}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-3 w-3"
          aria-hidden="true"
        >
          <path
            d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13ZM8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3Zm0 2a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 5Zm0 5.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z"
            fill="currentColor"
          />
        </svg>
        Not Funded
      </span>
    </Tooltip>
  );
}
