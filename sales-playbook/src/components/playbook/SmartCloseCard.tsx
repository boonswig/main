'use client'

import { useState } from 'react'
import { CloseRecommendation, Question } from '@/types'

interface Props {
  closeRecommendations: CloseRecommendation[]
  taggedAnswers: Record<string, string[]>
  questions: Question[]
  selectedNextStep: string
  onSelectNextStep: (step: string) => void
}

function findBestRecommendation(
  recs: CloseRecommendation[],
  taggedAnswers: Record<string, string[]>
): { rec: CloseRecommendation; matchCount: number } | null {
  const allTagged = new Set(Object.values(taggedAnswers).flat())
  const scored = recs
    .map((rec) => ({
      rec,
      matchCount: rec.chipIds.filter((id) => allTagged.has(id)).length,
    }))
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
  return scored[0] ?? null
}

export default function SmartCloseCard({
  closeRecommendations,
  taggedAnswers,
  questions,
  selectedNextStep,
  onSelectNextStep,
}: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [copied, setCopied] = useState(false)

  if (dismissed || closeRecommendations.length === 0) return null

  const best = findBestRecommendation(closeRecommendations, taggedAnswers)
  if (!best) return null

  const { rec, matchCount } = best
  const alreadySelected = selectedNextStep === rec.nextStep

  // Find labels for the matching chips
  const allTagged = new Set(Object.values(taggedAnswers).flat())
  const matchedLabels = questions
    .flatMap((q) => q.answerChips ?? [])
    .filter((c) => rec.chipIds.includes(c.id) && allTagged.has(c.id))
    .map((c) => c.label)
    .slice(0, 3)

  function handleCopy() {
    navigator.clipboard.writeText(rec.askThis).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-6 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Recommended close</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
            {matchCount} signal{matchCount !== 1 ? 's' : ''} matched
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-emerald-400 hover:text-emerald-600 transition p-0.5"
          title="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Matched signals */}
      {matchedLabels.length > 0 && (
        <div className="px-4 pb-1 flex flex-wrap gap-1">
          {matchedLabels.map((label) => (
            <span key={label} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Next step */}
      <div className="px-4 pt-1 pb-1">
        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Suggested next step</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-emerald-900">{rec.nextStep}</span>
          {alreadySelected ? (
            <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">Selected</span>
          ) : (
            <button
              onClick={() => onSelectNextStep(rec.nextStep)}
              className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold hover:bg-emerald-700 transition"
            >
              Select this
            </button>
          )}
        </div>
        <p className="text-xs text-emerald-600 mt-0.5">{rec.rationale}</p>
      </div>

      {/* Ask this */}
      <div className="px-4 pt-2 pb-3">
        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1.5">Words to use</p>
        <div className="bg-white border border-emerald-200 rounded-lg px-3 py-2.5">
          <p className="text-sm text-emerald-900 leading-relaxed italic">&ldquo;{rec.askThis}&rdquo;</p>
        </div>
        <div className="flex justify-end mt-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${
              copied
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {copied ? (
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
      </div>
    </div>
  )
}
