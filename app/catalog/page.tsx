import { Suspense } from 'react'
import type { Metadata } from 'next'
import CatalogPage from '@/views/Catalog'

export const metadata: Metadata = {
  title: 'Katalog Digital',
  description:
    'Katalog digital alat pancing terlengkap di Palembang. Joran, Reel, Senar, Kail, Umpan dan Aksesoris.',
}

function CatalogFallback() {
  return (
    <div className="min-h-screen bg-slate-50 pt-28">
      <div className="max-w-7xl mx-auto px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="h-4 bg-slate-200 rounded w-96" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogPage />
    </Suspense>
  )
}
