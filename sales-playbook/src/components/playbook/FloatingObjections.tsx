'use client'

import { useState, useMemo } from 'react'
import { Stage } from '@/types'

interface Props {
  stages: Stage[]
}

const STAGE_COLOR_TEXT: Record<string, string> = {
  blue:   'text-blue-600 bg-blue-50 border-blue-200',
  purple: 'text-purple-600 bg-purple-50 border-purple-200',
  green:  'text-emerald-600 bg-emerald-50 border-emerald-200',
  orange: 'text-orange-600 bg-orange-50 border-orange-200',
  teal:   'text-teal-600 bg-teal-50 border-teal-200',
  red:    'text-red-600 bg-red-50 border-red-200',
  pink:   'text-pink-600 bg-pink-50 border-pink-200',
  indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
}

export default function FloatingObjections({ stages }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const allObjections = useMemo(() => {
    return stages.flatMap((stage) =>
      (stage.objections ?? []).map((obj) => ({
        ...obj,
        stageName: stage.name,
        stageColor: stage.color,
        stageId: stage.id,
      }))
    )
  }, [stages])

  const filtered = useMemo(() => {
    if (!query.trim()) return allObjections
    const q = query.toLowerCase()
    return allObjections.filter(
      (o) =>
        o.objection.toLowerCase().includes(q) ||
        o.response.toLowerCase().includes(q) ||
        o.stageName.toLowerCase().includes(q)
    )
  }, [allObjections, query])

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Quick objection lookup"
        className="fixed bottom-20 right-4 z-40 w-11 h-11 rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700 transition flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="relative z-10 w-full sm:w-96 sm:mr-4 sm:mb-4 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="font-semibold text-sm text-slate-800">Objection Quick-Find</span>
                <span className="text-xs text-slate-400">{allObjections.length} total</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search objections…"
                  className="flex-1 text-sm bg-transparent focus:outline-none text-slate-700 placeholder-slate-400"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">No objections match "{query}"</div>
              ) : (
                filtered.map((obj) => {
                  const isExpanded = expandedId === obj.id
                  const colorClass = STAGE_COLOR_TEXT[obj.stageColor] ?? 'text-slate-600 bg-slate-50 border-slate-200'
                  return (
                    <div
                      key={obj.id}
                      className="border border-slate-100 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : obj.id)}
                        className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition flex items-start gap-2.5"
                      >
                        <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${colorClass}`}>
                          {obj.stageName}
                        </span>
                        <span className="flex-1 text-sm font-medium text-slate-800 leading-snug text-left">
                          {obj.objection}
                        </span>
                        <svg
                          className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-2 border-t border-slate-100 pt-2">
                          <p className="text-sm text-slate-700 leading-relaxed">{obj.response}</p>
                          {obj.tips?.length > 0 && (
                            <ul className="space-y-1">
                              {obj.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-500">
                                  <span className="flex-shrink-0 mt-0.5 text-slate-300">→</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
