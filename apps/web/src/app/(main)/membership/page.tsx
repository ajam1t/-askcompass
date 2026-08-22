'use client'

import { Suspense } from 'react'
import MembershipContent from './MembershipContent'

function MembershipFallback() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="wrap py-10">
        <div className="max-w-lg mx-auto space-y-4 animate-pulse">
          <div className="h-8 bg-paper-3 rounded w-1/3" />
          <div className="card p-6 space-y-3">
            <div className="h-5 bg-paper-3 rounded w-1/2" />
            <div className="h-4 bg-paper-3 rounded w-2/3" />
            <div className="h-10 bg-paper-3 rounded" />
          </div>
        </div>
      </div>
    </main>
  )
}

export default function MembershipPage() {
  return (
    <Suspense fallback={<MembershipFallback />}>
      <MembershipContent />
    </Suspense>
  )
}
