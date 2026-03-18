'use client'
import { Download, Share2, FileText } from 'lucide-react'
import { Card, Badge, Avatar, SectionTitle } from '@/components/ui'
import { TREND_DATA, REVIEWERS } from '@/lib/data'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

const CONFUSION = { tp: 142, fp: 12, fn: 18, tn: 28 }
const precision = (CONFUSION.tp / (CONFUSION.tp + CONFUSION.fp) * 100).toFixed(1)
const recall    = (CONFUSION.tp / (CONFUSION.tp + CONFUSION.fn) * 100).toFixed(1)
const f1        = (2 * CONFUSION.tp / (2 * CONFUSION.tp + CONFUSION.fp + CONFUSION.fn) * 100).toFixed(1)
const accuracy  = ((CONFUSION.tp + CONFUSION.tn) / Object.values(CONFUSION).reduce((a,b)=>a+b,0) * 100).toFixed(1)

function PerfBar({ pct, warn }: { pct: number; warn?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 rounded-full overflow-hidden w-20" style={{ background:'var(--surface3)' }}>
        <div className="h-full rounded-full" style={{
          width: `${pct}%`,
          background: warn ? 'linear-gradient(90deg,#c47f00,#F0A500)' : 'linear-gradient(90deg,var(--coral-dark),var(--coral))'
        }} />
      </div>
      <span className="text-[12px] font-semibold" style={{ color: warn ? 'var(--amber)' : 'var(--coral-light)' }}>{pct}%</span>
    </div>
  )
}

