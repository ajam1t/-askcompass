import Link from 'next/link'

export function MobileBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-cream border-t-2 border-gold border-opacity-40 shadow-[0_-4px_16px_-4px_rgba(58,20,12,0.18)]"
      aria-label="Mobile quick navigation"
    >
      {/* Top Madhubani accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-cream via-gold to-cream" />

      <div className="flex items-stretch">
        {/* Home */}
        <Link href="/" className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-maroon hover:text-terra active:text-terra transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[10px] font-medium tracking-wide leading-none">Home</span>
        </Link>

        {/* Biodata */}
        <Link href="/#biodata" className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-maroon hover:text-terra active:text-terra transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span className="text-[10px] font-medium tracking-wide leading-none">Biodata</span>
        </Link>

        {/* Join — primary CTA centre */}
        <Link
          href="/register"
          className="flex-[1.3] flex flex-col items-center justify-center gap-0.5 py-2 bg-maroon text-gold-lt hover:bg-maroon-deep active:bg-maroon-deep transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span className="text-[10px] font-semibold tracking-wide leading-none">Join Free</span>
        </Link>

        {/* Login */}
        <Link href="/login" className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-maroon hover:text-terra active:text-terra transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-[10px] font-medium tracking-wide leading-none">Login</span>
        </Link>

        {/* Help */}
        <Link href="/help" className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-maroon hover:text-terra active:text-terra transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-[10px] font-medium tracking-wide leading-none">Help</span>
        </Link>
      </div>
    </nav>
  )
}
