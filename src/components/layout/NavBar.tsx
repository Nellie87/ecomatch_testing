'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BarChart2,
  Settings,
  Sun,
  Moon,
  LogOut,
  Bell,
  ChevronDown,
  ShieldCheck,
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

const ALL_LINKS = [
  { href: '/admin', label: 'Admin', page: 'admin', icon: LayoutDashboard },
  { href: '/review', label: 'Review', page: 'review', icon: Users },
  { href: '/analytics', label: 'Analytics', page: 'analytics', icon: BarChart2 },
  { href: '/management', label: 'Management', page: 'management', icon: Settings },
]

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

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [light, setLight] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const { user, isLoading, canAccess, can, logout } = useAuth()

  const visibleLinks = useMemo(() => {
    if (isLoading || !user) return []
    return ALL_LINKS.filter((link) => canAccess(link.page))
  }, [isLoading, user, canAccess])

  const homeHref = useMemo(() => {
    if (isLoading || !user) return '/login'
    if (canAccess('admin')) return '/admin'
    return '/review'
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
      if (event.key === 'Escape') {
        setMenuOpen(false)
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
    <nav
      style={{
        background: 'var(--nav-bg)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
      className="sticky top-0 z-50 flex h-16 items-center px-8 shadow-navy"
    >
      <Link href={homeHref} className="mr-auto flex items-center gap-3 no-underline">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl font-syne text-sm font-black text-white"
          style={{
            background: 'linear-gradient(135deg, var(--coral), var(--coral-dark))',
            boxShadow: '0 4px 14px rgba(232,69,42,0.4)',
          }}
        >
          TW
        </div>

        <div>
          <div className="font-syne text-[15px] font-bold leading-tight text-white">
            Trinidad Wiseman
          </div>
          <div
            className="text-[11px] leading-tight"
            style={{ color: 'var(--teal-light)' }}
          >
            {user && !canAccess('admin') ? 'Review Workspace' : 'Human-in-the-Loop AI'}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-1">
        {!isLoading &&
          user &&
          visibleLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium no-underline transition-all duration-200 ${
                  active
                    ? 'nav-active-glow text-white'
                    : 'text-white/50 hover:bg-white/8 hover:text-white'
                }`}
                style={
                  active
                    ? {
                        background:
                          'linear-gradient(135deg, var(--coral), var(--coral-dark))',
                      }
                    : {}
                }
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
      </div>

      <div className="ml-4 flex items-center gap-2">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          }}
          aria-label="Notifications"
          type="button"
        >
          <Bell size={16} />
        </button>

        <button
          onClick={() => setLight((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          }}
          aria-label="Toggle theme"
          type="button"
        >
          {light ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user && !isLoading && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
              }}
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--coral), var(--coral-dark))',
                }}
              >
                {user.initials}
              </div>

              <div className="hidden min-w-0 text-left md:block">
                <div className="truncate text-sm font-semibold text-white">
                  {user.name}
                </div>
                <div
                  className="truncate text-[11px]"
                  style={{ color: 'var(--teal-light)' }}
                >
                  {user.role}
                </div>
              </div>

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
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--coral), var(--coral-dark))',
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
                    </div>
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
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                    <div className="text-xs font-semibold uppercase tracking-[0.08em]">
                      Role permissions
                    </div>
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
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                    style={{
                      background: 'var(--danger-soft)',
                      color: 'var(--danger)',
                      border: '1px solid var(--danger)',
                    }}
                    type="button"
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
    </nav>
  )
}