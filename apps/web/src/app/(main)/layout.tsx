import Link from 'next/link'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="sticky top-0 z-40 bg-cream border-b border-paper-3 shadow-mj-xs">
        <div className="wrap flex items-center justify-between h-14">
          <Link href="/" className="font-serif text-maroon text-xl leading-none">
            Mithila Jodi
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className="px-3 py-1.5 text-sm font-medium text-ink hover:text-maroon hover:bg-paper rounded-mj-sm transition-colors"
            >
              Search
            </Link>
            <Link
              href="/membership"
              className="px-3 py-1.5 text-sm font-medium text-ink hover:text-maroon hover:bg-paper rounded-mj-sm transition-colors"
            >
              Membership
            </Link>
            <Link
              href="/profile"
              className="px-3 py-1.5 text-sm font-medium text-ink hover:text-maroon hover:bg-paper rounded-mj-sm transition-colors"
            >
              My Profile
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </>
  )
}
