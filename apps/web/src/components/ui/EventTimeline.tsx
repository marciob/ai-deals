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
    <div className={`flex flex-col ${className}`}>
      {events.map((event, i) => (
        <div key={event.id} className="flex items-start gap-3.5 relative">
          {/* Vertical connector */}
          {i < events.length - 1 && (
            <div className="absolute left-[7px] top-6 bottom-0 w-px bg-border" />
          )}
          {/* Dot */}
          <div
            className={`mt-1.5 h-[15px] w-[15px] flex-shrink-0 rounded-full border-2 ${
              i === events.length - 1
                ? "border-accent bg-accent/15"
                : "border-border bg-surface-raised"
            }`}
          />
          {/* Content */}
          <div className="flex flex-col gap-1.5 pb-5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={event.to} />
              <span className="text-[11px] text-text-muted font-mono">
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
