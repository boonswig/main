'use client'

import { useState } from 'react'
import { RepPitchCard, USE_CASES } from '@/types'

interface Props {
  card: RepPitchCard
  onFilterUseCase: (id: string) => void
}

const PRODUCT_BADGE: Record<string, string> = {
  cep: 'bg-blue-100 text-blue-700',
  cameyo: 'bg-purple-100 text-purple-700',
  both: 'bg-slate-100 text-slate-600',
}

const PRODUCT_LABEL: Record<string, string> = {
  cep: 'CEP',
  cameyo: 'Cameyo',
  both: 'CEP + Cameyo',
}

export default function PitchCard({ card, onFilterUseCase }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(card.pitch).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ucLabels = USE_CASES.filter((uc) => card.useCases.includes(uc.id))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-emerald-200 transition">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">🎯 Pitch</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRODUCT_BADGE[card.product]}`}>
              {PRODUCT_LABEL[card.product]}
            </span>
            {ucLabels.map((uc) => (
              <button
                key={uc.id}
                onClick={() => onFilterUseCase(uc.id)}
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
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
        <p className="text-sm font-bold text-slate-800 mb-2">{card.title}</p>
        <p className="text-sm text-slate-600 leading-relaxed">&ldquo;{card.pitch}&rdquo;</p>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 hover:bg-slate-100 transition"
      >
        <span className="font-medium">{expanded ? 'Hide key points' : 'See key points'}</span>
        <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 py-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">Key points</p>
          <ul className="space-y-2">
            {card.keyPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-slate-700">{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
