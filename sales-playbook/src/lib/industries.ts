export const INDUSTRIES = [
  { id: 'financial-services', name: 'Financial Services', description: 'Banks, insurance, investment firms' },
  { id: 'retail',             name: 'Retail / E-commerce', description: 'Online and physical retail' },
  { id: 'manufacturing',      name: 'Manufacturing',       description: 'Factories, supply chain, logistics' },
  { id: 'professional-services', name: 'Professional Services', description: 'Agencies, consultancies, law firms' },
  { id: 'technology',         name: 'Technology / SaaS',   description: 'Tech companies buying SaaS tools' },
  { id: 'healthcare',         name: 'Healthcare',          description: 'Providers, payers, health systems, life sciences' },
] as const

export type IndustryId = typeof INDUSTRIES[number]['id']

export function getIndustry(id: string) {
  return INDUSTRIES.find((i) => i.id === id)
}

export function industryName(id: string) {
  return getIndustry(id)?.name ?? id
}
