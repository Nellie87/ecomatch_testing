'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, Moon, Sun, UserCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Admin', href: '/admin' },
  { label: 'Review', href: '/review' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Management', href: '/management' },
]

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
          <Link href="/admin" className="shrink-0">
            <div className="flex flex-col leading-none">
              <span className="tw-heading text-[15px] font-bold text-white">
                Entity Matching System
              </span>
              <span className="text-[11px] text-[#aeb8d8]">
                Human-in-the-loop AI
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#dbe4ff',
            }}
          >
            <Bell size={16} />
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
            }}
          >
            <UserCircle2 size={18} />
            <span className="hidden text-sm md:inline">Elen Axis</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </header>
  )
}