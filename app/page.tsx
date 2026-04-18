'use client'

import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { DashboardPreview } from '@/components/DashboardPreview'
import { CharityImpact } from '@/components/CharityImpact'
import { DrawRewards } from '@/components/DrawRewards'
import { CTASection } from '@/components/CTASection'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="relative z-10">
        <Hero />
        <DashboardPreview />
        <CharityImpact />
        <DrawRewards />
        <CTASection />
        <Footer />
      </div>
    </main>
  )
}
