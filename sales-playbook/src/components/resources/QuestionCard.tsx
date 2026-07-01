'use client'

import { useState } from 'react'
import { UseCaseQuestion, USE_CASES } from '@/types'

interface Props {
  question: UseCaseQuestion
  onFilterUseCase: (id: string) => void
}

export default function QuestionCard({ question, onFilterUseCase }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(question.question).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ucLabels = USE_CASES.filter((uc) => question.useCases.includes(uc.id))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-200 transition">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">💬 Discovery</span>
            {ucLabels.map((uc) => (
              <button
                key={uc.id}
                onClick={() => onFilterUseCase(uc.id)}
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
              >
                {uc.emoji} {uc.label}
              </button>
            ))}
          </div>
          <button
            onClick={copy}
            className={`flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border transition ${
              copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-sm font-semibold text-slate-800 leading-snug">
          &ldquo;{question.question}&rdquo;
        </p>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 hover:bg-slate-100 transition"
      >
        <span className="font-medium">{expanded ? 'Hide rationale' : 'See rationale & tips'}</span>
        <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 py-4 space-y-4 border-t border-slate-100">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Why ask this</p>
            <p className="text-sm text-slate-700 leading-relaxed">{question.rationale}</p>
          </div>
          {question.listenFor.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Listen for</p>
              <ul className="space-y-1.5">
                {question.listenFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-blue-400 flex-shrink-0 mt-0.5">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {question.followUp && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Follow-up if needed</p>
              <p className="text-sm text-amber-900 italic">&ldquo;{question.followUp}&rdquo;</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
