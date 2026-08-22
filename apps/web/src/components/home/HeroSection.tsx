import Link from 'next/link'
import { VarmalaScene } from '@/components/home/VarmalaScene'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-paper" aria-label="Hero — Mithila wedding platform introduction">
      {/* Textured background */}
      <div className="absolute inset-0 bg-paper-texture opacity-60 pointer-events-none" aria-hidden="true" />

      <div className="wrap relative z-10 py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left — text */}
        <div className="hero-text-enter order-2 md:order-1 flex flex-col gap-6">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-gold" />
            <span className="eyebrow">Mithila Vivah Sewa</span>
            <div className="h-px w-10 bg-gold" />
          </div>

          {/* Main heading */}
          <h1 className="font-serif text-display-lg text-maroon leading-[1.05]">
            जहाँ परंपरा मिलती है
            <br />
            <span className="text-terra">प्रेम से</span>
          </h1>
          <p className="font-sans text-lg text-maroon leading-relaxed opacity-90 italic">
            Where tradition meets love
          </p>

          {/* Sub heading */}
          <p className="font-sans text-[17px] text-ink-soft leading-relaxed max-w-[460px]">
            A matrimonial platform rooted in Mithila&apos;s cultural heritage — connecting Maithili families
            across Bihar and Jharkhand with authenticity, trust, and reverence for tradition.
          </p>

          {/* Culture chips */}
          <div className="flex flex-wrap gap-2">
            {['Madhubani Art', 'Maithili Language', 'Pag Phere Ceremony', 'Kothghar Tradition'].map(tag => (
              <span
                key={tag}
                className="text-[12px] bg-maroon text-gold-lt rounded-full px-4 py-1.5 font-medium tracking-wide border border-gold border-opacity-30"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/register" className="btn-primary text-base px-8 py-4">
              Create Your Biodata
            </Link>
            <Link href="/login" className="btn-ghost text-base px-8 py-4">
              Sign In
            </Link>
          </div>

          {/* Trust metrics */}
          <div className="flex gap-8 pt-2 border-t border-paper-3">
            {[
              { n: '12,000+', l: 'Profiles' },
              { n: '2,400+', l: 'Matches' },
              { n: '4 States', l: 'Across India' },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <p className="font-serif text-2xl text-maroon font-semibold">{n}</p>
                <p className="text-[12px] text-ink-soft uppercase tracking-widest">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — illustration */}
        <div className="hero-art-enter order-1 md:order-2 w-full max-w-[560px] mx-auto md:mx-0">
          {/* Card frame */}
          <div className="relative rounded-mj overflow-hidden border-2 border-gold shadow-mj">
            <VarmalaScene />
            {/* Caption ribbon */}
            <div className="absolute bottom-0 left-0 right-0 bg-maroon bg-opacity-90 py-2.5 px-4 text-center">
              <p className="font-serif text-gold-lt text-sm tracking-widest">
                वर माला — Varmala Ceremony
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-paper to-transparent pointer-events-none" aria-hidden="true" />
    </section>
  )
}
