const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" aria-hidden="true">
        {/* Madhubani fish = identity / authenticity */}
        <ellipse cx="24" cy="26" rx="14" ry="9" fill="#E4C572" stroke="#7A1220" strokeWidth="1.5" />
        <path d="M 38 26 L 46 20 L 46 32 Z" fill="#E4C572" stroke="#7A1220" strokeWidth="1.2" />
        {[0,1,2].map(i => (
          <path key={i} d={`M ${16 + i*4} 18 Q ${17+i*4} 26 ${16+i*4} 34`} fill="none" stroke="#7A1220" strokeWidth="1" />
        ))}
        <circle cx="18" cy="24" r="3" fill="#7A1220" />
        <circle cx="19" cy="23" r="1" fill="#E4C572" />
        {/* lotus below */}
        {[-6,-3,0,3,6].map((dx,pi) => (
          <ellipse key={pi} cx={24+dx} cy={40} rx={2.5} ry={5} fill="#FF91A4" stroke="#D4536A" strokeWidth="0.6" />
        ))}
        <circle cx="24" cy="38" r="2.5" fill="#FFD700" />
      </svg>
    ),
    title: 'Verified Profiles',
    desc: 'Every biodata reviewed. No fakes, no strangers — only trusted Maithili families.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" aria-hidden="true">
        {/* Peacock = culture */}
        {[-14,-8,-2,4,10,16].map((dx, i) => (
          <g key={i}>
            <line x1="24" y1="30" x2={24+dx} y2={8-Math.abs(dx)*0.3} stroke="#1A6B4A" strokeWidth="1.2" />
            <ellipse cx={24+dx} cy={7-Math.abs(dx)*0.3} rx="4" ry="6" fill="#1A6B4A" stroke="#0D4A30" strokeWidth="0.6" />
            <circle cx={24+dx} cy={8-Math.abs(dx)*0.3} r="2" fill="#4A90A4" />
            <circle cx={24+dx} cy={8-Math.abs(dx)*0.3} r="0.8" fill="#E4C572" />
          </g>
        ))}
        <ellipse cx="24" cy="34" rx="12" ry="8" fill="#1A6B4A" stroke="#0D4A30" strokeWidth="1.2" />
        <circle cx="24" cy="23" r="6" fill="#1A6B4A" stroke="#0D4A30" strokeWidth="1" />
        {[0,1,2,3,4].map(i => (
          <g key={i}><line x1={20+i} y1="17" x2={19+i} y2="12" stroke="#1A6B4A" strokeWidth="0.8" /><circle cx={19+i} cy="11" r="1.5" fill="#E4C572" /></g>
        ))}
        <circle cx="26" cy="22" r="2.2" fill="white" stroke="#0D4A30" strokeWidth="0.5" />
        <circle cx="27" cy="22" r="1.2" fill="#0D4A30" />
      </svg>
    ),
    title: 'Family Involvement',
    desc: 'Marriage in Mithila is a family union. Parents and elders are welcome at every step.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" aria-hidden="true">
        {/* Document / biodata */}
        <rect x="10" y="6" width="28" height="36" rx="3" fill="#FBF1DD" stroke="#7A1220" strokeWidth="1.5" />
        <rect x="10" y="6" width="28" height="9" rx="3" fill="#7A1220" />
        <rect x="10" y="11" width="28" height="4" fill="#7A1220" />
        <line x1="15" y1="22" x2="33" y2="22" stroke="#B98A2E" strokeWidth="1.4" />
        <line x1="15" y1="27" x2="33" y2="27" stroke="#B98A2E" strokeWidth="1.4" />
        <line x1="15" y1="32" x2="27" y2="32" stroke="#B98A2E" strokeWidth="1.4" />
        {/* Madhubani lotus at top */}
        {[-6,-3,0,3,6].map((dx,pi) => (
          <ellipse key={pi} cx={24+dx} cy={11} rx={2.5} ry={4} fill="#E4C572" stroke="#B98A2E" strokeWidth="0.5" />
        ))}
        <circle cx="24" cy="9" r="2" fill="#B98A2E" />
      </svg>
    ),
    title: 'Marriage Biodata Generator',
    desc: 'Create a complete marriage biodata in मैथिली, हिन्दी, English, or Sanskrit.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" aria-hidden="true">
        {/* Temple = Mithila Roots */}
        <rect x="16" y="24" width="16" height="18" fill="#C4562F" stroke="#7A1220" strokeWidth="1.2" />
        <rect x="22" y="30" width="4" height="12" fill="#7A1220" />
        <rect x="12" y="24" width="24" height="5" fill="#7A1220" stroke="#B98A2E" strokeWidth="0.8" />
        <rect x="14" y="16" width="20" height="10" fill="#9B2233" stroke="#7A1220" strokeWidth="1" />
        <rect x="18" y="10" width="12" height="8" fill="#7A1220" />
        <rect x="20" y="6" width="8" height="6" fill="#9B2233" />
        <ellipse cx="24" cy="4" rx="5" ry="3.5" fill="#B98A2E" />
        <line x1="24" y1="0" x2="24" y2="3" stroke="#B98A2E" strokeWidth="1.5" />
        <circle cx="24" cy="0" r="2" fill="#E4C572" />
        <line x1="12" y1="26" x2="36" y2="26" stroke="#E4C572" strokeWidth="0.8" />
      </svg>
    ),
    title: 'Mithila Roots',
    desc: 'Gotra, kul, mool, and ancestral gram — cultural identity at the core of every match.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" aria-hidden="true">
        {/* Lock + message = safe comms */}
        <rect x="8" y="22" width="32" height="22" rx="4" fill="#FBF1DD" stroke="#7A1220" strokeWidth="1.5" />
        <path d="M 16 22 L 16 16 Q 16 8 24 8 Q 32 8 32 16 L 32 22" fill="none" stroke="#7A1220" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="33" r="4" fill="#7A1220" />
        <rect x="22.5" y="33" width="3" height="5" rx="1" fill="#7A1220" />
        {/* small marigold accents */}
        {[14,34].map((fx,fi) => (
          <g key={fi}>
            {[0,60,120,180,240,300].map((a,ai) => {
              const r=(a*Math.PI)/180
              return <ellipse key={ai} cx={fx+4*Math.cos(r)} cy={44+3*Math.sin(r)} rx="1.5" ry="2.5" fill="#E8912A" stroke="#B96A1A" strokeWidth="0.3" transform={`rotate(${a} ${fx+4*Math.cos(r)} ${44+3*Math.sin(r)})`} />
            })}
            <circle cx={fx} cy="44" r="1.2" fill="#E4C572" />
          </g>
        ))}
      </svg>
    ),
    title: 'Safe & Private Communication',
    desc: 'Controlled contact — your details shared only with families you approve.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" aria-hidden="true">
        {/* Heart with Madhubani dots */}
        <path d="M24 40 C 10 30, 8 18, 16 14 C 20 12, 24 15, 24 19 C 24 15, 28 12, 32 14 C 40 18, 38 30, 24 40 Z" fill="#7A1220" stroke="#5A0E19" strokeWidth="1" />
        {[0,45,90,135,180,225,270,315].map((a, i) => {
          const rad = (a * Math.PI) / 180
          return <circle key={i} cx={24+18*Math.cos(rad)} cy={24+15*Math.sin(rad)} r="2.2" fill={i%2===0?'#E4C572':'#E8912A'} stroke="#B98A2E" strokeWidth="0.5" />
        })}
        <circle cx="24" cy="24" r="19" fill="none" stroke="#B98A2E" strokeWidth="0.8" strokeDasharray="3,3" />
      </svg>
    ),
    title: 'Real Relationships',
    desc: 'No endless swiping. Verified biodata and a process built for serious matrimony.',
  },
]

export function FeatureStrip() {
  return (
    <section id="how" className="relative bg-cream py-16" aria-label="Platform features">
      <div className="wrap">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Why Mithila Jodi</p>
          <h2 className="section-heading">Built for Maithili Families</h2>
          <div className="ornament-line w-24 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group flex flex-col items-center text-center gap-4 p-5 rounded-mj-sm border border-paper-3 bg-paper hover:border-gold hover:shadow-mj-xs transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center border-2 border-gold border-opacity-30 group-hover:border-opacity-70 transition-all">
                {icon}
              </div>
              <h3 className="font-serif text-[15px] text-maroon leading-snug">{title}</h3>
              <p className="text-[12px] text-ink-soft leading-snug hidden lg:block">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
