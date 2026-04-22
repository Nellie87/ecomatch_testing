'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { ExplainableAIPanel } from '@/components/review/ExplainableAIPanel'
import { MATCH_GROUPS, rejectionReasons } from '@/lib/review-data'
import type { MatchCandidateGroup, SourceRecord } from '@/types/hitl'
import { useAuth } from '@/context/AuthContext'

import {
  Check,
  X,
  SkipForward,
  Info,
  Search,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  GitCompareArrows,
  Layers3,
  Eye,
  Lock,
  FolderKanban,
} from 'lucide-react'

const DISPLAY_FIELDS = [
  'name',
  'country',
  'address',
  'sector',
  'entity_type',
  'reg_no',
] as const

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

function MotionSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
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

function ConfidenceRing({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const r = 28
  const circumference = 2 * Math.PI * r
  const dash = (pct / 100) * circumference
  const color =
    pct >= 85 ? 'var(--success)' : pct >= 65 ? 'var(--warning)' : 'var(--danger)'

  return (
    <motion.div
      className="relative h-[72px] w-[72px] shrink-0"
      title="AI confidence score for this match"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="5"
        />
        <motion.circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
    </motion.div>
  )
}

function formatDate(value?: string) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

function getSourceLabel(record: SourceRecord) {
  return record.source_system || record.source || 'manual'
}

function getFieldLabel(field: string) {
  const map: Record<string, string> = {
    name: 'Name',
    country: 'Country',
    address: 'Address',
    sector: 'Sector',
    entity_type: 'Field',
    reg_no: 'Reg number',
  }

  return map[field] || field.replace(/_/g, ' ')
}

function getRecordField(record: SourceRecord, field: string): string {
  const directValue = record[field as keyof SourceRecord]
  if (directValue !== undefined && directValue !== null && String(directValue).trim()) {
    return String(directValue)
  }

  const fieldValuesValue = record.field_values?.[field]
  if (
    fieldValuesValue !== undefined &&
    fieldValuesValue !== null &&
    String(fieldValuesValue).trim()
  ) {
    return String(fieldValuesValue)
  }

  const legacyFieldValue =
    record.fields?.[field as keyof NonNullable<SourceRecord['fields']>]
  if (
    legacyFieldValue !== undefined &&
    legacyFieldValue !== null &&
    String(legacyFieldValue).trim()
  ) {
    return String(legacyFieldValue)
  }

  return ''
}

function getFieldStatus(field: string, records: SourceRecord[]) {
  const values = records.map((record) => getRecordField(record, field))
  const normalized = values.map((value) =>
    String(value).toLowerCase().replace(/[^a-z0-9]/g, '')
  )
  const nonEmpty = normalized.filter(Boolean)

  if (nonEmpty.length === 0) return 'empty'
  const allSame = nonEmpty.every((value) => value === nonEmpty[0])
  return allSame ? 'match' : 'partial'
}

function getDefaultSourceForField(
  group: MatchCandidateGroup,
  field: string
): string | null {
  const valuesBySource: Record<string, string> = {}

  group.records.forEach((record) => {
    const value = getRecordField(record, field)
    const source = getSourceLabel(record)
    if (value && String(value).trim()) {
      valuesBySource[source] = String(value)
    }
  })

  if (Object.keys(valuesBySource).length <= 1) return null

  const priorityOrder = ['registry', 'sanctions', 'erp', 'crm', 'website', 'manual']
  for (const source of priorityOrder) {
    if (valuesBySource[source]) return source
  }
  return Object.keys(valuesBySource)[0] || null
}

function getScenarioLabel(group: MatchCandidateGroup) {
  const confidencePct = Math.round(group.confidence * 100)
  const reasons = group.reasons || []
  const positiveReasons = reasons.filter((r) => r.score > 0).length
  const negativeReasons = reasons.filter((r) => r.score < 0).length

  if (confidencePct >= 90 && negativeReasons === 0) {
    return {
      label: 'Exact high-confidence match',
      tone: 'success' as const,
      icon: CheckCircle2,
    }
  }
  if (confidencePct >= 75 && negativeReasons > 0) {
    return {
      label: 'Likely match with conflicts',
      tone: 'warning' as const,
      icon: GitCompareArrows,
    }
  }
  if (confidencePct < 65 && positiveReasons > 0) {
    return {
      label: 'Weak match — needs review',
      tone: 'warning' as const,
      icon: AlertTriangle,
    }
  }
  return {
    label: 'Probable mismatch',
    tone: 'danger' as const,
    icon: Layers3,
  }
}

function getToneStyles(tone: 'success' | 'warning' | 'danger' | 'primary') {
  if (tone === 'success') {
    return {
      bg: 'var(--success-soft)',
      color: 'var(--success)',
      border: 'var(--success)',
    }
  }
  if (tone === 'warning') {
    return {
      bg: 'var(--warning-soft)',
      color: 'var(--warning)',
      border: 'var(--warning)',
    }
  }
  if (tone === 'danger') {
    return {
      bg: 'var(--danger-soft)',
      color: 'var(--danger)',
      border: 'var(--danger)',
    }
  }
  return {
    bg: 'var(--primary-soft)',
    color: 'var(--primary)',
    border: 'var(--primary)',
  }
}

function getGroupCompanyTitle(group: MatchCandidateGroup | null) {
  if (!group) return 'Unnamed company'

  const registryRecord = group.records.find(
    (record) => getSourceLabel(record).toLowerCase() === 'registry'
  )

  const priorityRecords = registryRecord ? [registryRecord, ...group.records] : group.records

  for (const record of priorityRecords) {
    const value =
      getRecordField(record, 'name') ||
      getRecordField(record, 'client_name_primary') ||
      getRecordField(record, 'client_name') ||
      getRecordField(record, 'anchor_name')

    if (value?.trim()) return value
  }

  return 'Unnamed company'
}

export default function ReviewPage() {
  const { user, isLoading, can } = useAuth()

  const [groups, setGroups] = useState(MATCH_GROUPS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showExplainableAI, setShowExplainableAI] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [selectedReason, setSelectedReason] = useState('')
  const [goldenOverrides, setGoldenOverrides] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{
    msg: string
    color: string
    icon?: 'success' | 'error'
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const canConfirm = can('action:confirm')
  const canReject = can('action:reject')
  const isReadOnly = !canConfirm && !canReject

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups

    const term = searchTerm.toLowerCase().trim()
    return groups.filter((group) => {
      const inGroupMeta =
        group.id.toLowerCase().includes(term) ||
        String(Math.round(group.confidence * 100)).includes(term) ||
        (group.assignee || '').toLowerCase().includes(term) ||
        (group.projects || []).some((project) =>
          [
            project.project_name,
            project.project_title,
            project.company,
            project.project_code,
            project.project_state,
            project.description,
            project.owner_name,
            project.owner_email,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(term)
        )

      const inRecords = group.records.some((record) => {
        const searchable = [
          getSourceLabel(record),
          record.source_id,
          record.entity_type,
          record.name,
          record.country,
          record.address,
          record.sector,
          record.reg_no,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchable.includes(term)
      })

      return inGroupMeta || inRecords
    })
  }, [groups, searchTerm])

  const suggestedCandidates = useMemo(
    () => filteredGroups.filter((group) => group.status === 'suggested'),
    [filteredGroups]
  )

  const reviewedGroups = useMemo(
    () => filteredGroups.filter((group) => group.status !== 'suggested'),
    [filteredGroups]
  )

  const currentGroup =
    suggestedCandidates.length > 0
      ? suggestedCandidates[currentIndex] || suggestedCandidates[0]
      : null

  const currentCompanyTitle = useMemo(
    () => getGroupCompanyTitle(currentGroup),
    [currentGroup]
  )

  const totalRecords = groups.length
  const reviewedCount = groups.filter((group) => group.status !== 'suggested').length
  const pendingCount = suggestedCandidates.length
  const progress = totalRecords > 0 ? (reviewedCount / totalRecords) * 100 : 0

  const showToast = useCallback(
    (msg: string, color: string, icon?: 'success' | 'error') => {
      setToast({ msg, color, icon })
      setTimeout(() => setToast(null), 2400)
    },
    []
  )

  const handleNext = useCallback(() => {
    if (suggestedCandidates.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % suggestedCandidates.length)
    }
  }, [suggestedCandidates.length])

  const handleReject = useCallback(() => {
    if (!currentGroup || !selectedReason || !canReject) return

    setGroups((prev) =>
      prev.map((group) =>
        group.id === currentGroup.id ? { ...group, status: 'rejected' } : group
      )
    )
    setShowRejectModal(false)
    setSelectedReason('')
    showToast(`Match ${currentGroup.id} rejected`, 'var(--danger)', 'error')
  }, [currentGroup, selectedReason, canReject, showToast])

  const handleConfirm = useCallback(() => {
    if (!currentGroup || !canConfirm) return

    setGroups((prev) =>
      prev.map((group) =>
        group.id === currentGroup.id
          ? { ...group, status: 'confirmed', goldenOverrides }
          : group
      )
    )
    setShowConfirmModal(false)
    setGoldenOverrides({})
    showToast(
      `Match ${currentGroup.id} confirmed successfully`,
      'var(--success)',
      'success'
    )
  }, [currentGroup, goldenOverrides, canConfirm, showToast])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      const isTyping =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (e.target as HTMLElement)?.isContentEditable

      if (isTyping) return
      if (showRejectModal || showConfirmModal) return

      switch (e.key.toLowerCase()) {
        case 'c':
          if (!canConfirm) return
          e.preventDefault()
          if (currentGroup) setShowConfirmModal(true)
          break
        case 'x':
          if (!canReject) return
          e.preventDefault()
          if (currentGroup) setShowRejectModal(true)
          break
        case 'n':
        case 's':
          e.preventDefault()
          handleNext()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentGroup, handleNext, showConfirmModal, showRejectModal, canConfirm, canReject])

  useEffect(() => {
    if (currentIndex >= suggestedCandidates.length && suggestedCandidates.length > 0) {
      setCurrentIndex(0)
    }
  }, [suggestedCandidates.length, currentIndex])

  if (isLoading) {
    return (
      <AppShell>
        <div className="tw-page">
          <PageCard className="p-10 text-center">
            <div className="text-lg font-semibold">Loading review workspace...</div>
          </PageCard>
        </div>
      </AppShell>
    )
  }

  if (!user) {
    return (
      <AppShell>
        <div className="tw-page">
          <PageCard className="p-10 text-center">
            <div className="text-lg font-semibold">No authenticated user found.</div>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Please sign in to access the review queue.
            </p>
          </PageCard>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="tw-page">
        <div className="space-y-8">
          <MotionSection>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="tw-heading text-[34px] font-bold leading-none md:text-[42px]">
                  Entity Review
                </h1>
                <p
                  className="mt-3 max-w-3xl text-sm md:text-[15px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Review candidate entities across source systems, inspect explainability,
                  and decide whether to confirm or reject.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className="rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{
                    background: 'var(--surface-soft)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Role: {user.role}
                </span>

                {isReadOnly && (
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: 'var(--warning-soft)',
                      color: 'var(--warning)',
                    }}
                  >
                    <Eye size={13} />
                    View only
                  </span>
                )}
              </div>
            </div>
          </MotionSection>

          <AnimatePresence>
            {isReadOnly && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <PageCard className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: 'var(--warning-soft)',
                        color: 'var(--warning)',
                      }}
                    >
                      <Lock size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Read-only review access</div>
                      <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                        You can inspect candidate matches and explainability, but only a
                        Reviewer, Senior Reviewer, or Admin can confirm or reject records.
                      </p>
                    </div>
                  </div>
                </PageCard>
              </motion.div>
            )}
          </AnimatePresence>

          <MotionSection delay={0.03}>
            <PageCard className="p-4 md:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full max-w-[520px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentIndex(0)
                    }}
                    placeholder="Search by group id, company, project, reg no, country, address, owner..."
                    className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none"
                    style={{
                      background: 'var(--surface-soft)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: 'var(--primary-soft)',
                      color: 'var(--primary)',
                    }}
                  >
                    Filtered: {filteredGroups.length}
                  </span>
                  <span
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: 'var(--warning-soft)',
                      color: 'var(--warning)',
                    }}
                  >
                    Pending: {pendingCount}
                  </span>
                  <span
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: 'var(--success-soft)',
                      color: 'var(--success)',
                    }}
                  >
                    Reviewed: {reviewedGroups.length}
                  </span>
                </div>
              </div>
            </PageCard>
          </MotionSection>

          <motion.div
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ staggerChildren: 0.08 }}
          >
            {[
              {
                label: 'Pending matches',
                value: pendingCount,
                meta: 'Still in analyst queue',
                icon: Clock3,
                tone: 'warning' as const,
              },
              {
                label: 'Completed matches',
                value: reviewedCount,
                meta: `${Math.round(progress)}% of all cases done`,
                icon: CheckCircle2,
                tone: 'success' as const,
              },
            ].map((item) => {
              const styles = getToneStyles(item.tone)
              const Icon = item.icon
              return (
                <motion.div key={item.label} variants={fadeUp}>
                  <PageCard className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div
                          className="text-[11px] font-semibold uppercase tracking-[0.08em]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {item.label}
                        </div>
                        <div className="mt-3 text-3xl font-bold">{item.value}</div>
                        <div
                          className="mt-2 text-sm"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {item.meta}
                        </div>
                      </div>
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{ background: styles.bg, color: styles.color }}
                      >
                        <Icon size={18} />
                      </div>
                    </div>
                  </PageCard>
                </motion.div>
              )
            })}
          </motion.div>

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {!currentGroup ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <PageCard className="p-12 text-center">
                      <div className="text-4xl">✓</div>
                      <h2 className="tw-heading mt-4 text-[28px] font-bold">
                        All matches reviewed
                      </h2>
                      <p
                        className="mt-2 text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        No suggested groups remain in the queue for the current filter.
                      </p>
                    </PageCard>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentGroup.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="space-y-6"
                  >
                    <PageCard className="p-5">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div
                            className="text-[11px] font-semibold uppercase tracking-[0.08em]"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Company under review
                          </div>
                          <h2 className="mt-2 text-[28px] font-bold leading-tight">
                            {currentCompanyTitle}
                          </h2>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <div className="text-sm font-semibold">{currentGroup.id}</div>
                            <span
                              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                              style={{
                                background: 'var(--primary-soft)',
                                color: 'var(--primary)',
                              }}
                            >
                              {currentGroup.records.length} records
                            </span>
                            {(currentGroup.projects?.length || 0) > 0 && (
                              <span
                                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                                style={{
                                  background: 'var(--surface-soft)',
                                  color: 'var(--text-muted)',
                                  border: '1px solid var(--border)',
                                }}
                              >
                                {currentGroup.projects?.length} projects
                              </span>
                            )}
                            {currentGroup.assignee && (
                              <span
                                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                                style={{
                                  background: 'var(--surface-soft)',
                                  color: 'var(--text-muted)',
                                  border: '1px solid var(--border)',
                                }}
                              >
                                {currentGroup.assignee}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <ConfidenceRing value={currentGroup.confidence} />
                          {(() => {
                            const scenario = getScenarioLabel(currentGroup)
                            const styles = getToneStyles(
                              scenario.tone === 'danger'
                                ? 'danger'
                                : scenario.tone === 'warning'
                                  ? 'warning'
                                  : 'success'
                            )
                            const Icon = scenario.icon
                            return (
                              <motion.div
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.24, delay: 0.08 }}
                                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2"
                                style={{
                                  background: styles.bg,
                                  borderColor: styles.border,
                                  color: styles.color,
                                }}
                              >
                                <Icon size={15} />
                                <span className="text-xs font-semibold">
                                  {scenario.label}
                                </span>
                              </motion.div>
                            )
                          })()}
                        </div>
                      </div>
                    </PageCard>

                    <motion.div
                      className="grid gap-4"
                      style={{
                        gridTemplateColumns: `repeat(${currentGroup.records.length}, minmax(0, 1fr))`,
                      }}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ staggerChildren: 0.06 }}
                    >
                      {currentGroup.records.map((record, idx) => {
                        const sourceLabel = getSourceLabel(record)
                        const isPrimary = sourceLabel === 'registry'

                        return (
                          <motion.div
                            key={`${sourceLabel}-${record.source_id || idx}`}
                            variants={fadeUp}
                          >
                            <div
                              className="overflow-hidden rounded-2xl border"
                              style={{
                                background: 'var(--surface)',
                                borderColor: isPrimary ? 'var(--primary)' : 'var(--border)',
                                boxShadow: 'var(--shadow-md)',
                              }}
                            >
                              <div
                                className="flex items-center justify-between px-5 py-3"
                                style={{
                                  background: isPrimary
                                    ? 'var(--primary-soft)'
                                    : 'var(--surface-soft)',
                                  borderBottom: '1px solid var(--border)',
                                }}
                              >
                                <div className="flex min-w-0 flex-col">
                                  <span
                                    className="inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase"
                                    style={{
                                      background: isPrimary
                                        ? 'var(--primary)'
                                        : 'var(--info-soft)',
                                      color: isPrimary ? '#fff' : 'var(--primary)',
                                    }}
                                  >
                                    {sourceLabel}
                                  </span>
                                  <span
                                    className="mt-1 text-[11px]"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    {record.source_id || 'No source ID'}
                                  </span>
                                </div>
                                {isPrimary && (
                                  <span
                                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                                    style={{
                                      background: 'var(--surface)',
                                      color: 'var(--primary)',
                                      border: '1px solid var(--primary)',
                                    }}
                                  >
                                    Primary
                                  </span>
                                )}
                              </div>

                              <div className="space-y-3 p-5">
                                {DISPLAY_FIELDS.map((field) => {
                                  const value = getRecordField(record, field)
                                  const status = getFieldStatus(field, currentGroup.records)

                                  return (
                                    <div
                                      key={field}
                                      className="rounded-xl border p-3"
                                      style={{
                                        background: 'var(--surface-soft)',
                                        borderColor: 'var(--border)',
                                      }}
                                    >
                                      <div className="mb-1 flex items-center gap-2">
                                        <div
                                          className="h-2 w-2 rounded-full"
                                          style={{
                                            background:
                                              status === 'match'
                                                ? 'var(--success)'
                                                : status === 'partial'
                                                  ? 'var(--warning)'
                                                  : 'var(--border)',
                                          }}
                                        />
                                        <span
                                          className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                                          style={{ color: 'var(--text-muted)' }}
                                        >
                                          {getFieldLabel(field)}
                                        </span>
                                      </div>
                                      <div
                                        className="text-[13px] font-medium"
                                        style={{
                                          color: value ? 'var(--text)' : 'var(--text-muted)',
                                          fontStyle: value ? 'normal' : 'italic',
                                          overflowWrap: 'anywhere',
                                        }}
                                      >
                                        {value || '(not provided)'}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>

                    {(currentGroup.projects?.length || 0) > 0 && (
                      <PageCard className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <FolderKanban size={18} style={{ color: 'var(--primary)' }} />
                              <h3 className="text-lg font-bold">Related Projects</h3>
                            </div>
                            <p
                              className="mt-1 text-sm"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Project context linked to this company
                            </p>
                          </div>

                          <span
                            className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                            style={{
                              background: 'var(--primary-soft)',
                              color: 'var(--primary)',
                            }}
                          >
                            {currentGroup.projects?.length} projects
                          </span>
                        </div>

                        <motion.div
                          className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
                          initial="hidden"
                          animate="visible"
                          variants={fadeIn}
                          transition={{ staggerChildren: 0.07 }}
                        >
                          {currentGroup.projects?.map((project, index) => {
                            const stateTone =
                              project.project_state === 'Confirmed'
                                ? {
                                    bg: 'var(--success-soft)',
                                    color: 'var(--success)',
                                  }
                                : {
                                    bg: 'var(--warning-soft)',
                                    color: 'var(--warning)',
                                  }

                            return (
                              <motion.div
                                key={project.id || `${project.source_id}-${index}`}
                                variants={fadeUp}
                              >
                                <div
                                  className="rounded-2xl border p-4"
                                  style={{
                                    background: 'var(--surface-soft)',
                                    borderColor: 'var(--border)',
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="text-sm font-bold">
                                        {project.project_title ||
                                          project.project_name ||
                                          'Untitled project'}
                                      </div>
                                      <div
                                        className="mt-1 text-xs"
                                        style={{ color: 'var(--text-muted)' }}
                                      >
                                        {project.source_system || 'Unknown source'}
                                        {project.project_code
                                          ? ` · Code ${project.project_code}`
                                          : ''}
                                      </div>
                                    </div>

                                    <span
                                      className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase"
                                      style={{
                                        background: stateTone.bg,
                                        color: stateTone.color,
                                      }}
                                    >
                                      {project.project_state || 'Unknown'}
                                    </span>
                                  </div>

                                  <div className="mt-4 space-y-2 text-sm">
                                    <div>
                                      <span style={{ color: 'var(--text-muted)' }}>
                                        Company:{' '}
                                      </span>
                                      <span>{project.company || currentCompanyTitle || '—'}</span>
                                    </div>

                                    <div>
                                      <span style={{ color: 'var(--text-muted)' }}>
                                        Dates:{' '}
                                      </span>
                                      <span>
                                        {formatDate(project.project_start_date)} —{' '}
                                        {formatDate(project.project_end_date)}
                                      </span>
                                    </div>

                                    <div>
                                      <span style={{ color: 'var(--text-muted)' }}>
                                        Owner:{' '}
                                      </span>
                                      <span>{project.owner_name || '—'}</span>
                                    </div>

                                    <div>
                                      <span style={{ color: 'var(--text-muted)' }}>
                                        Owner email:{' '}
                                      </span>
                                      <span>{project.owner_email || '—'}</span>
                                    </div>

                                    <div>
                                      <span style={{ color: 'var(--text-muted)' }}>
                                        Description:{' '}
                                      </span>
                                      <span>
                                        {project.description || project.source_description || '—'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </motion.div>
                      </PageCard>
                    )}

                    <div className="flex flex-wrap gap-5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: 'var(--success)' }}
                        />{' '}
                        Fields match
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: 'var(--warning)' }}
                        />{' '}
                        Conflict detected
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: 'var(--border)' }}
                        />{' '}
                        No data
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowExplainableAI(true)}
                        className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                        style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--primary)',
                        }}
                      >
                        <Info size={15} />
                        Why this match?
                      </motion.button>

                      <div className="flex flex-wrap gap-2.5">
                        {canConfirm ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowConfirmModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                            style={{ background: 'var(--success)' }}
                          >
                            <Check size={15} /> Confirm
                          </motion.button>
                        ) : null}

                        {canReject ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowRejectModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                            style={{ background: 'var(--danger)' }}
                          >
                            <X size={15} /> Reject
                          </motion.button>
                        ) : null}

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleNext}
                          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                          style={{
                            background: 'var(--surface-soft)',
                            borderColor: 'var(--border)',
                            color: 'var(--text)',
                          }}
                        >
                          <SkipForward size={15} /> Skip
                        </motion.button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isReadOnly && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.22 }}
                        >
                          <PageCard className="p-4">
                            <div
                              className="rounded-xl px-4 py-3 text-sm"
                              style={{
                                background: 'var(--surface-soft)',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              View only — contact your reviewer to confirm or reject this match.
                            </div>
                          </PageCard>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <PageCard className="p-4">
                      <div
                        className="flex flex-wrap items-center justify-center gap-6 text-sm"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {canConfirm && (
                          <div className="flex items-center gap-2">
                            <kbd
                              className="rounded-md border px-2 py-1 text-xs font-bold"
                              style={{
                                background: 'var(--surface)',
                                borderColor: 'var(--border)',
                                color: 'var(--text)',
                              }}
                            >
                              C
                            </kbd>
                            <span>Confirm</span>
                          </div>
                        )}

                        {canReject && (
                          <div className="flex items-center gap-2">
                            <kbd
                              className="rounded-md border px-2 py-1 text-xs font-bold"
                              style={{
                                background: 'var(--surface)',
                                borderColor: 'var(--border)',
                                color: 'var(--text)',
                              }}
                            >
                              X
                            </kbd>
                            <span>Reject</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <kbd
                            className="rounded-md border px-2 py-1 text-xs font-bold"
                            style={{
                              background: 'var(--surface)',
                              borderColor: 'var(--border)',
                              color: 'var(--text)',
                            }}
                          >
                            N
                          </kbd>
                          <span>Next</span>
                        </div>
                      </div>
                    </PageCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <MotionSection delay={0.06}>
              <div className="space-y-6">
                <PageCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Pending Match Queue</h3>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Remaining items analysts still need to resolve
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                      style={{
                        background: 'var(--warning-soft)',
                        color: 'var(--warning)',
                      }}
                    >
                      {suggestedCandidates.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {suggestedCandidates.slice(0, 6).map((group) => {
                      const active = currentGroup?.id === group.id
                      const companyTitle = getGroupCompanyTitle(group)

                      return (
                        <motion.button
                          key={group.id}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            const nextIndex = suggestedCandidates.findIndex(
                              (g) => g.id === group.id
                            )
                            if (nextIndex >= 0) setCurrentIndex(nextIndex)
                          }}
                          className="w-full rounded-xl border p-3 text-left"
                          style={{
                            background: active ? 'var(--primary-soft)' : 'var(--surface-soft)',
                            borderColor: active ? 'var(--primary)' : 'var(--border)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-bold">{companyTitle}</div>
                              <div
                                className="mt-1 truncate text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {group.id}
                              </div>
                            </div>
                            <span
                              className="rounded-full px-2 py-1 text-[10px] font-semibold"
                              style={{
                                background: 'var(--surface)',
                                color: 'var(--primary)',
                              }}
                            >
                              {Math.round(group.confidence * 100)}%
                            </span>
                          </div>
                        </motion.button>
                      )
                    })}

                    {suggestedCandidates.length === 0 && (
                      <div
                        className="rounded-xl border p-4 text-sm"
                        style={{
                          background: 'var(--surface-soft)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        No pending matches for this filter.
                      </div>
                    )}
                  </div>
                </PageCard>

                <PageCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">Completed Review</h3>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Recently resolved groups in the same queue
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                      style={{
                        background: 'var(--success-soft)',
                        color: 'var(--success)',
                      }}
                    >
                      {reviewedGroups.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {reviewedGroups.slice(0, 6).map((group) => {
                      const statusStyles =
                        group.status === 'confirmed'
                          ? getToneStyles('success')
                          : getToneStyles('danger')

                      return (
                        <motion.div
                          key={group.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="rounded-xl border p-3"
                          style={{
                            background: 'var(--surface-soft)',
                            borderColor: 'var(--border)',
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-bold">
                                {getGroupCompanyTitle(group)}
                              </div>
                              <div
                                className="mt-1 text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {group.id} · {group.records.length} records ·{' '}
                                {Math.round(group.confidence * 100)}%
                              </div>
                            </div>
                            <span
                              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                              style={{
                                background: statusStyles.bg,
                                color: statusStyles.color,
                              }}
                            >
                              {group.status}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}

                    {reviewedGroups.length === 0 && (
                      <div
                        className="rounded-xl border p-4 text-sm"
                        style={{
                          background: 'var(--surface-soft)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        No completed reviews for this filter.
                      </div>
                    )}
                  </div>
                </PageCard>
              </div>
            </MotionSection>
          </div>
        </div>

        <AnimatePresence>
          {showRejectModal && currentGroup && canReject && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-[520px] rounded-2xl border"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="border-b px-6 py-5" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="tw-heading text-[24px] font-bold">Reject Match</h3>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Select the reason for rejecting {currentGroup.id}.
                  </p>
                </div>
                <div className="space-y-2 p-6">
                  {rejectionReasons.map((reason) => {
                    const selected = selectedReason === reason
                    return (
                      <motion.button
                        key={reason}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedReason(reason)}
                        className="w-full rounded-xl border px-4 py-3 text-left"
                        style={{
                          background: selected ? 'var(--primary-soft)' : 'var(--surface-soft)',
                          borderColor: selected ? 'var(--primary)' : 'var(--border)',
                        }}
                      >
                        <span className="text-sm font-medium">{reason}</span>
                      </motion.button>
                    )
                  })}
                </div>
                <div className="flex gap-3 border-t px-6 py-5" style={{ borderColor: 'var(--border)' }}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setShowRejectModal(false)
                      setSelectedReason('')
                    }}
                    className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: selectedReason ? 1.01 : 1 }}
                    whileTap={{ scale: selectedReason ? 0.99 : 1 }}
                    onClick={handleReject}
                    disabled={!selectedReason}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: 'var(--danger)' }}
                  >
                    Submit Rejection
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showConfirmModal && currentGroup && canConfirm && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl border"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="border-b px-6 py-5" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="tw-heading text-[24px] font-bold">
                    Confirm Match & Choose Golden Values
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Choose which source system should supply the canonical value for each
                    field.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                    {[
                      ['Company', currentCompanyTitle],
                      ['Group ID', currentGroup.id],
                      ['Confidence', `${Math.round(currentGroup.confidence * 100)}%`],
                      ['Records', String(currentGroup.records.length)],
                    ].map(([label, value]) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl border p-4"
                        style={{
                          background: 'var(--surface-soft)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div
                          className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {label}
                        </div>
                        <div className="mt-2 text-sm font-bold">{value}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      background: 'var(--surface-soft)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-bold">Golden Record Values</h4>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Leave unchanged to use defaults
                      </span>
                    </div>

                    <div className="space-y-6">
                      {DISPLAY_FIELDS.map((field) => {
                        const fieldValues = currentGroup.records
                          .map((record) => ({
                            source: getSourceLabel(record),
                            value: getRecordField(record, field).trim(),
                          }))
                          .filter((entry) => entry.value)

                        const uniqueValues = new Set(fieldValues.map((entry) => entry.value))
                        const hasConflict = uniqueValues.size > 1 && fieldValues.length > 1
                        const currentChoice =
                          goldenOverrides[field] ||
                          getDefaultSourceForField(currentGroup, field) ||
                          ''

                        if (!hasConflict && fieldValues.length === 0) return null

                        return (
                          <motion.div
                            key={field}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.18 }}
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-sm font-bold">
                                {getFieldLabel(field)}
                              </span>
                              <span
                                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                                style={{
                                  background: hasConflict
                                    ? 'var(--warning-soft)'
                                    : 'var(--success-soft)',
                                  color: hasConflict
                                    ? 'var(--warning)'
                                    : 'var(--success)',
                                }}
                              >
                                {hasConflict ? 'Conflict' : 'All match'}
                              </span>
                            </div>

                            {hasConflict ? (
                              <div className="grid gap-2 md:grid-cols-2">
                                {fieldValues.map(({ source, value }, index) => {
                                  const selected = currentChoice === source
                                  return (
                                    <motion.button
                                      key={`${field}-${source}-${index}`}
                                      type="button"
                                      whileHover={{ scale: 1.01 }}
                                      whileTap={{ scale: 0.99 }}
                                      onClick={() =>
                                        setGoldenOverrides((prev) => ({
                                          ...prev,
                                          [field]: source,
                                        }))
                                      }
                                      className="rounded-xl border p-4 text-left"
                                      style={{
                                        background: selected
                                          ? 'var(--primary-soft)'
                                          : 'var(--surface)',
                                        borderColor: selected
                                          ? 'var(--primary)'
                                          : 'var(--border)',
                                      }}
                                    >
                                      <div
                                        className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                                        style={{ color: 'var(--primary)' }}
                                      >
                                        {source}
                                      </div>
                                      <div className="mt-2 text-sm font-medium">{value}</div>
                                    </motion.button>
                                  )
                                })}
                              </div>
                            ) : (
                              <div
                                className="rounded-xl border px-4 py-3 text-sm"
                                style={{
                                  background: 'var(--success-soft)',
                                  borderColor: 'var(--success)',
                                }}
                              >
                                {fieldValues[0]?.value || '(empty)'}
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t px-6 py-5" style={{ borderColor: 'var(--border)' }}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setShowConfirmModal(false)
                      setGoldenOverrides({})
                    }}
                    className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleConfirm}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                    style={{ background: 'var(--success)' }}
                  >
                    <Check size={15} /> Confirm Match
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-8 right-8 z-[80] min-w-[280px] rounded-2xl border px-4 py-3 text-sm font-semibold"
              style={{
                background: 'var(--surface)',
                borderColor: toast.color,
                color: 'var(--text)',
                boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background:
                      toast.icon === 'success'
                        ? 'var(--success-soft)'
                        : 'var(--danger-soft)',
                    color:
                      toast.icon === 'success'
                        ? 'var(--success)'
                        : 'var(--danger)',
                  }}
                >
                  {toast.icon === 'success' ? <Check size={16} /> : <X size={16} />}
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-bold">
                    {toast.icon === 'success' ? 'Confirmed' : 'Rejected'}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {toast.msg}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ExplainableAIPanel
          isOpen={showExplainableAI}
          onClose={() => setShowExplainableAI(false)}
          matchData={currentGroup}
        />
      </div>
    </AppShell>
  )
}