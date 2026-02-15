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
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-medium text-text-secondary tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`rounded-xl border border-border bg-surface-base/60 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-all duration-200 focus:border-accent/50 focus:bg-surface-base/80 focus:ring-2 focus:ring-accent/15 resize-y min-h-[88px] ${className}`}
        {...props}
      />
    </div>
  );
}
