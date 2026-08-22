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
    title: 'Cultural Matching',
    desc: 'Gotra, kul, and tradition respected. Maithili customs at the heart of every connection.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" aria-hidden="true">
        {/* Madhubani house / privacy */}
        <rect x="10" y="24" width="28" height="20" fill="#C4562F" stroke="#7A1220" strokeWidth="1.5" />
        <polygon points="5,24 43,24 24,8" fill="#9B3520" stroke="#7A1220" strokeWidth="1.2" />
        <rect x="20" y="32" width="8" height="12" fill="#7A1220" />
        <rect x="12" y="28" width="7" height="7" fill="#E4C572" stroke="#B98A2E" strokeWidth="0.8" />
        <rect x="29" y="28" width="7" height="7" fill="#E4C572" stroke="#B98A2E" strokeWidth="0.8" />
        {/* lock */}
        <rect x="21" y="33" width="6" height="5" rx="1" fill="#E4C572" stroke="#B98A2E" strokeWidth="0.8" />
        <path d="M 22 33 Q 24 29 26 33" fill="none" stroke="#B98A2E" strokeWidth="1.2" />
      </svg>
    ),
    title: 'Privacy First',
    desc: 'Your biodata seen only by verified families you approve. Full control, always.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" aria-hidden="true">
        {/* Sacred fire / auspicious */}
        <ellipse cx="24" cy="42" rx="12" ry="4" fill="#7A1220" stroke="#B98A2E" strokeWidth="1" />
        <path d="M 14 42 L 16 34 L 32 34 L 34 42 Z" fill="#5A0E19" stroke="#B98A2E" strokeWidth="1" />
        <path d="M 17 34 L 18 28 L 30 28 L 31 34 Z" fill="#7A1220" stroke="#B98A2E" strokeWidth="0.8" />
        <path d="M 16 34 Q 18 20 22 14 Q 24 10 24 6 Q 26 10 26 14 Q 30 20 32 34" fill="#FF6B1A" />
        <path d="M 19 34 Q 21 22 23 16 Q 24 12 24 8 Q 25 12 25 16 Q 27 22 29 34" fill="#FFB347" />
        <path d="M 21 34 Q 23 24 24 18 Q 25 24 27 34" fill="#FFFF66" />
      </svg>
    ),
    title: 'Auspicious Matching',
    desc: 'Kundali, astrology, and muhurats — traditional checks alongside modern compatibility.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" aria-hidden="true">
        {/* Marigold garland = community */}
        <path d="M 6 24 Q 6 10 24 10 Q 42 10 42 24 Q 42 38 24 38 Q 6 38 6 24" fill="none" stroke="#2D5A27" strokeWidth="2" />
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => {
          const rad = (a * Math.PI) / 180
          const cx = 24 + 15 * Math.cos(rad)
          const cy = 24 + 13 * Math.sin(rad)
          return (
            <g key={i} transform={`translate(${cx},${cy})`}>
              {[0,60,120,180,240,300].map((pa, pi) => {
                const pr = (pa * Math.PI) / 180
                return <ellipse key={pi} cx={3*Math.cos(pr)} cy={3*Math.sin(pr)} rx="2" ry="3.5" fill={i%2===0?'#E8912A':'#FFD700'} stroke="#B96A1A" strokeWidth="0.4" transform={`rotate(${pa} ${3*Math.cos(pr)} ${3*Math.sin(pr)})`} />
              })}
              <circle cx="0" cy="0" r="1.5" fill="#FFD700" />
            </g>
          )
        })}
        <circle cx="24" cy="24" r="5" fill="#E4C572" stroke="#B98A2E" strokeWidth="1.2" />
        <text x="24" y="27.5" textAnchor="middle" fontSize="7" fill="#7A1220" fontFamily="serif">OM</text>
      </svg>
    ),
    title: 'Family to Family',
    desc: 'From first contact to milap — a platform that supports the whole family journey.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" aria-hidden="true">
        {/* Devanagari heart */}
        <text x="24" y="30" textAnchor="middle" fontSize="22" fill="#7A1220" fontFamily="serif" fontWeight="700">♥</text>
        {/* Madhubani dots around */}
        {[0,45,90,135,180,225,270,315].map((a, i) => {
          const rad = (a * Math.PI) / 180
          return <circle key={i} cx={24+18*Math.cos(rad)} cy={24+16*Math.sin(rad)} r="2.5" fill={i%2===0?'#E4C572':'#E8912A'} stroke="#B98A2E" strokeWidth="0.5" />
        })}
        <circle cx="24" cy="24" r="20" fill="none" stroke="#B98A2E" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
    ),
    title: 'Maithili Language',
    desc: 'Biodata in मैथिली, हिन्दी, and English — because your story deserves your language.',
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
