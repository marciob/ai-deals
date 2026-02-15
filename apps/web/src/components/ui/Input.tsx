"use client";

import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all duration-150 focus:border-accent/40 focus:ring-2 focus:ring-accent/10 ${className}`}
        {...props}
      />
    </div>
  );
}
