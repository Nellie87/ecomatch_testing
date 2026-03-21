'use client'

import { AppShell } from '@/components/layout/app-shell'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowRight,
  AlertTriangle,
  Users,
  ChevronRight,
  MoonStar,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { TREND_DATA, QUEUE_ITEMS } from '@/lib/review-data'

const PIE_DATA = [
  { name: 'Confirmed', value: 71, color: 'var(--success)' },
  { name: 'Rejected', value: 18, color: 'var(--danger)' },
  { name: 'Pending', value: 11, color: 'var(--warning)' },
]

const REVIEWER_WORKLOAD = [
  { name: 'Helen Bender', assigned: 12, completedToday: 8, avgTime: '2m 14s' },
  { name: 'Marcus Voss', assigned: 9, completedToday: 7, avgTime: '2m 48s' },
  { name: 'Amina Noor', assigned: 14, completedToday: 10, avgTime: '1m 56s' },
]

const ALERTS = [
  {
    title: 'Low-confidence queue is rising',
    description: '12 records below 65% confidence need manual review.',
    tone: 'warning',
  },
  {
    title: 'Reviewer imbalance detected',
    description: 'Amina Noor has 5 more assigned items than average.',
    tone: 'default',
  },
  {
    title: 'Precision trend improving',
    description: 'Model precision has increased across the last 4 checkpoints.',
    tone: 'success',
  },
] as const

const FILTER_OPTIONS = ['Today', '7 days', '30 days'] as const
type FilterOption = (typeof FILTER_OPTIONS)[number]

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

function StatPanel({
  title,
  value,
  meta,
  icon,
  tone = 'default',
}: {
  title: string
  value: number | string
  meta?: string
  icon: React.ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const toneMap = {
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
    danger: {
      bg: 'var(--danger-soft)',
      color: 'var(--danger)',
    },
  }

  return (
    <PageCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: 'var(--text-muted)' }}
          >
            {title}
          </p>
          <h3 className="tw-heading mt-3 text-3xl font-bold">{value}</h3>
          {meta ? (
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              {meta}
            </p>
          ) : null}
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: toneMap[tone].bg,
            color: toneMap[tone].color,
          }}
        >
          {icon}
        </div>
      </div>
    </PageCard>
  )
}

