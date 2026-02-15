"use client";

import { LifecycleRunner } from "@/components/agent/LifecycleRunner";

export function AgentPanel() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 animate-fade-in">
      <LifecycleRunner />
    </section>
  );
}
