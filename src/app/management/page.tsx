'use client'

import { AppShell } from '@/components/layout/app-shell'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Plus, Edit2, Trash2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { REVIEWERS, ROLE_PERMISSIONS, ACTIVITY_LOG } from '@/lib/review-data'

type ReviewerStatus = 'online' | 'away' | 'offline'

type ReviewerItem = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Senior Reviewer' | 'Reviewer' | 'Trainee'
  status: ReviewerStatus
  reviews: number
  lastActive: string
}

type RolePermissionItem = {
  role: string
  desc: string
  perms: string[]
}

type ActivityItem = {
  id: string
  type: 'confirm' | 'reject' | 'system' | 'user' | 'retrain' | 'alert'
  text: string
  time: string
}

type SettingItem = {
  key: string
  name: string
  desc: string
  on: boolean
}

const ACTIVITY_ICONS: Record<
  ActivityItem['type'],
  { icon: string; bg: string; color: string }
> = {
  confirm: {
    icon: '✓',
    bg: 'var(--success-soft)',
    color: 'var(--success)',
  },
  reject: {
    icon: '✕',
    bg: 'var(--danger-soft)',
    color: 'var(--danger)',
  },
  system: {
    icon: '⚙',
    bg: 'var(--primary-soft)',
    color: 'var(--primary)',
  },
  user: {
    icon: '👤',
    bg: 'var(--warning-soft)',
    color: 'var(--warning)',
  },
  retrain: {
    icon: '↑',
    bg: 'var(--success-soft)',
    color: 'var(--success)',
  },
  alert: {
    icon: '⚠',
    bg: 'var(--danger-soft)',
    color: 'var(--danger)',
  },
}

const SETTINGS_DEFAULT: SettingItem[] = [
  {
    key: 'autoAssign',
    name: 'Auto-assign reviews',
    desc: 'Distribute queue evenly to online reviewers',
    on: true,
  },
  {
    key: 'aiScreen',
    name: 'AI pre-screening',
    desc: 'Auto-confirm matches above 95% confidence',
    on: true,
  },
  {
    key: 'emailNotif',
    name: 'Email notifications',
    desc: 'Notify reviewers on new queue items',
    on: false,
  },
  {
    key: 'retrainAlerts',
    name: 'Model retraining alerts',
    desc: 'Alert admin when rejection rate exceeds 20%',
    on: true,
  },
  {
    key: 'auditLog',
    name: 'Audit logging',
    desc: 'Log all reviewer decisions for compliance',
    on: true,
  },
]

function PageCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-2xl border ${className}`}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {children}
    </section>
  )
}

function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="tw-heading text-[22px] font-bold">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {right}
    </div>
  )
}

function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'success' | 'warning' | 'neutral' | 'danger' | 'primary'
}) {
  const tones = {
    default: {
      bg: 'var(--primary-soft)',
      color: 'var(--primary)',
    },
    success: {
      bg: 'var(--success-soft)',
      color: 'var(--success)',
    },
    warning: {
      bg: 'var(--warning-soft)',
      color: 'var(--warning)',
    },
    neutral: {
      bg: 'var(--surface-soft)',
      color: 'var(--text-muted)',
    },
    danger: {
      bg: 'var(--danger-soft)',
      color: 'var(--danger)',
    },
    primary: {
      bg: 'var(--primary-soft)',
      color: 'var(--primary)',
    },
  }

  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize"
      style={{
        background: tones[tone].bg,
        color: tones[tone].color,
      }}
    >
      {children}
    </span>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-xs font-bold"
      style={{
        background: 'var(--primary-soft)',
        color: 'var(--primary)',
      }}
    >
      {initials}
    </div>
  )
}

function ActionButton({
  children,
  tone = 'neutral',
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'danger' | 'primary'
  onClick?: () => void
  disabled?: boolean
}) {
  const styles = {
    neutral: {
      bg: 'var(--surface-soft)',
      border: 'var(--border)',
      color: 'var(--text)',
    },
    danger: {
      bg: 'var(--danger-soft)',
      border: 'var(--danger)',
      color: 'var(--danger)',
    },
    primary: {
      bg: 'var(--nav)',
      border: 'var(--nav)',
      color: '#fff',
    },
  }

  const style = styles[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: style.bg,
        borderColor: style.border,
        color: style.color,
      }}
    >
      {children}
    </button>
  )
}

function Toggle({
  on,
  onChange,
  disabled = false,
}: {
  on: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className="relative inline-flex h-7 w-12 items-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: on ? 'var(--primary)' : 'var(--surface-soft)',
        border: `1px solid ${on ? 'var(--primary)' : 'var(--border)'}`,
      }}
      aria-pressed={on}
    >
      <span
        className="absolute h-5 w-5 rounded-full transition-all"
        style={{
          left: on ? 'calc(100% - 1.4rem)' : '0.2rem',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}
      />
    </button>
  )
}

export default function ManagementPage() {
  const { user, isLoading, canAccess, can } = useAuth()

  const [reviewers, setReviewers] = useState<ReviewerItem[]>(
    REVIEWERS as ReviewerItem[]
  )
  const [settings, setSettings] = useState<SettingItem[]>(SETTINGS_DEFAULT)

  const rolePermissions = ROLE_PERMISSIONS as unknown as RolePermissionItem[]
  const activityLog = ACTIVITY_LOG as ActivityItem[]

  const canManageUsers = can('action:manage_users')
  const canToggleSettings = can('action:toggle_settings')

  function toggleSetting(key: string) {
    if (!canToggleSettings) return

    setSettings((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, on: !item.on } : item
      )
    )
  }

  function removeReviewer(id: string) {
    if (!canManageUsers) return
    setReviewers((prev) => prev.filter((item) => item.id !== id))
  }

  const statusInfo = useMemo(
    () => ({
      online: {
        label: 'Online',
        color: 'var(--success)',
        bg: 'var(--success)',
      },
      away: {
        label: 'Away',
        color: 'var(--warning)',
        bg: 'var(--warning)',
      },
      offline: {
        label: 'Offline',
        color: 'var(--text-muted)',
        bg: 'var(--text-muted)',
      },
    }),
    []
  )

  const roleBadgeTone = useMemo<
    Record<ReviewerItem['role'], 'primary' | 'success' | 'warning' | 'danger' | 'neutral'>
  >(
    () => ({
      Admin: 'danger',
      'Senior Reviewer': 'primary',
      Reviewer: 'success',
      Trainee: 'warning',
    }),
    []
  )

  if (isLoading) {
    return (
      <AppShell>
        <div className="tw-page">
          <PageCard className="p-10 text-center">
            <div className="text-lg font-semibold">Loading management...</div>
          </PageCard>
        </div>
      </AppShell>
    )
  }

  if (!user || !canAccess('management')) {
    return (
      <AppShell>
        <div className="tw-page">
          <PageCard className="p-10 text-center">
            <h1 className="text-2xl font-bold">Unauthorized</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              You do not have access to management.
            </p>
            <Link
              href="/review"
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}
            >
              Go to Review
              <ArrowRight size={15} />
            </Link>
          </PageCard>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="tw-page">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="tw-heading text-[34px] font-bold leading-none md:text-[42px]">
                Management
              </h1>
              <p
                className="mt-3 max-w-3xl text-sm md:text-[15px]"
                style={{ color: 'var(--text-muted)' }}
              >
                Users, roles, system settings, and audit activity for the matching workflow.
              </p>
            </div>

            <ActionButton tone="primary" disabled={!canManageUsers}>
              <Plus size={14} />
              Add User
            </ActionButton>
          </div>

          {!canManageUsers && !canToggleSettings && (
            <PageCard className="p-4">
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: 'var(--surface-soft)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                You can view management details, but you do not have permission to modify users or settings.
              </div>
            </PageCard>
          )}

          <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
            <PageCard className="p-5 md:p-6 2xl:col-span-2">
              <SectionTitle
                title="Reviewer List"
                subtitle="All current users with roles, status, and recent activity"
                right={<Badge tone="success">{reviewers.length} users</Badge>}
              />

              <div
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="hidden grid-cols-[1.6fr_1fr_1fr_0.8fr_1fr_1.1fr] gap-4 border-b px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] lg:grid"
                  style={{
                    background: 'var(--surface-soft)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>User</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Reviews</span>
                  <span>Last active</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {reviewers.map((reviewer) => {
                    const status =
                      statusInfo[reviewer.status as keyof typeof statusInfo] ?? statusInfo.offline

                    return (
                      <div
                        key={reviewer.id}
                        className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.6fr_1fr_1fr_0.8fr_1fr_1.1fr] lg:items-center"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={reviewer.name} />
                          <div>
                            <div className="text-sm font-semibold">
                              {reviewer.name}
                            </div>
                            <div
                              className="text-[12px]"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {reviewer.email}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Badge tone={roleBadgeTone[reviewer.role]}>
                            {reviewer.role}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: status.bg }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: status.color }}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div
                          className="text-sm"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <span className="font-medium lg:hidden text-[var(--text)]">
                            Reviews:{' '}
                          </span>
                          {reviewer.reviews}
                        </div>

                        <div
                          className="text-sm"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <span className="font-medium lg:hidden text-[var(--text)]">
                            Last active:{' '}
                          </span>
                          {reviewer.lastActive}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <ActionButton tone="neutral" disabled={!canManageUsers}>
                            <Edit2 size={12} />
                            Edit
                          </ActionButton>
                          <ActionButton
                            tone="danger"
                            onClick={() => removeReviewer(reviewer.id)}
                            disabled={!canManageUsers}
                          >
                            <Trash2 size={12} />
                            Remove
                          </ActionButton>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </PageCard>

            <PageCard className="p-5 md:p-6">
              <SectionTitle
                title="Role Permissions"
                subtitle="Current capability set by reviewer tier"
              />

              <div className="space-y-3">
                {rolePermissions.map((item) => (
                  <div
                    key={item.role}
                    className="flex flex-col gap-4 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between"
                    style={{
                      background: 'var(--surface-soft)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div>
                      <div className="text-[14px] font-semibold">{item.role}</div>
                      <div
                        className="mt-1 text-[12px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {item.desc}
                      </div>
                    </div>

                    <div className="flex max-w-[240px] flex-wrap gap-1.5">
                      {['Review', 'Analytics', 'Manage', 'Settings'].map((perm) => (
                        <Badge
                          key={perm}
                          tone={item.perms.includes(perm) ? 'success' : 'neutral'}
                        >
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PageCard>

            <PageCard className="p-5 md:p-6">
              <SectionTitle
                title="System Settings"
                subtitle="Operational controls for assignment, notifications, and compliance"
              />

              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {settings.map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <div className="text-[14px] font-medium">
                        {setting.name}
                      </div>
                      <div
                        className="mt-0.5 text-[12px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {setting.desc}
                      </div>
                    </div>

                    <Toggle
                      on={setting.on}
                      onChange={() => toggleSetting(setting.key)}
                      disabled={!canToggleSettings}
                    />
                  </div>
                ))}
              </div>
            </PageCard>

            <PageCard className="p-5 md:p-6 2xl:col-span-2">
              <SectionTitle
                title="Activity Log"
                subtitle="Recent reviewer, system, and model-related events"
              />

              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {activityLog.map((item) => {
                  const iconStyle = ACTIVITY_ICONS[item.type]

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 py-4"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[15px]"
                        style={{
                          background: iconStyle.bg,
                          color: iconStyle.color,
                        }}
                      >
                        {iconStyle.icon}
                      </div>

                      <div className="flex-1">
                        <div
                          className="text-[13px] leading-relaxed"
                          style={{ color: 'var(--text)' }}
                          dangerouslySetInnerHTML={{
                            __html: item.text
                              .replace(
                                /<b>/g,
                                '<strong style="color:var(--text);font-weight:600">'
                              )
                              .replace(/<\/b>/g, '</strong>'),
                          }}
                        />
                        <div
                          className="mt-1 text-[11px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {item.time}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </PageCard>
          </div>
        </div>
      </div>
    </AppShell>
  )
}