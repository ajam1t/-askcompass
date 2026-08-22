import { MithilaHeader } from '@/components/home/MithilaHeader'
import { MithilaBorder } from '@/components/home/MithilaBorder'
import { HeroSection } from '@/components/home/HeroSection'
import { FeatureStrip } from '@/components/home/FeatureStrip'
import { PlatformSection } from '@/components/home/PlatformSection'
import { BiodataSection } from '@/components/home/BiodataSection'
import { SuccessStories } from '@/components/home/SuccessStories'
import { FinalCTA } from '@/components/home/FinalCTA'
import { MithilaFooter } from '@/components/home/MithilaFooter'

export const metadata = {
  title: 'Mithila Jodi — Maithili Matrimonial',
  description:
    'A matrimonial platform rooted in Mithila culture — connecting Maithili families across India with authenticity and reverence for tradition.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper overflow-x-hidden">
      <MithilaHeader />
      <MithilaBorder variant="bottom" />
      <main className="flex-1">
        <HeroSection />
        <MithilaBorder variant="top" />
        <FeatureStrip />
        <MithilaBorder variant="bottom" />
        <PlatformSection />
        <MithilaBorder variant="top" />
        <BiodataSection />
        <MithilaBorder variant="bottom" />
        <SuccessStories />
        <MithilaBorder variant="top" />
        <FinalCTA />
      </main>
      <MithilaFooter />
    </div>
  )
}
