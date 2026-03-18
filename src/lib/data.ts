// ── TYPES ─────────────────────────────────────────────
export type MatchStatus = 'confirmed' | 'rejected' | 'pending'
export type ReviewerStatus = 'online' | 'away' | 'offline'
export type Role = 'Admin' | 'Senior Reviewer' | 'Reviewer' | 'Trainee'

export interface QueueItem {
  id: string; entityA: string; entityB: string
  confidence: number; assignee: string; status: MatchStatus
  fields: { label: string; valueA: string; valueB: string; match: boolean }[]
}

export interface Reviewer {
  id: string; name: string; email: string; initials: string
  role: Role; status: ReviewerStatus; reviews: number
  accuracy: number; avgTime: number; avatarIndex: number; lastActive: string
}

export interface ActivityItem {
  id: string; type: 'confirm' | 'reject' | 'system' | 'user' | 'retrain' | 'alert'
  text: string; time: string
}

// ── MOCK DATA ──────────────────────────────────────────
export const QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'RQ-001', entityA: 'Acme Corp', entityB: 'ACME Corporation',
    confidence: 92, assignee: 'Liis Tamm', status: 'pending',
    fields: [
      { label: 'Name',            valueA: 'Acme Corp',     valueB: 'ACME Corporation', match: true  },
      { label: 'Reg. No.',        valueA: 'EE12345678',    valueB: 'EE12345678',        match: true  },
      { label: 'Country',         valueA: 'Estonia',       valueB: 'Estonia',           match: true  },
      { label: 'Industry',        valueA: 'Technology',    valueB: 'Tech & Software',   match: false },
      { label: 'Founded',         valueA: '2010',          valueB: '2010',              match: true  },
    ]
  },
  {
    id: 'RQ-002', entityA: 'John M. Smith', entityB: 'J. Michael Smith',
    confidence: 78, assignee: 'Mart Kaljurand', status: 'pending',
    fields: [
      { label: 'Name',    valueA: 'John M. Smith',  valueB: 'J. Michael Smith', match: false },
      { label: 'DOB',     valueA: '1985-03-12',     valueB: '1985-03-12',       match: true  },
      { label: 'Country', valueA: 'Estonia',        valueB: 'Estonia',          match: true  },
      { label: 'ID No.',  valueA: '38503124523',    valueB: '38503124523',      match: true  },
      { label: 'Email',   valueA: 'j.smith@co.ee',  valueB: 'john.smith@ee.co', match: false },
    ]
  },
  {
    id: 'RQ-003', entityA: 'TW Solutions Ltd', entityB: 'Trinidad Wiseman OÜ',
    confidence: 61, assignee: 'Anna Lepp', status: 'pending',
    fields: [
      { label: 'Name',    valueA: 'TW Solutions Ltd',   valueB: 'Trinidad Wiseman OÜ', match: false },
      { label: 'Reg. No.',valueA: 'EE87654321',         valueB: 'EE12987654',          match: false },
      { label: 'Country', valueA: 'UK',                 valueB: 'Estonia',             match: false },
      { label: 'Industry',valueA: 'Consulting',         valueB: 'IT Services',         match: false },
      { label: 'Founded', valueA: '2015',               valueB: '2004',                match: false },
    ]
  },
  {
    id: 'RQ-004', entityA: 'Maria Kask', entityB: 'M. Kask',
    confidence: 85, assignee: 'Liis Tamm', status: 'pending',
    fields: [
      { label: 'Name',    valueA: 'Maria Kask',      valueB: 'M. Kask',          match: false },
      { label: 'DOB',     valueA: '1990-07-22',      valueB: '1990-07-22',       match: true  },
      { label: 'Country', valueA: 'Estonia',         valueB: 'Estonia',          match: true  },
      { label: 'ID No.',  valueA: '49007224521',     valueB: '49007224521',      match: true  },
      { label: 'Phone',   valueA: '+372 5123 4567',  valueB: '+3725123 4567',    match: true  },
    ]
  },
  {
    id: 'RQ-005', entityA: 'Global Tech Inc', entityB: 'Global Technologies',
    confidence: 70, assignee: 'Karl Mägi', status: 'pending',
    fields: [
      { label: 'Name',    valueA: 'Global Tech Inc',    valueB: 'Global Technologies', match: false },
      { label: 'Reg. No.',valueA: 'US44332211',         valueB: 'US44332211',          match: true  },
      { label: 'Country', valueA: 'USA',                valueB: 'USA',                 match: true  },
      { label: 'Industry',valueA: 'Technology',         valueB: 'Technology',          match: true  },
      { label: 'Founded', valueA: '2001',               valueB: '1999',                match: false },
    ]
  },
]

