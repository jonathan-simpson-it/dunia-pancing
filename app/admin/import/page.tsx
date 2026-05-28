import type { Metadata } from 'next'
import AdminImportPage from '@/views/AdminImport'

export const metadata: Metadata = {
  title: 'Import Harga',
}

export default function Page() {
  return <AdminImportPage />
}
