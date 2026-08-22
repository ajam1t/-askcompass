import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center px-4">
        <p className="eyebrow mb-4">Mithila Jodi</p>
        <h1 className="text-display-lg text-maroon mb-4">Find your match.<br />Keep your roots.</h1>
        <p className="text-ink-soft font-serif italic text-lg mb-10">
          A premium matrimonial platform for the Mithila community.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register" className="btn btn-primary">
            Create Account
          </Link>
          <Link href="/login" className="btn btn-ghost">
            Log In
          </Link>
        </div>
      </div>
    </main>
  )
}
