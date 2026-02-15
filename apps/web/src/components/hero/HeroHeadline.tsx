"use client";

import { useMode } from "@/hooks/useMode";
import { getModeContent } from "@/data/modeContent";

export function HeroHeadline() {
  const { mode } = useMode();
  const content = getModeContent(mode);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
        {content.headline}
      </h1>
      <p className="max-w-2xl text-lg text-text-secondary">
        {content.subtitle}
      </p>
    </div>
  );
}
