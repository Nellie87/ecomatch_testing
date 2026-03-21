export type MatchStatus =
  | 'suggested'
  | 'confirmed'
  | 'rejected'
  | 'merged'
  | 'split'

export type MatchReasonStrength = 'strong' | 'medium' | 'weak'

export type MatchReason = {
  text: string
  score: number
  strength: MatchReasonStrength
}

export type SourceName =
  | 'registry'
  | 'crm'
  | 'erp'
  | 'website'
  | 'manual'

export type SourceRecord = {
  id: string
  source: SourceName
  fields: {
    name?: string
    vat?: string
    address?: string
    country?: string
    phone?: string
    email?: string
  }
}

export type MatchCandidateGroup = {
  id: string
  confidence: number
  status: MatchStatus
  assignee?: string
  reasons: MatchReason[]
  records: SourceRecord[]
  goldenOverrides?: Record<string, string>
}