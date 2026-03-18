'use client'
import { useState } from 'react'
import { Check, X, SkipForward, Clock } from 'lucide-react'
import { Card, Badge, Button, ConfidenceBar, Avatar } from '@/components/ui'
import { QUEUE_ITEMS, REVIEWERS, QueueItem } from '@/lib/data'

export default function ReviewPage() {
  const [items, setItems] = useState(QUEUE_ITEMS)
  const [selected, setSelected] = useState<QueueItem>(QUEUE_ITEMS[0])
  const [assignee, setAssignee] = useState(QUEUE_ITEMS[0].assignee)
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null)

  const pending = items.filter(i => i.status === 'pending')

  function showToast(msg: string, color: string) {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 2500)
  }

  function handleAction(action: 'confirmed' | 'rejected') {
    setItems(prev => prev.map(i => i.id === selected.id ? { ...i, status: action } : i))
    const next = pending.find(i => i.id !== selected.id)
    if (next) { setSelected(next); setAssignee(next.assignee) }
    showToast(
      action === 'confirmed' ? '✓ Match confirmed!' : '✕ Match rejected',
      action === 'confirmed' ? 'var(--green)' : 'var(--red-light)'
    )
  }

  function handleSkip() {
    const idx = pending.findIndex(i => i.id === selected.id)
    const next = pending[(idx + 1) % pending.length]
    setSelected(next); setAssignee(next.assignee)
    showToast('↷ Skipped to next', 'var(--text-muted)')
  }

  const statusColor = { confirmed:'var(--green)', rejected:'var(--red-light)', pending:'var(--amber)' }

  return (
    <div>
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="font-syne text-[26px] font-black tracking-tight">Review Queue</h1>
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>{pending.length} matches awaiting human decision</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="amber">⏳ {pending.length} Pending</Badge>
          <Badge variant="teal">↻ Auto-assigned</Badge>
        </div>
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-5 items-start">
        {/* Queue list */}
        <Card className="!p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color:'var(--text-muted)' }}>
            Pending Matches
          </div>
          <div className="flex flex-col gap-2">
            {items.map(item => (
              <button key={item.id} onClick={() => { setSelected(item); setAssignee(item.assignee) }}
                className={`w-full text-left px-4 py-3 rounded-2xl border transition-all duration-150 cursor-pointer ${
                  selected.id === item.id
                    ? 'border-[rgba(232,69,42,0.5)] bg-[rgba(232,69,42,0.08)]'
                    : item.status !== 'pending'
                    ? 'opacity-40 border-transparent bg-[var(--surface2)]'
                    : 'border-transparent bg-[var(--surface2)] hover:bg-[var(--surface3)]'
                }`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-syne text-[13px] font-bold">{item.id}</span>
                  <Badge variant={item.confidence >= 85 ? 'coral' : item.confidence >= 70 ? 'amber' : 'red'}
                    className="text-[10px]">{item.confidence}%</Badge>
                </div>
                <div className="text-[12px]" style={{ color:'var(--text-muted)' }}>
                  <span style={{ color:'var(--text-dim)' }}>{item.entityA}</span>
                  {' ↔ '}
                  <span style={{ color:'var(--text-dim)' }}>{item.entityB}</span>
                </div>
                {item.status !== 'pending' && (
                  <div className="mt-1.5">
                    <span className="text-[11px] font-semibold capitalize" style={{ color: statusColor[item.status] }}>
                      {item.status === 'confirmed' ? '✓' : '✕'} {item.status}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Comparison panel */}
        <div className="flex flex-col gap-4">
          {/* Confidence */}
          <Card>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-syne text-[16px] font-bold">{selected.id} — Entity Comparison</h2>
                <p className="text-[13px] mt-1" style={{ color:'var(--text-muted)' }}>AI confidence score</p>
              </div>
              <div className="flex items-center gap-2 text-[12px]" style={{ color:'var(--text-muted)' }}>
                <Clock size={13} /> Assigned to{' '}
                <span className="font-semibold" style={{ color:'var(--text-dim)' }}>{assignee}</span>
              </div>
            </div>
            <ConfidenceBar value={selected.confidence} />
          </Card>

          {/* Entity fields comparison */}
          <Card>
            <div className="grid grid-cols-[1fr_50px_1fr] gap-4 items-start">
              {/* Entity A */}
              <div className="rounded-2xl p-5" style={{ background:'var(--surface2)' }}>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color:'var(--text-muted)' }}>
                  🔵 Entity A
                </div>
                {selected.fields.map(f => (
                  <div key={f.label} className="mb-3">
                    <div className="text-[11px] mb-0.5" style={{ color:'var(--text-muted)' }}>{f.label}</div>
                    <div className="text-[14px] font-medium" style={{ color: f.match ? 'var(--teal-light)' : 'var(--text)' }}>
                      {f.valueA}
                    </div>
                  </div>
                ))}
              </div>

              {/* VS divider */}
              <div className="flex flex-col items-center justify-center pt-10 gap-2">
                <div className="w-px h-8" style={{ background:'var(--border2)' }} />
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-syne text-[12px] font-black"
                  style={{ background:'var(--surface3)', border:'2px solid var(--border2)', color:'var(--text-muted)' }}>VS</div>
                <div className="w-px h-8" style={{ background:'var(--border2)' }} />
              </div>

              {/* Entity B */}
              <div className="rounded-2xl p-5" style={{ background:'var(--surface2)' }}>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color:'var(--text-muted)' }}>
                  🟠 Entity B
                </div>
                {selected.fields.map(f => (
                  <div key={f.label} className="mb-3">
                    <div className="text-[11px] mb-0.5" style={{ color:'var(--text-muted)' }}>{f.label}</div>
                    <div className="text-[14px] font-medium" style={{ color: f.match ? 'var(--teal-light)' : 'var(--red-light)' }}>
                      {f.valueB}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field match legend */}
            <div className="flex gap-4 mt-4 pt-4" style={{ borderTop:'1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 text-[12px]" style={{ color:'var(--teal-light)' }}>
                <div className="w-2 h-2 rounded-full bg-[var(--teal-light)]" /> Fields match
              </div>
              <div className="flex items-center gap-1.5 text-[12px]" style={{ color:'var(--red-light)' }}>
                <div className="w-2 h-2 rounded-full bg-[var(--red-light)]" /> Fields differ
              </div>
            </div>
          </Card>

          {/* Action bar */}
          <Card className="!py-5">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-[12px] mb-2" style={{ color:'var(--text-muted)' }}>Assign reviewer</div>
                <select value={assignee} onChange={e => setAssignee(e.target.value)}
                  className="rounded-xl px-3 py-2 text-[13px] font-medium outline-none cursor-pointer"
                  style={{ background:'var(--surface3)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'DM Sans,sans-serif' }}>
                  {REVIEWERS.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2.5">
                <Button variant="ghost" onClick={handleSkip}>
                  <SkipForward size={14} /> Skip
                </Button>
                <Button variant="danger" onClick={() => handleAction('rejected')}>
                  <X size={14} /> Reject
                </Button>
                <Button variant="primary" onClick={() => handleAction('confirmed')}>
                  <Check size={14} /> Confirm Match
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast fixed bottom-8 right-8 px-5 py-3 rounded-xl text-white text-[14px] font-semibold z-50"
          style={{ background: toast.color, boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
