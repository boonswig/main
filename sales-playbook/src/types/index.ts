export interface AnswerChip {
  id: string
  label: string
  pitchBullet: string
  sayThis?: string
  deepDive?: {
    howItWorks: string
    additionalProtections: string[]
    proofPoint?: string
  }
}

export interface Question {
  id: string
  question: string
  purpose: string
  followUps: string[]
  keywords?: string[]
  industries?: string[]
  industryTips?: Record<string, string>
  answerChips?: AnswerChip[]
}

export interface TalkingPoint {
  id: string
  title: string
  content: string
  tips: string[]
  keywords?: string[]
  industries?: string[]
  industryTips?: Record<string, string>
}

export interface Objection {
  id: string
  objection: string
  response: string
  tips: string[]
  keywords?: string[]
  industries?: string[]
  industryTips?: Record<string, string>
}

export type StageColor = 'blue' | 'purple' | 'green' | 'orange' | 'teal' | 'red' | 'pink' | 'indigo'

export interface Stage {
  id: string
  name: string
  order: number
  description: string
  color: StageColor
  icon: string
  questions: Question[]
  talkingPoints: TalkingPoint[]
  objections: Objection[]
}

export interface OpenerStyle {
  id: string
  label: string
  tag: string
  tagColorKey: 'blue' | 'amber' | 'slate' | 'green' | 'purple' | 'red' | 'orange' | 'teal'
  opener: string   // template: {{name}}, {{company}}
  agenda: string
  bridge: string   // template: {{company}}
}

export interface OpenerRule {
  id: string
  titleKeywords: string[]  // any keyword match against contactTitle (case-insensitive)
  industries: string[]     // any match against industry id
  styleId: string
  priority: number         // higher wins; default = 0
}

export interface IndustryTalkingPoint {
  id: string
  title: string
  content: string
  tips?: string[]
}

export interface IndustryNote {
  id: string
  industry: string              // matches INDUSTRIES id
  label: string                 // display name
  talkingPoints: IndustryTalkingPoint[]
}

export interface CloseRecommendation {
  id: string
  chipIds: string[]        // any tagged chip from this list triggers this rec
  nextStep: string         // value from NEXT_STEP_OPTIONS
  askThis: string          // suggested language for the rep
  rationale: string        // brief explanation shown in the card
}

export interface Playbook {
  stages: Stage[]
  closeRecommendations?: CloseRecommendation[]
  openerRules?: OpenerRule[]
  openerStyles?: OpenerStyle[]
  industryNotes?: IndustryNote[]
  useCaseQuestions?: UseCaseQuestion[]
  pitchCards?: RepPitchCard[]
  resourceLinks?: ResourceLink[]
}

export const USE_CASES = [
  { id: 'contractors',   label: 'Contractor Access',         emoji: '👷' },
  { id: 'byod',         label: 'BYOD / Personal Devices',   emoji: '📱' },
  { id: 'data-exfil',   label: 'Data Protection',           emoji: '🛡️' },
  { id: 'gen-ai',       label: 'Gen AI Oversight',          emoji: '🤖' },
  { id: 'web-filtering', label: 'Web Filtering',            emoji: '🌐' },
  { id: 'citrix-vdi',   label: 'Citrix / VDI Replacement', emoji: '🖥️' },
] as const

export type UseCaseId = typeof USE_CASES[number]['id']

export interface UseCaseQuestion {
  id: string
  question: string
  rationale: string
  listenFor: string[]
  followUp?: string
  useCases: string[]
  industries?: string[]
}

export interface RepPitchCard {
  id: string
  useCases: string[]
  title: string
  pitch: string
  keyPoints: string[]
  product: 'cep' | 'cameyo' | 'both'
  industries?: string[]
}

export interface ResourceLink {
  id: string
  title: string
  description: string
  url: string
  type: 'internal' | 'customer-facing'
  useCases?: string[]
  industries?: string[]
}

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: 'admin' | 'rep'
}

export interface UsersData {
  users: User[]
}

// Pre-call context — stored in localStorage
export interface PreCallContext {
  repName: string
  companyName: string
  industry: string
  companySize: string
  leadSource: string
  currentSolution: string
  knownPainPoints: string
  contactName: string
  contactTitle: string
  bdrNotes: string
  timestamp: string
  // BANT checklist
  hasBudget: string
  hasAuthority: string
  hasNeed: string
  hasTimeline: string
}

export type SearchResultType = 'question' | 'talking-point' | 'objection' | 'resource'

export interface SearchResult {
  stageId: string
  stageName: string
  stageColor: StageColor
  type: SearchResultType
  id: string
  title: string
  content: string
  url?: string
}

// ── Call records (saved to Firestore) ──────────────────────────

export type CallIntent = 'highintent' | 'exploratory' | 'notafit' | 'timing'

export const INTENT_CONFIG: Record<CallIntent, { label: string; tag: string; color: string; bg: string; icon: string }> = {
  highintent:  { label: 'High Intent',   tag: '#highintent',  color: 'text-emerald-700', bg: 'bg-emerald-100', icon: '🔥' },
  exploratory: { label: 'Exploratory',   tag: '#exploratory', color: 'text-blue-700',    bg: 'bg-blue-100',    icon: '🔍' },
  timing:      { label: 'Not Right Time',tag: '#timing',      color: 'text-amber-700',   bg: 'bg-amber-100',   icon: '⏰' },
  notafit:     { label: 'Not a Fit',     tag: '#notafit',     color: 'text-red-700',     bg: 'bg-red-100',     icon: '✗' },
}

export const NEXT_STEP_OPTIONS = [
  'Follow-up email',
  'Send proposal / quote',
  'Product demo scheduled',
  'Discovery call scheduled',
  'Nurture sequence',
  'Technical review / POC',
  'Contract sent',
  'No next step agreed',
] as const

export interface CallRecord {
  id?: string
  createdAt: string
  repName: string
  companyName: string
  industry: string
  contactName: string
  contactTitle: string
  companySize: string
  leadSource: string
  currentSolution: string
  knownPainPoints: string
  notes: string
  intent: CallIntent
  nextStep: string
  nextStepNotes: string
  signals?: string[]     // tagged discovery chip labels
  toolRating?: number    // 1–5 rep feedback on playbook usefulness
}
