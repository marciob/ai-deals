"use client";

import { SegmentedToggle } from "./SegmentedToggle";
import { HeroHeadline } from "./HeroHeadline";
import { HeroCTA } from "./HeroCTA";

interface HeroSectionProps {
  onCTA?: () => void;
}

export function HeroSection({ onCTA }: HeroSectionProps) {
  return (
    <section className="relative flex flex-col items-center gap-10 px-4 pt-20 pb-16 overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-accent/15 via-transparent to-transparent blur-3xl pointer-events-none" />
      <SegmentedToggle />
      <HeroHeadline />
      <HeroCTA onAction={onCTA} />
    </section>
  );
}
