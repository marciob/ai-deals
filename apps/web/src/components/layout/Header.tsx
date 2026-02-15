export function Header() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 backdrop-blur-xl bg-surface-base/60 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-[oklch(0.55_0.22_310)] flex items-center justify-center glow-accent-sm">
          <span className="text-xs font-bold text-white tracking-tight">AI</span>
        </div>
        <span className="text-base font-semibold text-text-primary tracking-tight">
          ai-deals
        </span>
        <span className="text-[10px] text-text-muted font-medium bg-surface-highlight/30 rounded-full px-2 py-0.5 ml-1">
          MVP
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 glass rounded-full px-3.5 py-1.5">
          <span className="h-2 w-2 rounded-full bg-status-verified animate-pulse" />
          <span className="text-xs font-medium text-text-secondary">
            Devnet
          </span>
        </div>
        <div className="flex items-center gap-2.5 glass rounded-full px-3.5 py-1.5">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent/60 to-status-matched/60" />
          <span className="font-mono text-xs text-text-secondary">
            0x42...f9a1
          </span>
        </div>
      </div>
    </header>
  );
}
