'use client'
import Link from 'next/link'
import { Activity, CheckCircle, XCircle, Clock, ArrowUpRight } from 'lucide-react'
import { Card, StatCard } from '@/components/ui'
import { TREND_DATA, QUEUE_ITEMS } from '@/lib/data'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const PIE_DATA = [
  { name: 'Confirmed', value: 71, color: '#1AA39A' },
  { name: 'Rejected',  value: 18, color: '#E8452A' },
  { name: 'Pending',   value: 11, color: '#F0A500' },
]

export default function AdminPage() {
  const pending = QUEUE_ITEMS.filter(q => q.status === 'pending').length

  return (
    <div>
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="font-syne text-[26px] font-black tracking-tight">Admin Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>High-level overview of system performance and reviewer activity</p>
        </div>
        <Link href="/review">
          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg,var(--coral),var(--coral-dark))', boxShadow:'0 4px 14px rgba(232,69,42,0.35)' }}>
            Review Queue <ArrowUpRight size={15} />
          </span>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <StatCard title="Total Reviewed" value={45} sub="of 200 records" delay="delay-1"
          gradient="linear-gradient(135deg,#1A2B4A,#0F1C32)" shadow="0 8px 30px rgba(15,28,50,0.6)"
          icon={<Activity size={21} color="white" />} />
        <StatCard title="Confirmed Matches" value={32} badge="71%" delay="delay-2"
          gradient="linear-gradient(135deg,#1AA39A,#0e7a74)" shadow="0 8px 30px rgba(26,163,154,0.35)"
          icon={<CheckCircle size={21} color="white" />} />
        <StatCard title="Rejected Matches" value={8} badge="18%" delay="delay-3"
          gradient="linear-gradient(135deg,#E8452A,#C73520)" shadow="0 8px 30px rgba(232,69,42,0.35)"
          icon={<XCircle size={21} color="white" />} />
        <StatCard title="Needs Review" value={pending} sub="awaiting decision" delay="delay-4"
          gradient="linear-gradient(135deg,#F0A500,#c47f00)" shadow="0 8px 30px rgba(240,165,0,0.35)"
          icon={<Clock size={21} color="white" />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-[1fr_380px] gap-5">
        {/* Line chart */}
        <Card>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-syne text-[16px] font-bold">Model Performance Trends</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Precision &amp; Recall over time</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background:'rgba(26,163,154,0.15)', color:'var(--teal-light)', border:'1px solid rgba(26,163,154,0.3)' }}>
              ↗ Improving
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={TREND_DATA} margin={{ top:5, right:10, left:-20, bottom:5 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill:'#8A9BBB', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0.7,1.0]} tick={{ fill:'#8A9BBB', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(2)} />
              <Tooltip contentStyle={{ background:'#1A2B4A', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, color:'#fff', fontSize:12 }}
                labelStyle={{ color:'#8A9BBB' }} />
              <Line type="monotone" dataKey="precision" stroke="var(--coral)" strokeWidth={2.5} dot={{ fill:'var(--coral)', r:4, strokeWidth:2, stroke:'#0F1C32' }} name="Precision" />
              <Line type="monotone" dataKey="recall"    stroke="var(--teal-light)" strokeWidth={2.5} dot={{ fill:'var(--teal-light)', r:4, strokeWidth:2, stroke:'#0F1C32' }} name="Recall" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-2">
            {[['var(--coral)','Precision'],['var(--teal-light)','Recall']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-2 text-[13px]" style={{ color:'var(--text-dim)' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                {l}
              </div>
            ))}
          </div>
        </Card>

        {/* Donut chart */}
        <Card>
          <h2 className="font-syne text-[16px] font-bold mb-1">Status Distribution</h2>
          <p className="text-sm mb-5" style={{ color:'var(--text-muted)' }}>Breakdown of all reviews</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background:'#1A2B4A', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2.5 mt-2">
            {PIE_DATA.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background:'var(--surface2)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-[13px] font-medium" style={{ color:'var(--text-dim)' }}>{name}</span>
                </div>
                <span className="font-syne text-[14px] font-bold" style={{ color }}>{value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
