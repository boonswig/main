'use client'

import { Question } from '@/types'

interface Props {
  taggedAnswers: Record<string, string[]>
  questions: Question[]
  onNavigateToClose: () => void
}

function getTrialClose(taggedAnswers: Record<string, string[]>, questions: Question[]): string {
  const hasCameyo = (taggedAnswers['d-q-legacy-apps'] ?? []).length > 0
  const hasCep = questions.some(
    (q) => q.id !== 'd-q-legacy-apps' && (taggedAnswers[q.id] ?? []).length > 0
  )

  if (hasCameyo && hasCep) {
    return 'So if one platform could secure the browser layer and modernise your application delivery — deployed in weeks, not months — would you agree those are problems worth solving this year?'
  }
  if (hasCameyo) {
    return "And if your team could access those Windows applications in a Chrome tab — no Citrix, no servers to maintain — that would remove the infrastructure dependency you described, right?"
  }
  if (hasCep) {
    return "So if you could enforce browser-level security and DLP controls across every user — including contractors and personal devices — without replacing your existing stack, that would address the gaps you described?"
  }
  return "Based on what we've covered — does Chrome Enterprise Premium address the challenges you're facing in a way that makes sense for your organisation?"
}

export default function PitchTransition({ taggedAnswers, questions, onNavigateToClose }: Props) {
  const trialClose = getTrialClose(taggedAnswers, questions)

  return (
    <div className="mx-6 mt-6 mb-2 rounded-xl border border-violet-200 bg-violet-50 overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-violet-200">
        <p className="text-xs font-bold text-violet-700 uppercase tracking-wide mb-0.5">Get their buy-in before closing</p>
        <p className="text-xs text-violet-500">Work through these three steps to confirm the pitch landed.</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Step 1: Confirm it landed */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-200 text-violet-700 text-xs font-bold flex items-center justify-center">1</span>
            <p className="text-xs font-semibold text-violet-800">Confirm the pitch landed</p>
          </div>
          <div className="ml-7 rounded-lg bg-white border border-violet-100 px-3 py-2.5">
            <p className="text-sm text-slate-700 italic leading-relaxed">
              &ldquo;Before we move on — does any of what we covered resonate with where things stand for you today?&rdquo;
            </p>
          </div>
          <p className="ml-7 mt-1.5 text-xs text-violet-500">Let them talk. Any response is useful — silence means ask a follow-up.</p>
        </div>

        {/* Step 2: Trial close */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-200 text-violet-700 text-xs font-bold flex items-center justify-center">2</span>
            <p className="text-xs font-semibold text-violet-800">Get them to own the gap</p>
          </div>
          <div className="ml-7 rounded-lg bg-white border border-violet-100 px-3 py-2.5">
            <p className="text-sm text-slate-700 italic leading-relaxed">
              &ldquo;{trialClose}&rdquo;
            </p>
          </div>
          <p className="ml-7 mt-1.5 text-xs text-violet-500">You&rsquo;re looking for a yes. If you get a hesitation, that&rsquo;s an objection — go to the Objections stage.</p>
        </div>

        {/* Step 3: Bridge to close */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-200 text-violet-700 text-xs font-bold flex items-center justify-center">3</span>
            <p className="text-xs font-semibold text-violet-800">Bridge to next steps</p>
          </div>
          <div className="ml-7 rounded-lg bg-white border border-violet-100 px-3 py-2.5">
            <p className="text-sm text-slate-700 italic leading-relaxed">
              &ldquo;Good. So the question isn&rsquo;t whether this makes sense for you — it&rsquo;s just what the right first step looks like for your team. Let me show you the options.&rdquo;
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4 flex items-center justify-between">
        <p className="text-xs text-violet-400 italic">If they raise concerns now — objections stage first, then close.</p>
        <button
          onClick={onNavigateToClose}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition"
        >
          Move to Close
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
