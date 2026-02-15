import type { TaskStatus } from "@/types/task";
import { STATUS_LABELS, STATUS_CSS_CLASSES } from "@/lib/constants";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${STATUS_CSS_CLASSES[status]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {STATUS_LABELS[status]}
    </span>
  );
}
