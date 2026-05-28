import type { Metadata } from 'next'
import AdminRevenuePage from '@/views/AdminRevenue'

export const metadata: Metadata = {
  title: 'Pendapatan',
}

export default function Page() {
  return <AdminRevenuePage />
}
