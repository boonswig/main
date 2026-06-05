'use client'

import { useState, useEffect } from 'react'
import { Stage, Question, TalkingPoint, Objection } from '@/types'

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
  industry: string
  triggerKeywords: string[]
  onMatchCountChange: (count: number) => void
  taggedAnswers?: Record<string, string[]>
  onToggleAnswer?: (questionId: string, chipId: string) => void
}

function itemMatchesIndustry(item: { industries?: string[] }, industry: string): boolean {
  if (!industry) return true
  if (!item.industries || item.industries.length === 0) return true
  return item.industries.includes(industry) || item.industries.includes('all')
}

function itemMatchesKeywords(item: { keywords?: string[] }, terms: string[]): boolean {
  if (terms.length === 0) return false
  const keywords = (item.keywords ?? []).map((k) => k.toLowerCase())
  return terms.some((t) => keywords.some((k) => k.includes(t)))
}

export default function StageContent({
  stage,
  completedItems,
  onToggleItem,
  industry,
  triggerKeywords,
  onMatchCountChange,
  taggedAnswers = {},
  onToggleAnswer,
}: Props) {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({})
  const [expandedObjections, setExpandedObjections] = useState<Record<string, boolean>>({})

  const toggleQuestion = (id: string) =>
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }))
  const toggleObjection = (id: string) =>
    setExpandedObjections((prev) => ({ ...prev, [id]: !prev[id] }))

  // Filter by industry
  const questions     = stage.questions.filter((q) => itemMatchesIndustry(q, industry))
  const talkingPoints = stage.talkingPoints.filter((t) => itemMatchesIndustry(t, industry))
  const objections    = stage.objections.filter((o) => itemMatchesIndustry(o, industry))

  // Count keyword matches and report up
  useEffect(() => {
    if (triggerKeywords.length === 0) { onMatchCountChange(0); return }
    const count =
      questions.filter((q) => itemMatchesKeywords(q, triggerKeywords)).length +
      talkingPoints.filter((t) => itemMatchesKeywords(t, triggerKeywords)).length +
      objections.filter((o) => itemMatchesKeywords(o, triggerKeywords)).length
    onMatchCountChange(count)
  }, [triggerKeywords, questions.length, talkingPoints.length, objections.length])

  const sectionBg = SECTION_COLOR[stage.color] ?? 'border-slate-200 bg-slate-50'
  const badge = BADGE_COLOR[stage.color] ?? 'bg-slate-100 text-slate-700'

  function kwHighlight(item: { keywords?: string[] }) {
    return triggerKeywords.length > 0 && itemMatchesKeywords(item, triggerKeywords)
  }

  function industryTip(item: { industryTips?: Record<string, string> }) {
    return industry && item.industryTips?.[industry]
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Questions */}
      {questions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}>Questions</span>
            <span className="text-sm text-slate-400">
              {questions.filter((q) => completedItems[q.id]).length}/{questions.length} asked
            </span>
          </div>
          <div className="space-y-3">
            {questions.map((q) => {
              const done = completedItems[q.id]
              const expanded = expandedQuestions[q.id]
              const highlighted = kwHighlight(q)
              const indTip = industryTip(q)
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border transition-all ${
                    highlighted
                      ? 'border-amber-400 bg-amber-50 shadow-md shadow-amber-100 ring-1 ring-amber-300'
                      : done
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {highlighted && (
                    <div className="flex items-center gap-1.5 px-4 pt-3 pb-0">
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-xs font-semibold text-amber-600">Keyword match</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-4">
                    <button
                      onClick={() => onToggleItem(q.id)}
                      className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition ${
                        done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 hover:border-emerald-400'
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
                      {/* Answer chips — always visible */}
                      {q.answerChips && q.answerChips.length > 0 && onToggleAnswer && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {q.answerChips.map((chip) => {
                            const isTagged = (taggedAnswers[q.id] ?? []).includes(chip.id)
                            return (
                              <button
                                key={chip.id}
                                onClick={(e) => { e.stopPropagation(); onToggleAnswer(q.id, chip.id) }}
                                className={`text-xs font-medium px-2.5 py-1 rounded-full border transition ${
                                  isTagged
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                                }`}
                              >
                                {isTagged && <span className="mr-1">✓</span>}{chip.label}
                              </button>
                            )
                          })}
                        </div>
                      )}
                      {/* Expanded: follow-ups, why, industry tip */}
                      {q.purpose && !expanded && !q.answerChips?.length && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{q.purpose}</p>
                      )}
                      {expanded && (
                        <div className="mt-3 space-y-3">
                          {q.purpose && (
                            <div className="flex gap-2">
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex-shrink-0 mt-0.5">Why:</span>
                              <p className="text-xs text-slate-600">{q.purpose}</p>
                            </div>
                          )}
                          {q.followUps.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Drill-downs</p>
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
                          {/* Say-this hints for tagged chips */}
                          {q.answerChips && (taggedAnswers[q.id] ?? []).length > 0 && (
                            <div className="space-y-2">
                              {(taggedAnswers[q.id] ?? []).map((chipId) => {
                                const chip = q.answerChips!.find((c) => c.id === chipId)
                                if (!chip?.sayThis) return null
                                return (
                                  <div key={chipId} className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                                    <p className="text-xs font-semibold text-amber-700 mb-1">💬 Say this — {chip.label}</p>
                                    <p className="text-xs text-amber-800 italic">&ldquo;{chip.sayThis}&rdquo;</p>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          {indTip && (
                            <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                              <p className="text-xs font-semibold text-blue-600 mb-1">Industry tip</p>
                              <p className="text-xs text-blue-700">{indTip}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {(q.purpose || q.followUps.length > 0 || indTip) && (
                      <button onClick={() => toggleQuestion(q.id)} className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition mt-0.5">
                        <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      {talkingPoints.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}>Talking Points</span>
            <span className="text-sm text-slate-400">
              {talkingPoints.filter((t) => completedItems[t.id]).length}/{talkingPoints.length} covered
            </span>
          </div>
          <div className="space-y-3">
            {talkingPoints.map((tp) => {
              const done = completedItems[tp.id]
              const highlighted = kwHighlight(tp)
              const indTip = industryTip(tp)
              return (
                <div
                  key={tp.id}
                  className={`rounded-xl border p-4 transition-all ${
                    highlighted
                      ? 'border-amber-400 bg-amber-50 shadow-md shadow-amber-100 ring-1 ring-amber-300'
                      : done
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {highlighted && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-xs font-semibold text-amber-600">Keyword match</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleItem(tp.id)}
                      className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition ${
                        done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      {done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>{tp.title}</p>
                      <p className={`text-sm mt-1 leading-relaxed ${done ? 'text-slate-400' : 'text-slate-600'}`}>{tp.content}</p>
                      {(tp.tips.length > 0 || indTip) && (
                        <div className={`mt-3 rounded-lg p-3 ${sectionBg}`}>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">💡 Tips</p>
                          <ul className="space-y-1">
                            {tp.tips.map((tip, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                <span className="text-slate-400 flex-shrink-0">•</span>{tip}
                              </li>
                            ))}
                            {indTip && (
                              <li className="text-xs text-blue-700 flex items-start gap-2 mt-1 pt-1 border-t border-blue-100">
                                <span className="text-blue-400 flex-shrink-0">★</span>
                                <span><strong>Industry:</strong> {indTip}</span>
                              </li>
                            )}
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
      {objections.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}>Objection Handlers</span>
            <span className="text-sm text-slate-400">
              {objections.filter((o) => completedItems[o.id]).length}/{objections.length} handled
            </span>
          </div>
          <div className="space-y-3">
            {objections.map((obj) => {
              const done = completedItems[obj.id]
              const expanded = expandedObjections[obj.id]
              const highlighted = kwHighlight(obj)
              const indTip = industryTip(obj)
              return (
                <div
                  key={obj.id}
                  className={`rounded-xl border overflow-hidden transition-all ${
                    highlighted
                      ? 'border-amber-400 shadow-md shadow-amber-100 ring-1 ring-amber-300'
                      : done
                      ? 'border-emerald-200'
                      : 'border-slate-200'
                  }`}
                >
                  <div
                    className={`flex items-start gap-3 p-4 cursor-pointer ${
                      highlighted ? 'bg-amber-50' : done ? 'bg-emerald-50/50' : 'bg-white hover:bg-slate-50'
                    }`}
                    onClick={() => toggleObjection(obj.id)}
                  >
                    {highlighted && (
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleItem(obj.id) }}
                      className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition ${
                        done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      {done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      {highlighted && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-xs font-semibold text-amber-600">Keyword match</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Objection</span>
                      </div>
                      <p className={`text-sm font-medium italic ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        &ldquo;{obj.objection}&rdquo;
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform mt-0.5 ${expanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {expanded && (
                    <div className="border-t border-slate-100 bg-emerald-50 p-4 space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Your response</span>
                        <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{obj.response}</p>
                      </div>
                      {(obj.tips.length > 0 || indTip) && (
                        <div className="rounded-lg bg-white/70 border border-emerald-100 p-3">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">💡 Tips</p>
                          <ul className="space-y-1">
                            {obj.tips.map((tip, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                <span className="text-slate-400 flex-shrink-0">•</span>{tip}
                              </li>
                            ))}
                            {indTip && (
                              <li className="text-xs text-blue-700 flex items-start gap-2 mt-1 pt-1 border-t border-blue-100">
                                <span className="text-blue-400 flex-shrink-0">★</span>
                                <span><strong>Industry:</strong> {indTip}</span>
                              </li>
                            )}
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

      {questions.length === 0 && talkingPoints.length === 0 && objections.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">No content for this stage</p>
          <p className="text-slate-400 text-xs mt-1">
            {industry ? 'Try switching industry or ask your admin to add industry-specific content.' : 'Admins can add content in the Admin panel.'}
          </p>
        </div>
      )}
    </div>
  )
}
