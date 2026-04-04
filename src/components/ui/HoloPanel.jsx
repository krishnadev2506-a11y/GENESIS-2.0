export const HoloPanel = ({ children, className = '' }) => {
  return (
    <div className={`relative bg-[#12121A] border border-[#2A2A3F] p-5 group ${className}`}>
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-transparent group-hover:border-[#00F5FF] transition-colors" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-transparent group-hover:border-[#00F5FF] transition-colors" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-transparent group-hover:border-[#00F5FF] transition-colors" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-transparent group-hover:border-[#00F5FF] transition-colors" />
      {children}
    </div>
  )
}
