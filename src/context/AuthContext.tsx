'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Role, Permission } from '@/lib/rbac'

// ✅ FIX: rename import to avoid collision
import { hasPermission, canAccess as canAccessPage } from '@/lib/rbac'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  initials: string
}

interface AuthCtx {
  user: AuthUser | null
  isLoading: boolean
  login: (user: AuthUser) => void
  logout: () => void
  can: (permission: Permission) => boolean
  canAccess: (page: string) => boolean
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  can: () => false,
  canAccess: () => false,
})

const STORAGE_KEY = 'twn_auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) setUser(JSON.parse(stored) as AuthUser)
    } catch {
      // ignore malformed JSON
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback((u: AuthUser) => {
    setUser(u)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } catch {}
    document.cookie = `twn_role=${encodeURIComponent(u.role)}; path=/; SameSite=Lax`
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {}
    document.cookie = 'twn_role=; path=/; max-age=0'
  }, [])

  const can = useCallback(
    (permission: Permission): boolean =>
      user ? hasPermission(user.role, permission) : false,
    [user]
  )

  // ✅ FIXED: uses canAccessPage instead of recursive call
  const canAccess = useCallback(
    (page: string): boolean =>
      user ? canAccessPage(user.role, page) : false,
    [user]
  )

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, can, canAccess }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}