'use client'

import { useState, useEffect } from 'react'

interface Props {
  onTrigger: (keywords: string[]) => void
  onClear: () => void
  matchCount: number
}

export default function KeywordTriggerBar({ onTrigger, onClear, matchCount }: Props) {
  const [input, setInput] = useState('')
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!input.trim()) {
      onClear()
      setActive(false)
      return
    }
    const terms = input
      .toLowerCase()
      .split(/[\s,]+/)
      .filter((t) => t.length > 2)
    onTrigger(terms)
    setActive(terms.length > 0)
  }, [input])

  function handleClear() {
    setInput('')
    onClear()
    setActive(false)
  }

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border transition-all duration-200 ${
        active
          ? 'bg-amber-50 border-amber-300 shadow-amber-100'
          : 'bg-white border-slate-200'
      }`}
      style={{ width: 'min(480px, calc(100vw - 200px))' }}
    >
      <svg
        className={`w-4 h-4 flex-shrink-0 ${active ? 'text-amber-500' : 'text-slate-400'}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="What did they just say? Type a keyword…"
        className={`flex-1 text-sm bg-transparent focus:outline-none ${
          active ? 'text-amber-900 placeholder-amber-400' : 'text-slate-700 placeholder-slate-400'
        }`}
      />

      {active && matchCount > 0 && (
        <span className="text-xs font-semibold bg-amber-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
          {matchCount} match{matchCount !== 1 ? 'es' : ''}
        </span>
      )}

      {active && matchCount === 0 && (
        <span className="text-xs text-amber-600 flex-shrink-0">no matches</span>
      )}

      {input && (
        <button onClick={handleClear} className="text-slate-400 hover:text-slate-600 flex-shrink-0 transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
