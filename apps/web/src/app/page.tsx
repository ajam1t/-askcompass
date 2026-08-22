import type { Metadata } from 'next'
import { MithilaHeader } from '@/components/home/MithilaHeader'
import { MithilaBorder } from '@/components/home/MithilaBorder'
import { HeroSection } from '@/components/home/HeroSection'
import { FeatureStrip } from '@/components/home/FeatureStrip'
import { BiodataSection } from '@/components/home/BiodataSection'
import { SuccessStories } from '@/components/home/SuccessStories'
import { FinalCTA } from '@/components/home/FinalCTA'
import { MithilaFooter } from '@/components/home/MithilaFooter'
import { MobileBottomNav } from '@/components/home/MobileBottomNav'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mithilajodi.com'

export const metadata: Metadata = {
  title: 'Mithila Jodi — Maithili Matrimonial & Marriage Biodata',
  description:
    'Mithila Jodi is a matrimonial platform for the Mithila community of India. Create a marriage biodata in English, Hindi, Maithili & Sanskrit, involve your family, and find matches rooted in Maithili heritage.',
  alternates: { canonical: SITE },
  openGraph: {
    type: 'website',
    url: SITE,
    siteName: 'Mithila Jodi',
    title: 'Mithila Jodi — Maithili Matrimonial & Marriage Biodata',
    description:
      'A matrimonial platform rooted in Mithila culture — create a marriage biodata in your language and connect Maithili families across India.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mithila Jodi — Maithili Matrimonial & Marriage Biodata',
    description: 'A matrimonial platform rooted in Mithila culture, for the Maithili community of India.',
  },
}

// Structured data — Organization + WebSite (no fabricated stats/claims)
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Mithila Jodi',
      url: SITE,
      slogan: 'Find your match. Keep your roots.',
      description:
        'A matrimonial platform for the Mithila (Maithili) community of India, offering marriage biodata creation in English, Hindi, Maithili and Sanskrit.',
      areaServed: { '@type': 'Country', name: 'India' },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: SITE,
      name: 'Mithila Jodi',
      publisher: { '@id': `${SITE}/#organization` },
      inLanguage: ['en', 'hi', 'mai', 'sa'],
    },
  ],
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper overflow-x-hidden">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MithilaHeader />
      <MithilaBorder variant="bottom" />
      <main className="flex-1 pb-16 lg:pb-0">
        {/* 1. Hero */}
        <HeroSection />
        <MithilaBorder variant="top" />
        {/* 2. Key features */}
        <FeatureStrip />
        <MithilaBorder variant="bottom" />
        {/* 3. Marriage biodata */}
        <BiodataSection />
        <MithilaBorder variant="top" />
        {/* 4. Family & values */}
        <SuccessStories />
        {/* 5. Final CTA */}
        <FinalCTA />
      </main>
      <MithilaFooter />
      <MobileBottomNav />
    </div>
  )
}
