'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import type { Role } from '@/lib/rbac'

type MockUser = {
  id: string
  name: string
  email: string
  role: Role
  initials: string
}

const MOCK_USERS: MockUser[] = [
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

export default function LoginPage() {
  const { login, logout, user, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="w-full max-w-md rounded-2xl border p-8 text-center"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="text-sm font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div
        className="w-full max-w-md rounded-2xl border p-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h1 className="mb-2 font-syne text-2xl font-bold">Sign in as…</h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          Choose a mock reviewer account to test RBAC flows.
        </p>

        {user && (
          <div
            className="mb-6 rounded-xl border p-4"
            style={{
              background: 'var(--surface2)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="text-sm font-semibold">Currently signed in</div>
            <div className="mt-2 text-sm">{user.name}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {user.role}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => router.push(getLandingPage(user.role))}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--coral)' }}
              >
                Continue
              </button>

              <button
                type="button"
                onClick={logout}
                className="rounded-xl border px-4 py-2 text-sm font-semibold"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                  background: 'transparent',
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {MOCK_USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                login(u)
                router.push(getLandingPage(u.role))
              }}
              className="w-full rounded-xl border p-4 text-left transition-all hover:border-[var(--coral)]"
              style={{
                background: 'var(--surface2)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="font-semibold">{u.name}</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {u.role}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}