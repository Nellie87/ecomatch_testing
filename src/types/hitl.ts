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
  | 'sanctions'

export type SourceRecord = {
  id: string

  // new structure
  source_system: SourceName
  source_id: string
  entity_type: string
  name?: string
  observed_at?: string
  raw_payload_json?: unknown
  record_subtype?: string
  record_family?: string
  anchor_name?: string
  client_name?: string
  client_name_primary?: string
  country?: string
  address?: string
  sector?: string
  reg_no?: string
  field_values?: Record<string, unknown>

  // backward compatibility
  source?: SourceName
  fields?: {
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