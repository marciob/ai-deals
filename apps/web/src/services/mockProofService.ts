import type { ProofArtifact, ProofSubmission } from "@/types/proof";
import { generateId } from "@/lib/formatting";

export async function submitProof(
  taskId: string,
  artifacts: Omit<ProofArtifact, "id" | "timestamp">[],
  notes?: string
): Promise<ProofSubmission> {
  await delay(500);
  const now = Date.now();
  return {
    taskId,
    artifacts: artifacts.map((a) => ({
      ...a,
      id: generateId(),
      timestamp: now,
    })),
    submittedAt: now,
    notes,
  };
}

export async function verifyProof(
  _submission: ProofSubmission
): Promise<{ verified: boolean; reason?: string }> {
  await delay(1000);
  // Mock: always verifies successfully
  return { verified: true };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
