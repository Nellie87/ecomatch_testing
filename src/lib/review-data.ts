import type { MatchCandidateGroup } from '@/types/hitl'

export const rejectionReasons = [
  'Different VAT / registration identity',
  'Different legal entity',
  'Address conflict too strong',
  'Phone / email mismatch',
  'Grouped by mistake',
  'Insufficient evidence',
]

export const REVIEWERS = [
  { id: 'r1', name: 'Helen Bender' },
  { id: 'r2', name: 'Marcus Voss' },
  { id: 'r3', name: 'Amina Noor' },
]

export const MATCH_GROUPS: MatchCandidateGroup[] = [
  {
    id: 'GRP-1001',
    confidence: 0.93,
    status: 'suggested',
    assignee: 'Helen Bender',
    reasons: [
      { text: 'Exact VAT match', score: 1, strength: 'strong' },
      { text: 'Business name highly similar', score: 0.91, strength: 'strong' },
      { text: 'Country matches', score: 0.7, strength: 'medium' },
      { text: 'Address formatting differs slightly', score: -0.2, strength: 'weak' },
    ],
    records: [
      {
        id: 'rec-1',
        source: 'registry',
        fields: {
          name: 'Trinidad Wiseman OÜ',
          vat: 'EE123456789',
          address: 'Harju maakond, Tallinn',
          country: 'Estonia',
          phone: '+372 600 1111',
          email: 'info@trinidadwiseman.ee',
        },
      },
      {
        id: 'rec-2',
        source: 'crm',
        fields: {
          name: 'Trinidad Wiseman OU',
          vat: 'EE123456789',
          address: 'Tallinn, Harju',
          country: 'Estonia',
          phone: '+372 600 1111',
          email: 'info@trinidadwiseman.ee',
        },
      },
      {
        id: 'rec-3',
        source: 'website',
        fields: {
          name: 'Trinidad Wiseman',
          vat: 'EE123456789',
          address: 'Tallinn',
          country: 'Estonia',
          email: 'info@trinidadwiseman.ee',
        },
      },
    ],
  },
  {
    id: 'GRP-1002',
    confidence: 0.71,
    status: 'suggested',
    assignee: 'Marcus Voss',
    reasons: [
      { text: 'Name similarity moderate', score: 0.55, strength: 'medium' },
      { text: 'Country matches', score: 0.4, strength: 'medium' },
      { text: 'Phone differs', score: -0.5, strength: 'strong' },
      { text: 'VAT missing in one source', score: -0.2, strength: 'weak' },
    ],
    records: [
      {
        id: 'rec-4',
        source: 'erp',
        fields: {
          name: 'Eco Match BV',
          vat: 'NL99887766B01',
          address: 'Rotterdam',
          country: 'Netherlands',
          phone: '+31 10 111 2222',
          email: 'ops@ecomatch.nl',
        },
      },
      {
        id: 'rec-5',
        source: 'crm',
        fields: {
          name: 'EcoMatch B.V.',
          vat: '',
          address: 'Rotterdam',
          country: 'Netherlands',
          phone: '+31 10 111 9999',
          email: 'hello@ecomatch.nl',
        },
      },
    ],
  },
]