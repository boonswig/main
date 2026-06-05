'use client'

import { useState } from 'react'
import { SIGNALS } from '@/lib/signals'

interface Props {
  selected: string[]
  onChange: (ids: string[]) => void
}

const CHIP: Record<string, { base: string; active: string; header: string }> = {
  blue:   { base: 'border-blue-200 text-blue-700 hover:border-blue-400 hover:bg-blue-50',     active: 'border-blue-500 bg-blue-100 text-blue-900',     header: 'text-blue-700 bg-blue-50 border-blue-100' },
  purple: { base: 'border-purple-200 text-purple-700 hover:border-purple-400 hover:bg-purple-50', active: 'border-purple-500 bg-purple-100 text-purple-900', header: 'text-purple-700 bg-purple-50 border-purple-100' },
  red:    { base: 'border-red-200 text-red-700 hover:border-red-400 hover:bg-red-50',         active: 'border-red-500 bg-red-100 text-red-900',         header: 'text-red-700 bg-red-50 border-red-100' },
  amber:  { base: 'border-amber-200 text-amber-700 hover:border-amber-400 hover:bg-amber-50', active: 'border-amber-500 bg-amber-100 text-amber-900',   header: 'text-amber-700 bg-amber-50 border-amber-100' },
  orange: { base: 'border-orange-200 text-orange-700 hover:border-orange-400 hover:bg-orange-50', active: 'border-orange-500 bg-orange-100 text-orange-900', header: 'text-orange-700 bg-orange-50 border-orange-100' },
  slate:  { base: 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50', active: 'border-slate-500 bg-slate-100 text-slate-900',   header: 'text-slate-700 bg-slate-50 border-slate-200' },
  indigo: { base: 'border-indigo-200 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50', active: 'border-indigo-500 bg-indigo-100 text-indigo-900', header: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
}

export default function SignalChips({ selected, onChange }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  function toggle(id: string) {
    const isActive = selected.includes(id)
    if (isActive) {
      onChange(selected.filter((s) => s !== id))
      if (expanded === id) setExpanded(null)
    } else {
      onChange([...selected, id])
      setExpanded(id)
    }
  }

  const expandedSignal = expanded ? SIGNALS.find((s) => s.id === expanded && selected.includes(s.id)) : null

  return (
    <div className="mx-6 mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">
          Tag gaps as you hear them
        </p>
        <div className="flex flex-wrap gap-2">
          {SIGNALS.map((signal) => {
            const isActive = selected.includes(signal.id)
            const c = CHIP[signal.color]
            return (
              <button
                key={signal.id}
                onClick={() => toggle(signal.id)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition ${
                  isActive ? c.active : c.base
                }`}
              >
                <span>{signal.emoji}</span>
                {signal.label}
                {isActive && (
                  <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
        {selected.length === 0 && (
          <p className="text-xs text-slate-400 mt-2">Tap a chip when the customer mentions a gap — you'll get targeted follow-up questions to dig deeper.</p>
        )}
      </div>

      {expandedSignal && (
        <div className={`mx-4 mb-3 rounded-lg border p-3 ${CHIP[expandedSignal.color].header}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wide">
              {expandedSignal.emoji} Dig deeper on {expandedSignal.label}
            </p>
            <button
              onClick={() => setExpanded(null)}
              className="text-current opacity-50 hover:opacity-100 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="space-y-2">
            {expandedSignal.followUps.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="opacity-40 mt-0.5 flex-shrink-0 font-bold">{i + 1}.</span>
                <span className="leading-snug">&ldquo;{q}&rdquo;</span>
              </li>
            ))}
          </ul>
          {selected.length > 1 && (
            <button
              onClick={() => setExpanded(null)}
              className="mt-2 text-xs opacity-60 hover:opacity-100 transition underline"
            >
              See all identified gaps
            </button>
          )}
        </div>
      )}

      {selected.length > 0 && !expandedSignal && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          <p className="text-xs text-slate-500 w-full mb-1">Tap any tagged gap to see follow-up questions:</p>
          {selected.map((id) => {
            const s = SIGNALS.find((sig) => sig.id === id)
            if (!s) return null
            const c = CHIP[s.color]
            return (
              <button
                key={id}
                onClick={() => setExpanded(id)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border transition ${c.active}`}
              >
                {s.emoji} {s.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
