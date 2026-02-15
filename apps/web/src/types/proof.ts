export interface ProofArtifact {
  id: string;
  type: "screenshot" | "confirmation_code" | "receipt" | "text";
  label: string;
  value: string;
  timestamp: number;
}

export interface ProofSubmission {
  taskId: string;
  artifacts: ProofArtifact[];
  submittedAt: number;
  notes?: string;
}
