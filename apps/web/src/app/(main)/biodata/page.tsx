import { Suspense } from 'react'
import BiodataContent from './BiodataContent'

export default function BiodataPage() {
  return (
    <Suspense fallback={null}>
      <BiodataContent />
    </Suspense>
  )
}
