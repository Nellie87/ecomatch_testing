'use client'
import { useAuth } from '@/context/AuthContext'
import { hasPermission } from '@/lib/rbac'
import type { Permission } from '@/lib/rbac'

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user } = useAuth()
  if (!user) return <>{fallback}</>
  return hasPermission(user.role, permission)
    ? <>{children}</>
    : <>{fallback}</>
}