import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export function Card({
  children,
  hover = false,
  glow = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`card-elevated rounded-2xl p-5 transition-all duration-200 ease-[var(--ease-snappy)] ${
        hover ? "card-elevated-hover cursor-pointer" : ""
      } ${glow ? "border-accent/20" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
