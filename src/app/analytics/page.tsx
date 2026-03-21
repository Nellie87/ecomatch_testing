'use client'

import { AppShell } from '@/components/layout/app-shell'
import { Download, Share2, FileText } from 'lucide-react'
import { useMemo } from 'react'
import { REVIEWERS } from '@/lib/review-data'
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

const TREND_DATA = [
  { date: 'Mon', precision: 0.82, recall: 0.76 },
  { date: 'Tue', precision: 0.84, recall: 0.79 },
  { date: 'Wed', precision: 0.86, recall: 0.81 },
  { date: 'Thu', precision: 0.88, recall: 0.84 },
  { date: 'Fri', precision: 0.9, recall: 0.86 },
  { date: 'Sat', precision: 0.91, recall: 0.88 },
  { date: 'Sun', precision: 0.92, recall: 0.89 },
]

const CONFUSION = {
  tp: 142,
  fp: 12,
  fn: 18,
  tn: 28,
}

type ReviewerStatus = 'online' | 'away' | 'offline'

type ReviewerAnalytics = {
  id: string
  name: string
  reviews: number
  accuracy: number
  avgTime: number
  status: ReviewerStatus
}

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
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-5">
      <h2 className="tw-heading text-[22px] font-bold">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

function Avatar({
  name,
}: {
  name: string
}) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
      style={{
        background: 'var(--primary-soft)',
        color: 'var(--primary)',
      }}
    >
      {initials}
    </div>
  )
}

function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'success' | 'warning' | 'neutral'
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

function PerfBar({ pct, warn }: { pct: number; warn?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-24 overflow-hidden rounded-full"
        style={{ background: 'var(--surface-soft)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: warn ? 'var(--warning)' : 'var(--primary)',
          }}
        />
      </div>
      <span
        className="text-[12px] font-semibold"
        style={{ color: warn ? 'var(--warning)' : 'var(--primary)' }}
      >
        {pct}%
      </span>
    </div>
  )
}

