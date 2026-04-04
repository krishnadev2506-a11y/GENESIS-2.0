import { useState } from 'react'
import { HoloPanel } from '../../components/ui/HoloPanel'
import { GlitchText } from '../../components/ui/GlitchText'
import { BookOpen, ExternalLink, FileText, Wifi, Coffee, Shield, X, FileSearch } from 'lucide-react'

const resources = [
  {
    category: 'TOOLS & APIS',
    icon: Wifi,
    color: 'text-cp-cyan',
    items: [
      { name: 'Supabase', desc: 'Backend & DB', url: 'https://supabase.com' },
      { name: 'GitHub Copilot', desc: 'AI coding assistant', url: 'https://github.com/features/copilot' },
      { name: 'Vercel', desc: 'Deploy in seconds', url: 'https://vercel.com' },
      { name: 'Figma', desc: 'UI/UX design', url: 'https://figma.com' },
    ]
  },
  {
    category: 'DOCUMENTATION',
    icon: FileText,
    color: 'text-cp-magenta',
    items: [
      { name: 'Problem Statements', desc: 'Official tracks & challenges', url: '#', content: 'TRACK 1: AI FOR GOOD\nDevelop an application that solves a real-world humanitarian crisis using Generative AI.\n\nTRACK 2: FINTECH FUTURE\nCreate a decentralized finance protocol or payment gateway alternative.\n\nMore details will be revealed at the opening ceremony!' },
      { name: 'Judging Criteria', desc: 'How projects are scored', url: '#', content: '1. Innovation (30%)\n2. Technical Complexity (30%)\n3. Business Viability (20%)\n4. UI/UX Design (20%)' },
      { name: 'Code of Conduct', desc: 'Rules & expectations', url: '#', content: 'Be respectful. Harassment is not tolerated. All code must be written during the hackathon window. Be awesome.' },
      { name: 'Submission Guidelines', desc: 'What to submit & format', url: '#', content: 'Submit a 3-minute video pitch, a link to a public GitHub repository, and a live deployment URL.' },
    ]
  },
  {
    category: 'VENUE & LOGISTICS',
    icon: Coffee,
    color: 'text-[#39FF14]',
    items: [
      { name: 'Wi-Fi Credentials', desc: 'SSID: GENESIS2 / Pass: hack2025', url: '#', content: 'Main Router:\nNetwork: GENESIS2_5G\nPassword: hack2025_secure\n\nBackup Router:\nNetwork: GENESIS_ALT\nPassword: offline_mode' },
      { name: 'Lab Timings', desc: 'Labs open 24/7 during event', url: '#', content: 'The labs are open for 48 hours consecutively. Sleeping bags are available in the recreational area.' },
      { name: 'Meal Schedule', desc: 'Breakfast 8AM, Lunch 1PM, Dinner 7PM', url: '#', content: 'All meals are served in the Ground Floor Cafeteria. Vegetarian and Vegan options are always available.' },
      { name: 'Emergency Contact', desc: 'Organizer: +91 98765 43210', url: '#', content: 'Lead Organizer: John Doe (+91 98765 43210)\nMedical Emergency: Call Campus Security instantly at internal ext 999.' },
    ]
  },
  {
    category: 'LEARNING',
    icon: Shield,
    color: 'text-cp-yellow',
    items: [
      { name: 'React Docs', desc: 'Official React documentation', url: 'https://react.dev' },
      { name: 'TailwindCSS', desc: 'Utility-first CSS framework', url: 'https://tailwindcss.com' },
      { name: 'FastAPI Docs', desc: 'Python backend framework', url: 'https://fastapi.tiangolo.com' },
      { name: 'Hugging Face', desc: 'Open-source AI models', url: 'https://huggingface.co' },
    ]
  }
]

export const ResourcesPage = () => {
  const [modalContent, setModalContent] = useState(null)

  return (
    <div className="p-8 max-w-4xl space-y-8 relative">
      <div>
        <h1 className="font-orbitron font-bold text-3xl text-cp-cyan mb-1"><GlitchText text="RESOURCE_HUB" /></h1>
        <p className="font-mono text-cp-muted text-sm">EVERYTHING YOU NEED TO HACK THE FUTURE</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map(section => {
          const Icon = section.icon
          return (
            <HoloPanel key={section.category}>
              <div className="flex items-center gap-2 mb-4">
                <Icon size={16} className={section.color} />
                <h2 className={`font-orbitron text-sm tracking-widest ${section.color}`}>{section.category}</h2>
              </div>
              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-cp-border last:border-0 group">
                    <button 
                      onClick={() => item.url === '#' && setModalContent(item)}
                      className={`text-left w-full ${item.url === '#' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                    >
                      <p className="font-mono text-sm text-cp-text group-hover:text-white transition-colors">{item.name}</p>
                      <p className="font-mono text-[10px] text-cp-muted">{item.desc}</p>
                    </button>
                    {item.url && item.url !== '#' ? (
                      <a href={item.url} target="_blank" rel="noreferrer" className={`${section.color} hover:opacity-70 transition-opacity flex-shrink-0 mt-1`}>
                        <ExternalLink size={14} />
                      </a>
                    ) : item.url === '#' ? (
                      <button onClick={() => setModalContent(item)} className={`${section.color} hover:opacity-70 transition-opacity flex-shrink-0 mt-1`}>
                        <FileSearch size={14} />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </HoloPanel>
          )
        })}
      </div>

      {/* Quick note */}
      <HoloPanel className="border-cp-yellow/50 bg-cp-yellow/5">
        <p className="font-mono text-xs text-cp-yellow text-center">
          ⚡ Need something not listed? Ask an organizer or ping in the Discord server.
        </p>
      </HoloPanel>

      {/* Internal Document Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setModalContent(null)}>
          <div className="bg-[#12121A] border border-cp-border w-full max-w-lg shadow-[0_0_30px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-cp-border flex justify-between items-center bg-cp-dark/50">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-cp-magenta" />
                <h3 className="font-orbitron font-bold text-white text-sm">{modalContent.name}</h3>
              </div>
              <button onClick={() => setModalContent(null)} className="text-cp-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {modalContent.content ? (
                <div className="whitespace-pre-wrap font-mono text-sm text-cp-text leading-relaxed">
                  {modalContent.content}
                </div>
              ) : (
                <p className="text-center text-cp-muted font-mono py-8">DOCUMENT NOT FOUND OR EMPTY</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
