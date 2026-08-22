import { Suspense } from 'react'
import InterestsContent from './InterestsContent'

export default function InterestsPage() {
  return (
    <Suspense fallback={null}>
      <InterestsContent />
    </Suspense>
  )
}
