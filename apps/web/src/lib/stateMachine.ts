import type { TaskStatus, TaskAction } from "@/types/task";

const TRANSITIONS: Record<TaskStatus, Partial<Record<TaskAction, TaskStatus>>> =
  {
    DRAFT: { POST: "POSTED" },
    POSTED: { MATCH: "MATCHED", CLAIM: "IN_PROGRESS" },
    MATCHED: { ESCROW: "ESCROWED" },
    ESCROWED: { ACCEPT: "ACCEPTED" },
    ACCEPTED: { START: "IN_PROGRESS" },
    IN_PROGRESS: { SUBMIT_PROOF: "PROOF_SUBMITTED", TIMEOUT: "TIMED_OUT" },
    PROOF_SUBMITTED: {
      VERIFY: "VERIFIED",
      REJECT_PROOF: "PROOF_REJECTED",
      TIMEOUT: "TIMED_OUT",
    },
    VERIFIED: { PAY: "PAID" },
    PAID: { CLOSE: "CLOSED" },
    CLOSED: {},
    TIMED_OUT: { REFUND: "REFUNDED" },
    REFUNDED: {},
    PROOF_REJECTED: {
      RETRY_PROOF: "PROOF_SUBMITTED",
      TIMEOUT: "TIMED_OUT",
    },
  };

export function transition(
  currentStatus: TaskStatus,
  action: TaskAction
): TaskStatus {
  const allowed = TRANSITIONS[currentStatus];
  if (!allowed) {
    throw new Error(`No transitions defined for status: ${currentStatus}`);
  }
  const next = allowed[action];
  if (!next) {
    throw new Error(
      `Invalid transition: ${currentStatus} + ${action}. Allowed actions: ${Object.keys(allowed).join(", ") || "none"}`
    );
  }
  return next;
}

export function getAllowedActions(status: TaskStatus): TaskAction[] {
  const allowed = TRANSITIONS[status];
  return allowed ? (Object.keys(allowed) as TaskAction[]) : [];
}
