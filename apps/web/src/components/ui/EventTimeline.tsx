import type { TaskEvent } from "@/types/task";
import { StatusBadge } from "./StatusBadge";
import { TxHashChip } from "./TxHashChip";
import { formatTimestamp } from "@/lib/formatting";

interface EventTimelineProps {
  events: TaskEvent[];
  className?: string;
}

export function EventTimeline({ events, className = "" }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-text-muted italic">No events yet.</p>
    );
  }

  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      {events.map((event, i) => (
        <div key={event.id} className="flex items-start gap-3 relative">
          {/* Vertical line */}
          {i < events.length - 1 && (
            <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border" />
          )}
          {/* Dot */}
          <div className="mt-1.5 h-[15px] w-[15px] flex-shrink-0 rounded-full border-2 border-border bg-surface-raised" />
          {/* Content */}
          <div className="flex flex-col gap-1 pb-4 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={event.to} />
              <span className="text-xs text-text-muted">
                {formatTimestamp(event.timestamp)}
              </span>
            </div>
            {event.txHash && <TxHashChip hash={event.txHash} />}
          </div>
        </div>
      ))}
    </div>
  );
}
