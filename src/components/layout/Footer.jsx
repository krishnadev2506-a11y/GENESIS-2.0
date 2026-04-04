export const Footer = () => {
  return (
    <footer className="bg-[#0A0A0F] border-t border-[#1e1e30] py-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        
        <pre className="text-[#2A2A3F] font-mono text-[8px] sm:text-[10px] leading-tight text-center hidden sm:block mb-8">
{` ██████╗ ███████╗███╗   ██╗███████╗███████╗██╗███████╗
██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔════╝██║██╔════╝
██║  ███╗█████╗  ██╔██╗ ██║█████╗  ███████╗██║███████╗
██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ╚════██║██║╚════██║
╚██████╔╝███████╗██║ ╚████║███████╗███████║██║███████║
 ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝╚══════╝`}
        </pre>

        <div className="flex gap-6 mb-8 font-mono text-xs tracking-widest font-bold">
          <a href="#" className="text-[#6B6B8A] hover:text-[#00F5FF] transition-colors">[GH]</a>
          <a href="#" className="text-[#6B6B8A] hover:text-[#00F5FF] transition-colors">[TW]</a>
          <a href="#" className="text-[#6B6B8A] hover:text-[#00F5FF] transition-colors">[IN]</a>
          <a href="#" className="text-[#6B6B8A] hover:text-[#00F5FF] transition-colors">[IG]</a>
        </div>

        <p className="font-mono text-xs tracking-[0.2em] text-[#6B6B8A] text-center">
          © 2025 GENESIS 2.0. ALL SYSTEMS OPERATIONAL.
        </p>

      </div>
    </footer>
  )
}
