"use client";

import { useMode } from "@/hooks/useMode";
import { getModeContent } from "@/data/modeContent";

export function HeroHeadline() {
  const { mode } = useMode();
  const content = getModeContent(mode);

  return (
    <div className="flex flex-col items-center gap-3 text-center animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl leading-[1.15]">
        {content.headline}
      </h1>
      <p className="max-w-lg text-base text-text-secondary leading-relaxed">
        {content.subtitle}
      </p>
    </div>
  );
}
