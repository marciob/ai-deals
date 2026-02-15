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
        <label htmlFor={inputId} className="text-xs text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors duration-150 focus:border-accent focus:ring-1 focus:ring-accent/30 ${className}`}
        {...props}
      />
    </div>
  );
}
