'use client'

import { useState } from 'react'
import Link from 'next/link'

const LANGS = [
  { code: 'en',  label: 'English',  script: 'English' },
  { code: 'hi',  label: 'हिन्दी',   script: 'Devanagari' },
  { code: 'mai', label: 'मैथिली',  script: 'Maithili' },
  { code: 'sa',  label: 'संस्कृत',  script: 'Sanskrit' },
]

const SAMPLE: Record<string, { name: string; intro: string; seeking: string; family: string }> = {
  en: {
    name: 'Priya Kumari',
    intro: 'A software engineer from Darbhanga, rooted in the Maithili tradition of learning and cultural pride. Fluent in Maithili and Hindi.',
    seeking: 'Seeking a life partner who values family, tradition, and growth equally.',
    family: 'Father: Retired teacher. Mother: Homemaker. One younger brother.',
  },
  hi: {
    name: 'प्रिया कुमारी',
    intro: 'दरभंगा की एक सॉफ़्टवेयर इंजीनियर, जो मैथिली परंपरा और संस्कृति में गहरी आस्था रखती हैं।',
    seeking: 'एक ऐसे जीवनसाथी की तलाश जो परिवार, परंपरा और विकास को बराबर महत्व दें।',
    family: 'पिता: सेवानिवृत्त शिक्षक। माता: गृहिणी। एक छोटा भाई।',
  },
  mai: {
    name: 'प्रिया कुमारी',
    intro: 'दरभंगाक एक सॉफ्टवेयर इंजीनियर, मैथिली परम्परा आ संस्कृतिमे जकर गहिर आस्था अछि।',
    seeking: 'एहन जीवनसाथीक तलाश जे परिवार, परम्परा आ उन्नतिकें समान महत्व दैथ।',
    family: 'पिताजी: सेवानिवृत्त शिक्षक। माताजी: गृहिणी। एक छोट भाय।',
  },
  sa: {
    name: 'प्रिया कुमारी',
    intro: 'दर्भङ्गानगर्याः एकः सङ्गणकयन्त्रप्रकौशली, मैथिलीपरम्परायां संस्कृतौ च गाढ़ा निष्ठा यस्याः।',
    seeking: 'तादृशं जीवनसाथिनं मृगयते या कुटुम्बं परम्परां प्रगतिं च तुल्यमूल्यं गणयति।',
    family: 'पिता: अवकाशप्राप्तः शिक्षकः। माता: गृहिणी। एकः कनिष्ठः भ्राता।',
  },
}

