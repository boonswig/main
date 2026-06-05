'use client'

interface CloseOption {
  id: string
  emoji: string
  title: string
  timing: string
  suggested: string
  details?: string[]
  nextStep: string
}

const OPTIONS: CloseOption[] = [
  {
    id: 'demo',
    emoji: '🖥️',
    title: 'Book a demo',
    timing: 'High intent — clear use case',
    suggested: '"Let\'s get a proper demo in the calendar — I\'ll show exactly the use cases we talked about, with your IT team in the room. What\'s the best time this week or next?"',
    nextStep: 'Product demo scheduled',
  },
  {
    id: 'pilot',
    emoji: '🚀',
    title: 'Propose a 30-day pilot',
    timing: 'Good fit — needs internal validation',
    suggested: '"How about a 30-day, 10-seat pilot — low risk, clear success criteria agreed upfront. You evaluate it with IT; we support the whole way. What would make it a yes at day 30?"',
    nextStep: 'Technical review / POC',
  },
  {
    id: 'stakeholder-call',
    emoji: '👥',
    title: 'Multi-stakeholder call',
    timing: 'More stakeholders needed before proceeding',
    suggested: '"Let\'s get [IT / CISO / procurement] on a call together — I\'ll send a brief ahead of time so everyone\'s up to speed before we meet. Who else needs to be in the room?"',
    nextStep: 'Discovery call scheduled',
  },
  {
    id: 'send-resources',
    emoji: '📩',
    title: 'Send resources',
    timing: 'Timing not right — keep the door open',
    suggested: '"No problem — let me send a product overview, a TCO comparison vs your current setup, and a case study from a similar company. You\'ll have everything ready when the timing\'s right."',
    details: [
      'Product overview + datasheet',
      'TCO calculator vs Citrix / VDI',
      'Customer case study (industry-matched)',
      'Pilot proposal template',
    ],
    nextStep: 'Nurture sequence',
  },
]

interface Props {
  selected: string | null
  onSelect: (nextStep: string) => void
}

export default function CloseOptions({ selected, onSelect }: Props) {
  return (
    <div className="mx-6 mt-4">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Agree a next step with the customer</p>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.nextStep
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(isSelected ? '' : opt.nextStep)}
              className={`text-left p-4 rounded-xl border-2 transition ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{opt.emoji}</span>
                  <span className={`text-sm font-bold ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>
                    {opt.title}
                  </span>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <p className={`text-xs mb-2 font-medium ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                {opt.timing}
              </p>
              <p className={`text-xs leading-relaxed italic ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                {opt.suggested}
              </p>
              {opt.details && (
                <ul className="mt-2 space-y-0.5">
                  {opt.details.map((item, i) => (
                    <li key={i} className={`text-xs flex items-center gap-1.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                      <span className="opacity-60">·</span> {item}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          )
        })}
      </div>
      {selected && (
        <p className="text-xs text-slate-500 mt-2 text-center">
          Selected next step will pre-fill the End Call form
        </p>
      )}
    </div>
  )
}
