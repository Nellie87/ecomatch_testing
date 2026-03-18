'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BarChart2, Settings, Sun, Moon } from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/admin',      label: 'Admin',      icon: LayoutDashboard },
  { href: '/review',     label: 'Review',     icon: Users },
  { href: '/analytics',  label: 'Analytics',  icon: BarChart2 },
  { href: '/management', label: 'Management', icon: Settings },
]

export function NavBar() {
  const pathname = usePathname()
  const [light, setLight] = useState(false)

  return (
    <nav style={{ background: 'var(--nav-bg)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      className="sticky top-0 z-50 h-16 px-8 flex items-center shadow-navy">
      {/* Brand */}
      <Link href="/admin" className="flex items-center gap-3 mr-auto no-underline">
        <div className="w-9 h-9 rounded-xl flex items-center justify-content-center font-syne font-black text-sm text-white flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--coral), var(--coral-dark))', boxShadow: '0 4px 14px rgba(232,69,42,0.4)' }}>
          TW
        </div>
        <div>
          <div className="font-syne font-bold text-[15px] text-white leading-tight">Trinidad Wiseman</div>
          <div className="text-[11px] leading-tight" style={{ color: 'var(--teal-light)' }}>Human-in-the-Loop AI</div>
        </div>
      </Link>

      {/* Nav tabs */}
      <div className="flex gap-1">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 no-underline ${
                active
                  ? 'text-white nav-active-glow'
                  : 'text-white/50 hover:text-white hover:bg-white/8'
              }`}
              style={active ? { background: 'linear-gradient(135deg, var(--coral), var(--coral-dark))' } : {}}>
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </div>

      {/* Theme toggle */}
      <button onClick={() => setLight(!light)}
        className="ml-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
        {light ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </nav>
  )
}
