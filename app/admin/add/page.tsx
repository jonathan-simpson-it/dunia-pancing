import type { Metadata } from 'next'
import AdminAddProductPage from '@/views/AdminAddProduct'

export const metadata: Metadata = {
  title: 'Tambah Produk',
}

export default function Page() {
  return <AdminAddProductPage />
}
