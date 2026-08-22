const CARDS = [
  {
    color: 'bg-maroon',
    textColor: 'text-gold-lt',
    descColor: 'text-paper-2',
    icon: (
      <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" aria-hidden="true">
        <ellipse cx="28" cy="32" rx="18" ry="12" fill="#E4C572" stroke="#FBF1DD" strokeWidth="1.5" />
        <path d="M 46 32 L 54 24 L 54 40 Z" fill="#E4C572" stroke="#FBF1DD" strokeWidth="1.2" />
        {[0,1,2,3].map(i => <path key={i} d={`M ${18+i*5} 22 Q ${19+i*5} 32 ${18+i*5} 42`} fill="none" stroke="#FBF1DD" strokeWidth="1" />)}
        <circle cx="22" cy="30" r="4" fill="#7A1220" /><circle cx="23" cy="29" r="1.5" fill="#E4C572" />
        {[-8,-4,0,4,8].map((dx,pi) => <ellipse key={pi} cx={28+dx} cy={48} rx={3} ry={6} fill="#FF91A4" stroke="#D4536A" strokeWidth="0.6" />)}
        <circle cx="28" cy="46" r="3" fill="#FFD700" />
      </svg>
    ),
    title: 'Detailed Biodata',
    desc: 'Rich profiles beyond a photo — family history, kul, gotra, occupation, horoscope, and cultural preferences in one place.',
  },
  {
    color: 'bg-terra',
    textColor: 'text-paper',
    descColor: 'text-paper-2',
    icon: (
      <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" aria-hidden="true">
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => {
          const r = (a*Math.PI)/180
          const cx = 28+18*Math.cos(r), cy = 28+15*Math.sin(r)
          return <circle key={i} cx={cx} cy={cy} r="4" fill={i%2===0?'#E8912A':'#FFD700'} stroke="#FBF1DD" strokeWidth="0.6" />
        })}
        <circle cx="28" cy="28" r="10" fill="#FBF1DD" stroke="#FBF1DD" strokeWidth="1.5" />
        <text x="28" y="32" textAnchor="middle" fontSize="12" fill="#7A1220" fontFamily="serif" fontWeight="700">❤</text>
      </svg>
    ),
    title: 'Family Introductions',
    desc: 'Structured milap process — families connect respectfully, at their own pace, guided by cultural norms.',
  },
  {
    color: 'bg-green',
    textColor: 'text-gold-lt',
    descColor: 'text-paper-2',
    icon: (
      <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" aria-hidden="true">
        <rect x="10" y="16" width="36" height="28" rx="4" fill="#FBF1DD" stroke="#E4C572" strokeWidth="1.5" />
        {['मैथिली', 'हिन्दी', 'English'].map((t, i) => (
          <text key={i} x="28" y={26+i*8} textAnchor="middle" fontSize={i===0?9:8} fill={i===0?'#7A1220':'#6A5A4E'} fontFamily="serif" fontWeight={i===0?'700':'400'}>{t}</text>
        ))}
        <rect x="8" y="14" width="10" height="5" rx="2" fill="#E4C572" stroke="#B98A2E" strokeWidth="0.8" />
        <text x="13" y="18" textAnchor="middle" fontSize="4" fill="#7A1220">भाषा</text>
      </svg>
    ),
    title: 'Three Languages',
    desc: 'Create and browse biodata in मैथिली, हिन्दी, or English. Your mother tongue is honoured.',
  },
  {
    color: 'bg-indigo',
    textColor: 'text-gold-lt',
    descColor: 'text-paper-2',
    icon: (
      <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" aria-hidden="true">
        <path d="M 28 6 Q 14 14 14 28 Q 14 44 28 50 Q 42 44 42 28 Q 42 14 28 6 Z" fill="none" stroke="#E4C572" strokeWidth="1.5" />
        <ellipse cx="28" cy="28" rx="14" ry="22" fill="none" stroke="#E4C572" strokeWidth="1" />
        <line x1="14" y1="28" x2="42" y2="28" stroke="#E4C572" strokeWidth="1" />
        <text x="28" y="21" textAnchor="middle" fontSize="7" fill="#E4C572">Bihar</text>
        <text x="28" y="33" textAnchor="middle" fontSize="7" fill="#E4C572">Jharkhand</text>
        {[[22,22],[34,22],[22,34],[34,34]].map(([px,py],i) => <circle key={i} cx={px} cy={py} r="2.2" fill="#FF6B1A" />)}
      </svg>
    ),
    title: 'India-Wide Reach',
    desc: 'Profiles from Bihar, Jharkhand, Uttar Pradesh, and the broader Maithili diaspora across India.',
  },
]

export function PlatformSection() {
  return (
    <section className="relative bg-paper py-16">
      <div className="wrap">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">More than Matrimonial</p>
          <h2 className="section-heading">A Complete Cultural Platform</h2>
          <div className="ornament-line w-24 mx-auto mt-4" />
          <p className="mt-5 text-ink-soft max-w-xl mx-auto text-[16px]">
            Mithila Jodi honours the full richness of Maithili tradition — not just a search
            form, but a cultural bridge across generations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CARDS.map(({ color, textColor, descColor, icon, title, desc }) => (
            <div
              key={title}
              className={`${color} rounded-mj p-6 flex flex-col gap-4 shadow-mj-sm hover:-translate-y-1 hover:shadow-mj transition-all duration-200`}
            >
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                {icon}
              </div>
              <h3 className={`font-serif text-xl ${textColor} leading-snug`}>{title}</h3>
              <p className={`text-[14px] ${descColor} leading-relaxed`}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
