'use client'

import { Question } from '@/types'

interface Props {
  taggedAnswers: Record<string, string[]>
  questions: Question[]
  onNavigateToPitch: () => void
}

function getTransitionLine(taggedAnswers: Record<string, string[]>, questions: Question[]): string {
  const allLabels = questions.flatMap((q) =>
    (taggedAnswers[q.id] ?? []).map(
      (chipId) => q.answerChips?.find((c) => c.id === chipId)?.label ?? chipId
    )
  ).filter(Boolean)

  if (allLabels.length === 0) return ''

  const hasCameyo = (taggedAnswers['d-q-legacy-apps'] ?? []).length > 0
  const hasCep = questions.some(
    (q) => q.id !== 'd-q-legacy-apps' && (taggedAnswers[q.id] ?? []).length > 0
  )

  const preview = allLabels.slice(0, 3).join(', ')

  if (hasCameyo && hasCep) {
    return `That's really useful context. Based on what you've shared — ${preview} — there's a clear case for Chrome Enterprise Premium and Cameyo working together to address your environment. Want me to walk you through how they fit together specifically?`
  }
  if (hasCameyo) {
    return `That's really useful — your application landscape is the priority here. Let me show you how Cameyo addresses exactly what you've described — specifically ${preview}. Does that sound useful?`
  }
  return `This gives me a clear picture of where things stand. Based on what you've shared — ${preview} — let me show you how Chrome Enterprise Premium addresses these specifically. The good news is these are exactly the gaps it was built to fill.`
}

export default function DiscoveryTransition({ taggedAnswers, questions, onNavigateToPitch }: Props) {
  const totalTagged = questions.reduce(
    (acc, q) => acc + (taggedAnswers[q.id] ?? []).length,
    0
  )
  const transitionLine = getTransitionLine(taggedAnswers, questions)

  if (totalTagged === 0) {
    return (
      <div className="mx-6 mt-6 mb-2 rounded-xl border border-dashed border-slate-200 px-5 py-4 text-center">
        <p className="text-sm text-slate-400">
          Tag what you hear using the chips above — the pitch will tailor itself to their specific gaps.
        </p>
        <button
          onClick={onNavigateToPitch}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-sm text-slate-500 hover:bg-slate-200 transition"
        >
          Move to Pitch
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="mx-6 mt-6 mb-2 rounded-xl border border-emerald-200 bg-emerald-50 overflow-hidden">
      <div className="px-5 py-3 flex items-center justify-between border-b border-emerald-200">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-emerald-800">
            {totalTagged} challenge{totalTagged !== 1 ? 's' : ''} identified
          </span>
        </div>
        <button
          onClick={onNavigateToPitch}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
        >
          Move to Pitch
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="px-5 py-3">
        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">Suggested transition</p>
        <p className="text-sm text-emerald-900 leading-relaxed italic">&ldquo;{transitionLine}&rdquo;</p>
      </div>
    </div>
  )
}
