'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { ExplainableAIPanel } from '@/components/review/ExplainableAIPanel'
import { MATCH_GROUPS, rejectionReasons, REVIEWERS } from '@/lib/review-data'
import type { MatchCandidateGroup, SourceRecord } from '@/types/hitl'
import {
  Check,
  X,
  SkipForward,
  Info,
  Scissors,
  Merge,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

const FIELDS = ['name', 'vat', 'address', 'country', 'phone', 'email'] as const

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
    <div className="relative h-[72px] w-[72px] shrink-0">
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="5"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>
          {pct}%
        </span>
        <span className="text-[9px] uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>
          conf.
        </span>
      </div>
    </div>
  )
}

function getFieldStatus(field: string, records: SourceRecord[]) {
  const values = records.map((record) => record.fields[field as keyof typeof record.fields] || '')
  const normalized = values.map((value) =>
    String(value).toLowerCase().replace(/[^a-z0-9]/g, '')
  )

  const nonEmpty = normalized.filter(Boolean)
  if (nonEmpty.length === 0) return 'empty'

  const allSame = nonEmpty.every((value) => value === nonEmpty[0])
  return allSame ? 'match' : 'partial'
}

function getDefaultSourceForField(group: MatchCandidateGroup, field: string): string | null {
  const valuesBySource: Record<string, string> = {}

  group.records.forEach((record) => {
    const value = record.fields[field as keyof typeof record.fields]
    if (value && String(value).trim()) {
      valuesBySource[record.source] = String(value)
    }
  })

  if (Object.keys(valuesBySource).length <= 1) return null

  const priorityOrder = ['registry', 'erp', 'crm', 'website', 'manual']
  for (const source of priorityOrder) {
    if (valuesBySource[source]) return source
  }

  return Object.keys(valuesBySource)[0] || null
}

