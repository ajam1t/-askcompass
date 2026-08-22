import { Suspense } from 'react'
import ShortlistsContent from './ShortlistsContent'

export default function ShortlistsPage() {
  return (
    <Suspense fallback={null}>
      <ShortlistsContent />
    </Suspense>
  )
}
