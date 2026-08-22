const STORIES = [
  {
    names: 'Amit & Sunita',
    location: 'Darbhanga → Patna',
    state: 'Bihar',
    quote:
      'Mithila Jodi respected our family\'s kul and gotra traditions completely. Both families felt at home from the first introduction. The platform felt like it truly understood what Maithili families care about.',
    joined: 'Jan 2024',
    met: 'Mar 2024',
    married: 'Nov 2024',
  },
  {
    names: 'Rajan & Pooja',
    location: 'Madhubani → Muzaffarpur',
    state: 'Bihar',
    quote:
      'We both created biodata in मैथिली, which made the connection feel genuine and immediate. Our parents could read everything in their own language — that trust made the whole journey smoother.',
    joined: 'Mar 2024',
    met: 'May 2024',
    married: 'Jan 2025',
  },
  {
    names: 'Deepak & Kavya',
    location: 'Ranchi → Darbhanga',
    state: 'Jharkhand / Bihar',
    quote:
      'We were living in different states and I was worried a platform would not understand the Maithili diaspora. Mithila Jodi connected us across Jharkhand and Bihar, and the families bonded over shared traditions.',
    joined: 'Jun 2024',
    met: 'Aug 2024',
    married: 'Feb 2025',
  },
]

function StoryCard({
  names, location, state, quote, joined, met, married,
}: (typeof STORIES)[0]) {
  return (
    <article className="card p-7 flex flex-col gap-5 hover:-translate-y-1 hover:shadow-mj transition-all duration-200">
      {/* Quote marks — Madhubani-style lotus */}
      <div className="text-gold-lt text-5xl font-serif leading-none select-none" aria-hidden="true">"</div>

      <p className="text-ink text-[15px] leading-relaxed -mt-4 flex-1">{quote}</p>

      {/* Journey timeline */}
      <div className="flex items-center gap-2 text-[11px] text-ink-soft">
        <span className="px-2 py-1 bg-paper-2 rounded text-terra">{joined}</span>
        <div className="h-px flex-1 bg-paper-3" />
        <span className="px-2 py-1 bg-paper-2 rounded">{met}</span>
        <div className="h-px flex-1 bg-paper-3" />
        <span className="px-2 py-1 bg-maroon text-gold-lt rounded font-medium">Married {married}</span>
      </div>

      {/* Names and location */}
      <div className="border-t border-paper-3 pt-4 flex items-center justify-between">
        <div>
          <p className="font-serif text-maroon text-[18px] leading-tight">{names}</p>
          <p className="text-[12px] text-ink-soft mt-0.5">{location}</p>
        </div>
        <span className="text-[11px] text-terra border border-terra border-opacity-40 rounded-full px-3 py-1">
          {state}
        </span>
      </div>
    </article>
  )
}

export function SuccessStories() {
  return (
    <section id="stories" className="relative bg-paper py-16" aria-label="Mithila Jodi success stories">
      {/* Madhubani decorative row */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon-deep via-gold to-maroon-deep opacity-60" aria-hidden="true" />

      <div className="wrap">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Success Stories</p>
          <h2 className="section-heading">Families Joined in Mithila&apos;s Tradition</h2>
          <div className="ornament-line w-24 mx-auto mt-4" />
          <p className="mt-5 text-ink-soft max-w-lg mx-auto text-[16px]">
            Real families, real connections — across Bihar and Jharkhand, rooted in Maithili culture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {STORIES.map(s => (
            <StoryCard key={s.names} {...s} />
          ))}
        </div>

        {/* Aggregate trust bar */}
        <div className="mt-12 bg-maroon rounded-mj p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { n: '2,400+', l: 'Successful Matches' },
            { n: '95%',    l: 'Family Satisfaction' },
            { n: '4',      l: 'Indian States' },
            { n: '3',      l: 'Languages Supported' },
          ].map(({ n, l }) => (
            <div key={l}>
              <p className="font-serif text-3xl text-gold-lt font-semibold">{n}</p>
              <p className="text-[12px] text-paper-2 uppercase tracking-widest mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
