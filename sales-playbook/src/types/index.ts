export interface Question {
  id: string
  question: string
  purpose: string
  followUps: string[]
  keywords?: string[]
  industries?: string[]               // empty / absent = show for all industries
  industryTips?: Record<string, string> // industry-specific extra tip
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

export interface Playbook {
  stages: Stage[]
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
}

export type SearchResultType = 'question' | 'talking-point' | 'objection'

export interface SearchResult {
  stageId: string
  stageName: string
  stageColor: StageColor
  type: SearchResultType
  id: string
  title: string
  content: string
}