function MatrixCell({ value, label, variant }: { value: number; label: string; variant: 'tp'|'fp'|'fn'|'tn' }) {
  const styles = {
    tp: { bg:'rgba(26,163,154,0.18)', border:'rgba(26,163,154,0.3)',  color:'var(--teal-light)' },
    fp: { bg:'rgba(232,69,42,0.13)',  border:'rgba(232,69,42,0.25)',  color:'var(--coral-light)' },
    fn: { bg:'rgba(240,165,0,0.13)',  border:'rgba(240,165,0,0.25)',  color:'var(--amber)' },
    tn: { bg:'rgba(26,163,154,0.08)', border:'rgba(26,163,154,0.18)', color:'var(--teal-light)' },
  }
  const s = styles[variant]
  return (
    <div className="rounded-xl p-4 text-center" style={{ background:s.bg, border:`1px solid ${s.border}` }}>
      <div className="font-syne text-[26px] font-black" style={{ color:s.color }}>{value}</div>
      <div className="text-[11px] mt-1" style={{ color:'var(--text-muted)' }}>{label}</div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div>
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="font-syne text-[26px] font-black tracking-tight">Analytics</h1>
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>Model performance and reviewer insights</p>
        </div>
        <div className="flex gap-2">
          {[
            { icon:<FileText size={13}/>, label:'Export CSV' },
            { icon:<Download size={13}/>, label:'Export PDF' },
            { icon:<Share2 size={13}/>,   label:'Share Report' },
          ].map(({ icon, label }) => (
            <button key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] transition-all hover:bg-[var(--surface3)] hover:text-white"
              style={{ background:'var(--surface2)', border:'1px solid var(--border2)', color:'var(--text-dim)', fontFamily:'DM Sans,sans-serif', cursor:'pointer' }}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        {[
          { label:'Overall Precision', value:'87.4%', color:'var(--coral)',      trend:'↑ +2.1% this week', up:true  },
          { label:'Overall Recall',    value:'81.9%', color:'var(--teal-light)', trend:'↑ +1.3% this week', up:true  },
          { label:'Avg Review Time',   value:'2.4 min',color:'var(--amber)',     trend:'↓ −0.3 min vs last week', up:false },
        ].map(({ label, value, color, trend, up }) => (
          <Card key={label} className="animate-fade-up">
            <div className="text-[12px] font-medium mb-2" style={{ color:'var(--text-muted)' }}>{label}</div>
            <div className="font-syne text-[32px] font-black tracking-tight leading-none" style={{ color }}>{value}</div>
            <div className={`inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full text-[12px] font-semibold ${
              up ? 'bg-[rgba(26,163,154,0.15)] text-[var(--teal-light)]' : 'bg-[rgba(232,69,42,0.12)] text-[var(--coral-light)]'
            }`}>{trend}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Reviewer table */}
        <Card>
          <SectionTitle>Reviewer Performance</SectionTitle>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Reviewer','Reviewed','Accuracy','Avg Time','Status'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wider pb-3 px-3"
                    style={{ color:'var(--text-muted)', borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REVIEWERS.map((r, i) => (
                <tr key={r.id}>
                  {[
                    <td key="name" className="px-3 py-3.5" style={{ borderBottom:'1px solid var(--border)' }}>
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={r.initials} index={r.avatarIndex} size={30} />
                        <span className="text-[13px] font-medium text-white">{r.name}</span>
                      </div>
                    </td>,
                    <td key="rev" className="px-3 py-3.5 text-[13px]" style={{ color:'var(--text-dim)', borderBottom:'1px solid var(--border)' }}>{r.reviews}</td>,
                    <td key="acc" className="px-3 py-3.5" style={{ borderBottom:'1px solid var(--border)' }}>
                      <PerfBar pct={r.accuracy} warn={r.accuracy < 85} />
                    </td>,
                    <td key="time" className="px-3 py-3.5 text-[13px]" style={{ color:'var(--text-dim)', borderBottom:'1px solid var(--border)' }}>{r.avgTime} min</td>,
                    <td key="status" className="px-3 py-3.5" style={{ borderBottom: i < REVIEWERS.length-1 ? '1px solid var(--border)' : 'none' }}>
                      <Badge variant={r.status==='online'?'teal':r.status==='away'?'amber':'gray'} className="capitalize">{r.status}</Badge>
                    </td>,
                  ]}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Confusion matrix */}
        <Card>
          <SectionTitle>
            Confusion Matrix
            <span className="text-[12px] font-normal" style={{ color:'var(--text-muted)' }}>Last 200 records</span>
          </SectionTitle>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
            <div />
            <div className="text-center text-[11px] font-semibold uppercase tracking-wider py-2" style={{ color:'var(--text-muted)' }}>Predicted +</div>
            <div className="text-center text-[11px] font-semibold uppercase tracking-wider py-2" style={{ color:'var(--text-muted)' }}>Predicted −</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color:'var(--text-muted)', writingMode:'horizontal-tb' }}>Actual +</div>
            <MatrixCell value={CONFUSION.tp} label="True Positive"  variant="tp" />
            <MatrixCell value={CONFUSION.fn} label="False Negative" variant="fn" />
            <div className="text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color:'var(--text-muted)' }}>Actual −</div>
            <MatrixCell value={CONFUSION.fp} label="False Positive" variant="fp" />
            <MatrixCell value={CONFUSION.tn} label="True Negative"  variant="tn" />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-5 pt-4" style={{ borderTop:'1px solid var(--border)' }}>
            {[
              { label:'Precision', value:`${precision}%`, color:'var(--coral)' },
              { label:'Recall',    value:`${recall}%`,    color:'var(--teal-light)' },
              { label:'F1 Score',  value:`${f1}%`,        color:'var(--amber)' },
              { label:'Accuracy',  value:`${accuracy}%`,  color:'var(--coral)' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="text-[11px] mb-1" style={{ color:'var(--text-muted)' }}>{label}</div>
                <div className="font-syne text-[20px] font-black" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Model accuracy full width */}
      <Card>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-syne text-[16px] font-bold">Model Accuracy Over Time</h2>
            <p className="text-[13px] mt-1" style={{ color:'var(--text-muted)' }}>Precision & Recall — 9 day trend</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background:'rgba(232,69,42,0.15)', color:'var(--coral-light)', border:'1px solid rgba(232,69,42,0.3)' }}>
            ↗ Trending up
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={TREND_DATA} margin={{ top:5, right:10, left:-20, bottom:5 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill:'#8A9BBB', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0.7,1.0]} tick={{ fill:'#8A9BBB', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(2)} />
            <Tooltip contentStyle={{ background:'#1A2B4A', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, color:'#fff', fontSize:12 }} />
            <Line type="monotone" dataKey="precision" stroke="var(--coral)"      strokeWidth={2.5} dot={{ fill:'var(--coral)',      r:4, strokeWidth:2, stroke:'#0F1C32' }} name="Precision" />
            <Line type="monotone" dataKey="recall"    stroke="var(--teal-light)" strokeWidth={2.5} dot={{ fill:'var(--teal-light)', r:4, strokeWidth:2, stroke:'#0F1C32' }} name="Recall" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-5 mt-2">
          {[['var(--coral)','Precision'],['var(--teal-light)','Recall']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-2 text-[13px]" style={{ color:'var(--text-dim)' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background:c }} />
              {l}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
