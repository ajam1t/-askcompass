import { Suspense } from 'react'
import SettingsContent from './SettingsContent'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Settings — Mithila Jodi' }

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="wrap py-8 text-ink-soft text-sm animate-pulse">Loading…</div>}>
      <SettingsContent />
    </Suspense>
  )
}
