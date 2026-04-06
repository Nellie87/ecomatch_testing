'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  ChevronDown,
  Moon,
  Sun,
  Menu,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  Users,
  BarChart2,
  Settings,
  CheckCircle2,
  XCircle,
  // GitMerge,
  // Split,
  Download,
  UserCog,
  SlidersHorizontal,
  RefreshCcw,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth, type AuthUser } from '@/context/AuthContext'
import type { Permission, Role } from '@/lib/rbac'

const ALL_NAV_ITEMS = [
  { label: 'Admin', href: '/admin', page: 'admin', icon: LayoutDashboard },
  { label: 'Review', href: '/review', page: 'review', icon: Users },
  { label: 'Analytics', href: '/analytics', page: 'analytics', icon: BarChart2 },
  { label: 'Management', href: '/management', page: 'management', icon: Settings },
] as const

const TEST_USERS: AuthUser[] = [
  {
    id: 'r1',
    name: 'Liis Tamm',
    email: 'liis@twn.ee',
    role: 'Senior Reviewer',
    initials: 'LT',
  },
  {
    id: 'r2',
    name: 'Mart Kaljurand',
    email: 'mart@twn.ee',
    role: 'Reviewer',
    initials: 'MK',
  },
  {
    id: 'r3',
    name: 'Anna Lepp',
    email: 'anna@twn.ee',
    role: 'Trainee',
    initials: 'AL',
  },
  {
    id: 'r4',
    name: 'Admin User',
    email: 'admin@twn.ee',
    role: 'Admin',
    initials: 'AU',
  },
]

const PERMISSION_META: Record<
  Permission,
  {
    label: string
    icon: React.ReactNode
    group: 'Access' | 'Actions'
  }
> = {
  'view:admin': {
    label: 'Access Admin',
    icon: <LayoutDashboard size={13} />,
    group: 'Access',
  },
  'view:review': {
    label: 'Access Review',
    icon: <Users size={13} />,
    group: 'Access',
  },
  'view:analytics': {
    label: 'Access Analytics',
    icon: <BarChart2 size={13} />,
    group: 'Access',
  },
  'view:management': {
    label: 'Access Management',
    icon: <Settings size={13} />,
    group: 'Access',
  },
  'action:confirm': {
    label: 'Confirm matches',
    icon: <CheckCircle2 size={13} />,
    group: 'Actions',
  },
  'action:reject': {
    label: 'Reject matches',
    icon: <XCircle size={13} />,
    group: 'Actions',
  },
  // 'action:merge': {
  //   label: 'Merge matches',
  //   icon: <GitMerge size={13} />,
  //   group: 'Actions',
  // },
  // 'action:split': {
  //   label: 'Split matches',
  //   icon: <Split size={13} />,
  //   group: 'Actions',
  // },
  'action:manage_users': {
    label: 'Manage users',
    icon: <UserCog size={13} />,
    group: 'Actions',
  },
  'action:toggle_settings': {
    label: 'Toggle settings',
    icon: <SlidersHorizontal size={13} />,
    group: 'Actions',
  },
  'action:export': {
    label: 'Export reports',
    icon: <Download size={13} />,
    group: 'Actions',
  },
}

