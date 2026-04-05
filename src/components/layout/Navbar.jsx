import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GlitchText } from '../ui/GlitchText'
import { Menu, X } from 'lucide-react'
import { NeonButton } from '../ui/NeonButton'

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'ABOUT',    href: '#about'    },
    { name: 'TIMELINE', href: '#timeline' },
    { name: 'PRIZES',   href: '#prizes'   },
  ]

  const handleNavClick = (e, href) => {
    e.preventDefault()
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div className={`mx-auto max-w-7xl rounded-[28px] border transition-all duration-300 ease-out ${scrolled ? 'glass-panel-strong border-white/12' : 'border-white/8 bg-white/[0.02] backdrop-blur-sm'}`}>
        <div className="flex h-20 items-center justify-between px-4 sm:px-6">
          
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-3 font-orbitron text-xl font-semibold tracking-[0.22em] text-cp-text sm:text-2xl">
            <span className="h-2 w-2 rounded-full bg-cp-cyan shadow-[0_0_18px_rgba(110,231,249,0.45)]" />
            <GlitchText text="GENESIS" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-7">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="font-mono text-[11px] tracking-[0.22em] text-cp-muted transition-colors duration-200 hover:text-cp-text"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <NeonButton variant="outline" onClick={() => navigate('/login')} className="!rounded-xl !px-4 !py-2 text-[10px]">LOGIN</NeonButton>
            <NeonButton variant="primary" onClick={() => navigate('/register')} className="!rounded-xl !px-4 !py-2 text-[10px]">REGISTER</NeonButton>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-cp-text transition-colors hover:border-cp-cyan/30 hover:text-cp-cyan"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Setup */}
      {mobileOpen && (
        <div className="mx-auto mt-3 max-w-7xl rounded-[24px] border border-white/10 bg-[#0b1018]/88 p-3 backdrop-blur-xl md:hidden">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block rounded-xl px-3 py-2 font-mono text-xs tracking-[0.24em] text-cp-muted transition-colors hover:bg-white/[0.04] hover:text-cp-text"
              >
                {item.name}
              </a>
            ))}
            <div className="flex flex-col gap-3 px-3 py-4">
              <NeonButton variant="outline" onClick={() => { setMobileOpen(false); navigate('/login'); }} className="w-full text-[10px]">LOGIN</NeonButton>
              <NeonButton variant="primary" onClick={() => { setMobileOpen(false); navigate('/register'); }} className="w-full text-[10px]">REGISTER</NeonButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
