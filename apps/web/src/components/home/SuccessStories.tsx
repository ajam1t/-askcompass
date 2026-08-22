const VALUES = [
  {
    title: 'Family Involvement',
    desc: 'Marriage in Mithila is a union of families. Mithila Jodi is built for parents and elders to take part respectfully, at every step — from first introduction to milap.',
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9" aria-hidden="true">
        {[14, 24, 34].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={16} r={5.5} fill={i === 1 ? '#7A1220' : '#C4562F'} stroke="#5A0E19" strokeWidth="1" />
            <path d={`M ${cx - 6} 40 Q ${cx} 26 ${cx + 6} 40 Z`} fill={i === 1 ? '#7A1220' : '#C4562F'} stroke="#5A0E19" strokeWidth="1" />
          </g>
        ))}
        <circle cx="24" cy="9" r="2" fill="#D4122C" />
      </svg>
    ),
  },
  {
    title: 'Cultural Compatibility',
    desc: 'Gotra, kul, mool and gram matter here. Biodata captures what Maithili families actually look for, so conversations begin with genuine cultural common ground.',
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9" aria-hidden="true">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
          const r = (a * Math.PI) / 180
          return <ellipse key={i} cx={24 + 12 * Math.cos(r)} cy={24 + 12 * Math.sin(r)} rx={4} ry={7} fill={i % 2 === 0 ? '#E8912A' : '#FFD700'} stroke="#B96A1A" strokeWidth="0.6" transform={`rotate(${a} ${24 + 12 * Math.cos(r)} ${24 + 12 * Math.sin(r)})`} />
        })}
        <circle cx="24" cy="24" r="6" fill="#7A1220" />
        <circle cx="24" cy="24" r="2.5" fill="#E4C572" />
      </svg>
    ),
  },
  {
    title: 'Meaningful Relationships',
    desc: 'No endless swiping. Verified biodata, private and controlled contact, and a process designed for serious, respectful matrimony rooted in Mithila tradition.',
    icon: (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9" aria-hidden="true">
        <path d="M24 40 C 10 30, 8 18, 16 14 C 20 12, 24 15, 24 19 C 24 15, 28 12, 32 14 C 40 18, 38 30, 24 40 Z" fill="#7A1220" stroke="#5A0E19" strokeWidth="1" />
        {[0, 60, 120, 180, 240, 300].map((a, i) => {
          const r = (a * Math.PI) / 180
          return <circle key={i} cx={24 + 17 * Math.cos(r)} cy={22 + 15 * Math.sin(r)} r={1.6} fill="#B98A2E" />
        })}
      </svg>
    ),
  },
]

export function SuccessStories() {
  return (
    <section id="stories" className="relative bg-paper py-16" aria-label="Family and values at Mithila Jodi">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon-deep via-gold to-maroon-deep opacity-60" aria-hidden="true" />

      <div className="wrap">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Family &amp; Values</p>
          <h2 className="section-heading">Rooted in Family, Built for Marriage</h2>
          <div className="ornament-line w-24 mx-auto mt-4" />
          <p className="mt-5 text-ink-soft max-w-xl mx-auto text-[16px]">
            Mithila Jodi honours how Maithili families actually come together — with respect,
            tradition, and the whole family involved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {VALUES.map(({ title, desc, icon }) => (
            <article key={title} className="card p-7 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-mj transition-all duration-200">
              <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center border-2 border-gold border-opacity-30">
                {icon}
              </div>
              <h3 className="font-serif text-xl text-maroon leading-snug">{title}</h3>
              <p className="text-[14px] text-ink-soft leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>

        {/* Honest positioning strip — no fabricated numbers */}
        <div className="mt-12 bg-maroon rounded-mj p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { t: 'India', d: 'For the Mithila community' },
            { t: '4', d: 'Biodata languages' },
            { t: 'Free', d: 'To join and create a profile' },
            { t: 'Private', d: 'You control who sees you' },
          ].map(({ t, d }) => (
            <div key={t}>
              <p className="font-serif text-2xl text-gold-lt font-semibold">{t}</p>
              <p className="text-[12px] text-paper-2 mt-1">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
