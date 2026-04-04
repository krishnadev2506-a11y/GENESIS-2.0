import { useEffect, useState } from 'react'

export const GlitchText = ({ text, className = '' }) => {
  const [displayText, setDisplayText] = useState(text)
  const chars = '!@#$%^&*[]{}|<>01ABCDEF'

  useEffect(() => {
    let interval
    let timeout
    
    // Scramble effect
    interval = setInterval(() => {
      setDisplayText(text.split('').map(c => 
        c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]
      ).join(''))
    }, 50)

    // Resolve text
    timeout = setTimeout(() => {
      clearInterval(interval)
      setDisplayText(text)
    }, 800)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [text])

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{displayText}</span>
      <span className="absolute inset-0 text-cp-cyan animate-glitch opacity-50 ml-[-2px] mix-blend-screen">{displayText}</span>
      <span className="absolute inset-0 text-cp-magenta animate-glitch opacity-50 ml-[2px] mix-blend-screen" style={{ animationDelay: '0.1s' }}>{displayText}</span>
    </span>
  )
}
