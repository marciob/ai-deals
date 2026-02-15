"use client";

import { type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({
  label,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all duration-150 focus:border-accent/40 focus:ring-2 focus:ring-accent/10 resize-y min-h-[88px] ${className}`}
        {...props}
      />
    </div>
  );
}
