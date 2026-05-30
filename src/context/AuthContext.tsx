'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import type { Session } from 'next-auth'

interface AuthContextValue {
  user: { username: string; role: string; name: string; phone?: string } | null
  login: (username: string, password: string) => Promise<boolean>
  register: (data: { name: string; phone: string; password: string }) => Promise<boolean>
  logout: () => void
  isAdmin: boolean
  isClient: boolean
  isLoggedIn: boolean
  loaded: boolean
}

const AuthContext = createContext<AuthContextValue>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  const user = session?.user
    ? {
        username: (session.user as any).username || session.user.email || '',
        role: (session.user as any).role || 'client',
        name: session.user.name || '',
      }
    : null

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })
    return !result?.error
  }, [])

  const register = useCallback(async ({ name, phone, password }: { name: string; phone: string; password: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: phone, password, name, phone }),
      })
      if (!res.ok) return false
      const result = await signIn('credentials', {
        username: phone,
        password,
        redirect: false,
      })
      return !result?.error
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    signOut({ callbackUrl: '/login' })
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
      isClient: user?.role === 'client',
      isLoggedIn: !!user,
      loaded: status !== 'loading',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