export default function ReviewPage() {
  const [groups, setGroups] = useState<MatchCandidateGroup[]>(MATCH_GROUPS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showExplainableAI, setShowExplainableAI] = useState(false)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [showSplitModal, setShowSplitModal] = useState(false)

  const [selectedReason, setSelectedReason] = useState('')
  const [selectedRecordsToSplit, setSelectedRecordsToSplit] = useState<Set<string>>(new Set())
  const [goldenOverrides, setGoldenOverrides] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null)

  const suggestedCandidates = useMemo(
    () => groups.filter((group) => group.status === 'suggested'),
    [groups]
  )

  const currentGroup =
    suggestedCandidates.length > 0
      ? suggestedCandidates[currentIndex] || suggestedCandidates[0]
      : null

  const totalRecords = groups.length
  const reviewedCount = groups.filter((group) => group.status !== 'suggested').length
  const progress = totalRecords > 0 ? (reviewedCount / totalRecords) * 100 : 0

  const showToast = useCallback((msg: string, color: string) => {
    setToast({ msg, color })
    window.setTimeout(() => setToast(null), 2400)
  }, [])

  const handleNext = useCallback(() => {
    if (suggestedCandidates.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % suggestedCandidates.length)
    }
  }, [suggestedCandidates.length])

  useEffect(() => {
    if (currentIndex >= suggestedCandidates.length && suggestedCandidates.length > 0) {
      setCurrentIndex(0)
    }
  }, [suggestedCandidates.length, currentIndex])

  const handleReject = useCallback(() => {
    if (!currentGroup || !selectedReason) return

    setGroups((prev) =>
      prev.map((group) =>
        group.id === currentGroup.id
          ? { ...group, status: 'rejected' }
          : group
      )
    )

    setShowRejectModal(false)
    setSelectedReason('')
    showToast(`Group ${currentGroup.id} rejected`, 'var(--danger)')
  }, [currentGroup, selectedReason, showToast])

  const handleConfirm = useCallback(() => {
    if (!currentGroup) return

    setGroups((prev) =>
      prev.map((group) =>
        group.id === currentGroup.id
          ? {
              ...group,
              status: 'confirmed',
              goldenOverrides,
            }
          : group
      )
    )

    setShowConfirmModal(false)
    setGoldenOverrides({})
    showToast(`Group ${currentGroup.id} confirmed`, 'var(--success)')
  }, [currentGroup, goldenOverrides, showToast])

  const handleMerge = useCallback(() => {
    if (!currentGroup) return

    setGroups((prev) =>
      prev.map((group) =>
        group.id === currentGroup.id
          ? { ...group, status: 'merged' }
          : group
      )
    )

    setShowMergeModal(false)
    showToast(`Group ${currentGroup.id} merged`, 'var(--primary)')
  }, [currentGroup, showToast])

  const handleSplit = useCallback(() => {
    if (!currentGroup || selectedRecordsToSplit.size === 0) return

    setGroups((prev) =>
      prev.map((group) =>
        group.id === currentGroup.id
          ? { ...group, status: 'split' }
          : group
      )
    )

    setShowSplitModal(false)
    setSelectedRecordsToSplit(new Set())
    showToast(`Group ${currentGroup.id} split`, 'var(--warning)')
  }, [currentGroup, selectedRecordsToSplit, showToast])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      const isTyping =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (e.target as HTMLElement)?.isContentEditable

      if (isTyping) return
      if (
        showRejectModal ||
        showConfirmModal ||
        showMergeModal ||
        showSplitModal
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'c':
          e.preventDefault()
          if (currentGroup) setShowConfirmModal(true)
          break
        case 'x':
          e.preventDefault()
          if (currentGroup) setShowRejectModal(true)
          break
        case 'm':
          e.preventDefault()
          if (currentGroup) setShowMergeModal(true)
          break
        case 'd':
          e.preventDefault()
          if (currentGroup) setShowSplitModal(true)
          break
        case 'n':
        case 's':
          e.preventDefault()
          handleNext()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    currentGroup,
    handleNext,
    showConfirmModal,
    showMergeModal,
    showRejectModal,
    showSplitModal,
  ])

  return (
    <AppShell>
      <div className="tw-page">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="tw-heading text-[34px] font-bold leading-none md:text-[42px]">
                Entity Review
              </h1>
              <p
                className="mt-3 max-w-3xl text-sm md:text-[15px]"
                style={{ color: 'var(--text-muted)' }}
              >
                Review candidate groups, inspect explainability, and decide whether to confirm, reject, merge, or split.
              </p>
            </div>

            {currentGroup ? (
              <div className="flex items-center gap-4 rounded-2xl border px-4 py-3"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}>
                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>
                    Current group
                  </div>
                  <div className="text-sm font-bold">{currentGroup.id}</div>
                </div>
                <ConfidenceRing value={currentGroup.confidence} />
              </div>
            ) : null}
          </div>

          <PageCard className="p-5 md:p-6">
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold">Review Progress</div>
                <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {reviewedCount} of {totalRecords} reviewed — {Math.round(progress)}% complete
                </div>
              </div>

              {currentGroup ? (
                <span
                  className="inline-flex rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                  }}
                >
                  Confidence: {Math.round(currentGroup.confidence * 100)}%
                </span>
              ) : null}
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface-soft)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: 'var(--primary)',
                }}
              />
            </div>

            {currentGroup?.reasons?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {currentGroup.reasons.slice(0, 4).map((reason, idx) => (
                  <span
                    key={`${reason.text}-${idx}`}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      background:
                        reason.score > 0 ? 'var(--success-soft)' : 'var(--danger-soft)',
                      color:
                        reason.score > 0 ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {reason.text}
                  </span>
                ))}
              </div>
            ) : null}
          </PageCard>

          {!currentGroup ? (
            <PageCard className="p-12 text-center">
              <div className="text-4xl">✓</div>
              <h2 className="tw-heading mt-4 text-[28px] font-bold">
                All matches reviewed
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                No suggested groups remain in the queue.
              </p>
            </PageCard>
          ) : (
            <>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${currentGroup.records.length}, minmax(0, 1fr))`,
                }}
              >
                {currentGroup.records.map((record, idx) => {
                  const isPrimary = record.source === 'registry'

                  return (
                    <div
                      key={`${record.source}-${idx}`}
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
                          background: isPrimary ? 'var(--primary-soft)' : 'var(--surface-soft)',
                          borderBottom: `1px solid var(--border)`,
                        }}
                      >
                        <span
                          className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase"
                          style={{
                            background: isPrimary ? 'var(--primary)' : 'var(--info-soft)',
                            color: isPrimary ? '#fff' : 'var(--primary)',
                          }}
                        >
                          {record.source}
                        </span>

                        {isPrimary ? (
                          <span
                            className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                            style={{
                              background: 'var(--surface)',
                              color: 'var(--primary)',
                              border: `1px solid var(--primary)`,
                            }}
                          >
                            Primary
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-3 p-5">
                        {FIELDS.map((field) => {
                          const value = record.fields[field] || ''
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
                                  {field}
                                </span>
                              </div>

                              <div
                                className="text-[13px] font-medium"
                                style={{
                                  color: value ? 'var(--text)' : 'var(--text-muted)',
                                  fontStyle: value ? 'normal' : 'italic',
                                }}
                              >
                                {value || '(not provided)'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-wrap gap-5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: 'var(--success)' }} />
                  Fields match
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: 'var(--warning)' }} />
                  Conflict detected
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: 'var(--border)' }} />
                  No data
                </div>
              </div>

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <button
                  type="button"
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
                </button>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                    style={{ background: 'var(--success)' }}
                  >
                    <Check size={15} />
                    Confirm
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                    style={{ background: 'var(--danger)' }}
                  >
                    <X size={15} />
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMergeModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--primary)',
                      color: 'var(--primary)',
                    }}
                  >
                    <Merge size={15} />
                    Merge
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSplitModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--warning)',
                      color: 'var(--warning)',
                    }}
                  >
                    <Scissors size={15} />
                    Split
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                    style={{
                      background: 'var(--surface-soft)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    <SkipForward size={15} />
                    Skip
                  </button>
                </div>
              </div>

              <PageCard className="p-4">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {[
                    ['C', 'Confirm'],
                    ['X', 'Reject'],
                    ['M', 'Merge'],
                    ['D', 'Split'],
                    ['N', 'Next'],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <kbd
                        className="rounded-md border px-2 py-1 text-xs font-bold"
                        style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--text)',
                        }}
                      >
                        {key}
                      </kbd>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </PageCard>
            </>
          )}
        </div>

        {/* Reject modal */}
        {showRejectModal && currentGroup ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
            <div
              className="w-full max-w-[520px] rounded-2xl border"
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
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className="w-full rounded-xl border px-4 py-3 text-left"
                      style={{
                        background: selected ? 'var(--primary-soft)' : 'var(--surface-soft)',
                        borderColor: selected ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      <span className="text-sm font-medium">{reason}</span>
                    </button>
                  )
                })}
              </div>

              <div
                className="flex gap-3 border-t px-6 py-5"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  type="button"
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
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  disabled={!selectedReason}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'var(--danger)' }}
                >
                  Submit Rejection
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Confirm modal */}
        {showConfirmModal && currentGroup ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
            <div
              className="flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl border"
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
                  Optionally choose which source should supply the canonical value for each field.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    ['Group ID', currentGroup.id],
                    ['Confidence', `${Math.round(currentGroup.confidence * 100)}%`],
                    ['Records', String(currentGroup.records.length)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border p-4"
                      style={{
                        background: 'var(--surface-soft)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>
                        {label}
                      </div>
                      <div className="mt-2 text-sm font-bold">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border p-5" style={{ background: 'var(--surface-soft)', borderColor: 'var(--border)' }}>
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-bold">Golden Record Values</h4>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Leave unchanged to use defaults
                    </span>
                  </div>

                  <div className="space-y-6">
                    {FIELDS.map((field) => {
                      const fieldValues = currentGroup.records
                        .map((record) => ({
                          source: record.source,
                          value: (record.fields[field] || '').toString().trim(),
                        }))
                        .filter((entry) => entry.value)

                      const uniqueValues = new Set(fieldValues.map((entry) => entry.value))
                      const hasConflict = uniqueValues.size > 1 && fieldValues.length > 1
                      const currentChoice =
                        goldenOverrides[field] || getDefaultSourceForField(currentGroup, field) || ''

                      if (!hasConflict && fieldValues.length === 0) return null

                      return (
                        <div key={field}>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm font-bold capitalize">{field}</span>
                            <span
                              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
                              style={{
                                background: hasConflict ? 'var(--warning-soft)' : 'var(--success-soft)',
                                color: hasConflict ? 'var(--warning)' : 'var(--success)',
                              }}
                            >
                              {hasConflict ? 'Conflict' : 'All match'}
                            </span>
                          </div>

                          {hasConflict ? (
                            <div className="grid gap-2 md:grid-cols-2">
                              {fieldValues.map(({ source, value }) => {
                                const selected = currentChoice === source

                                return (
                                  <button
                                    key={`${field}-${source}`}
                                    type="button"
                                    onClick={() =>
                                      setGoldenOverrides((prev) => ({
                                        ...prev,
                                        [field]: source,
                                      }))
                                    }
                                    className="rounded-xl border p-4 text-left"
                                    style={{
                                      background: selected ? 'var(--primary-soft)' : 'var(--surface)',
                                      borderColor: selected ? 'var(--primary)' : 'var(--border)',
                                    }}
                                  >
                                    <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--primary)' }}>
                                      {source}
                                    </div>
                                    <div className="mt-2 text-sm font-medium">{value}</div>
                                  </button>
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
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div
                className="flex justify-end gap-3 border-t px-6 py-5"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  type="button"
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
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                  style={{ background: 'var(--success)' }}
                >
                  <Check size={15} />
                  Confirm Match
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Merge modal */}
        {showMergeModal && currentGroup ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
            <div
              className="w-full max-w-[520px] rounded-2xl border p-6"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <h3 className="tw-heading text-[24px] font-bold">Merge Records</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
                Merge the records in <strong>{currentGroup.id}</strong> into one resolved entity.
              </p>

              <div className="mt-5 rounded-xl border p-4" style={{ background: 'var(--surface-soft)', borderColor: 'var(--border)' }}>
                <div className="text-sm font-semibold">Sources</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentGroup.records.map((record) => (
                    <span
                      key={record.id}
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: 'var(--primary-soft)',
                        color: 'var(--primary)',
                      }}
                    >
                      {record.source}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMergeModal(false)}
                  className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleMerge}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  Confirm Merge
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Split modal */}
        {showSplitModal && currentGroup ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
            <div
              className="flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="border-b px-6 py-5" style={{ borderColor: 'var(--border)' }}>
                <h3 className="tw-heading text-[24px] font-bold">Split Match</h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Select which records should be separated into their own entities.
                </p>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-6">
                {currentGroup.records.map((record, idx) => {
                  const recordId = `${record.source}-${idx}`
                  const checked = selectedRecordsToSplit.has(recordId)

                  return (
                    <button
                      key={recordId}
                      type="button"
                      onClick={() => {
                        setSelectedRecordsToSplit((prev) => {
                          const next = new Set(prev)
                          if (next.has(recordId)) next.delete(recordId)
                          else next.add(recordId)
                          return next
                        })
                      }}
                      className="flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left"
                      style={{
                        background: checked ? 'var(--primary-soft)' : 'var(--surface-soft)',
                        borderColor: checked ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      <div
                        className="mt-0.5 h-4 w-4 rounded-sm border"
                        style={{
                          background: checked ? 'var(--primary)' : 'transparent',
                          borderColor: checked ? 'var(--primary)' : 'var(--text-muted)',
                        }}
                      />
                      <div>
                        <div className="text-sm font-bold">
                          {record.source}: {record.fields.name || 'Unknown'}
                        </div>
                        <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {record.fields.vat || 'N/A'} · {record.fields.country || 'N/A'}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div
                className="flex gap-3 border-t px-6 py-5"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowSplitModal(false)
                    setSelectedRecordsToSplit(new Set())
                  }}
                  className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={selectedRecordsToSplit.size === 0}
                  onClick={handleSplit}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'var(--warning)' }}
                >
                  Split Selected ({selectedRecordsToSplit.size})
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {toast ? (
          <div
            className="fixed bottom-8 right-8 z-[80] rounded-xl px-5 py-3 text-[14px] font-semibold text-white"
            style={{
              background: toast.color,
              boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
            }}
          >
            {toast.msg}
          </div>
        ) : null}

        <ExplainableAIPanel
          isOpen={showExplainableAI}
          onClose={() => setShowExplainableAI(false)}
          matchData={currentGroup}
        />
      </div>
    </AppShell>
  )
}