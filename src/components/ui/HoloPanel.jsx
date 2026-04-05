export const HoloPanel = ({ children, className = '' }) => {
  return (
    <div className={`panel-surface group relative p-5 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-white/12 hover:shadow-[0_18px_38px_rgba(3,8,20,0.28)] ${className}`}>
      <div className="absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-cp-cyan/28 to-transparent opacity-70" />
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cp-magenta/16 to-transparent opacity-40" />
      <div className="absolute top-0 left-0 h-4 w-4 rounded-tl-[24px] border-l border-t border-transparent transition-colors duration-300 group-hover:border-cp-cyan/30" />
      <div className="absolute top-0 right-0 h-4 w-4 rounded-tr-[24px] border-r border-t border-transparent transition-colors duration-300 group-hover:border-cp-cyan/20" />
      <div className="absolute bottom-0 left-0 h-4 w-4 rounded-bl-[24px] border-b border-l border-transparent transition-colors duration-300 group-hover:border-cp-magenta/18" />
      <div className="absolute bottom-0 right-0 h-4 w-4 rounded-br-[24px] border-b border-r border-transparent transition-colors duration-300 group-hover:border-cp-magenta/12" />
      {children}
    </div>
  )
}
