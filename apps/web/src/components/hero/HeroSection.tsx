"use client";

import { SegmentedToggle } from "./SegmentedToggle";
import { HeroHeadline } from "./HeroHeadline";
import { HeroCTA } from "./HeroCTA";

interface HeroSectionProps {
  onCTA?: () => void;
}

export function HeroSection({ onCTA }: HeroSectionProps) {
  return (
    <section className="flex flex-col items-center gap-8 px-4 pt-16 pb-12">
      <SegmentedToggle />
      <HeroHeadline />
      <HeroCTA onAction={onCTA} />
    </section>
  );
}
