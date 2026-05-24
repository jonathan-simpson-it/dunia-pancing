import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  role: 'admin' | 'client'
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isLoggedIn, isAdmin, loaded } = useAuth()

  if (!loaded) return null

  if (!isLoggedIn) return <Navigate to="/login" replace />

  if (role === 'admin' && !isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}
