export const NeonButton = ({ children, onClick, className = '', variant = 'primary', type = 'button', ...props }) => {
  const baseStyles = "px-6 py-3 font-orbitron tracking-widest relative overflow-hidden transition-all duration-300 transform hover:scale-105"
  
  const variants = {
    primary: "border border-cp-cyan text-cp-cyan bg-transparent hover:bg-cp-cyan hover:text-cp-black hover:shadow-[0_0_20px_#00F5FF_inset,0_0_20px_#00F5FF]",
    secondary: "border border-cp-magenta text-cp-magenta bg-transparent hover:bg-cp-magenta hover:text-cp-black hover:shadow-[0_0_20px_#FF2D78_inset,0_0_20px_#FF2D78]",
    outline: "border border-cp-muted text-cp-text hover:border-cp-text flex items-center justify-center gap-2",
    danger: "border border-cp-magenta text-cp-magenta bg-[rgba(255,45,120,0.1)] hover:bg-cp-magenta hover:text-cp-black hover:shadow-[0_0_20px_#FF2D78_inset,0_0_20px_#FF2D78]",
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
