"use client";

import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-secondary tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-xl border border-border bg-surface-base/60 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-all duration-200 focus:border-accent/50 focus:bg-surface-base/80 focus:ring-2 focus:ring-accent/15 ${className}`}
        {...props}
      />
    </div>
  );
}
