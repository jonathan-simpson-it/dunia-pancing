import type { Metadata } from 'next'
import ProductDetailPage from '@/views/ProductDetail'

export const metadata: Metadata = {
  title: 'Detail Produk',
}

export default function Page() {
  return <ProductDetailPage />
}
