'use client'

import { useState } from 'react'
import { Stage } from '@/types'

const SECTION_COLOR: Record<string, string> = {
  blue: 'border-blue-200 bg-blue-50',
  purple: 'border-purple-200 bg-purple-50',
  green: 'border-emerald-200 bg-emerald-50',
  orange: 'border-orange-200 bg-orange-50',
  teal: 'border-teal-200 bg-teal-50',
  red: 'border-red-200 bg-red-50',
  pink: 'border-pink-200 bg-pink-50',
  indigo: 'border-indigo-200 bg-indigo-50',
}

const BADGE_COLOR: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-emerald-100 text-emerald-700',
  orange: 'bg-orange-100 text-orange-700',
  teal: 'bg-teal-100 text-teal-700',
  red: 'bg-red-100 text-red-700',
  pink: 'bg-pink-100 text-pink-700',
  indigo: 'bg-indigo-100 text-indigo-700',
}

interface Props {
  stage: Stage
  completedItems: Record<string, boolean>
  onToggleItem: (id: string) => void
}

export default function StageContent({ stage, completedItems, onToggleItem }: Props) {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({})
  const [expandedObjections, setExpandedObjections] = useState<Record<string, boolean>>({})

  const toggleQuestion = (id: string) =>
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }))
  const toggleObjection = (id: string) =>
    setExpandedObjections((prev) => ({ ...prev, [id]: !prev[id] }))

  const sectionBg = SECTION_COLOR[stage.color] ?? 'border-slate-200 bg-slate-50'
  const badge = BADGE_COLOR[stage.color] ?? 'bg-slate-100 text-slate-700'

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Questions */}
      {stage.questions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}>
              Questions
            </span>
            <span className="text-sm text-slate-400">
              {stage.questions.filter((q) => completedItems[q.id]).length}/{stage.questions.length} asked
            </span>
          </div>
          <div className="space-y-3">
            {stage.questions.map((q) => {
              const done = completedItems[q.id]
              const expanded = expandedQuestions[q.id]
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border transition-all ${
                    done ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleItem(q.id)}
                      className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition ${
                        done
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      {done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {q.question}
                      </p>
                      {q.purpose && !expanded && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{q.purpose}</p>
                      )}
                      {expanded && (
                        <div className="mt-3 space-y-3">
                          {q.purpose && (
                            <div className="flex gap-2">
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex-shrink-0 mt-0.5">
                                Why:
                              </span>
                              <p className="text-xs text-slate-600">{q.purpose}</p>
                            </div>
                          )}
                          {q.followUps.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                Follow-ups
                              </p>
                              <ul className="space-y-1.5">
                                {q.followUps.map((fu, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-slate-400 mt-0.5 flex-shrink-0">→</span>
                                    <span className="text-xs text-slate-600">{fu}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expand button */}
                    {(q.purpose || q.followUps.length > 0) && (
                      <button
                        onClick={() => toggleQuestion(q.id)}
                        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition mt-0.5"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Talking Points */}
      {stage.talkingPoints.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}>
              Talking Points
            </span>
            <span className="text-sm text-slate-400">
              {stage.talkingPoints.filter((t) => completedItems[t.id]).length}/{stage.talkingPoints.length} covered
            </span>
          </div>
          <div className="space-y-3">
            {stage.talkingPoints.map((tp) => {
              const done = completedItems[tp.id]
              return (
                <div
                  key={tp.id}
                  className={`rounded-xl border p-4 transition-all ${
                    done ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleItem(tp.id)}
                      className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition ${
                        done
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      {done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {tp.title}
                      </p>
                      <p className={`text-sm mt-1 leading-relaxed ${done ? 'text-slate-400' : 'text-slate-600'}`}>
                        {tp.content}
                      </p>
                      {tp.tips.length > 0 && (
                        <div className={`mt-3 rounded-lg p-3 ${sectionBg}`}>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                            💡 Tips
                          </p>
                          <ul className="space-y-1">
                            {tp.tips.map((tip, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                <span className="text-slate-400 flex-shrink-0">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Objections */}
      {stage.objections.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}>
              Objection Handlers
            </span>
            <span className="text-sm text-slate-400">
              {stage.objections.filter((o) => completedItems[o.id]).length}/{stage.objections.length} handled
            </span>
          </div>
          <div className="space-y-3">
            {stage.objections.map((obj) => {
              const done = completedItems[obj.id]
              const expanded = expandedObjections[obj.id]
              return (
                <div
                  key={obj.id}
                  className={`rounded-xl border overflow-hidden transition-all ${
                    done ? 'border-emerald-200' : 'border-slate-200'
                  }`}
                >
                  {/* Objection header */}
                  <div
                    className={`flex items-start gap-3 p-4 cursor-pointer ${
                      done ? 'bg-emerald-50/50' : 'bg-white hover:bg-slate-50'
                    }`}
                    onClick={() => toggleObjection(obj.id)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleItem(obj.id)
                      }}
                      className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition ${
                        done
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      {done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                          Objection
                        </span>
                      </div>
                      <p className={`text-sm font-medium italic ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        &ldquo;{obj.objection}&rdquo;
                      </p>
                    </div>

                    <svg
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform mt-0.5 ${expanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Response (expanded) */}
                  {expanded && (
                    <div className="border-t border-slate-100 bg-emerald-50 p-4 space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                          Your response
                        </span>
                        <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{obj.response}</p>
                      </div>
                      {obj.tips.length > 0 && (
                        <div className="rounded-lg bg-white/70 border border-emerald-100 p-3">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                            💡 Tips
                          </p>
                          <ul className="space-y-1">
                            {obj.tips.map((tip, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                <span className="text-slate-400 flex-shrink-0">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {stage.questions.length === 0 && stage.talkingPoints.length === 0 && stage.objections.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">No content yet</p>
          <p className="text-slate-400 text-xs mt-1">Admins can add questions, talking points, and objections in the Admin panel.</p>
        </div>
      )}
    </div>
  )
}
