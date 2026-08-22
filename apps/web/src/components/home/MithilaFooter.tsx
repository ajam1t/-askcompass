import Link from 'next/link'

const LINKS = {
  Platform: [
    { href: '/register', label: 'Create Biodata' },
    { href: '/login', label: 'Sign In' },
    { href: '#how', label: 'How It Works' },
    { href: '#stories', label: 'Success Stories' },
  ],
  Culture: [
    { href: '#biodata', label: 'Maithili Biodata' },
    { href: '#how', label: 'Madhubani Tradition' },
    { href: '#how', label: 'Pag Phere Ceremony' },
    { href: '#how', label: 'Kothghar Heritage' },
  ],
  Legal: [
    { href: '/legal/terms', label: 'Terms of Service' },
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/consent', label: 'Consent & Data' },
  ],
}

export function MithilaFooter() {
  return (
    <footer className="bg-maroon-deep" role="contentinfo">
      {/* Gold top border */}
      <div className="h-[4px] bg-gradient-to-r from-maroon-deep via-gold to-maroon-deep" aria-hidden="true" />

      {/* Madhubani decorative top band */}
      <div className="bg-maroon" aria-hidden="true">
        <svg viewBox="0 0 1200 40" xmlns="http://www.w3.org/2000/svg" className="w-full h-10" preserveAspectRatio="none">
          {Array.from({ length: 24 }, (_, i) => {
            const x = 25 + i * 50
            return (
              <g key={i} transform={`translate(${x},20)`}>
                {[-10,-5,0,5,10].map((dx, pi) => (
                  <ellipse key={pi} cx={dx} cy={4} rx={3.5} ry={8} fill="#E4C572" stroke="#B98A2E" strokeWidth="0.5" opacity="0.8" />
                ))}
                <circle cx={0} cy={3} r={3.5} fill="#B98A2E" />
                <circle cx={0} cy={3} r={1.5} fill="#E4C572" />
                {/* Fish between groups */}
                {i % 2 === 0 && (
                  <>
                    <path d="M 26 -6 Q 33 -12 40 -6 Q 33 0 26 -6 Z" fill="#E4C572" stroke="#B98A2E" strokeWidth="0.7" />
                    <circle cx="30" cy="-7" r="1.5" fill="#7A1220" />
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Main footer content */}
      <div className="wrap py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-3 mb-4">
            <svg width="40" height="32" viewBox="0 0 40 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M 2 16 Q 10 5 22 16 Q 10 27 2 16 Z" fill="#E4C572" stroke="#B98A2E" strokeWidth="1.5" />
              <path d="M 22 16 Q 30 9 38 16 L 31 11 L 38 16 L 31 21 L 38 16 Z" fill="#E4C572" stroke="#B98A2E" strokeWidth="1.2" />
              <circle cx="11" cy="15" r="3" fill="#7A1220" />
              <circle cx="12" cy="14" r="1.1" fill="#E4C572" />
              {[0,1,2,3].map(i => (
                <path key={i} d={`M ${7+i*4} 9 Q ${8+i*4} 16 ${7+i*4} 23`} fill="none" stroke="#B98A2E" strokeWidth="0.9" />
              ))}
            </svg>
            <span className="font-serif text-2xl text-gold-lt leading-none">Mithila Jodi</span>
          </Link>

          {/* Devanagari tagline */}
          <p className="font-deva text-[17px] text-gold leading-relaxed mb-3" lang="mai">
            मिथिला जोड़ी — परम्परा आ प्रेमक संगम
          </p>
          <p className="font-serif text-paper-3 text-[13px] italic mb-5">
            Where tradition and love meet
          </p>
          <p className="text-paper-3 text-[13px] leading-relaxed opacity-75">
            A matrimonial platform built for Maithili families — Bihar, Jharkhand, and the broader Maithili community across India.
          </p>
        </div>

        {/* Nav columns */}
        {Object.entries(LINKS).map(([category, links]) => (
          <div key={category}>
            <h3 className="font-serif text-gold text-[15px] tracking-wide mb-4 border-b border-gold border-opacity-20 pb-2">
              {category}
            </h3>
            <ul className="space-y-2.5">
              {links.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-paper-3 text-[13px] hover:text-gold-lt transition-colors leading-snug opacity-80 hover:opacity-100"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Gold divider */}
      <div className="h-px bg-gold opacity-20" />

      {/* Bottom bar */}
      <div className="wrap py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-paper-3 opacity-60">
        <p>© {new Date().getFullYear()} Mithila Jodi. All rights reserved.</p>
        <p>
          Made with reverence for Mithila&apos;s culture &mdash; India only &mdash; No data transferred outside India
        </p>
      </div>

      {/* Bottom Madhubani border */}
      <div className="bg-maroon" aria-hidden="true">
        <svg viewBox="0 0 1200 12" xmlns="http://www.w3.org/2000/svg" className="w-full h-3" preserveAspectRatio="none">
          <rect width="1200" height="12" fill="#7A1220" />
          <rect width="1200" height="3" fill="#B98A2E" />
          {Array.from({ length: 60 }, (_, i) => (
            <rect key={i} x={i * 20} y={0} width={10} height={12} fill={i % 2 === 0 ? '#7A1220' : '#9B2233'} />
          ))}
          <line x1="0" y1="9" x2="1200" y2="9" stroke="#E4C572" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>
    </footer>
  )
}
