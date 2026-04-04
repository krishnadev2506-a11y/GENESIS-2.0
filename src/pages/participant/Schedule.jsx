import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { Calendar, Clock, MapPin } from 'lucide-react'

const schedule = [
  { day: 'DAY 1', date: 'AUG 15', items: [
    { time: '08:00', label: 'Registration & Check-in',     type: 'logistics', venue: 'Main Gate'       },
    { time: '09:00', label: 'Inauguration Ceremony',        type: 'event',    venue: 'Auditorium'      },
    { time: '10:00', label: 'Team Formation & Briefing',    type: 'event',    venue: 'Hall A'          },
    { time: '11:00', label: '🚀 HACKING BEGINS',            type: 'milestone',venue: 'All Labs'        },
    { time: '13:00', label: 'Lunch',                        type: 'meals',    venue: 'Cafeteria'       },
    { time: '15:00', label: 'Mentor Session — Round 1',     type: 'event',    venue: 'Breakout Rooms'  },
    { time: '19:00', label: 'Dinner',                       type: 'meals',    venue: 'Cafeteria'       },
    { time: '22:00', label: 'Midnight Chill & Games',       type: 'misc',     venue: 'Recreation Room' },
  ]},
  { day: 'DAY 2', date: 'AUG 16', items: [
    { time: '08:00', label: 'Breakfast',                    type: 'meals',    venue: 'Cafeteria'       },
    { time: '10:00', label: 'Mentor Session — Round 2',     type: 'event',    venue: 'Breakout Rooms'  },
    { time: '13:00', label: 'Lunch',                        type: 'meals',    venue: 'Cafeteria'       },
    { time: '18:00', label: 'Dinner',                       type: 'meals',    venue: 'Cafeteria'       },
    { time: '22:00', label: 'Deadline Warning — 12 hrs',    type: 'milestone',venue: 'All Labs'        },
  ]},
  { day: 'DAY 3', date: 'AUG 17', items: [
    { time: '08:00', label: 'Breakfast',                    type: 'meals',    venue: 'Cafeteria'       },
    { time: '10:00', label: '🏁 HACKING ENDS — Submissions', type: 'milestone',venue: 'Online Portal'  },
    { time: '11:00', label: 'Project Demonstrations',       type: 'event',    venue: 'Exhibition Hall' },
    { time: '14:00', label: 'Lunch',                        type: 'meals',    venue: 'Cafeteria'       },
    { time: '15:00', label: 'Judge Panel — Final Review',   type: 'event',    venue: 'Auditorium'      },
    { time: '17:00', label: 'Prize Distribution & Closing', type: 'milestone',venue: 'Auditorium'      },
    { time: '18:00', label: 'Event Ends',                   type: 'logistics',venue: 'All Venues'      },
  ]},
]

const typeColor = {
  milestone: 'border-[#F5E642] text-[#F5E642]',
  event:     'border-cp-cyan     text-cp-cyan',
  meals:     'border-[#39FF14]   text-[#39FF14]',
  logistics: 'border-cp-muted    text-cp-muted',
  misc:      'border-cp-magenta  text-cp-magenta',
}

const typeDot = {
  milestone: 'bg-[#F5E642]',
  event:     'bg-cp-cyan',
  meals:     'bg-[#39FF14]',
  logistics: 'bg-cp-muted',
  misc:      'bg-cp-magenta',
}

export const SchedulePage = () => (
  <div className="p-8 max-w-3xl space-y-8">
    <div>
      <h1 className="font-orbitron font-bold text-3xl text-cp-yellow mb-1"><GlitchText text="EVENT_TIMELINE" /></h1>
      <p className="font-mono text-cp-muted text-sm">GENESIS 2.0 · AUG 15–17 · 48-HOUR HACKATHON</p>
    </div>

    {/* Legend */}
    <div className="flex flex-wrap gap-3">
      {Object.entries({ milestone: 'KEY EVENT', event: 'SESSION', meals: 'MEALS', logistics: 'LOGISTICS', misc: 'EXTRA' }).map(([k, v]) => (
        <div key={k} className="flex items-center gap-1.5 font-mono text-[10px] text-cp-muted">
          <div className={`w-2 h-2 rounded-full ${typeDot[k]}`} />{v}
        </div>
      ))}
    </div>

    {schedule.map(day => (
      <div key={day.day}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={16} className="text-cp-cyan" />
          <h2 className="font-orbitron text-white">{day.day} <span className="text-cp-cyan">— {day.date}</span></h2>
        </div>
        <div className="relative border-l-2 border-cp-border ml-2 space-y-1 pl-6">
          {day.items.map((item, i) => (
            <div key={i} className="relative">
              <div className={`absolute -left-[29px] top-3 w-3 h-3 rounded-full border-2 ${item.type === 'milestone' ? 'bg-[#F5E642] border-[#F5E642]' : 'bg-cp-bg border-cp-border'}`} />
              <HoloPanel className="py-3 px-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-cp-muted w-12">{item.time}</span>
                    <span className={`font-mono text-sm ${item.type === 'milestone' ? 'text-[#F5E642] font-bold' : 'text-cp-text'}`}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-cp-muted">
                    <MapPin size={9} />{item.venue}
                  </div>
                </div>
              </HoloPanel>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)
