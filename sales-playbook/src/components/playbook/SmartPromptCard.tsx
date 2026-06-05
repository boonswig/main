'use client'

import { useState, useEffect } from 'react'
import { PreCallContext } from '@/types'
import { getSmartPrompt } from '@/lib/smartPrompt'

interface Props {
  context: PreCallContext | null
  activeStageId: string
}

const PRODUCT_BADGE = {
  cep: {
    label: 'Chrome Enterprise Premium',
    className: 'bg-blue-100 text-blue-800 border border-blue-200',
    dot: 'bg-blue-500',
  },
  cameyo: {
    label: 'Cameyo',
    className: 'bg-purple-100 text-purple-800 border border-purple-200',
    dot: 'bg-purple-500',
  },
  both: {
    label: 'CEP + Cameyo',
    className: 'bg-slate-100 text-slate-700 border border-slate-200',
    dot: 'bg-gradient-to-r from-blue-500 to-purple-500',
  },
}

export default function SmartPromptCard({ context, activeStageId }: Props) {
  const [dismissedStage, setDismissedStage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Reset dismissal whenever stage changes
  useEffect(() => {
    setDismissedStage(null)
  }, [activeStageId])

  const prompt = getSmartPrompt(context, activeStageId)

  if (!prompt || dismissedStage === activeStageId) return null

  const badge = PRODUCT_BADGE[prompt.product]

  function handleCopy() {
    navigator.clipboard.writeText(prompt!.question).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          {/* Spark icon */}
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Ask this next</span>
          {/* Product badge */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
        </div>
        <button
          onClick={() => setDismissedStage(activeStageId)}
          className="text-amber-400 hover:text-amber-600 transition p-0.5"
          title="Dismiss for this stage"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Question */}
      <div className="px-4 pt-1 pb-2">
        <p className="text-sm font-semibold text-amber-900 leading-snug">
          &ldquo;{prompt.question}&rdquo;
        </p>
      </div>

      {/* Rationale + copy */}
      <div className="px-4 pb-3 flex items-center justify-between gap-4">
        <p className="text-xs text-amber-700 leading-relaxed flex-1">{prompt.rationale}</p>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${
            copied
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-amber-200 text-amber-700 hover:bg-amber-100'
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
  )
}
