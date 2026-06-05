'use client'

import { useState } from 'react'
import { Question, AnswerChip } from '@/types'

interface TaggedChip {
  chip: AnswerChip
  isCameyo: boolean
}

interface Props {
  taggedAnswers: Record<string, string[]>
  questions: Question[]
}

function collectTaggedChips(taggedAnswers: Record<string, string[]>, questions: Question[]): TaggedChip[] {
  return questions.flatMap((q) => {
    const taggedIds = taggedAnswers[q.id] ?? []
    return taggedIds.flatMap((chipId) => {
      const chip = q.answerChips?.find((c) => c.id === chipId)
      if (!chip) return []
      return [{ chip, isCameyo: q.id === 'd-q-legacy-apps' }]
    })
  })
}

function getPitchOpener(taggedChips: TaggedChip[]): string {
  if (taggedChips.length === 0) return ''
  const hasCameyo = taggedChips.some((t) => t.isCameyo)
  const hasCep = taggedChips.some((t) => !t.isCameyo)

  if (hasCameyo && hasCep) {
    return "I want to show you two things that work together. Chrome Enterprise Premium secures the browser layer for everything you described around security and data control. Cameyo eliminates your Windows infrastructure dependency — apps stream in a Chrome tab, no Citrix, no servers. Together they're a browser-first platform that addresses everything we just discussed."
  }
  if (hasCameyo) {
    return "Based on what you've described, Cameyo is the right starting point. Any Windows application — your legacy tools, your ERP — streams in a Chrome tab from the cloud. No servers to build, no client to install. Your users see no difference; your IT team loses the infrastructure overhead."
  }
  return "Chrome Enterprise Premium turns the browser into your security perimeter. Policy-controlled, DLP-enforced, threat-protected — deployed to existing Chrome browsers in hours. Everything we discussed — the visibility gaps, the data controls, the unmanaged devices — CEP addresses at the browser layer without replacing anything you already have."
}

function ChipCard({ chip, isCameyo }: TaggedChip) {
  const [expanded, setExpanded] = useState(false)
  const hasDeepDive = !!chip.deepDive

  return (
    <div className={`rounded-xl border overflow-hidden ${isCameyo ? 'border-purple-100' : 'border-slate-200'}`}>
      {/* Header row */}
      <div className={`flex items-start justify-between gap-3 px-4 py-3 ${isCameyo ? 'bg-purple-50' : 'bg-white'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold ${isCameyo ? 'text-purple-600' : 'text-blue-600'}`}>
              {isCameyo ? 'Cameyo' : 'CEP'}
            </span>
            <span className={`text-xs font-bold ${isCameyo ? 'text-purple-800' : 'text-slate-700'}`}>
              {chip.label}
            </span>
          </div>
          <p className={`text-xs leading-relaxed ${isCameyo ? 'text-purple-900' : 'text-slate-600'}`}>
            {chip.pitchBullet}
          </p>
        </div>
        {hasDeepDive && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
              expanded
                ? isCameyo ? 'bg-purple-200 border-purple-300 text-purple-800' : 'bg-slate-200 border-slate-300 text-slate-700'
                : isCameyo ? 'bg-white border-purple-200 text-purple-600 hover:bg-purple-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {expanded ? 'Less' : 'How it works'}
            <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Deep dive */}
      {expanded && chip.deepDive && (
        <div className={`px-4 py-3 border-t space-y-3 ${isCameyo ? 'bg-purple-50/60 border-purple-100' : 'bg-slate-50 border-slate-100'}`}>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">How it works</p>
            <p className="text-xs text-slate-700 leading-relaxed">{chip.deepDive.howItWorks}</p>
          </div>
          {chip.deepDive.additionalProtections.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Additional protections</p>
              <ul className="space-y-1.5">
                {chip.deepDive.additionalProtections.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`flex-shrink-0 mt-0.5 ${isCameyo ? 'text-purple-400' : 'text-blue-400'}`}>✓</span>
                    <span className="text-xs text-slate-600 leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {chip.deepDive.proofPoint && (
            <div className={`rounded-lg px-3 py-2 ${isCameyo ? 'bg-purple-100 border border-purple-200' : 'bg-blue-50 border border-blue-100'}`}>
              <p className={`text-xs font-semibold mb-0.5 ${isCameyo ? 'text-purple-700' : 'text-blue-700'}`}>Proof point</p>
              <p className={`text-xs leading-relaxed ${isCameyo ? 'text-purple-800' : 'text-blue-800'}`}>{chip.deepDive.proofPoint}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PitchBriefing({ taggedAnswers, questions }: Props) {
  const taggedChips = collectTaggedChips(taggedAnswers, questions)

  if (taggedChips.length === 0) {
    return (
      <div className="mx-6 mt-4 rounded-xl border border-dashed border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-400 text-center">
          No gaps tagged in discovery — go back to tag what you heard and the pitch will personalise itself.
        </p>
      </div>
    )
  }

  const opener = getPitchOpener(taggedChips)
  const cepChips = taggedChips.filter((t) => !t.isCameyo)
  const cameyoChips = taggedChips.filter((t) => t.isCameyo)

  return (
    <div className="mx-6 mt-4 space-y-3">
      {/* Opening line */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">How to open</p>
        <p className="text-sm text-blue-900 leading-relaxed italic">&ldquo;{opener}&rdquo;</p>
      </div>

      {/* CEP response cards */}
      {cepChips.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 px-1">
            🔒 Chrome Enterprise Premium
          </p>
          <div className="space-y-2">
            {cepChips.map(({ chip }) => (
              <ChipCard key={chip.id} chip={chip} isCameyo={false} />
            ))}
          </div>
        </div>
      )}

      {/* Cameyo response cards */}
      {cameyoChips.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 px-1">
            🖥️ Cameyo
          </p>
          <div className="space-y-2">
            {cameyoChips.map(({ chip }) => (
              <ChipCard key={chip.id} chip={chip} isCameyo={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
