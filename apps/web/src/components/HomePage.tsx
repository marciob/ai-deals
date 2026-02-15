"use client";

import { useRef } from "react";
import { useMode } from "@/hooks/useMode";
import { Header } from "./layout/Header";
import { Footer } from "./layout/Footer";
import { HeroSection } from "./hero/HeroSection";
import { AgentPanel } from "./panels/AgentPanel";
import { HumanPanel } from "./panels/HumanPanel";
import { BusinessPanel } from "./panels/BusinessPanel";

export function HomePage() {
  const { mode } = useMode();
  const panelRef = useRef<HTMLDivElement>(null);

  const scrollToPanel = () => {
    panelRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection onCTA={scrollToPanel} />
        <div ref={panelRef} className="pb-16">
          {mode === "agent" && <AgentPanel />}
          {mode === "human" && <HumanPanel />}
          {mode === "business" && <BusinessPanel />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
