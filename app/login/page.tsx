import type { Metadata } from 'next'
import LoginPage from '@/views/Login'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Masuk',
}

export default function Page() {
  return <LoginPage />
}
