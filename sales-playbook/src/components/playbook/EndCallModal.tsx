'use client'

import { useState } from 'react'
import { PreCallContext, CallIntent, INTENT_CONFIG, NEXT_STEP_OPTIONS, CallRecord } from '@/types'
import { saveCall } from '@/lib/firestore'
import { industryName } from '@/lib/industries'

interface Props {
  context: PreCallContext | null
  notes: string
  signals?: string[]
  preferredNextStep?: string
  onClose: () => void
  onSaved: () => void
}

export default function EndCallModal({ context, notes, signals = [], preferredNextStep = '', onClose, onSaved }: Props) {
  const [editedNotes, setEditedNotes] = useState(notes)
  const [intent, setIntent] = useState<CallIntent | null>(null)
  const [nextStep, setNextStep] = useState(preferredNextStep)
  const [nextStepNotes, setNextStepNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const configured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'YOUR_PROJECT_ID'

  async function handleSave() {
    if (!intent) { setError('Please select a lead intent before saving.'); return }
    if (!nextStep) { setError('Please select a next step before saving.'); return }

    setSaving(true)
    setError('')

    const record: Omit<CallRecord, 'id' | 'createdAt'> = {
      repName:        context?.repName        ?? 'Unknown',
      companyName:    context?.companyName    ?? '',
      industry:       context?.industry       ?? '',
      contactName:    context?.contactName    ?? '',
      contactTitle:   context?.contactTitle   ?? '',
      companySize:    context?.companySize    ?? '',
      leadSource:     context?.leadSource     ?? '',
      currentSolution: context?.currentSolution ?? '',
      knownPainPoints: context?.knownPainPoints ?? '',
      notes: editedNotes,
      intent,
      nextStep,
      nextStepNotes,
    }

    try {
      await saveCall(record)
      onSaved()
    } catch (err) {
      console.error(err)
      setError('Failed to save to Firestore. Check your Firebase config in .env.local.')
      setSaving(false)
    }
  }

  const intents: { id: CallIntent; icon: string; label: string; sublabel: string; bg: string; ring: string; selectedBg: string }[] = [
    { id: 'highintent',  icon: '🔥', label: 'High Intent',    sublabel: '#highintent',  bg: 'border-slate-200 hover:border-emerald-400', ring: 'ring-emerald-500', selectedBg: 'border-emerald-500 bg-emerald-50' },
    { id: 'exploratory', icon: '🔍', label: 'Exploratory',    sublabel: '#exploratory', bg: 'border-slate-200 hover:border-blue-400',    ring: 'ring-blue-500',    selectedBg: 'border-blue-500 bg-blue-50' },
    { id: 'timing',      icon: '⏰', label: 'Not Right Time', sublabel: '#timing',      bg: 'border-slate-200 hover:border-amber-400',   ring: 'ring-amber-500',   selectedBg: 'border-amber-500 bg-amber-50' },
    { id: 'notafit',     icon: '✗',  label: 'Not a Fit',      sublabel: '#notafit',     bg: 'border-slate-200 hover:border-red-400',     ring: 'ring-red-500',     selectedBg: 'border-red-500 bg-red-50' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">End of Call Summary</h2>
            {context?.companyName && (
              <p className="text-sm text-slate-500 mt-0.5">
                {context.companyName}
                {context.contactName ? ` · ${context.contactName}` : ''}
                {context.industry ? ` · ${industryName(context.industry)}` : ''}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition mt-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Identified gaps summary */}
          {signals.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Gaps identified this call</p>
              <div className="flex flex-wrap gap-1.5">
                {signals.map((label, i) => (
                  <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Firebase not configured warning */}
          {!configured && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              ⚠️ Firebase not configured — the record won't be saved to a database. Add your Firebase config to <code className="bg-amber-100 px-1 rounded">.env.local</code> to enable saving.
            </div>
          )}

          {/* Intent selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              How would you categorize this lead? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {intents.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setIntent(item.id)}
                  className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition ${
                    intent === item.id ? item.selectedBg : item.bg
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`text-xs font-semibold text-center leading-tight ${intent === item.id ? 'text-slate-800' : 'text-slate-600'}`}>
                    {item.label}
                  </span>
                  <span className="text-xs text-slate-400">{item.sublabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Next step */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Agreed Next Step <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <select
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select next step…</option>
                {NEXT_STEP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <input
              value={nextStepNotes}
              onChange={(e) => setNextStepNotes(e.target.value)}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes on next step (e.g. date, who to include)…"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Call Notes
            </label>
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              rows={6}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="No notes taken during this call."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Call Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
