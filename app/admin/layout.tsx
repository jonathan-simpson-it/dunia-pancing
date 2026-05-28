'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isAdmin, loaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loaded && (!isLoggedIn || !isAdmin)) {
      router.replace('/login')
    }
  }, [loaded, isLoggedIn, isAdmin, router])

  if (!loaded) return null
  if (!isLoggedIn || !isAdmin) return null

  return <>{children}</>
}
