export interface Question {
  id: string
  question: string
  purpose: string
  followUps: string[]
}

export interface TalkingPoint {
  id: string
  title: string
  content: string
  tips: string[]
}

export interface Objection {
  id: string
  objection: string
  response: string
  tips: string[]
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

// Search result types
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
