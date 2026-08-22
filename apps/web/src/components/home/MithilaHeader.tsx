'use client'

import Link from 'next/link'
import { useState } from 'react'

export function MithilaHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-maroon shadow-mj-xs">
      {/* Top gold strip */}
      <div className="h-[3px] w-full bg-gradient-to-r from-maroon-deep via-gold-lt to-maroon-deep" />

      <div className="wrap flex items-center justify-between h-16">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Madhubani-style fish icon */}
          <svg width="36" height="28" viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M 2 14 Q 10 4 20 14 Q 10 24 2 14 Z" fill="#E4C572" stroke="#B98A2E" strokeWidth="1.2" />
            <path d="M 20 14 Q 28 8 34 14 L 28 10 L 34 14 L 28 18 L 34 14 Z" fill="#E4C572" stroke="#B98A2E" strokeWidth="1" />
            <circle cx="10" cy="13" r="2.5" fill="#7A1220" />
            <circle cx="11" cy="12.5" r="0.9" fill="#E4C572" />
            {[0,1,2,3].map(i => (
              <path key={i} d={`M ${6 + i * 3.5} 10 Q ${7 + i * 3.5} 14 ${6 + i * 3.5} 18`} fill="none" stroke="#B98A2E" strokeWidth="0.9" />
            ))}
          </svg>
          <span className="font-serif text-xl text-gold-lt leading-none tracking-wide">
            Mithila Jodi
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          <Link href="#how" className="text-[13px] text-paper-2 hover:text-gold-lt transition-colors tracking-wide">
            How it Works
          </Link>
          <Link href="#stories" className="text-[13px] text-paper-2 hover:text-gold-lt transition-colors tracking-wide">
            Success Stories
          </Link>
          <Link href="#biodata" className="text-[13px] text-paper-2 hover:text-gold-lt transition-colors tracking-wide">
            Biodata
          </Link>
          <div className="h-4 w-px bg-gold opacity-40" />
          <Link
            href="/login"
            className="text-[13px] text-gold-lt hover:text-paper transition-colors tracking-wide font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="btn bg-gold-lt text-maroon-deep text-[13px] py-2 px-5 font-semibold hover:-translate-y-px hover:shadow-mj transition-all"
          >
            Create Profile
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="md:hidden text-gold-lt p-2 rounded"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="18" y2="18" />
              <line x1="18" y1="4" x2="4" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="7" x2="19" y2="7" />
              <line x1="3" y1="12" x2="19" y2="12" />
              <line x1="3" y1="17" x2="19" y2="17" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-maroon-deep border-t border-gold border-opacity-20">
          <div className="wrap py-4 flex flex-col gap-4">
            <Link href="#how" onClick={() => setOpen(false)} className="text-paper-2 text-sm py-1">How it Works</Link>
            <Link href="#stories" onClick={() => setOpen(false)} className="text-paper-2 text-sm py-1">Success Stories</Link>
            <Link href="#biodata" onClick={() => setOpen(false)} className="text-paper-2 text-sm py-1">Biodata</Link>
            <div className="h-px bg-gold opacity-20" />
            <Link href="/login" onClick={() => setOpen(false)} className="text-gold-lt text-sm py-1">Sign In</Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="btn-gold w-full text-center text-sm"
            >
              Create Profile
            </Link>
          </div>
        </div>
      )}

      {/* Bottom gold strip */}
      <div className="h-[2px] w-full bg-gradient-to-r from-maroon-deep via-gold to-maroon-deep opacity-70" />
    </header>
  )
}