function MatrixCell({
  value,
  label,
  variant,
}: {
  value: number
  label: string
  variant: 'tp' | 'fp' | 'fn' | 'tn'
}) {
  const styles = {
    tp: {
      bg: 'var(--success-soft)',
      border: 'var(--success)',
      color: 'var(--success)',
    },
    fp: {
      bg: 'var(--danger-soft)',
      border: 'var(--danger)',
      color: 'var(--danger)',
    },
    fn: {
      bg: 'var(--warning-soft)',
      border: 'var(--warning)',
      color: 'var(--warning)',
    },
    tn: {
      bg: 'var(--primary-soft)',
      border: 'var(--primary)',
      color: 'var(--primary)',
    },
  }

  const style = styles[variant]

  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      <div
        className="tw-heading text-[26px] font-bold"
        style={{ color: style.color }}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const precision = (
    (CONFUSION.tp / (CONFUSION.tp + CONFUSION.fp)) *
    100
  ).toFixed(1)

  const recall = (
    (CONFUSION.tp / (CONFUSION.tp + CONFUSION.fn)) *
    100
  ).toFixed(1)

  const f1 = (
    (2 * CONFUSION.tp / (2 * CONFUSION.tp + CONFUSION.fp + CONFUSION.fn)) *
    100
  ).toFixed(1)

  const accuracy = (
    ((CONFUSION.tp + CONFUSION.tn) /
      Object.values(CONFUSION).reduce((a, b) => a + b, 0)) *
    100
  ).toFixed(1)

  const outcomeData = useMemo(
    () => [
      { name: 'Confirmed', value: 71, color: 'var(--success)' },
      { name: 'Rejected', value: 18, color: 'var(--danger)' },
      { name: 'Pending', value: 11, color: 'var(--warning)' },
    ],
    []
  )

  const reviewers: ReviewerAnalytics[] = REVIEWERS as ReviewerAnalytics[]

  return (
    <AppShell>
      <div className="tw-page">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="tw-heading text-[34px] font-bold leading-none md:text-[42px]">
                Analytics
              </h1>
              <p
                className="mt-3 max-w-3xl text-sm md:text-[15px]"
                style={{ color: 'var(--text-muted)' }}
              >
                Model performance, reviewer insights, and resolution quality metrics.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { icon: <FileText size={14} />, label: 'Export CSV' },
                { icon: <Download size={14} />, label: 'Export PDF' },
                { icon: <Share2 size={14} />, label: 'Share Report' },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              {
                label: 'Overall Precision',
                value: `${precision}%`,
                color: 'var(--primary)',
                trend: '↑ +2.1% this week',
                up: true,
              },
              {
                label: 'Overall Recall',
                value: `${recall}%`,
                color: 'var(--success)',
                trend: '↑ +1.3% this week',
                up: true,
              },
              {
                label: 'Avg Review Time',
                value: '2.4 min',
                color: 'var(--warning)',
                trend: '↓ −0.3 min vs last week',
                up: false,
              },
            ].map(({ label, value, color, trend, up }) => (
              <PageCard key={label} className="p-5">
                <div
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {label}
                </div>
                <div
                  className="tw-heading mt-3 text-[32px] font-bold leading-none"
                  style={{ color }}
                >
                  {value}
                </div>
                <div
                  className="mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                  style={{
                    background: up ? 'var(--success-soft)' : 'var(--danger-soft)',
                    color: up ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {trend}
                </div>
              </PageCard>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
            <PageCard className="p-5 md:p-6">
              <SectionTitle
                title="Reviewer Performance"
                subtitle="Productivity, accuracy, and current status"
              />

              <div
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="hidden grid-cols-[1.5fr_0.8fr_1fr_0.9fr_0.8fr] gap-4 border-b px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] lg:grid"
                  style={{
                    background: 'var(--surface-soft)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>Reviewer</span>
                  <span>Reviewed</span>
                  <span>Accuracy</span>
                  <span>Avg time</span>
                  <span>Status</span>
                </div>

                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {reviewers.map((reviewer) => (
                    <div
                      key={reviewer.id}
                      className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.5fr_0.8fr_1fr_0.9fr_0.8fr] lg:items-center"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar name={reviewer.name} />
                        <span className="text-sm font-medium">{reviewer.name}</span>
                      </div>

                      <div
                        className="text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <span className="font-medium lg:hidden text-[var(--text)]">
                          Reviewed:{' '}
                        </span>
                        {reviewer.reviews}
                      </div>

                      <div>
                        <PerfBar pct={reviewer.accuracy} warn={reviewer.accuracy < 85} />
                      </div>

                      <div
                        className="text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <span className="font-medium lg:hidden text-[var(--text)]">
                          Avg time:{' '}
                        </span>
                        {reviewer.avgTime} min
                      </div>

                      <div>
                        <Badge
                          tone={
                            reviewer.status === 'online'
                              ? 'success'
                              : reviewer.status === 'away'
                                ? 'warning'
                                : 'neutral'
                          }
                        >
                          {reviewer.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PageCard>

            <PageCard className="p-5 md:p-6">
              <SectionTitle
                title="Confusion Matrix"
                subtitle="Last 200 reviewed records"
              />

              <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
                <div />
                <div
                  className="py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Predicted +
                </div>
                <div
                  className="py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Predicted −
                </div>

                <div
                  className="text-center text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Actual +
                </div>
                <MatrixCell value={CONFUSION.tp} label="True Positive" variant="tp" />
                <MatrixCell value={CONFUSION.fn} label="False Negative" variant="fn" />

                <div
                  className="text-center text-[11px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Actual −
                </div>
                <MatrixCell value={CONFUSION.fp} label="False Positive" variant="fp" />
                <MatrixCell value={CONFUSION.tn} label="True Negative" variant="tn" />
              </div>

              <div
                className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-4"
                style={{ borderColor: 'var(--border)' }}
              >
                {[
                  { label: 'Precision', value: `${precision}%`, color: 'var(--primary)' },
                  { label: 'Recall', value: `${recall}%`, color: 'var(--success)' },
                  { label: 'F1 Score', value: `${f1}%`, color: 'var(--warning)' },
                  { label: 'Accuracy', value: `${accuracy}%`, color: 'var(--danger)' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div
                      className="text-[11px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {label}
                    </div>
                    <div
                      className="tw-heading mt-1 text-[20px] font-bold"
                      style={{ color }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </PageCard>
          </div>

          <PageCard className="p-5 md:p-6">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="tw-heading text-[22px] font-bold">
                  Model Accuracy Over Time
                </h2>
                <p
                  className="mt-1 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Precision and recall trend across recent review windows
                </p>
              </div>

              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: 'var(--success-soft)',
                  color: 'var(--success)',
                }}
              >
                ↗ Trending up
              </span>
            </div>

            <div className="h-[240px] w-full md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={TREND_DATA}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#8A9BBB', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0.7, 1.0]}
                    tick={{ fill: '#8A9BBB', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.toFixed(2)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      color: 'var(--text)',
                      fontSize: 12,
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="precision"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    dot={{ fill: 'var(--primary)', r: 4 }}
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

            <div className="mt-3 flex flex-wrap gap-5">
              {[
                ['var(--primary)', 'Precision'],
                ['var(--success)', 'Recall'],
              ].map(([color, label]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-[13px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: color }}
                  />
                  {label}
                </div>
              ))}
            </div>
          </PageCard>

          <PageCard className="p-5 md:p-6">
            <SectionTitle
              title="Review Outcome Distribution"
              subtitle="Current processed decision breakdown"
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] lg:items-center">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {outcomeData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        color: 'var(--text)',
                        fontSize: 12,
                        boxShadow: 'var(--shadow-lg)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {outcomeData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl border px-4 py-3"
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
                      className="tw-heading text-[18px] font-bold"
                      style={{ color: item.color }}
                    >
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </PageCard>
        </div>
      </div>
    </AppShell>
  )
}