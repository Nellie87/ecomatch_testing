'use client'
import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Card, Badge, Button, Toggle, Avatar, SectionTitle } from '@/components/ui'
import { REVIEWERS, ROLE_PERMISSIONS, ACTIVITY_LOG, type Reviewer } from '@/lib/data'

const ACTIVITY_ICONS: Record<string, { icon: string; bg: string }> = {
  confirm: { icon:'✓', bg:'rgba(26,163,154,0.15)' },
  reject:  { icon:'✕', bg:'rgba(232,69,42,0.15)'  },
  system:  { icon:'⚙', bg:'rgba(139,108,247,0.15)' },
  user:    { icon:'👤', bg:'rgba(240,165,0,0.15)'  },
  retrain: { icon:'↑', bg:'rgba(26,163,154,0.15)'  },
  alert:   { icon:'⚠', bg:'rgba(232,69,42,0.15)'  },
}

const ROLE_BADGE: Record<string, 'coral'|'teal'|'amber'|'purple'|'gray'> = {
  'Admin':           'coral',
  'Senior Reviewer': 'purple',
  'Reviewer':        'teal',
  'Trainee':         'amber',
}

const STATUS_INFO = {
  online:  { dot:'bg-[var(--teal-light)] shadow-[0_0_6px_rgba(34,196,186,0.5)]', label:'Online',  color:'var(--teal-light)' },
  away:    { dot:'bg-[var(--amber)]',  label:'Away',   color:'var(--amber)'      },
  offline: { dot:'bg-[#8A9BBB]',       label:'Offline', color:'var(--text-muted)' },
}

const SETTINGS_DEFAULT = [
  { key:'autoAssign',    name:'Auto-assign reviews',       desc:'Distribute queue evenly to online reviewers',    on:true  },
  { key:'aiScreen',      name:'AI pre-screening',          desc:'Auto-confirm matches above 95% confidence',      on:true  },
  { key:'emailNotif',    name:'Email notifications',       desc:'Notify reviewers on new queue items',            on:false },
  { key:'retrainAlerts', name:'Model retraining alerts',   desc:'Alert admin when rejection rate exceeds 20%',    on:true  },
  { key:'auditLog',      name:'Audit logging',             desc:'Log all reviewer decisions for compliance',      on:true  },
]

export default function ManagementPage() {
  const [reviewers, setReviewers] = useState<Reviewer[]>(REVIEWERS)
  const [settings, setSettings] = useState(SETTINGS_DEFAULT)

  function toggleSetting(key: string) {
    setSettings(s => s.map(x => x.key === key ? { ...x, on: !x.on } : x))
  }

  function removeReviewer(id: string) {
    setReviewers(r => r.filter(x => x.id !== id))
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="font-syne text-[26px] font-black tracking-tight">Management</h1>
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>Users, roles, system settings and activity log</p>
        </div>
        <Button variant="primary"><Plus size={14} /> Add User</Button>
      </div>

      <div className="grid grid-cols-2 gap-5">

        {/* User list — full width */}
        <Card className="col-span-2">
          <SectionTitle>
            Reviewer List
            <Badge variant="teal" className="text-[11px] font-medium">{reviewers.length} users</Badge>
          </SectionTitle>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['User','Role','Status','Reviews','Last Active','Actions'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wider pb-3 px-4"
                    style={{ color:'var(--text-muted)', borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviewers.map((r, i) => {
                const si = STATUS_INFO[r.status]
                return (
                  <tr key={r.id} className="transition-colors hover:bg-white/2">
                    <td className="px-4 py-4" style={{ borderBottom: i < reviewers.length-1 ? '1px solid var(--border)' : 'none' }}>
                      <div className="flex items-center gap-3">
                        <Avatar initials={r.initials} index={r.avatarIndex} size={34} />
                        <div>
                          <div className="text-[13px] font-semibold text-white">{r.name}</div>
                          <div className="text-[11px]" style={{ color:'var(--text-muted)' }}>{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4" style={{ borderBottom: i < reviewers.length-1 ? '1px solid var(--border)' : 'none' }}>
                      <Badge variant={ROLE_BADGE[r.role]}>{r.role}</Badge>
                    </td>
                    <td className="px-4 py-4" style={{ borderBottom: i < reviewers.length-1 ? '1px solid var(--border)' : 'none' }}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${si.dot}`} />
                        <span className="text-[13px]" style={{ color:si.color }}>{si.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px]" style={{ color:'var(--text-dim)', borderBottom: i < reviewers.length-1 ? '1px solid var(--border)' : 'none' }}>{r.reviews}</td>
                    <td className="px-4 py-4 text-[13px]" style={{ color:'var(--text-muted)', borderBottom: i < reviewers.length-1 ? '1px solid var(--border)' : 'none' }}>{r.lastActive}</td>
                    <td className="px-4 py-4" style={{ borderBottom: i < reviewers.length-1 ? '1px solid var(--border)' : 'none' }}>
                      <div className="flex gap-2">
                        <Button variant="ghost" className="!px-3 !py-1.5 !text-[12px]">
                          <Edit2 size={12} /> Edit
                        </Button>
                        <Button variant="danger" className="!px-3 !py-1.5 !text-[12px]" onClick={() => removeReviewer(r.id)}>
                          <Trash2 size={12} /> Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>

        {/* Role Permissions */}
        <Card>
          <SectionTitle>Role Permissions</SectionTitle>
          <div className="flex flex-col gap-3">
            {ROLE_PERMISSIONS.map(({ role, desc, perms }) => (
              <div key={role} className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
                style={{ background:'var(--surface2)', border:'1px solid var(--border)' }}>
                <div>
                  <div className="text-[14px] font-semibold text-white">{role}</div>
                  <div className="text-[12px] mt-0.5" style={{ color:'var(--text-muted)' }}>{desc}</div>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end max-w-[200px]">
                  {['Review','Analytics','Manage','Settings'].map(p => (
                    <Badge key={p} variant={perms.includes(p) ? 'teal' : 'gray'}>{p}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System Settings */}
        <Card>
          <SectionTitle>System Settings</SectionTitle>
          <div className="flex flex-col">
            {settings.map(({ key, name, desc, on }, i) => (
              <div key={key} className="flex items-center justify-between py-4"
                style={{ borderBottom: i < settings.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div className="text-[14px] font-medium text-white">{name}</div>
                  <div className="text-[12px] mt-0.5" style={{ color:'var(--text-muted)' }}>{desc}</div>
                </div>
                <Toggle on={on} onChange={() => toggleSetting(key)} />
              </div>
            ))}
          </div>
        </Card>

        {/* Activity Log — full width */}
        <Card className="col-span-2">
          <SectionTitle>Activity Log</SectionTitle>
          <div className="flex flex-col">
            {ACTIVITY_LOG.map(({ id, type, text, time }, i) => {
              const ai = ACTIVITY_ICONS[type]
              return (
                <div key={id} className="flex items-start gap-4 py-4"
                  style={{ borderBottom: i < ACTIVITY_LOG.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[15px]"
                    style={{ background: ai.bg }}>
                    {ai.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] leading-relaxed" style={{ color:'var(--text-dim)' }}
                      dangerouslySetInnerHTML={{ __html: text.replace(/<b>/g,'<strong style="color:#fff;font-weight:600">').replace(/<\/b>/g,'</strong>') }} />
                    <div className="text-[11px] mt-1" style={{ color:'var(--text-muted)' }}>{time}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

      </div>
    </div>
  )
}
