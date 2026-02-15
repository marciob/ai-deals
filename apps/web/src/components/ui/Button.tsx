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
    "bg-gradient-to-r from-accent to-[oklch(0.60_0.24_300)] text-white glow-accent hover:brightness-110 active:scale-[0.97]",
  secondary:
    "glass inner-light text-text-primary hover:bg-glass-hover",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-surface-raised/50",
  danger:
    "bg-status-timed-out/15 text-status-timed-out border border-status-timed-out/20 hover:bg-status-timed-out/25",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-xl",
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
      className={`inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em] transition-all duration-200 ease-[var(--ease-snappy)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
