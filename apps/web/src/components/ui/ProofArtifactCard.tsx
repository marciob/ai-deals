import type { ProofArtifact } from "@/types/proof";
import { formatTimestamp } from "@/lib/formatting";

interface ProofArtifactCardProps {
  artifact: ProofArtifact;
}

const typeIcons: Record<ProofArtifact["type"], string> = {
  screenshot: "🖼",
  confirmation_code: "#",
  receipt: "📄",
  text: "T",
};

export function ProofArtifactCard({ artifact }: ProofArtifactCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-base p-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-surface-overlay text-sm">
        {typeIcons[artifact.type]}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-text-primary">
          {artifact.label}
        </span>
        <span className="text-xs text-text-muted font-mono truncate">
          {artifact.value}
        </span>
        <span className="text-[10px] text-text-muted">
          {formatTimestamp(artifact.timestamp)}
        </span>
      </div>
    </div>
  );
}
