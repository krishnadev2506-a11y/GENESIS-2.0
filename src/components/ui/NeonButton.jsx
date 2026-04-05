export const NeonButton = ({ children, onClick, className = '', variant = 'primary', type = 'button', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.24em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cp-cyan/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cp-black disabled:pointer-events-none disabled:opacity-60"
  
  const variants = {
    primary: "border-cp-cyan/28 bg-cp-cyan/[0.07] text-cp-text shadow-accent hover:-translate-y-0.5 hover:border-cp-cyan/42 hover:bg-cp-cyan/[0.11]",
    secondary: "border-cp-magenta/28 bg-cp-magenta/[0.07] text-cp-text hover:-translate-y-0.5 hover:border-cp-magenta/42 hover:bg-cp-magenta/[0.11]",
    outline: "border-white/10 bg-white/[0.025] text-cp-text hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.05]",
    danger: "border-cp-magenta/28 bg-cp-magenta/[0.07] text-cp-text hover:-translate-y-0.5 hover:border-cp-magenta/42 hover:bg-cp-magenta/[0.13]",
  }

  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
