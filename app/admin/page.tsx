import type { Metadata } from 'next'
import AdminDashboardPage from '@/views/AdminDashboard'

export const metadata: Metadata = {
  title: 'Admin',
}

export default function Page() {
  return <AdminDashboardPage />
}
