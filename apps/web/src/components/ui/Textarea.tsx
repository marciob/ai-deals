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
        <label htmlFor={textareaId} className="text-xs text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors duration-150 focus:border-accent focus:ring-1 focus:ring-accent/30 resize-y min-h-[80px] ${className}`}
        {...props}
      />
    </div>
  );
}
