import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({
  children,
  hover = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface-raised p-4 ${hover ? "transition-colors duration-200 ease-[var(--ease-snappy)] hover:border-border-hover hover:bg-surface-overlay" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
