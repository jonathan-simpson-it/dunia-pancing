import type { Metadata } from 'next'
import OrderSuccessPage from '@/views/OrderSuccess'

export const metadata: Metadata = {
  title: 'Pesanan Berhasil',
}

export default function Page() {
  return <OrderSuccessPage />
}
