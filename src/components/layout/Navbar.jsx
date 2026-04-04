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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[rgba(10,10,15,0.9)] backdrop-blur-md border-b border-[#1e1e30]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 font-orbitron font-bold text-2xl text-[#00F5FF]">
            <GlitchText text="GENESIS" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="font-mono text-xs tracking-widest text-[#6B6B8A] hover:text-[#00F5FF] transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <NeonButton variant="outline" onClick={() => navigate('/login')} className="!py-2 !px-4 text-xs font-mono">LOGIN</NeonButton>
            <NeonButton variant="primary" onClick={() => navigate('/register')} className="!py-2 !px-4 text-xs font-mono">REGISTER</NeonButton>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-[#00F5FF] hover:text-white p-2"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Setup */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A0A0F] border-b border-[#2A2A3F]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block px-3 py-2 font-mono text-sm tracking-widest text-[#6B6B8A] hover:text-[#00F5FF]"
              >
                {item.name}
              </a>
            ))}
            <div className="px-3 py-4 flex flex-col gap-3">
              <NeonButton variant="outline" onClick={() => { setMobileOpen(false); navigate('/login'); }} className="w-full text-xs">LOGIN</NeonButton>
              <NeonButton variant="primary" onClick={() => { setMobileOpen(false); navigate('/register'); }} className="w-full text-xs">REGISTER</NeonButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
