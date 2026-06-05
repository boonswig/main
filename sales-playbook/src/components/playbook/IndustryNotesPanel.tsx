'use client'

import { useState } from 'react'
import { IndustryNote, PreCallContext } from '@/types'

interface Props {
  industryNotes: IndustryNote[]
  context: PreCallContext | null
}

export default function IndustryNotesPanel({ industryNotes, context }: Props) {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const industry = context?.industry ?? ''
  const matched = industryNotes.find(
    (n) => n.industry.toLowerCase() === industry.toLowerCase()
  )

  // Only show the button when we have talking points for this industry
  if (!matched || matched.talkingPoints.length === 0) return null

  return (
    <>
      {/* Persistent floating toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        title={`${matched.label} talking points`}
        className={`fixed bottom-32 right-4 z-40 flex items-center gap-2 h-10 rounded-full shadow-lg text-xs font-semibold transition-all ${
          open
            ? 'bg-blue-600 text-white pl-3 pr-3'
            : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 pl-3 pr-3'
        }`}
      >
        {/* Building/Industry icon */}
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="max-w-[120px] truncate">{matched.label}</span>
        {open ? (
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
            {matched.talkingPoints.length}
          </span>
        )}
      </button>

      {/* Slide-over panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end pointer-events-none">
          {/* Backdrop — only blocks clicks, doesn't cover the button area */}
          <div
            className="absolute inset-0 bg-black/20 pointer-events-auto"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-full sm:w-96 sm:mr-4 sm:mb-4 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[75vh] pointer-events-auto">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{matched.label}</p>
                  <p className="text-xs text-slate-400">Industry talking points</p>
                </div>
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

            {/* Talking points list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {matched.talkingPoints.map((tp) => {
                const isExpanded = expandedId === tp.id
                return (
                  <div
                    key={tp.id}
                    className="border border-slate-100 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : tp.id)}
                      className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition flex items-center gap-2"
                    >
                      <span className="flex-1 text-sm font-semibold text-slate-800">{tp.title}</span>
                      <svg
                        className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-2">
                        <p className="text-sm text-slate-700 leading-relaxed">{tp.content}</p>
                        {tp.tips && tp.tips.length > 0 && (
                          <ul className="space-y-1">
                            {tp.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-500">
                                <span className="text-blue-400 flex-shrink-0 mt-0.5">→</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="px-4 py-2.5 border-t border-slate-100 flex-shrink-0">
              <p className="text-xs text-slate-400 text-center">
                Configured by admin · Edit in Admin → Industry Notes
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
