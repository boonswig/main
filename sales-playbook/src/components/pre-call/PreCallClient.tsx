'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { INDUSTRIES } from '@/lib/industries'
import { PreCallContext, CallRecord } from '@/types'
import { fetchAllCalls, firestoreConfigured } from '@/lib/firestore'

const CONTEXT_KEY = 'sales-playbook-context'

const EMPTY: PreCallContext = {
  repName: '',
  companyName: '',
  industry: '',
  companySize: '',
  leadSource: '',
  currentSolution: '',
  knownPainPoints: '',
  contactName: '',
  contactTitle: '',
  bdrNotes: '',
  timestamp: '',
  hasBudget: '',
  hasAuthority: '',
  hasNeed: '',
  hasTimeline: '',
}

export default function PreCallClient() {
  const router = useRouter()
  const [form, setForm] = useState<PreCallContext>(EMPTY)
  const [bdrNotes, setBdrNotes] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [showNotes, setShowNotes] = useState(false)

  // Previous call search
  const [recentCalls, setRecentCalls]   = useState<CallRecord[]>([])
  const [searchTerm, setSearchTerm]     = useState('')
  const [searchOpen, setSearchOpen]     = useState(false)
  const searchRef                       = useRef<HTMLDivElement>(null)

  // Pre-fill from existing context if returning mid-session
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONTEXT_KEY)
      if (saved) {
        const ctx = JSON.parse(saved) as PreCallContext
        setForm(ctx)
        if (ctx.bdrNotes) setBdrNotes(ctx.bdrNotes)
      }
    } catch {}
  }, [])

  // Load recent calls for search
  useEffect(() => {
    if (!firestoreConfigured) return
    fetchAllCalls().then(setRecentCalls).catch(() => {})
  }, [])

  // Close search dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const searchResults = searchTerm.trim().length > 1
    ? recentCalls
        .filter((c) =>
          c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.contactName?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .slice(0, 6)
    : []

  function resumeCall(record: CallRecord) {
    setForm((prev) => ({
      ...prev,
      companyName:     record.companyName     || prev.companyName,
      contactName:     record.contactName     || prev.contactName,
      contactTitle:    record.contactTitle    || prev.contactTitle,
      industry:        record.industry        || prev.industry,
      companySize:     record.companySize     || prev.companySize,
      leadSource:      record.leadSource      || prev.leadSource,
      currentSolution: record.currentSolution || prev.currentSolution,
      knownPainPoints: record.knownPainPoints || prev.knownPainPoints,
    }))
    if (record.notes) setBdrNotes(record.notes)
    setSearchTerm('')
    setSearchOpen(false)
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return '' }
  }

  function set(field: keyof PreCallContext, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleExtract() {
    if (!bdrNotes.trim()) return
    setExtracting(true)
    setExtractError('')
    try {
      const res = await fetch('/api/parse-bdr-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: bdrNotes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Extraction failed')
      const e = data.extracted
      setForm((prev) => ({
        ...prev,
        companyName:      e.companyName      || prev.companyName,
        industry:         e.industry         || prev.industry,
        companySize:      e.companySize      || prev.companySize,
        leadSource:       e.leadSource       || prev.leadSource,
        currentSolution:  e.currentSolution  || prev.currentSolution,
        knownPainPoints:  e.knownPainPoints  || prev.knownPainPoints,
        contactName:      e.contactName      || prev.contactName,
        contactTitle:     e.contactTitle     || prev.contactTitle,
        bdrNotes,
      }))
    } catch (err: unknown) {
      setExtractError(err instanceof Error ? err.message : 'Failed to extract')
    } finally {
      setExtracting(false)
    }
  }

  function handleStart() {
    const ctx: PreCallContext = { ...form, bdrNotes, timestamp: new Date().toISOString() }
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(ctx))
    router.push('/playbook')
  }

  function handleSkip() {
    localStorage.removeItem(CONTEXT_KEY)
    router.push('/playbook')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-start justify-center p-6 pt-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Pre-Call Setup</h1>
              <p className="text-slate-400 text-sm">Prepare your context before joining the call</p>
            </div>
          </div>
        </div>

        {/* ── Resume previous call ───────────────────────────── */}
        {firestoreConfigured && (
          <div ref={searchRef} className="relative mb-5">
            <div className={`bg-white/5 border rounded-2xl px-4 py-3 transition-colors ${searchOpen ? 'border-blue-400/50' : 'border-white/10'}`}>
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setSearchOpen(true) }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Find a previous call — type company or contact name…"
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                />
                {searchTerm && (
                  <button onClick={() => { setSearchTerm(''); setSearchOpen(false) }} className="text-slate-500 hover:text-slate-300 transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Results dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                {searchResults.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => resumeCall(record)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-700 transition text-left border-b border-slate-700 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{record.companyName}</span>
                        {record.contactName && (
                          <span className="text-xs text-slate-400">{record.contactName}{record.contactTitle ? ` · ${record.contactTitle}` : ''}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {record.nextStep && (
                          <span className="text-xs text-slate-500">{record.nextStep}</span>
                        )}
                        <span className="text-xs text-slate-600">{formatDate(record.createdAt)}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-400 flex-shrink-0 mt-0.5">Resume →</span>
                  </button>
                ))}
              </div>
            )}

            {searchOpen && searchTerm.trim().length > 1 && searchResults.length === 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 px-4 py-3">
                <p className="text-sm text-slate-500">No previous calls found for &ldquo;{searchTerm}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* BDR Notes section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-white font-medium">Paste BDR Notes</span>
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">AI Extract</span>
            </div>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform ${showNotes ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showNotes && (
            <div className="mt-4 space-y-3">
              <textarea
                value={bdrNotes}
                onChange={(e) => setBdrNotes(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Paste the BDR's notes here — Gemini will extract company name, industry, pain points, current solution, and contact details automatically…"
              />
              {extractError && (
                <p className="text-sm text-red-400 bg-red-900/30 rounded-lg px-3 py-2">{extractError}</p>
              )}
              <button
                onClick={handleExtract}
                disabled={!bdrNotes.trim() || extracting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-blue-400 text-white text-sm font-medium rounded-lg transition"
              >
                {extracting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Extracting…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Extract with Gemini
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Customer info form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-800">Customer Information</h2>

          {/* Rep name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Your Name (Rep)
            </label>
            <input
              value={form.repName}
              onChange={(e) => set('repName', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Alex Johnson"
            />
          </div>

          {/* Row 1: Company name + Industry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Company Name
              </label>
              <input
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Industry
              </label>
              <select
                value={form.industry}
                onChange={(e) => set('industry', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind.id} value={ind.id}>{ind.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Contact name + title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Contact Name
              </label>
              <input
                value={form.contactName}
                onChange={(e) => set('contactName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Their Title
              </label>
              <input
                value={form.contactTitle}
                onChange={(e) => set('contactTitle', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Head of Operations"
              />
            </div>
          </div>

          {/* Row 3: Company size + Lead source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Company Size
              </label>
              <select
                value={form.companySize}
                onChange={(e) => set('companySize', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select size…</option>
                <option value="1-10">1–10 (Startup)</option>
                <option value="11-50">11–50 (Small)</option>
                <option value="51-200">51–200 (Mid-market)</option>
                <option value="201-1000">201–1,000 (Growth)</option>
                <option value="1000+">1,000+ (Enterprise)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Lead Source
              </label>
              <select
                value={form.leadSource}
                onChange={(e) => set('leadSource', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select source…</option>
                <option value="Inbound demo request">Inbound demo request</option>
                <option value="Cold outreach">Cold outreach (BDR)</option>
                <option value="Referral">Referral</option>
                <option value="Event / conference">Event / conference</option>
                <option value="Paid advertising">Paid advertising</option>
                <option value="Partner referral">Partner referral</option>
                <option value="Existing customer expansion">Existing customer expansion</option>
              </select>
            </div>
          </div>

          {/* Current solution */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Current Solution / Incumbent
            </label>
            <input
              value={form.currentSolution}
              onChange={(e) => set('currentSolution', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Spreadsheets, Salesforce, homegrown system…"
            />
          </div>

          {/* Known pain points */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Known Pain Points
            </label>
            <textarea
              value={form.knownPainPoints}
              onChange={(e) => set('knownPainPoints', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What has the BDR uncovered so far? What problems have they mentioned?"
            />
          </div>

          {/* Qualification checklist */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Pre-Call Qualification Checklist</p>
            {[
              { key: 'hasBudget',     label: 'Budget confirmed or likely available' },
              { key: 'hasAuthority',  label: 'Decision-maker or champion is on the call' },
              { key: 'hasNeed',       label: 'Clear business need has been established' },
              { key: 'hasTimeline',   label: 'Timeline or urgency identified' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 py-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!!form[key as keyof PreCallContext]}
                  onChange={(e) => set(key as keyof PreCallContext, e.target.checked ? 'yes' : '')}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-5 pb-12">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-400 hover:text-slate-300 transition"
          >
            Skip setup →
          </button>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg"
          >
            Start Call
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
