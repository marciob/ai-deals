import type { ProofArtifact } from "@/types/proof";
import { formatTimestamp } from "@/lib/formatting";

interface ProofArtifactCardProps {
  artifact: ProofArtifact;
}

const typeIcons: Record<ProofArtifact["type"], string> = {
  screenshot: "IMG",
  confirmation_code: "#",
  receipt: "RCP",
  text: "TXT",
};

const typeColors: Record<ProofArtifact["type"], string> = {
  screenshot: "bg-status-in-progress/10 text-status-in-progress",
  confirmation_code: "bg-accent/10 text-accent",
  receipt: "bg-status-verified/10 text-status-verified",
  text: "bg-status-proof-submitted/10 text-status-proof-submitted",
};

export function ProofArtifactCard({ artifact }: ProofArtifactCardProps) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface-raised p-3.5">
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-bold ${typeColors[artifact.type]}`}
      >
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
