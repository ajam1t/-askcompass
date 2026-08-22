'use client'

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print fixed top-4 right-4 z-50 bg-maroon text-white text-sm font-medium px-4 py-2 rounded shadow-lg hover:bg-maroon/90 transition-colors"
    >
      Print / Save as PDF
    </button>
  )
}
