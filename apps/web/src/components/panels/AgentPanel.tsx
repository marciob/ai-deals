"use client";

import { AgentInstallCard } from "@/components/agent/AgentInstallCard";

export function AgentPanel() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 animate-fade-in">
      <AgentInstallCard />
    </section>
  );
}