export default function AdminPage() {
  const [range, setRange] = useState<FilterOption>('7 days')

  const metrics = useMemo(() => {
    const total = QUEUE_ITEMS.length
    const pending = QUEUE_ITEMS.filter((q) => q.status === 'pending').length
    const confirmed = QUEUE_ITEMS.filter((q) => q.status === 'confirmed').length
    const rejected = QUEUE_ITEMS.filter((q) => q.status === 'rejected').length
    const reviewed = confirmed + rejected

    const highConfidence = QUEUE_ITEMS.filter(
      (q) => (q.confidence ?? 0) >= 0.9
    ).length
    const mediumConfidence = QUEUE_ITEMS.filter(
      (q) => (q.confidence ?? 0) >= 0.75 && (q.confidence ?? 0) < 0.9
    ).length
    const lowConfidence = QUEUE_ITEMS.filter(
      (q) => (q.confidence ?? 0) < 0.75
    ).length

    return {
      total,
      pending,
      confirmed,
      rejected,
      reviewed,
      highConfidence,
      mediumConfidence,
      lowConfidence,
    }
  }, [])

  return (
    <AppShell>
      <div className="tw-page">
        <div className="mx-auto w-full max-w-none">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="tw-heading text-[34px] font-bold leading-none md:text-[42px]">
                  Admin Dashboard
                </h1>
                <p
                  className="mt-3 max-w-3xl text-sm md:text-[15px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  High-level overview of system performance, review operations,
                  and matching health.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="inline-flex rounded-xl border p-1"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {FILTER_OPTIONS.map((option) => {
                    const active = option === range
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRange(option)}
                        className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                        style={{
                          background: active
                            ? 'var(--primary-soft)'
                            : 'transparent',
                          color: active
                            ? 'var(--primary)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>

                <Link
                  href="/review"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    background: 'var(--nav)',
                    color: '#fff',
                  }}
                >
                  Open Review Queue
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              <StatPanel
                title="Total Reviewed"
                value={metrics.reviewed}
                meta={`of ${metrics.total} records`}
                icon={<Activity size={20} />}
                tone="default"
              />
              <StatPanel
                title="Confirmed Matches"
                value={metrics.confirmed}
                meta={`${
                  metrics.total
                    ? Math.round((metrics.confirmed / metrics.total) * 100)
                    : 0
                }% of all records`}
                icon={<CheckCircle2 size={20} />}
                tone="success"
              />
              <StatPanel
                title="Rejected Matches"
                value={metrics.rejected}
                meta={`${
                  metrics.total
                    ? Math.round((metrics.rejected / metrics.total) * 100)
                    : 0
                }% of all records`}
                icon={<XCircle size={20} />}
                tone="danger"
              />
              <StatPanel
                title="Needs Review"
                value={metrics.pending}
                meta="Awaiting reviewer decision"
                icon={<Clock3 size={20} />}
                tone="warning"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.65fr)_420px]">
              <div className="space-y-5">


                <PageCard className="p-5 md:p-6">
                  <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <h2 className="tw-heading text-[22px] font-bold">
                        Model performance trends
                      </h2>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Precision and recall over time
                      </p>
                    </div>

                    <div
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: 'var(--success-soft)',
                        color: 'var(--success)',
                      }}
                    >
                      <MoonStar size={13} />
                      Stable improvement
                    </div>
                  </div>

                  <div className="h-[270px] w-full md:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={TREND_DATA}
                        margin={{ top: 8, right: 10, left: -24, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="4 4"
                          stroke="var(--border)"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: 'var(--text-soft)', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0.7, 1.0]}
                          tick={{ fill: 'var(--text-soft)', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => v.toFixed(2)}
                        />
                        <Tooltip
                          contentStyle={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            boxShadow: 'var(--shadow-lg)',
                            color: 'var(--text)',
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="precision"
                          stroke="var(--danger)"
                          strokeWidth={2.5}
                          dot={{ fill: 'var(--danger)', r: 4 }}
                          name="Precision"
                        />
                        <Line
                          type="monotone"
                          dataKey="recall"
                          stroke="var(--success)"
                          strokeWidth={2.5}
                          dot={{ fill: 'var(--success)', r: 4 }}
                          name="Recall"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-5">
                    {[
                      { label: 'Precision', color: 'var(--danger)' },
                      { label: 'Recall', color: 'var(--success)' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: item.color }}
                        />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </PageCard>

                <PageCard className="p-5 md:p-6">
                  <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="tw-heading text-[22px] font-bold">
                        Reviewer workload
                      </h2>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Current assignments and daily output
                      </p>
                    </div>

                    <div
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: 'var(--surface-soft)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Users size={13} />
                      3 active reviewers
                    </div>
                  </div>

                  <div
                    className="overflow-hidden rounded-xl border"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div
                      className="hidden grid-cols-[1.5fr_0.7fr_0.9fr_0.9fr] gap-4 border-b px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] lg:grid"
                      style={{
                        background: 'var(--surface-soft)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span>Reviewer</span>
                      <span>Assigned</span>
                      <span>Completed today</span>
                      <span>Avg time</span>
                    </div>

                    <div
                      className="divide-y"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {REVIEWER_WORKLOAD.map((reviewer) => (
                        <div
                          key={reviewer.name}
                          className="grid grid-cols-1 gap-2 px-4 py-4 lg:grid-cols-[1.5fr_0.7fr_0.9fr_0.9fr] lg:items-center"
                          style={{ background: 'var(--surface)' }}
                        >
                          <div className="font-semibold">{reviewer.name}</div>
                          <div
                            className="text-sm"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <span className="lg:hidden font-medium text-[var(--text)]">
                              Assigned:{' '}
                            </span>
                            {reviewer.assigned}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <span className="lg:hidden font-medium text-[var(--text)]">
                              Completed today:{' '}
                            </span>
                            {reviewer.completedToday}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <span className="lg:hidden font-medium text-[var(--text)]">
                              Avg time:{' '}
                            </span>
                            {reviewer.avgTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PageCard>
              </div>

              <div className="space-y-5">
                <PageCard className="p-5 md:p-6">
                  <h2 className="tw-heading text-[22px] font-bold">
                    Review outcomes
                  </h2>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Breakdown of processed review decisions
                  </p>

                  <div className="mt-4 h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={PIE_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={56}
                          outerRadius={82}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {PIE_DATA.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            boxShadow: 'var(--shadow-lg)',
                            color: 'var(--text)',
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {PIE_DATA.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-xl border px-3 py-2.5"
                        style={{
                          background: 'var(--surface-soft)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: item.color }}
                          />
                          <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {item.name}
                          </span>
                        </div>
                        <span
                          className="tw-heading text-[15px] font-bold"
                          style={{ color: item.color }}
                        >
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </PageCard>

                <PageCard className="p-5 md:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    <h2 className="tw-heading text-[22px] font-bold">
                      Priority alerts
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {ALERTS.map((alert) => {
                      const toneStyle =
                        alert.tone === 'warning'
                          ? {
                              bg: 'var(--warning-soft)',
                              border: 'var(--warning)',
                            }
                          : alert.tone === 'success'
                            ? {
                                bg: 'var(--success-soft)',
                                border: 'var(--success)',
                              }
                            : {
                                bg: 'var(--surface-soft)',
                                border: 'var(--border)',
                              }

                      return (
                        <div
                          key={alert.title}
                          className="rounded-xl border p-4"
                          style={{
                            background: toneStyle.bg,
                            borderColor: toneStyle.border,
                          }}
                        >
                          <h3 className="text-sm font-semibold">
                            {alert.title}
                          </h3>
                          <p
                            className="mt-1 text-sm leading-6"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {alert.description}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </PageCard>

                <PageCard className="p-5 md:p-6">
                  <h2 className="tw-heading text-[22px] font-bold">
                    Quick actions
                  </h2>

                  <div className="mt-4 space-y-3">
                    {[
                      {
                        label: 'Open pending reviews',
                        sub: 'Resolve records awaiting review',
                        href: '/review',
                      },
                      {
                        label: 'View analytics',
                        sub: 'Inspect model and reviewer performance',
                        href: '/analytics',
                      },
                      {
                        label: 'Manage users and settings',
                        sub: 'Permissions, thresholds, and activity',
                        href: '/management',
                      },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors"
                        style={{
                          background: 'var(--surface-soft)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div>
                          <div className="text-sm font-semibold">
                            {item.label}
                          </div>
                          <div
                            className="mt-1 text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {item.sub}
                          </div>
                        </div>
                        <ChevronRight
                          size={16}
                          style={{ color: 'var(--text-muted)' }}
                        />
                      </Link>
                    ))}
                  </div>
                </PageCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}