export const REVIEWERS: Reviewer[] = [
  { id:'r1', name:'Liis Tamm',       email:'liis.tamm@twn.ee',  initials:'LT', role:'Senior Reviewer', status:'online',  reviews:124, accuracy:94, avgTime:1.8, avatarIndex:0, lastActive:'Just now'    },
  { id:'r2', name:'Mart Kaljurand',  email:'mart.k@twn.ee',     initials:'MK', role:'Reviewer',        status:'online',  reviews:98,  accuracy:88, avgTime:2.6, avatarIndex:2, lastActive:'3 min ago'   },
  { id:'r3', name:'Anna Lepp',       email:'anna.lepp@twn.ee',  initials:'AL', role:'Reviewer',        status:'away',    reviews:76,  accuracy:79, avgTime:3.1, avatarIndex:1, lastActive:'2 hrs ago'   },
  { id:'r4', name:'Karl Mägi',       email:'karl.m@twn.ee',     initials:'KM', role:'Trainee',         status:'offline', reviews:54,  accuracy:91, avgTime:2.2, avatarIndex:3, lastActive:'Yesterday'   },
]

export const ACTIVITY_LOG: ActivityItem[] = [
  { id:'a1', type:'confirm',  text:'<b>Liis Tamm</b> confirmed match <b>RQ-044</b> — Acme Corp ↔ ACME Corporation',                    time:'2 min ago'      },
  { id:'a2', type:'reject',   text:'<b>Mart Kaljurand</b> rejected match <b>RQ-043</b> — TW Solutions ↔ Wiseman OÜ',                   time:'11 min ago'     },
  { id:'a3', type:'system',   text:'<b>System</b> auto-confirmed 3 high-confidence matches above 95%',                                  time:'34 min ago'     },
  { id:'a4', type:'user',     text:'<b>Admin</b> added new user <b>Karl Mägi</b> with Trainee role',                                    time:'2 hours ago'    },
  { id:'a5', type:'retrain',  text:'<b>System</b> model retrained — precision improved from 85.1% to 87.4%',                           time:'Yesterday 16:42'},
  { id:'a6', type:'alert',    text:'<b>System</b> rejection rate hit 21% — model retraining alert triggered',                           time:'Yesterday 09:15'},
]

export const TREND_DATA = [
  { date:'Oct 27', precision:0.775, recall:0.750 },
  { date:'Oct 28', precision:0.793, recall:0.763 },
  { date:'Oct 29', precision:0.805, recall:0.775 },
  { date:'Oct 30', precision:0.818, recall:0.787 },
  { date:'Oct 31', precision:0.829, recall:0.798 },
  { date:'Nov 01', precision:0.840, recall:0.807 },
  { date:'Nov 02', precision:0.852, recall:0.815 },
  { date:'Nov 03', precision:0.862, recall:0.819 },
  { date:'Nov 04', precision:0.874, recall:0.825 },
]

export const ROLE_PERMISSIONS = [
  { role:'Admin',           desc:'Full system access',         perms:['Review','Analytics','Manage','Settings'] },
  { role:'Senior Reviewer', desc:'Review + analytics access',  perms:['Review','Analytics'] },
  { role:'Reviewer',        desc:'Review queue only',          perms:['Review'] },
  { role:'Trainee',         desc:'View-only, supervised',      perms:['View'] },
]
