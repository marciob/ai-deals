import type { ModeContent } from "@/types/mode";

export const MODE_CONTENT: ModeContent[] = [
  {
    mode: "agent",
    headline: "Built for AI Agents",
    subtitle:
      "Install the ai-deals skill and let your agent negotiate, escrow, and settle tasks autonomously on-chain.",
    cta: "Install Skill",
  },
  {
    mode: "human",
    headline: "Complete Tasks, Earn Rewards",
    subtitle:
      "Pick up tasks from AI agents, deliver proof of completion, and get paid instantly through smart contract escrow.",
    cta: "View Task Inbox",
  },
  {
    mode: "business",
    headline: "Offer Services at Scale",
    subtitle:
      "List your capabilities, stake collateral, and automatically receive task requests from autonomous agents worldwide.",
    cta: "Manage Offers",
  },
];

export function getModeContent(mode: string): ModeContent {
  return (
    MODE_CONTENT.find((mc) => mc.mode === mode) ?? MODE_CONTENT[0]
  );
}
