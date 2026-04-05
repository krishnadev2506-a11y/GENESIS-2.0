export const TerminalInput = ({ label, ...props }) => {
  return (
    <div className="flex w-full flex-col gap-2 font-mono">
      {label && <label className="text-[11px] uppercase tracking-[0.24em] text-cp-muted">{label}</label>}
      <div className="field-shell relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cp-cyan/70">»</span>
        <input
          className="w-full bg-transparent py-3.5 pl-10 pr-4 text-cp-text outline-none transition-all placeholder:text-cp-muted/80"
          {...props}
        />
        <div className="absolute bottom-2 right-3 h-5 w-px bg-cp-cyan/0 transition-all duration-300 group-focus-within:bg-cp-cyan/55" />
      </div>
    </div>
  )
}
