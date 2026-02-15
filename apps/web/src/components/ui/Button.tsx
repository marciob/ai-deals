"use client";

import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-sm",
  secondary:
    "bg-surface-raised border border-border text-text-primary hover:bg-surface-overlay hover:border-border-hover shadow-sm",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-surface-highlight",
  danger:
    "bg-status-timed-out/8 text-status-timed-out border border-status-timed-out/15 hover:bg-status-timed-out/12",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-sm rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em] transition-all duration-150 ease-[var(--ease-snappy)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
