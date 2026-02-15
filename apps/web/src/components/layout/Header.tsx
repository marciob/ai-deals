export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-sm font-bold text-white">AI</span>
        </div>
        <span className="text-lg font-semibold text-text-primary">
          ai-deals
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-surface-raised px-3 py-1 text-xs text-text-muted border border-border">
          Devnet
        </span>
        <span className="font-mono text-xs text-text-secondary">
          0x42...f9a1
        </span>
      </div>
    </header>
  );
}
