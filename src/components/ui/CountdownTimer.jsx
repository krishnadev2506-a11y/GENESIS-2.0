import { useState, useEffect } from 'react'

export const CountdownTimer = ({ targetDate, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    const target = new Date(targetDate).getTime()
    if (!target || isNaN(target)) return
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = target - now

      if (distance < 0) {
        clearInterval(interval)
        if (onEnd) onEnd()
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [targetDate])

  const format = (num) => num.toString().padStart(2, '0')

  const Box = ({ label, value }) => (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-[#12121A] border border-[#2A2A3F] w-16 h-20 sm:w-24 sm:h-28 flex items-center justify-center animate-flicker">
        <span className="font-orbitron text-3xl sm:text-5xl text-[#00F5FF] drop-shadow-[0_0_10px_#00F5FF]">
          {format(value)}
        </span>
      </div>
      <span className="font-mono text-[10px] sm:text-xs tracking-[0.2em] text-[#6B6B8A] uppercase">{label}</span>
    </div>
  )

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Box label="DAYS" value={timeLeft.days} />
      <span className="font-orbitron font-bold text-2xl sm:text-4xl text-[#FF2D78] mb-6 animate-pulse">:</span>
      <Box label="HOURS" value={timeLeft.hours} />
      <span className="font-orbitron font-bold text-2xl sm:text-4xl text-[#FF2D78] mb-6 animate-pulse">:</span>
      <Box label="MINS" value={timeLeft.mins} />
      <span className="font-orbitron font-bold text-2xl sm:text-4xl text-[#FF2D78] mb-6 animate-pulse">:</span>
      <Box label="SECS" value={timeLeft.secs} />
    </div>
  )
}
