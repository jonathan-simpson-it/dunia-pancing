import type { Metadata } from 'next'
import CatalogPage from '@/views/Catalog'

export const metadata: Metadata = {
  title: 'Katalog Digital',
  description:
    'Katalog digital alat pancing terlengkap di Palembang. Joran, Reel, Senar, Kail, Umpan dan Aksesoris.',
}

export default function Page() {
  return <CatalogPage />
}
