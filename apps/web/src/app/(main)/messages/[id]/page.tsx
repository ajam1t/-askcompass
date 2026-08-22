import { Suspense } from 'react'
import ThreadContent from './ThreadContent'

export default function ThreadPage() {
  return (
    <Suspense fallback={null}>
      <ThreadContent />
    </Suspense>
  )
}
