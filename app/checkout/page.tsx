import type { Metadata } from 'next'
import CheckoutPage from '@/views/Checkout'

export const metadata: Metadata = {
  title: 'Checkout',
}

export default function Page() {
  return <CheckoutPage />
}
