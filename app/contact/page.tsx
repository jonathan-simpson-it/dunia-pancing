import type { Metadata } from 'next'
import ContactPage from '@/views/Contact'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Kontak',
}

export default function Page() {
  return <ContactPage />
}
