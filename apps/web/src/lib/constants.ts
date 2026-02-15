import type { TaskStatus } from "@/types/task";

export const STATUS_COLORS: Record<TaskStatus, string> = {
  DRAFT: "var(--color-status-draft)",
  POSTED: "var(--color-status-posted)",
  MATCHED: "var(--color-status-matched)",
  ESCROWED: "var(--color-status-escrowed)",
  ACCEPTED: "var(--color-status-accepted)",
  IN_PROGRESS: "var(--color-status-in-progress)",
  PROOF_SUBMITTED: "var(--color-status-proof-submitted)",
  VERIFIED: "var(--color-status-verified)",
  PAID: "var(--color-status-paid)",
  CLOSED: "var(--color-status-closed)",
  TIMED_OUT: "var(--color-status-timed-out)",
  REFUNDED: "var(--color-status-refunded)",
  PROOF_REJECTED: "var(--color-status-proof-rejected)",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  DRAFT: "Draft",
  POSTED: "Posted",
  MATCHED: "Matched",
  ESCROWED: "Escrowed",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  PROOF_SUBMITTED: "Proof Submitted",
  VERIFIED: "Verified",
  PAID: "Paid",
  CLOSED: "Closed",
  TIMED_OUT: "Timed Out",
  REFUNDED: "Refunded",
  PROOF_REJECTED: "Proof Rejected",
};

export const STATUS_CSS_CLASSES: Record<TaskStatus, string> = {
  DRAFT: "bg-status-draft/20 text-status-draft",
  POSTED: "bg-status-posted/20 text-status-posted",
  MATCHED: "bg-status-matched/20 text-status-matched",
  ESCROWED: "bg-status-escrowed/20 text-status-escrowed",
  ACCEPTED: "bg-status-accepted/20 text-status-accepted",
  IN_PROGRESS: "bg-status-in-progress/20 text-status-in-progress",
  PROOF_SUBMITTED: "bg-status-proof-submitted/20 text-status-proof-submitted",
  VERIFIED: "bg-status-verified/20 text-status-verified",
  PAID: "bg-status-paid/20 text-status-paid",
  CLOSED: "bg-status-closed/20 text-status-closed",
  TIMED_OUT: "bg-status-timed-out/20 text-status-timed-out",
  REFUNDED: "bg-status-refunded/20 text-status-refunded",
  PROOF_REJECTED: "bg-status-proof-rejected/20 text-status-proof-rejected",
};

/** Simulated step durations in ms for lifecycle demo */
export const STEP_DURATIONS: Record<string, number> = {
  POST: 800,
  MATCH: 1200,
  ESCROW: 1000,
  ACCEPT: 600,
  START: 500,
  SUBMIT_PROOF: 2000,
  VERIFY: 1500,
  PAY: 1000,
  CLOSE: 400,
};
