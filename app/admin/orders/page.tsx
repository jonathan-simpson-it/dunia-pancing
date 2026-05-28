import type { Metadata } from 'next'
import AdminOrdersPage from '@/views/AdminOrders'

export const metadata: Metadata = {
  title: 'Pesanan',
}

export default function Page() {
  return <AdminOrdersPage />
}
