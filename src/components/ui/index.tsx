import { clsx } from 'clsx'

// ── BADGE ──────────────────────────────────────────────
type BadgeVariant = 'coral' | 'teal' | 'amber' | 'green' | 'red' | 'purple' | 'gray'
export function Badge({ children, variant = 'gray', className = '' }:
  { children: React.ReactNode; variant?: BadgeVariant; className?: string }) {
  const styles: Record<BadgeVariant, string> = {
    coral:  'bg-[rgba(232,69,42,0.15)]  text-[#FF6347] border border-[rgba(232,69,42,0.3)]',
    teal:   'bg-[rgba(26,163,154,0.15)] text-[#22C4BA] border border-[rgba(26,163,154,0.3)]',
    green:  'bg-[rgba(24,164,116,0.15)] text-[#1DC98D] border border-[rgba(24,164,116,0.3)]',
    amber:  'bg-[rgba(240,165,0,0.15)]  text-[#F0A500] border border-[rgba(240,165,0,0.3)]',
    red:    'bg-[rgba(217,48,37,0.15)]  text-[#E8523A] border border-[rgba(217,48,37,0.3)]',
    purple: 'bg-[rgba(139,108,247,0.15)]text-[#8B6CF7] border border-[rgba(139,108,247,0.3)]',
    gray:   'bg-white/8 text-[#8A9BBB]  border border-white/12',
  }
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold', styles[variant], className)}>
      {children}
    </span>
  )
}

// ── BUTTON ─────────────────────────────────────────────
type BtnVariant = 'primary' | 'ghost' | 'danger' | 'success' | 'outline'
export function Button({ children, variant = 'ghost', onClick, className = '', disabled = false }:
  { children: React.ReactNode; variant?: BtnVariant; onClick?: () => void; className?: string; disabled?: boolean }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer border-0 font-sans disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = 'px-4 py-2.5 text-[13px]'
  const variants: Record<BtnVariant, string> = {
    primary: 'text-white hover:brightness-110 active:scale-95',
    ghost:   'bg-white/8 text-[#C8D3E5] border border-white/14 hover:bg-white/14 hover:text-white',
    danger:  'bg-[rgba(217,48,37,0.12)] text-[#E8523A] border border-[rgba(217,48,37,0.3)] hover:bg-[rgba(217,48,37,0.22)]',
    success: 'bg-[rgba(24,164,116,0.12)] text-[#1DC98D] border border-[rgba(24,164,116,0.3)] hover:bg-[rgba(24,164,116,0.22)]',
    outline: 'bg-transparent text-[#22C4BA] border border-[rgba(26,163,154,0.4)] hover:bg-[rgba(26,163,154,0.1)]',
  }
  const primaryStyle = variant === 'primary'
    ? { background: 'linear-gradient(135deg, var(--coral), var(--coral-dark))', boxShadow: '0 4px 14px rgba(232,69,42,0.35)' }
    : {}
  return (
    <button onClick={onClick} disabled={disabled} style={primaryStyle}
      className={clsx(base, sizes, variants[variant], className)}>
      {children}
    </button>
  )
}

// ── CARD ───────────────────────────────────────────────
export function Card({ children, className = '', hover = false }:
  { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={clsx(
      'rounded-3xl border p-6',
      hover && 'card-hover cursor-pointer',
      className
    )}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
      {children}
    </div>
  )
}

// ── TOGGLE ─────────────────────────────────────────────
export function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 border-0 cursor-pointer"
      style={on
        ? { background: 'linear-gradient(135deg, var(--coral), var(--coral-dark))' }
        : { background: 'var(--surface3)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-md transition-all duration-200 ${on ? 'left-[22px]' : 'left-[3px]'}`} />
    </button>
  )
}

// ── STAT CARD ──────────────────────────────────────────
interface StatCardProps {
  title: string; value: string | number; sub?: string
  gradient: string; shadow: string; icon: React.ReactNode; badge?: string
  delay?: string
}
export function StatCard({ title, value, sub, gradient, shadow, icon, badge, delay = '' }: StatCardProps) {
  return (
    <div className={`relative rounded-3xl p-7 overflow-hidden card-hover animate-fade-up ${delay}`}
      style={{ background: gradient, boxShadow: shadow }}>
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-5 right-5 w-20 h-20 rounded-full bg-white/4 pointer-events-none" />
      {badge && (
        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-white text-xs font-semibold"
          style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(10px)' }}>
          {badge}
        </div>
      )}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(255,255,255,0.18)' }}>
        {icon}
      </div>
      <div className="font-syne text-5xl font-black text-white leading-none mb-2 tracking-tight">{value}</div>
      <div className="text-sm font-medium text-white/85 mb-1">{title}</div>
      {sub && <div className="text-xs text-white/60">{sub}</div>}
    </div>
  )
}

// ── SECTION TITLE ──────────────────────────────────────
export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="font-syne text-[15px] font-bold text-white">{children}</h2>
      {action}
    </div>
  )
}

// ── AVATAR ─────────────────────────────────────────────
const AVATAR_COLORS = [
  'linear-gradient(135deg,#E8452A,#C73520)',
  'linear-gradient(135deg,#1AA39A,#0e7a74)',
  'linear-gradient(135deg,#8B6CF7,#6d48f5)',
  'linear-gradient(135deg,#F0A500,#c47f00)',
  'linear-gradient(135deg,#18A474,#0e7a56)',
]
export function Avatar({ initials, index = 0, size = 32 }: { initials: string; index?: number; size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length], width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  )
}

// ── CONFIDENCE BAR ─────────────────────────────────────
export function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 85
    ? 'linear-gradient(90deg, var(--coral-dark), var(--coral))'
    : value >= 70
    ? 'linear-gradient(90deg, #c47f00, var(--amber))'
    : 'linear-gradient(90deg, #a02010, var(--red-light))'
  const textColor = value >= 85 ? 'var(--coral-light)' : value >= 70 ? 'var(--amber)' : 'var(--red-light)'
  const label = value >= 85 ? 'High Confidence' : value >= 70 ? 'Medium Confidence' : 'Low Confidence'

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-[#8A9BBB]">Match confidence</span>
        <span className="text-sm font-bold" style={{ color: textColor }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface3)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }} />
      </div>
      <div className="mt-2">
        <Badge variant={value >= 85 ? 'coral' : value >= 70 ? 'amber' : 'red'}>{label}</Badge>
      </div>
    </div>
  )
}
