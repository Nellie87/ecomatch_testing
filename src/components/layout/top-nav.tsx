'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  ChevronDown,
  Moon,
  Sun,
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
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { Permission } from '@/lib/rbac'

const ALL_NAV_ITEMS = [
  { label: 'Admin', href: '/admin', page: 'admin', icon: LayoutDashboard },
  { label: 'Review', href: '/review', page: 'review', icon: Users },
  { label: 'Analytics', href: '/analytics', page: 'analytics', icon: BarChart2 },
  { label: 'Management', href: '/management', page: 'management', icon: Settings },
] as const

const PERMISSION_META: Record<
  Permission,
  { label: string; icon: React.ReactNode }
> = {
  'view:admin': {
    label: 'Access Admin',
    icon: <LayoutDashboard size={13} />,
  },
  'view:review': {
    label: 'Access Review',
    icon: <Users size={13} />,
  },
  'view:analytics': {
    label: 'Access Analytics',
    icon: <BarChart2 size={13} />,
  },
  'view:management': {
    label: 'Access Management',
    icon: <Settings size={13} />,
  },
  'action:confirm': {
    label: 'Confirm matches',
    icon: <CheckCircle2 size={13} />,
  },
  'action:reject': {
    label: 'Reject matches',
    icon: <XCircle size={13} />,
  },
  // 'action:merge': {
  //   label: 'Merge matches',
  //   icon: <GitMerge size={13} />,
  // },
  // 'action:split': {
  //   label: 'Split matches',
  //   icon: <Split size={13} />,
  // },
  'action:manage_users': {
    label: 'Manage users',
    icon: <UserCog size={13} />,
  },
  'action:toggle_settings': {
    label: 'Toggle settings',
    icon: <SlidersHorizontal size={13} />,
  },
  'action:export': {
    label: 'Export reports',
    icon: <Download size={13} />,
  },
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
        background: 'transparent',
        borderColor: 'rgba(255,255,255,0.08)',
        color: '#dbe4ff',
      }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, canAccess, can, logout } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

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

    const ordered: Permission[] = [
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

    return ordered.filter((permission) => can(permission))
  }, [user, can])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    router.push('/login')
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <header
      className="sticky top-0 z-50 h-16 w-full border-b"
      style={{
        background: 'var(--nav)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex h-full w-full items-center justify-between px-4 md:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-8">
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
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#dbe4ff',
            }}
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>

          {user && !isLoading && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
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
                  className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] z-[70] w-[320px] overflow-hidden rounded-2xl border"
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
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div
                      className="mt-1 text-xs"
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

                  <div className="px-4 py-4">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em]">
                      Role permissions
                    </div>

                    <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                      {grantedPermissions.map((permission) => {
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
    </header>
  )
}