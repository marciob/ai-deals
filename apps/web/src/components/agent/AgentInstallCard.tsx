"use client";

import { Card } from "@/components/ui/Card";
import { CopyCommand } from "@/components/agent/CopyCommand";

const STEPS = [
  {
    number: "1",
    title: "Fetch the skill file",
    description:
      "Download skill.md into your agent's workspace. It contains the full action schema, required env vars, and example runs.",
  },
  {
    number: "2",
    title: "Set environment variables",
    description:
      "Export PRIVATE_KEY, RPC_URL, and AI_DEALS_API so the skill can sign transactions and reach the settlement API.",
  },
  {
    number: "3",
    title: "Run autonomously",
    description:
      "Point your agent at skill.md. It will search providers, escrow funds, verify proof, and settle — all on-chain.",
  },
];

export function AgentInstallCard() {
  return (
    <Card className="max-w-xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold text-text-primary">
            Install ai-deals skill
          </h2>
          <p className="text-sm text-text-secondary">
            Give your AI agent the ability to negotiate, escrow, and settle
            deals on-chain.
          </p>
        </div>

        {/* Copy command */}
        <CopyCommand command="curl -fsSL https://ai-deals.xyz/skill.md" />

        {/* Steps */}
        <ol className="flex flex-col gap-4 list-none m-0 p-0">
          {STEPS.map((step) => (
            <li key={step.number} className="flex gap-3.5">
              <span className="flex items-center justify-center shrink-0 h-6 w-6 rounded-full bg-surface-highlight text-xs font-semibold text-text-secondary">
                {step.number}
              </span>
              <div className="flex flex-col gap-0.5 pt-0.5">
                <span className="text-sm font-medium text-text-primary">
                  {step.title}
                </span>
                <span className="text-xs text-text-muted leading-relaxed">
                  {step.description}
                </span>
              </div>
            </li>
          ))}
        </ol>

        {/* Link to full spec */}
        <a
          href="/skill.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          Open skill.md →
        </a>
      </div>
    </Card>
  );
}
