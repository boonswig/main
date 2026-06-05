'use client'

import { useState } from 'react'
import { CloseRecommendation, Question } from '@/types'

interface CloseOption {
  id: string
  emoji: string
  title: string
  timing: string
  suggested: string
  nextStep: string
}

const OPTIONS: CloseOption[] = [
  {
    id: 'demo',
    emoji: '🖥️',
    title: 'Book a demo',
    timing: 'High intent — clear use case',
    suggested: "Let's get a proper demo in the calendar — I'll show exactly the use cases we talked about, with your IT team in the room. What's the best time this week or next?",
    nextStep: 'Product demo scheduled',
  },
  {
    id: 'stakeholder-call',
    emoji: '👥',
    title: 'Bring in the team',
    timing: 'More buy-in needed',
    suggested: "Let's get [IT / CISO / procurement] on a call together — I'll send a brief ahead of time so everyone's up to speed before we meet. Who else needs to be in the room?",
    nextStep: 'Discovery call scheduled',
  },
  {
    id: 'pilot',
    emoji: '🚀',
    title: 'Propose a pilot',
    timing: 'Good fit — needs validation',
    suggested: "How about a 30-day, 10-seat pilot — low risk, clear success criteria agreed upfront. You evaluate it with IT; we support the whole way. What would make it a yes at day 30?",
    nextStep: 'Technical review / POC',
  },
  {
    id: 'send-resources',
    emoji: '📩',
    title: 'Send resources',
    timing: 'Timing not right — keep warm',
    suggested: "No problem — let me send a product overview, a TCO comparison vs your current setup, and a case study from a similar company. You'll have everything ready when the timing's right.",
    nextStep: 'Nurture sequence',
  },
]

function findBestRec(
  recs: CloseRecommendation[],
  taggedAnswers: Record<string, string[]>,
) {
  const allTagged = new Set(Object.values(taggedAnswers).flat())
  const scored = recs
    .map((rec) => ({ rec, matchCount: rec.chipIds.filter((id) => allTagged.has(id)).length }))
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
  return scored[0] ?? null
}

interface Props {
  closeRecommendations?: CloseRecommendation[]
  taggedAnswers: Record<string, string[]>
  questions: Question[]
  selected: string
  onSelect: (nextStep: string) => void
  onEndCall: () => void
}

export default function CloseStage({
  closeRecommendations = [],
  taggedAnswers,
  questions,
  selected,
  onSelect,
  onEndCall,
}: Props) {
  const [frameworkDismissed, setFrameworkDismissed] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const best = closeRecommendations.length > 0
    ? findBestRec(closeRecommendations, taggedAnswers)
    : null

  // Always surface ONE recommended option — AI pick if chips matched, otherwise demo
  const recommendedNextStep = best?.rec.nextStep ?? 'Product demo scheduled'

  const allTagged = new Set(Object.values(taggedAnswers).flat())
  const matchedLabels = best
    ? questions
        .flatMap((q) => q.answerChips ?? [])
        .filter((c) => best.rec.chipIds.includes(c.id) && allTagged.has(c.id))
        .map((c) => c.label)
        .slice(0, 3)
    : []

  // Put recommended option first in the grid
  const sortedOptions = [...OPTIONS].sort((a, b) => {
    if (a.nextStep === recommendedNextStep) return -1
    if (b.nextStep === recommendedNextStep) return 1
    return 0
  })

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const selectedOption = OPTIONS.find((o) => o.nextStep === selected)

  return (
    <div className="mx-6 mt-4 space-y-4">

      {/* ── Last 5 minutes guide ─────────────────────────────── */}
      {!frameworkDismissed && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm">⏱</span>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Last 5 minutes — close strong</p>
            </div>
            <button
              onClick={() => setFrameworkDismissed(true)}
              className="text-amber-400 hover:text-amber-600 transition p-0.5 flex-shrink-0"
              title="Dismiss"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-3">
            {[
              { n: '1', label: 'Summarize', detail: 'Reflect back the 1–2 things that resonated most' },
              { n: '2', label: 'Express fit', detail: 'State your confidence in the match' },
              { n: '3', label: 'Ask clearly', detail: 'Request one specific next step — then stop talking' },
            ].map(({ n, label, detail }) => (
              <div key={n} className="flex-1 flex items-start gap-1.5">
                <span className="text-xs font-bold text-amber-500 flex-shrink-0 mt-0.5">{n}.</span>
                <div>
                  <p className="text-xs font-semibold text-amber-800">{label}</p>
                  <p className="text-xs text-amber-600 leading-snug mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Admin-configured words to say (if chip-matched rec exists) ── */}
      {best && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Suggested words</span>
              {matchedLabels.map((label) => (
                <span key={label} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{label}</span>
              ))}
            </div>
            <button
              onClick={() => copyText(best.rec.askThis, 'rec')}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition flex-shrink-0 ${
                copiedId === 'rec'
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {copiedId === 'rec' ? (
                <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied</>
              ) : (
                <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
              )}
            </button>
          </div>
          <div className="px-4 pb-2">
            <p className="text-xs text-emerald-600 mb-1.5">{best.rec.rationale}</p>
          </div>
          <div className="mx-4 mb-3 bg-white border border-emerald-200 rounded-lg px-4 py-3">
            <p className="text-sm text-slate-900 leading-relaxed">&ldquo;{best.rec.askThis}&rdquo;</p>
          </div>
        </div>
      )}

      {/* ── Next step picker ─────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">Agree a next step</p>
        <div className="grid grid-cols-2 gap-2.5">
          {sortedOptions.map((opt) => {
            const isSelected    = selected === opt.nextStep
            const isRecommended = opt.nextStep === recommendedNextStep && !isSelected
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(isSelected ? '' : opt.nextStep)}
                className={`text-left p-3.5 rounded-xl border-2 transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : isRecommended
                    ? 'border-emerald-400 bg-emerald-50 hover:border-emerald-500'
                    : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{opt.emoji}</span>
                    <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-blue-800' : isRecommended ? 'text-emerald-800' : 'text-slate-800'}`}>
                      {opt.title}
                    </span>
                  </div>
                  {isSelected ? (
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isRecommended ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      Suggested
                    </span>
                  ) : null}
                </div>
                <p className={`text-xs ${isSelected ? 'text-blue-500' : isRecommended ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {opt.timing}
                </p>
              </button>
            )
          })}
        </div>

        {/* Words to say — expands when an option is selected */}
        {selectedOption && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-2 gap-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Say this</p>
              <button
                onClick={() => copyText(selectedOption.suggested, `opt-${selectedOption.id}`)}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition flex-shrink-0 ${
                  copiedId === `opt-${selectedOption.id}`
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                }`}
              >
                {copiedId === `opt-${selectedOption.id}` ? (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-blue-900 leading-relaxed">&ldquo;{selectedOption.suggested}&rdquo;</p>
          </div>
        )}
      </div>

      {/* ── "Ready to wrap" CTA ──────────────────────────────── */}
      {selected && (
        <div className="bg-slate-900 rounded-xl px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Next step agreed</p>
            <p className="text-sm font-semibold text-white truncate">{selected}</p>
          </div>
          <button
            onClick={onEndCall}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Log call
          </button>
        </div>
      )}
    </div>
  )
}
