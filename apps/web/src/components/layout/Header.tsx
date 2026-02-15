export function Header() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-surface-raised border-b border-border">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-xs font-bold text-white tracking-tight">AI</span>
        </div>
        <span className="text-sm font-semibold text-text-primary tracking-tight">
          ai-deals
        </span>
        <span className="text-[10px] text-text-muted font-medium bg-surface-highlight rounded-full px-2 py-0.5">
          MVP
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-status-verified" />
          <span className="text-xs font-medium text-text-secondary">
            Devnet
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <div className="h-5 w-5 rounded-full bg-surface-highlight" />
          <span className="font-mono text-xs text-text-secondary">
            0x42...f9a1
          </span>
        </div>
      </div>
    </header>
  );
}
