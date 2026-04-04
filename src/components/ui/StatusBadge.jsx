const config = {
  confirmed:      { color: 'text-[#39FF14]', bg: 'bg-[#39FF14]/10 border-[#39FF14]/30', dot: 'bg-[#39FF14]' },
  pending:        { color: 'text-cp-yellow',  bg: 'bg-cp-yellow/10  border-cp-yellow/30',  dot: 'bg-cp-yellow' },
  rejected:       { color: 'text-cp-magenta', bg: 'bg-cp-magenta/10 border-cp-magenta/30', dot: 'bg-cp-magenta' },
  waitlist:       { color: 'text-cp-muted',   bg: 'bg-cp-muted/10   border-cp-muted/30',   dot: 'bg-cp-muted' },
  'not registered':{ color: 'text-cp-muted',  bg: 'bg-cp-muted/10   border-cp-muted/30',   dot: 'bg-cp-muted' },
}

export const StatusBadge = ({ status }) => {
  const cfg = config[status] || config['not registered']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border font-mono text-[10px] tracking-widest uppercase ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  )
}
