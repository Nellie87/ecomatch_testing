export type Role = 'Admin' | 'Senior Reviewer' | 'Reviewer' | 'Trainee'

export type Permission =
  | 'view:admin'
  | 'view:review'
  | 'view:analytics'
  | 'view:management'
  | 'action:confirm'
  | 'action:reject'
  // | 'action:merge'
  // | 'action:split'
  | 'action:manage_users'
  | 'action:toggle_settings'
  | 'action:export'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Admin: [
    'view:admin', 'view:review', 'view:analytics', 'view:management',
    'action:confirm', 'action:reject', // 'action:merge', 'action:split',
    'action:manage_users', 'action:toggle_settings', 'action:export',
  ],
  'Senior Reviewer': [
    'view:admin', 'view:review', 'view:analytics',
    'action:confirm', 'action:reject', // 'action:merge', 'action:split',
    'action:export',
  ],
  Reviewer: [
    'view:review',
    'action:confirm', 'action:reject', // 'action:merge', 'action:split',
  ],
  Trainee: [
    'view:review',
    // No action permissions — view only
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function canAccess(role: Role, page: string): boolean {
  const pagePermMap: Record<string, Permission> = {
    admin:      'view:admin',
    review:     'view:review',
    analytics:  'view:analytics',
    management: 'view:management',
  }
  const perm = pagePermMap[page]
  return perm ? hasPermission(role, perm) : false
}