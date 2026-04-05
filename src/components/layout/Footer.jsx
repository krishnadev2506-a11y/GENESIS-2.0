export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#07101a]/72 py-10 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 text-center">
        <div className="accent-line w-full max-w-md" />

        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.35em] text-cp-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-cp-cyan" />
          <span>Genesis 2.0</span>
        </div>

        <div className="flex gap-6 font-mono text-[11px] tracking-[0.26em] text-cp-muted">
          <a href="#" className="transition-colors hover:text-cp-text">GH</a>
          <a href="#" className="transition-colors hover:text-cp-text">TW</a>
          <a href="#" className="transition-colors hover:text-cp-text">IN</a>
          <a href="#" className="transition-colors hover:text-cp-text">IG</a>
        </div>

        <p className="font-mono text-[11px] tracking-[0.2em] text-cp-muted">
          (C) 2025 GENESIS 2.0. ALL SYSTEMS OPERATIONAL.
        </p>
      </div>
    </footer>
  )
}
