'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { CallRecord, CallIntent, INTENT_CONFIG } from '@/types'
import { subscribeToCalls, firestoreConfigured } from '@/lib/firestore'
import { industryName } from '@/lib/industries'
import Link from 'next/link'

// ── Helpers ────────────────────────────────────────────────────────────────

function BarChart({ items, max, colorClass = 'bg-blue-500' }: {
  items: { label: string; count: number }[]
  max: number
  colorClass?: string
}) {
  if (items.length === 0) return <p className="text-xs text-slate-400 py-4 text-center">No data yet</p>
  return (
    <div className="space-y-2">
      {items.map(({ label, count }) => (
        <div key={label} className="flex items-center gap-3">
          <div className="w-36 flex-shrink-0 text-xs text-slate-600 truncate text-right">{label}</div>
          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
              style={{ width: max > 0 ? `${(count / max) * 100}%` : '0%' }}
            />
          </div>
          <span className="w-6 text-xs font-semibold text-slate-700 flex-shrink-0">{count}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, color = 'text-slate-900' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg
          key={s}
          className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
          fill="currentColor" viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

// ── Weekly buckets ─────────────────────────────────────────────────────────

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))
  return monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ── Main component ─────────────────────────────────────────────────────────

export default function DashboardClient() {
  const [calls, setCalls] = useState<CallRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterIntent, setFilterIntent] = useState<CallIntent | ''>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!firestoreConfigured) { setLoading(false); return }
    setLoading(true)
    const unsub = subscribeToCalls(
      (records) => { setCalls(records); setLoading(false) },
      filterIntent ? { intent: filterIntent } : undefined,
    )
    return unsub
  }, [filterIntent])

  const allCalls = useMemo(() => calls, [calls])

  // ── Analytics ──────────────────────────────────────────────────────────
  const intentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allCalls.forEach((c) => { if (c.intent) counts[c.intent] = (counts[c.intent] ?? 0) + 1 })
    return counts
  }, [allCalls])

  const topSignals = useMemo(() => {
    const counts: Record<string, number> = {}
    allCalls.forEach((c) => {
      c.signals?.forEach((s) => { counts[s] = (counts[s] ?? 0) + 1 })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => ({ label, count }))
  }, [allCalls])

  const topNextSteps = useMemo(() => {
    const counts: Record<string, number> = {}
    allCalls.forEach((c) => { if (c.nextStep) counts[c.nextStep] = (counts[c.nextStep] ?? 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }))
  }, [allCalls])

  const topIndustries = useMemo(() => {
    const counts: Record<string, number> = {}
    allCalls.forEach((c) => { if (c.industry) counts[c.industry] = (counts[c.industry] ?? 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, count]) => ({ label: industryName(id), count }))
  }, [allCalls])

  const ratingData = useMemo(() => {
    const rated = allCalls.filter((c) => c.toolRating != null)
    if (rated.length === 0) return null
    const avg = rated.reduce((s, c) => s + (c.toolRating ?? 0), 0) / rated.length
    const dist: number[] = [0,0,0,0,0]
    rated.forEach((c) => { if (c.toolRating) dist[c.toolRating - 1]++ })
    return { avg: Math.round(avg * 10) / 10, total: rated.length, dist }
  }, [allCalls])

  const repActivity = useMemo(() => {
    const counts: Record<string, number> = {}
    allCalls.forEach((c) => { if (c.repName) counts[c.repName] = (counts[c.repName] ?? 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => ({ label, count }))
  }, [allCalls])

  const weeklyTrend = useMemo(() => {
    const buckets: Record<string, number> = {}
    allCalls.forEach((c) => {
      if (!c.createdAt) return
      const week = getWeekLabel(c.createdAt)
      buckets[week] = (buckets[week] ?? 0) + 1
    })
    return Object.entries(buckets).slice(-8).map(([label, count]) => ({ label, count }))
  }, [allCalls])

  const conversionRate = useMemo(() => {
    if (allCalls.length === 0) return null
    const hi = allCalls.filter((c) => c.intent === 'highintent').length
    return Math.round((hi / allCalls.length) * 100)
  }, [allCalls])

  const intents: CallIntent[] = ['highintent', 'exploratory', 'timing', 'notafit']
  const maxSignal = topSignals[0]?.count ?? 1
  const maxNextStep = topNextSteps[0]?.count ?? 1
  const maxIndustry = topIndustries[0]?.count ?? 1
  const maxWeekly = Math.max(...weeklyTrend.map((w) => w.count), 1)
  const maxRep = repActivity[0]?.count ?? 1

  if (!firestoreConfigured) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Firebase not configured</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Add your Firebase config to <code className="bg-slate-100 px-1 rounded">.env.local</code> to enable call record storage and dashboard analytics.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── Top stat cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Calls" value={allCalls.length} sub={`${weeklyTrend.slice(-1)[0]?.count ?? 0} this week`} />
          <StatCard
            label="High Intent"
            value={intentCounts['highintent'] ?? 0}
            sub={conversionRate != null ? `${conversionRate}% conversion` : '—'}
            color="text-emerald-600"
          />
          <StatCard
            label="Avg Tool Rating"
            value={ratingData ? `${ratingData.avg}/5` : '—'}
            sub={ratingData ? `${ratingData.total} ratings` : 'No ratings yet'}
            color="text-amber-600"
          />
          <StatCard
            label="Reps Active"
            value={repActivity.length}
            sub={repActivity[0] ? `Most active: ${repActivity[0].label.split(' ')[0]}` : '—'}
          />
        </div>

        {/* ── Intent breakdown ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {intents.map((intent) => {
            const cfg = INTENT_CONFIG[intent]
            const count = intentCounts[intent] ?? 0
            const pct = allCalls.length > 0 ? Math.round((count / allCalls.length) * 100) : 0
            return (
              <button
                key={intent}
                onClick={() => setFilterIntent(filterIntent === intent ? '' : intent)}
                className={`text-left bg-white rounded-2xl border-2 p-4 transition shadow-sm ${
                  filterIntent === intent ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{cfg.icon} {cfg.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{count}</p>
                <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    intent === 'highintent' ? 'bg-emerald-500' :
                    intent === 'exploratory' ? 'bg-blue-500' :
                    intent === 'timing' ? 'bg-amber-500' : 'bg-red-400'
                  }`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{pct}%</p>
              </button>
            )
          })}
        </div>

        {filterIntent && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Filtering by:</span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${INTENT_CONFIG[filterIntent].bg} ${INTENT_CONFIG[filterIntent].color}`}>
              {INTENT_CONFIG[filterIntent].icon} {INTENT_CONFIG[filterIntent].label}
            </span>
            <button onClick={() => setFilterIntent('')} className="text-xs text-slate-400 hover:text-slate-600 ml-1">Clear ×</button>
          </div>
        )}

        {/* ── Analytics grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Top signals */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Top Discovery Signals</h3>
            <p className="text-xs text-slate-400 mb-4">Most common pain points tagged during discovery</p>
            {loading ? (
              <div className="space-y-2 animate-pulse">{[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded" />)}</div>
            ) : topSignals.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Signals appear here once reps complete the end-of-call flow with tagged discovery chips.
              </p>
            ) : (
              <BarChart items={topSignals} max={maxSignal} colorClass="bg-blue-500" />
            )}
          </div>

          {/* Next step mix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Next Step Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">What reps are agreeing as next steps</p>
            {loading ? (
              <div className="space-y-2 animate-pulse">{[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded" />)}</div>
            ) : (
              <BarChart items={topNextSteps} max={maxNextStep} colorClass="bg-emerald-500" />
            )}
          </div>

          {/* Industry mix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Industry Mix</h3>
            <p className="text-xs text-slate-400 mb-4">Which industries reps are calling into</p>
            {loading ? (
              <div className="space-y-2 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded" />)}</div>
            ) : (
              <BarChart items={topIndustries} max={maxIndustry} colorClass="bg-purple-500" />
            )}
          </div>

          {/* Tool rating */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Playbook Rating</h3>
            <p className="text-xs text-slate-400 mb-4">Rep feedback on playbook usefulness</p>
            {loading ? (
              <div className="space-y-2 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded" />)}</div>
            ) : !ratingData ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Ratings appear after reps submit end-of-call feedback.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-slate-900">{ratingData.avg}</span>
                  <div>
                    <StarRating rating={ratingData.avg} />
                    <p className="text-xs text-slate-400 mt-0.5">{ratingData.total} rating{ratingData.total !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[5,4,3,2,1].map((star) => {
                    const count = ratingData.dist[star - 1]
                    const pct = ratingData.total > 0 ? (count / ratingData.total) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-4">{star}</span>
                        <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 w-4">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Weekly call volume */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Weekly Call Volume</h3>
            <p className="text-xs text-slate-400 mb-4">Calls completed per week (Monday–Sunday)</p>
            {loading ? (
              <div className="flex items-end gap-2 h-24 animate-pulse">
                {[...Array(8)].map((_, i) => <div key={i} className="flex-1 bg-slate-100 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />)}
              </div>
            ) : weeklyTrend.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No data yet.</p>
            ) : (
              <div className="flex items-end gap-1.5 h-24">
                {weeklyTrend.map(({ label, count }) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-slate-500">{count}</span>
                    <div
                      className="w-full bg-blue-500 rounded-t-sm"
                      style={{ height: `${maxWeekly > 0 ? (count / maxWeekly) * 64 : 4}px` }}
                      title={`${label}: ${count} calls`}
                    />
                    <span className="text-[9px] text-slate-400 truncate w-full text-center">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rep activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Rep Activity</h3>
            <p className="text-xs text-slate-400 mb-4">Calls logged per rep</p>
            {loading ? (
              <div className="space-y-2 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded" />)}</div>
            ) : (
              <BarChart items={repActivity} max={maxRep} colorClass="bg-teal-500" />
            )}
          </div>

        </div>

        {/* ── Call log ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Call Log</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Loading…</div>
          ) : calls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-sm">
              <p className="text-base font-medium text-slate-600">No call records yet</p>
              <p className="mt-1">Records appear here after reps complete the end-of-call flow</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rep</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Intent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Next Step</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calls.map((call) => {
                  const cfg = call.intent ? INTENT_CONFIG[call.intent] : null
                  const rowKey = call.id ?? call.createdAt
                  const isExpanded = expandedId === rowKey
                  const dateStr = call.createdAt
                    ? new Date(call.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'
                  return (
                    <React.Fragment key={rowKey}>
                      <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rowKey)}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{call.companyName || '—'}</p>
                          {call.contactName && <p className="text-xs text-slate-500">{call.contactName}{call.contactTitle ? ` · ${call.contactTitle}` : ''}</p>}
                          {call.industry && <p className="text-xs text-slate-400">{industryName(call.industry)}</p>}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{call.repName || '—'}</td>
                        <td className="px-4 py-3">
                          {cfg && (
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs max-w-[160px] truncate">{call.nextStep || '—'}</td>
                        <td className="px-4 py-3">
                          {call.toolRating ? <StarRating rating={call.toolRating} /> : <span className="text-xs text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{dateStr}</td>
                        <td className="px-4 py-3 text-slate-400">
                          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-6 text-sm">
                              <div className="space-y-2">
                                {call.companySize && <p><span className="font-medium text-slate-600">Size:</span> <span className="text-slate-700">{call.companySize}</span></p>}
                                {call.leadSource && <p><span className="font-medium text-slate-600">Source:</span> <span className="text-slate-700">{call.leadSource}</span></p>}
                                {call.currentSolution && <p><span className="font-medium text-slate-600">Current:</span> <span className="text-slate-700">{call.currentSolution}</span></p>}
                                {call.nextStepNotes && <p><span className="font-medium text-slate-600">Next step notes:</span> <span className="text-slate-700">{call.nextStepNotes}</span></p>}
                                {call.signals && call.signals.length > 0 && (
                                  <div>
                                    <p className="font-medium text-slate-600 mb-1">Signals tagged:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {call.signals.map((s, i) => (
                                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                {call.notes ? (
                                  <>
                                    <p className="font-medium text-slate-600 mb-1.5">Call Notes</p>
                                    <p className="text-slate-700 whitespace-pre-wrap text-xs leading-relaxed bg-white border border-slate-200 rounded-lg px-3 py-2.5">{call.notes}</p>
                                  </>
                                ) : (
                                  <p className="text-slate-400 text-xs">No call notes recorded.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}

function DashboardNav() {
  return (
    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <span className="text-white font-semibold text-sm">Sales Dashboard</span>
      </div>
      <Link href="/playbook" className="text-slate-400 hover:text-slate-200 text-xs transition">
        ← Back to Playbook
      </Link>
    </div>
  )
}