export function BiodataSection() {
  const [lang, setLang] = useState<string>('en')
  const sample = SAMPLE[lang]

  return (
    <section id="biodata" className="relative bg-cream py-16" aria-label="Biodata language selection demo">
      <div className="wrap">
        <div className="text-center mb-10">
          <p className="eyebrow mb-3">Your Language</p>
          <h2 className="section-heading">Biodata in Your Mother Tongue</h2>
          <div className="ornament-line w-24 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: language selector + description */}
          <div>
            <p className="text-ink-soft text-[16px] leading-relaxed mb-6">
              Create your biodata in मैथिली, हिन्दी, English, or Sanskrit. Your profile, your words,
              your culture — never forced into a single language or a generic template.
            </p>

            {/* Language tabs */}
            <div className="flex gap-2 flex-wrap mb-8" role="tablist" aria-label="Choose preview language">
              {LANGS.map(l => (
                <button
                  key={l.code}
                  role="tab"
                  aria-selected={lang === l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-5 py-2.5 rounded-full text-[14px] font-medium border transition-all duration-150 ${
                    lang === l.code
                      ? 'bg-maroon text-gold-lt border-maroon shadow-mj-xs'
                      : 'bg-paper text-ink-soft border-paper-3 hover:border-gold hover:text-maroon'
                  }`}
                >
                  <span className={lang === l.code ? 'font-deva' : ''}>{l.label}</span>
                </button>
              ))}
            </div>

            <ul className="space-y-3 text-[14px] text-ink-soft">
              {[
                'Full Devanagari support — names, places, family details',
                'Maithili-specific fields: kul, gotra, mool, ancestral village',
                'Switch language any time; original data preserved',
                'Family members view in their preferred language',
              ].map(pt => (
                <li key={pt} className="flex items-start gap-3">
                  <span className="text-marigold text-lg leading-none mt-0.5">◆</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link href="/register" className="btn-primary">
                Create Your Biodata
              </Link>
            </div>
          </div>

          {/* Right: live preview card */}
          <div>
            <div className="rounded-mj border-2 border-gold shadow-mj bg-paper overflow-hidden">
              {/* Card header */}
              <div className="bg-maroon px-6 py-3 flex items-center justify-between">
                <span className="font-serif text-gold-lt text-sm tracking-widest">Biodata Preview</span>
                <span className="text-paper-3 text-[11px] uppercase tracking-widest">{LANGS.find(l => l.code === lang)?.script}</span>
              </div>

              {/* Card content */}
              <div className="p-6 flex gap-5">
                {/* Avatar placeholder — Madhubani-style face */}
                <div className="flex-shrink-0">
                  <svg width="80" height="100" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect width="80" height="100" rx="8" fill="#FBF1DD" stroke="#B98A2E" strokeWidth="1.5" />
                    {/* Hair */}
                    <ellipse cx="40" cy="32" rx="26" ry="20" fill="#2B1506" />
                    <ellipse cx="40" cy="36" rx="22" ry="18" fill="#D4A574" />
                    {/* Bindi */}
                    <circle cx="40" cy="28" r="3.5" fill="#D4122C" />
                    {/* Eyes */}
                    {[[30,42],[50,42]].map(([ex,ey],i) => (
                      <g key={i}><ellipse cx={ex} cy={ey} rx="5" ry="5.5" fill="white" stroke="#2B1506" strokeWidth="1" /><circle cx={ex+1} cy={ey} r="3.2" fill="#2B1506" /><circle cx={ex+2} cy={ey-1} r="1" fill="white" /></g>
                    ))}
                    {/* Nose */}
                    <ellipse cx="40" cy="54" rx="3.5" ry="2.5" fill="#C48A5A" />
                    {/* Smile */}
                    <path d="M 33 62 Q 40 68 47 62" fill="none" stroke="#2B1506" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Earrings */}
                    {[[18,44],[62,44]].map(([ex,ey],i) => (
                      <g key={i}><circle cx={ex} cy={ey} r="5" fill="#B98A2E" stroke="#7A1220" strokeWidth="0.8" /><circle cx={ex} cy={ey} r="2.5" fill="#E4C572" /></g>
                    ))}
                    {/* Sari blouse */}
                    <rect x="14" y="78" width="52" height="22" fill="#7A1220" />
                    {/* Necklace */}
                    <path d="M 22 75 Q 40 82 58 75" fill="none" stroke="#B98A2E" strokeWidth="2" />
                    {[28,34,40,46,52].map(nx => <circle key={nx} cx={nx} cy={75+Math.abs(nx-40)/8} r="2.5" fill="#E4C572" stroke="#B98A2E" strokeWidth="0.4" />)}
                    {/* Madhubani border */}
                    {[0,8,16,24,32,40,48,56,64,72].map((bx,i) => (
                      <rect key={i} x={bx} y={96} width={8} height={4} fill={i%2===0?'#B98A2E':'#7A1220'} />
                    ))}
                  </svg>
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-serif text-xl text-maroon mb-1 ${lang !== 'en' ? 'font-deva' : ''}`}>{sample.name}</p>
                  <p className="text-[11px] text-terra uppercase tracking-widest mb-3">Verified Profile · Darbhanga</p>
                  <p className={`text-[13px] text-ink-soft leading-relaxed mb-3 ${lang !== 'en' ? 'font-deva' : ''}`}>{sample.intro}</p>
                  <div className="border-t border-paper-3 pt-3 space-y-1">
                    <p className={`text-[12px] text-ink ${lang !== 'en' ? 'font-deva' : ''}`}><strong>Seeking:</strong> {sample.seeking}</p>
                    <p className={`text-[12px] text-ink-soft ${lang !== 'en' ? 'font-deva' : ''}`}>{sample.family}</p>
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="bg-paper-2 px-6 py-3 flex items-center justify-between border-t border-paper-3">
                <span className="text-[11px] text-ink-soft">Sample only — not a real profile</span>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-green" />
                  <span className="text-[11px] text-ink-soft">Verified Family</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
