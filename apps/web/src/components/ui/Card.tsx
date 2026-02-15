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
      className={`glass inner-light rounded-2xl p-5 transition-all duration-300 ease-[var(--ease-snappy)] ${
        hover ? "glass-hover cursor-pointer" : ""
      } ${glow ? "glow-accent-sm" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
