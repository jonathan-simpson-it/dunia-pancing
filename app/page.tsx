import { Suspense } from 'react'
import type { Metadata } from 'next'
import PageProviders from '@/components/layout/PageProviders'
import HomePage from '@/views/Home'

export const metadata: Metadata = {
  title: 'Home',
}

function HomeSkeleton() {
  return (
    <div className="bg-slate-50">
      <div className="h-screen bg-slate-200 animate-pulse" />
      <div className="py-32 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-200 rounded-4xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <PageProviders>
      <Suspense fallback={<HomeSkeleton />}>
        <HomePage />
      </Suspense>
    </PageProviders>
  )
}
