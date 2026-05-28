import type { Metadata } from 'next'
import CartPage from '@/views/Cart'

export const metadata: Metadata = {
  title: 'Keranjang Belanja',
}

export default function Page() {
  return <CartPage />
}
