'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { useEffect, type ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  role: 'admin' | 'client'
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isLoggedIn, isAdmin, loaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loaded) return
    if (!isLoggedIn) {
      router.replace('/login')
    } else if (role === 'admin' && !isAdmin) {
      router.replace('/')
    }
  }, [loaded, isLoggedIn, isAdmin, role, router])

  if (!loaded) return null
  if (!isLoggedIn) return null
  if (role === 'admin' && !isAdmin) return null

  return <>{children}</>
}
