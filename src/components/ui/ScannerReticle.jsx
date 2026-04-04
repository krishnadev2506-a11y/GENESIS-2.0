export const ScannerReticle = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-8">
      {/* Top Left */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#00F5FF]" />
      {/* Top Right */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#00F5FF]" />
      {/* Bottom Left */}
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#00F5FF]" />
      {/* Bottom Right */}
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#00F5FF]" />
      
      {/* Scanline */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00F5FF] opacity-80 animate-[scanSweep_2s_linear_infinite]" 
           style={{ boxShadow: '0 0 10px #00F5FF, 0 0 20px #00F5FF' }} />
           
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanSweep {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(280px); opacity: 0; }
        }
      `}} />
    </div>
  )
}
