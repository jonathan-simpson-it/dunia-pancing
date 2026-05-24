import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()
const USERS_KEY = 'dunia-pancing-users'
const SESSION_KEY = 'dunia-pancing-session'

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  name: 'Admin',
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    const users = raw ? JSON.parse(raw) : []
    const hasAdmin = users.some(u => u.role === 'admin')
    if (!hasAdmin) users.push(DEFAULT_ADMIN)
    return users
  } catch {
    return [DEFAULT_ADMIN]
  }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const login = useCallback((username, password) => {
    const users = loadUsers()
    const found = users.find(u => u.username === username && u.password === password)
    if (!found) return false
    const session = { username: found.username, role: found.role, name: found.name }
    setUser(session)
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return true
  }, [])

  const register = useCallback(({ name, phone, password }) => {
    const users = loadUsers()
    const exists = users.some(u => u.username === phone)
    if (exists) return false
    const newUser = { username: phone, password, role: 'client', name, phone }
    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    const session = { username: newUser.username, role: 'client', name: newUser.name }
    setUser(session)
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
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
      loaded,
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
