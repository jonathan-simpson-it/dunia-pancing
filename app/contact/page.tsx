import type { Metadata } from 'next'
import ContactPage from '@/views/Contact'

export const metadata: Metadata = {
  title: 'Kontak',
}

export default function Page() {
  return <ContactPage />
}
