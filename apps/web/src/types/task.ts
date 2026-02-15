export type TaskStatus =
  | "DRAFT"
  | "POSTED"
  | "MATCHED"
  | "ESCROWED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "PROOF_SUBMITTED"
  | "VERIFIED"
  | "PAID"
  | "CLOSED"
  | "TIMED_OUT"
  | "REFUNDED"
  | "PROOF_REJECTED";

export type TaskAction =
  | "POST"
  | "MATCH"
  | "ESCROW"
  | "ACCEPT"
  | "START"
  | "SUBMIT_PROOF"
  | "VERIFY"
  | "PAY"
  | "CLOSE"
  | "TIMEOUT"
  | "REFUND"
  | "REJECT_PROOF"
  | "RETRY_PROOF";

export interface TaskEvent {
  id: string;
  action: TaskAction;
  from: TaskStatus;
  to: TaskStatus;
  timestamp: number;
  txHash?: string;
  metadata?: Record<string, unknown>;
}

export interface TaskContract {
  capability: string;
  goal: string;
  maxBudget: number;
  currency: string;
  slaSeconds: number;
  urgent: boolean;
}

export interface Task {
  id: string;
  status: TaskStatus;
  contract: TaskContract;
  providerId?: string;
  escrowAmount?: number;
  events: TaskEvent[];
  createdAt: number;
  updatedAt: number;
}
