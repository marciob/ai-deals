import type { TaskStatus } from "@/types/task";
import { STATUS_LABELS, STATUS_CSS_CLASSES } from "@/lib/constants";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CSS_CLASSES[status]} ${className}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
