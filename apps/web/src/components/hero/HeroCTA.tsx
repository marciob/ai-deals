"use client";

import { useMode } from "@/hooks/useMode";
import { getModeContent } from "@/data/modeContent";
import { Button } from "@/components/ui/Button";

interface HeroCTAProps {
  onAction?: () => void;
}

export function HeroCTA({ onAction }: HeroCTAProps) {
  const { mode } = useMode();
  const content = getModeContent(mode);

  return (
    <Button size="lg" onClick={onAction}>
      {content.cta}
    </Button>
  );
}
