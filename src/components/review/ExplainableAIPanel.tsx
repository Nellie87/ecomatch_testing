'use client'

import type { MatchCandidateGroup } from '@/types/hitl'
import { X } from 'lucide-react'

export function ExplainableAIPanel({
  isOpen,
  onClose,
  matchData,
}: {
  isOpen: boolean
  onClose: () => void
  matchData: MatchCandidateGroup | null
}) {
  if (!isOpen || !matchData) return null

  return (
    <div className="fixed inset-0 z-[70] flex">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <aside
        className="ml-auto h-full w-full max-w-[420px] border-l p-6"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="tw-heading text-[24px] font-bold">Why this match?</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Explainability signals for {matchData.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border p-2"
            style={{
              background: 'var(--surface-soft)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {matchData.reasons.map((reason, idx) => {
            const tone =
              reason.score > 0
                ? {
                    bg: 'var(--success-soft)',
                    border: 'var(--success)',
                    text: 'var(--success)',
                  }
                : {
                    bg: 'var(--danger-soft)',
                    border: 'var(--danger)',
                    text: 'var(--danger)',
                  }

            return (
              <div
                key={`${reason.text}-${idx}`}
                className="rounded-2xl border p-4"
                style={{
                  background: tone.bg,
                  borderColor: tone.border,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {reason.text}
                  </p>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase"
                    style={{
                      background: 'var(--surface)',
                      color: tone.text,
                      border: `1px solid ${tone.border}`,
                    }}
                  >
                    {reason.strength}
                  </span>
                </div>

                <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Score: {reason.score.toFixed(2)}
                </p>
              </div>
            )
          })}
        </div>
      </aside>
    </div>
  )
}