function getLandingPage(role: Role) {
  switch (role) {
    case 'Admin':
    case 'Senior Reviewer':
      return '/admin'
    case 'Reviewer':
    case 'Trainee':
      return '/review'
    default:
      return '/login'
  }
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setMounted(true)
    const saved = window.localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const next = saved === 'dark' || (!saved && prefersDark) ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    window.localStorage.setItem('theme', next)
  }

  if (!mounted) return null

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
      style={{
        borderColor: 'rgba(255,255,255,0.08)',
        color: '#dbe4ff',
        background: 'transparent',
      }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

function PermissionGroup({
  title,
  items,
}: {
  title: 'Access' | 'Actions'
  items: Permission[]
}) {
  if (items.length === 0) return null

  return (
    <div>
      <div
        className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: 'var(--text-muted)' }}
      >
        {title}
      </div>

      <div className="space-y-2">
        {items.map((permission) => {
          const meta = PERMISSION_META[permission]

          return (
            <div
              key={permission}
              className="flex items-center gap-2 rounded-xl border px-3 py-2"
              style={{
                background: 'var(--surface-soft)',
                borderColor: 'var(--border)',
              }}
            >
              <div style={{ color: 'var(--primary)' }}>{meta.icon}</div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{meta.label}</div>
                <div
                  className="text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {permission}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, canAccess, can, logout, login } = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const profileRef = useRef<HTMLDivElement | null>(null)

  const visibleNavItems = useMemo(() => {
    if (isLoading || !user) return []
    return ALL_NAV_ITEMS.filter((item) => canAccess(item.page))
  }, [isLoading, user, canAccess])

  const homeHref = useMemo(() => {
    if (isLoading || !user) return '/login'
    return canAccess('admin') ? '/admin' : '/review'
  }, [isLoading, user, canAccess])

  const grantedPermissions = useMemo(() => {
    if (!user) return []

    const orderedPermissions: Permission[] = [
      'view:admin',
      'view:review',
      'view:analytics',
      'view:management',
      'action:confirm',
      'action:reject',
      // 'action:merge',
      // 'action:split',
      'action:manage_users',
      'action:toggle_settings',
      'action:export',
    ]

    return orderedPermissions.filter((permission) => can(permission))
  }, [user, can])

  const accessPermissions = useMemo(
    () =>
      grantedPermissions.filter(
        (permission) => PERMISSION_META[permission].group === 'Access'
      ),
    [grantedPermissions]
  )

  const actionPermissions = useMemo(
    () =>
      grantedPermissions.filter(
        (permission) => PERMISSION_META[permission].group === 'Actions'
      ),
    [grantedPermissions]
  )

  const switchableUsers = useMemo(() => {
    if (!user) return TEST_USERS
    return TEST_USERS.filter((candidate) => candidate.role !== user.role)
  }, [user])

  const handleLogout = () => {
    setProfileOpen(false)
    setMobileOpen(false)
    logout()
    router.push('/login')
  }

  const handleSwitchRole = (nextUser: AuthUser) => {
    login(nextUser)
    setProfileOpen(false)
    setMobileOpen(false)
    router.push(getLandingPage(nextUser.role))
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileRef.current) return
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileOpen(false)
        setMobileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <header
        className="sticky top-0 z-50 h-16 w-full border-b"
        style={{
          background: 'var(--nav)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex h-full w-full items-center justify-between px-4 md:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-4 md:gap-8">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border md:hidden"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                color: '#dbe4ff',
              }}
              aria-label="Open navigation"
            >
              <Menu size={16} />
            </button>

            <Link href={homeHref} className="shrink-0">
              <div className="flex flex-col leading-none">
                <span className="tw-heading text-[15px] font-bold text-white">
                  Entity Matching System
                </span>
                <span className="text-[11px] text-[#aeb8d8]">
                  {user && !canAccess('admin')
                    ? 'Review workspace'
                    : 'Human-in-the-loop AI'}
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {!isLoading &&
                user &&
                visibleNavItems.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative inline-flex h-16 items-center px-4 text-sm font-medium transition-colors"
                      style={{
                        color: active ? '#ffffff' : '#b8c2e3',
                      }}
                    >
                      {item.label}
                      {active ? (
                        <span
                          className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                          style={{ background: 'var(--nav-accent)' }}
                        />
                      ) : null}
                    </Link>
                  )
                })}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />

            <button
              className="hidden h-9 w-9 items-center justify-center rounded-lg border md:inline-flex"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                color: '#dbe4ff',
              }}
              type="button"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>

            {user && !isLoading && (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
                  style={{
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                  }}
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: 'var(--primary-soft)',
                      color: 'var(--primary)',
                    }}
                  >
                    {user.initials}
                  </div>

                  <span className="hidden text-sm md:inline">{user.name}</span>

                  <ChevronDown
                    size={14}
                    className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+10px)] z-[70] w-[340px] overflow-hidden rounded-2xl border"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <div
                      className="border-b px-4 py-4"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                          style={{
                            background: 'var(--primary-soft)',
                            color: 'var(--primary)',
                          }}
                        >
                          {user.initials}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {user.name}
                          </div>
                          <div
                            className="truncate text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {user.email}
                          </div>

                          <div className="mt-3">
                            <span
                              className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                              style={{
                                background: 'var(--primary-soft)',
                                color: 'var(--primary)',
                              }}
                            >
                              <ShieldCheck size={12} />
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto px-4 py-4">
                      <div className="space-y-4">
                        <div>
                          <div className="mb-3 flex items-center gap-2">
                            <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                            <div className="text-xs font-semibold uppercase tracking-[0.08em]">
                              Role permissions
                            </div>
                          </div>

                          <div className="space-y-4">
                            <PermissionGroup title="Access" items={accessPermissions} />
                            <PermissionGroup title="Actions" items={actionPermissions} />
                          </div>
                        </div>

                        <div
                          className="border-t pt-4"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <div className="mb-3 flex items-center gap-2">
                            <RefreshCcw size={14} style={{ color: 'var(--primary)' }} />
                            <div className="text-xs font-semibold uppercase tracking-[0.08em]">
                              Switch role
                            </div>
                          </div>

                          <div className="space-y-2">
                            {switchableUsers.map((candidate) => (
                              <button
                                key={candidate.id}
                                type="button"
                                onClick={() => handleSwitchRole(candidate)}
                                className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors"
                                style={{
                                  background: 'var(--surface-soft)',
                                  borderColor: 'var(--border)',
                                }}
                              >
                                <div className="min-w-0">
                                  <div className="text-sm font-medium">
                                    {candidate.name}
                                  </div>
                                  <div
                                    className="text-[11px]"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    {candidate.role}
                                  </div>
                                </div>

                                <div
                                  className="rounded-full px-2 py-1 text-[10px] font-semibold"
                                  style={{
                                    background: 'var(--primary-soft)',
                                    color: 'var(--primary)',
                                  }}
                                >
                                  Switch
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="border-t px-4 py-3"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                        style={{
                          background: 'var(--danger-soft)',
                          color: 'var(--danger)',
                          border: '1px solid var(--danger)',
                        }}
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div
            className="border-t px-4 py-2 md:hidden"
            style={{
              background: 'var(--nav)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <nav className="flex flex-col">
              {!isLoading &&
                user &&
                visibleNavItems.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-lg px-3 py-2 text-sm font-medium"
                      style={{
                        color: active ? '#fff' : '#b8c2e3',
                        background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                })}

              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 rounded-lg px-3 py-2 text-left text-sm font-medium"
                  style={{
                    color: 'var(--danger)',
                    background: 'var(--danger-soft)',
                  }}
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="w-full">{children}</main>
    </div>
  )
}