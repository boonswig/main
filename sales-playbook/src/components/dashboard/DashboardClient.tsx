'use client'

import React, { useState, useEffect } from 'react'
import { CallRecord, CallIntent, INTENT_CONFIG } from '@/types'
import { subscribeToCalls } from '@/lib/firestore'
import { industryName } from '@/lib/industries'
import Link from 'next/link'

export default function DashboardClient() {
  const [calls, setCalls] = useState<CallRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterIntent, setFilterIntent] = useState<CallIntent | ''>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeToCalls(
      (records) => { setCalls(records); setLoading(false) },
      filterIntent ? { intent: filterIntent } : undefined,
    )
    return unsub
  }, [filterIntent])

  const intents: CallIntent[] = ['highintent', 'exploratory', 'timing', 'notafit']
  const countByIntent = (intent: CallIntent) => calls.filter((c) => c.intent === intent).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Calls</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{calls.length}</p>
          </div>
          {intents.map((intent) => {
            const cfg = INTENT_CONFIG[intent]
            const count = countByIntent(intent)
            const pct = calls.length > 0 ? Math.round((count / calls.length) * 100) : 0
            return (
              <button
                key={intent}
                onClick={() => setFilterIntent(filterIntent === intent ? '' : intent)}
                className={`text-left bg-white rounded-2xl shadow-sm border-2 p-5 transition ${
                  filterIntent === intent
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {cfg.icon} {cfg.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{count}</p>
                <p className="text-xs text-slate-400 mt-0.5">{pct}% of total</p>
              </button>
            )
          })}
        </div>

        {filterIntent && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-slate-600">Filtering by:</span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${INTENT_CONFIG[filterIntent].bg} ${INTENT_CONFIG[filterIntent].color}`}>
              {INTENT_CONFIG[filterIntent].icon} {INTENT_CONFIG[filterIntent].label}
            </span>
            <button onClick={() => setFilterIntent('')} className="text-xs text-slate-400 hover:text-slate-600 transition ml-1">
              Clear ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Loading…</div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm">
            <p className="text-base font-medium text-slate-600">No call records yet</p>
            <p className="mt-1">Records appear here after reps complete the end-of-call flow</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rep</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Intent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Next Step</th>
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
                    ? new Date(call.createdAt).toLocaleDateString('en-AU', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })
                    : '—'
                  return (
                    <React.Fragment key={rowKey}>
                      <tr
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : rowKey)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{call.companyName || '—'}</p>
                          {call.contactName && (
                            <p className="text-xs text-slate-500">
                              {call.contactName}{call.contactTitle ? ` · ${call.contactTitle}` : ''}
                            </p>
                          )}
                          {call.industry && (
                            <p className="text-xs text-slate-400">{industryName(call.industry)}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{call.repName || '—'}</td>
                        <td className="px-4 py-3">
                          {cfg && (
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs max-w-[180px] truncate">
                          {call.nextStep || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{dateStr}</td>
                        <td className="px-4 py-3 text-slate-400">
                          <svg
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-6 text-sm">
                              <div className="space-y-2">
                                {call.companySize && (
                                  <p><span className="font-medium text-slate-600">Size:</span> <span className="text-slate-700">{call.companySize}</span></p>
                                )}
                                {call.leadSource && (
                                  <p><span className="font-medium text-slate-600">Source:</span> <span className="text-slate-700">{call.leadSource}</span></p>
                                )}
                                {call.currentSolution && (
                                  <p><span className="font-medium text-slate-600">Current solution:</span> <span className="text-slate-700">{call.currentSolution}</span></p>
                                )}
                                {call.knownPainPoints && (
                                  <p><span className="font-medium text-slate-600">Pain points:</span> <span className="text-slate-700">{call.knownPainPoints}</span></p>
                                )}
                                {call.nextStepNotes && (
                                  <p><span className="font-medium text-slate-600">Next step notes:</span> <span className="text-slate-700">{call.nextStepNotes}</span></p>
                                )}
                              </div>
                              <div>
                                {call.notes ? (
                                  <>
                                    <p className="font-medium text-slate-600 mb-1.5">Call Notes</p>
                                    <p className="text-slate-700 whitespace-pre-wrap text-xs leading-relaxed bg-white border border-slate-200 rounded-lg px-3 py-2.5">
                                      {call.notes}
                                    </p>
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
          </div>
        )}
      </div>
    </div>
  )
}
