export const TerminalInput = ({ label, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full font-mono">
      {label && <label className="text-cp-muted text-sm tracking-widest">{label}</label>}
      <div className="relative group">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cp-cyan opacity-70">»</span>
        <input 
          className="w-full bg-cp-dark border border-cp-border py-3 pl-10 pr-4 text-cp-text focus:outline-none focus:border-cp-cyan focus:shadow-[0_0_10px_rgba(0,245,255,0.2)] transition-all placeholder:text-cp-muted"
          {...props} 
        />
        <div className="absolute top-0 right-0 w-2 h-full bg-cp-cyan opacity-0 group-focus-within:animate-flicker group-focus-within:opacity-100" />
      </div>
    </div>
  )
}
