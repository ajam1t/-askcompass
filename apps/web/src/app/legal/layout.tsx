import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="sticky top-0 z-40 bg-cream border-b border-paper-3 shadow-mj-xs">
        <div className="wrap flex items-center h-14">
          <Link href="/" className="font-serif text-maroon text-xl leading-none">
            Mithila Jodi
          </Link>
        </div>
      </nav>
      <main className="wrap py-10 max-w-3xl">
        {children}
      </main>
    </>
  )
}
