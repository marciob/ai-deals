"use client";

import { useMode } from "@/hooks/useMode";
import { getModeContent } from "@/data/modeContent";

export function HeroHeadline() {
  const { mode } = useMode();
  const content = getModeContent(mode);

  return (
    <div className="flex flex-col items-center gap-5 text-center animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl bg-gradient-to-b from-text-primary to-text-secondary bg-clip-text text-transparent leading-[1.1]">
        {content.headline}
      </h1>
      <p className="max-w-xl text-base text-text-secondary leading-relaxed sm:text-lg">
        {content.subtitle}
      </p>
    </div>
  );
}
