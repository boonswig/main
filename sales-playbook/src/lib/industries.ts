export interface Industry {
  id: string
  name: string
  description: string
  priority: boolean   // priority verticals — best product-market fit; focus first
}

export const INDUSTRIES = [
  // ── Priority verticals (focus first — best product-market fit) ──
  { id: 'healthcare',         name: 'Healthcare',          description: 'Providers, payers, health systems, life sciences', priority: true },
  { id: 'financial-services', name: 'Finance',             description: 'Banks, insurance, investment & financial services', priority: true },
  { id: 'construction',       name: 'Construction',        description: 'Contractors, builders, trades, AEC', priority: true },
  { id: 'government-federal', name: 'Government — Federal', description: 'Federal agencies and departments', priority: true },
  { id: 'government-local',   name: 'Government — Local',   description: 'State, county, and municipal government', priority: true },
  // ── Additional verticals ──
  { id: 'retail',             name: 'Retail / E-commerce', description: 'Online and physical retail', priority: false },
  { id: 'manufacturing',      name: 'Manufacturing',       description: 'Factories, supply chain, logistics', priority: false },
  { id: 'professional-services', name: 'Professional Services', description: 'Agencies, consultancies, law firms', priority: false },
  { id: 'technology',         name: 'Technology / SaaS',   description: 'Tech companies buying SaaS tools', priority: false },
] as const

export type IndustryId = typeof INDUSTRIES[number]['id']

export function getIndustry(id: string) {
  return INDUSTRIES.find((i) => i.id === id)
}

export function industryName(id: string) {
  return getIndustry(id)?.name ?? id
}

export function isPriorityIndustry(id: string): boolean {
  return getIndustry(id)?.priority ?? false
}

export const PRIORITY_INDUSTRIES = INDUSTRIES.filter((i) => i.priority)
export const OTHER_INDUSTRIES = INDUSTRIES.filter((i) => !i.priority)
