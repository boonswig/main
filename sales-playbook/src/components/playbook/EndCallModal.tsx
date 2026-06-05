'use client'

import { useState } from 'react'
import { PreCallContext, CallIntent, INTENT_CONFIG, NEXT_STEP_OPTIONS, CallRecord } from '@/types'
import { saveCall } from '@/lib/firestore'
import { industryName } from '@/lib/industries'
import type { GenerateEmailPayload } from '@/app/api/generate-email/route'

interface Props {
  context: PreCallContext | null
  notes: string
  signals?: string[]
  preferredNextStep?: string
  onClose: () => void
  onSaved: () => void
}

function generateCRMSummary(
  context: PreCallContext | null,
  signals: string[],
  intent: CallIntent | null,
  nextStep: string,
  nextStepNotes: string,
  notes: string
): string {
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const lines: string[] = [`=== CALL LOG — ${date} ===`, '']

  lines.push(`Company:  ${context?.companyName || '—'}`)
  lines.push(`Contact:  ${context?.contactName || '—'}${context?.contactTitle ? ` (${context.contactTitle})` : ''}`)
  if (context?.industry) lines.push(`Industry: ${industryName(context.industry)}${context.companySize ? ` | Size: ${context.companySize}` : ''}`)
  if (context?.leadSource) lines.push(`Source:   ${context.leadSource}`)
  if (context?.currentSolution) lines.push(`Current:  ${context.currentSolution}`)

  if (signals.length > 0) {
    lines.push('')
    lines.push('Gaps / Signals:')
    signals.forEach((s) => lines.push(`  • ${s}`))
  }

  lines.push('')
  lines.push(`Intent:    ${intent ? INTENT_CONFIG[intent].label : '—'}`)
  lines.push(`Next Step: ${nextStep || '—'}`)
  if (nextStepNotes) lines.push(`           ${nextStepNotes}`)

  if (notes.trim()) {
    lines.push('')
    lines.push('Notes:')
    lines.push(notes.trim())
  }

  return lines.join('\n')
}

function generateEmailDraft(
  context: PreCallContext | null,
  signals: string[],
  nextStep: string,
  nextStepNotes: string
): { subject: string; body: string } {
  const firstName = context?.contactName?.split(' ')[0] || 'there'
  const company = context?.companyName || 'your organisation'
  const rep = context?.repName || ''

  const hasCameyo = signals.some((s) =>
    /legacy|windows|citrix|vdi|app delivery/i.test(s)
  )
  const productLine = hasCameyo ? 'Chrome Enterprise Premium and Cameyo' : 'Chrome Enterprise Premium'

  const signalRef =
    signals.length === 0
      ? 'what we discussed today'
      : signals.length === 1
      ? `the ${signals[0].toLowerCase()} challenge you described`
      : `the ${signals.slice(0, 2).map((s) => s.toLowerCase()).join(' and ')} gaps you mentioned`

  const subjectMap: Record<string, string> = {
    'Follow-up email':          `Following up — ${company} + Chrome Enterprise`,
    'Send proposal / quote':    `Proposal — Chrome Enterprise Premium for ${company}`,
    'Product demo scheduled':   `Your Chrome Enterprise demo`,
    'Discovery call scheduled': `Next steps — ${company}`,
    'Nurture sequence':         `Great connecting today`,
    'Technical review / POC':   `Technical deep-dive — next steps for ${company}`,
    'Contract sent':            `Chrome Enterprise — contract`,
    'No next step agreed':      `Following up — ${company}`,
  }
  const subject = subjectMap[nextStep] ?? `Following up — ${company}`

  let body: string

  if (nextStep === 'Product demo scheduled') {
    body = `Hi ${firstName},

Really enjoyed our conversation — thanks for taking the time.

Based on ${signalRef}, I'll tailor the demo around your specific situation so you see exactly how ${productLine} addresses what you're dealing with right now.

${nextStepNotes ? `As discussed — ${nextStepNotes}\n\n` : ''}A quick agenda for the session:
• [Agenda item 1 — tailored to their environment]
• [Agenda item 2]
• Q&A and agreed next steps

Let me know if there's anything specific you'd like us to cover, or anyone else you'd like to include.

Looking forward to it.

${rep}`
  } else if (nextStep === 'Send proposal / quote') {
    body = `Hi ${firstName},

Great speaking today. Based on ${signalRef}, I'm putting together a proposal that maps ${productLine} directly to your environment and use case.

You'll receive it by [date]. It'll include:
• Recommended configuration based on what you described
• Indicative pricing for your team size
• Proposed pilot scope and timeline

${nextStepNotes ? `${nextStepNotes}\n\n` : ''}Any questions in the meantime, just reply here.

${rep}`
  } else if (nextStep === 'Technical review / POC') {
    body = `Hi ${firstName},

Thanks for today — really useful context on ${signalRef}.

I'll set up a technical session with our solutions team so we can go deeper on your environment. They'll be able to address the specifics around [relevant technical area] and scope a proof of concept around your setup.

${nextStepNotes ? `${nextStepNotes}\n\n` : ''}I'll send a calendar invite shortly with the relevant team copied.

${rep}`
  } else if (nextStep === 'Discovery call scheduled') {
    body = `Hi ${firstName},

Really useful conversation today — thanks for the time.

Looking forward to going deeper on ${signalRef} in our next session. I'll send a short agenda beforehand so we make the most of the time.

${nextStepNotes ? `${nextStepNotes}\n\n` : ''}Speak soon.

${rep}`
  } else if (nextStep === 'Contract sent') {
    body = `Hi ${firstName},

As discussed, I'm sending across the contract for ${productLine} for ${company}.

Please review at your convenience — happy to walk through any sections together if useful.${nextStepNotes ? ` ${nextStepNotes}` : ''}

Looking forward to getting you started.

${rep}`
  } else if (nextStep === 'Nurture sequence') {
    body = `Hi ${firstName},

Great connecting today. Even if the timing isn't quite right, I wanted to share a couple of resources based on ${signalRef} that might be useful as you think this through.

• [Resource 1 — e.g. CEP security benchmark / customer story]
• [Resource 2 — e.g. Cameyo ROI calculator]

Happy to reconnect when the time is right — feel free to reach out whenever.

${rep}`
  } else if (nextStep === 'No next step agreed') {
    body = `Hi ${firstName},

Thanks for taking the time today.

I'll leave this with you — but if anything we discussed around ${signalRef} becomes more pressing, I'm happy to pick up the conversation.

${rep}`
  } else {
    body = `Hi ${firstName},

Really enjoyed our conversation today — thanks for your time.

Based on ${signalRef}, I think there's a strong fit for how ${productLine} can address what you're working through at ${company}.${nextStepNotes ? ` ${nextStepNotes}` : ''}

Happy to answer any questions as you think this through.

${rep}`
  }

  return { subject, body }
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
        copied
          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}

export default function EndCallModal({ context, notes, signals = [], preferredNextStep = '', onClose, onSaved }: Props) {
  const [editedNotes, setEditedNotes] = useState(notes)
  const [intent, setIntent] = useState<CallIntent | null>(null)
  const [nextStep, setNextStep] = useState(preferredNextStep)
  const [nextStepNotes, setNextStepNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [crmSummary, setCrmSummary] = useState('')
  const [emailDraft, setEmailDraft] = useState('')
  const [generatingEmail, setGeneratingEmail] = useState(false)

  const configured =
    !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'YOUR_PROJECT_ID'

  async function handleSave() {
    if (!intent) { setError('Please select a lead intent before saving.'); return }
    if (!nextStep) { setError('Please select a next step before saving.'); return }

    setSaving(true)
    setError('')

    const record: Omit<CallRecord, 'id' | 'createdAt'> = {
      repName:         context?.repName         ?? 'Unknown',
      companyName:     context?.companyName     ?? '',
      industry:        context?.industry        ?? '',
      contactName:     context?.contactName     ?? '',
      contactTitle:    context?.contactTitle    ?? '',
      companySize:     context?.companySize     ?? '',
      leadSource:      context?.leadSource      ?? '',
      currentSolution: context?.currentSolution ?? '',
      knownPainPoints: context?.knownPainPoints ?? '',
      notes: editedNotes,
      intent,
      nextStep,
      nextStepNotes,
    }

    const crm = generateCRMSummary(context, signals, intent, nextStep, nextStepNotes, editedNotes)
    setCrmSummary(crm)

    // Show the summary screen immediately — email generates in background
    const showSummary = () => {
      setSaved(true)
      setGeneratingEmail(true)

      const payload: GenerateEmailPayload = {
        repName:         context?.repName         ?? '',
        contactName:     context?.contactName     ?? '',
        contactTitle:    context?.contactTitle    ?? '',
        company:         context?.companyName     ?? '',
        industry:        context?.industry        ?? '',
        companySize:     context?.companySize     ?? '',
        currentSolution: context?.currentSolution ?? '',
        signals,
        nextStep,
        nextStepNotes,
        notes: editedNotes,
      }

      fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.subject && data?.body) {
            setEmailDraft(`Subject: ${data.subject}\n\n${data.body}`)
          } else {
            // Gemini not configured or errored — fall back to template
            const { subject, body } = generateEmailDraft(context, signals, nextStep, nextStepNotes)
            setEmailDraft(`Subject: ${subject}\n\n${body}`)
          }
        })
        .catch(() => {
          const { subject, body } = generateEmailDraft(context, signals, nextStep, nextStepNotes)
          setEmailDraft(`Subject: ${subject}\n\n${body}`)
        })
        .finally(() => setGeneratingEmail(false))
    }

    if (!configured) {
      showSummary()
      return
    }

    try {
      await saveCall(record)
      showSummary()
    } catch (err) {
      console.error(err)
      setError('Failed to save to Firestore. Check your Firebase config in .env.local.')
      setSaving(false)
    }
  }

  const intents: {
    id: CallIntent
    icon: string
    label: string
    sublabel: string
    bg: string
    selectedBg: string
  }[] = [
    { id: 'highintent',  icon: '🔥', label: 'High Intent',    sublabel: '#highintent',  bg: 'border-slate-200 hover:border-emerald-400', selectedBg: 'border-emerald-500 bg-emerald-50' },
    { id: 'exploratory', icon: '🔍', label: 'Exploratory',    sublabel: '#exploratory', bg: 'border-slate-200 hover:border-blue-400',    selectedBg: 'border-blue-500 bg-blue-50' },
    { id: 'timing',      icon: '⏰', label: 'Not Right Time', sublabel: '#timing',      bg: 'border-slate-200 hover:border-amber-400',   selectedBg: 'border-amber-500 bg-amber-50' },
    { id: 'notafit',     icon: '✗',  label: 'Not a Fit',      sublabel: '#notafit',     bg: 'border-slate-200 hover:border-red-400',     selectedBg: 'border-red-500 bg-red-50' },
  ]

  // ── Post-save summary screen ──────────────────────────────────────────────
  if (saved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Call saved</h2>
              <p className="text-sm text-slate-500 mt-0.5">Copy the summary or email draft below</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* CRM summary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-700">CRM summary</p>
                <CopyButton text={crmSummary} label="Copy to CRM" />
              </div>
              <pre className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed overflow-auto max-h-44">
                {crmSummary}
              </pre>
            </div>

            {/* Email draft */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-700">Follow-up email draft</p>
                  {generatingEmail && (
                    <span className="flex items-center gap-1.5 text-xs text-blue-600">
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Writing…
                    </span>
                  )}
                </div>
                {!generatingEmail && <CopyButton text={emailDraft} label="Copy email" />}
              </div>
              {generatingEmail ? (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-5 space-y-2.5 animate-pulse">
                  <div className="h-3 bg-slate-200 rounded w-2/5" />
                  <div className="h-3 bg-slate-200 rounded w-full mt-4" />
                  <div className="h-3 bg-slate-200 rounded w-4/5" />
                  <div className="h-3 bg-slate-200 rounded w-full mt-2" />
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-full mt-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                </div>
              ) : (
                <textarea
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  rows={16}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              )}
              {!generatingEmail && (
                <p className="text-xs text-slate-400 mt-1.5">
                  Edit above before copying. Generated from your call context — tweak as needed.
                </p>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end bg-slate-50">
            <button
              onClick={onSaved}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
            >
              Done — start new call
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Call log form ─────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
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

          {!configured && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              ⚠️ Firebase not configured — the record won&apos;t be saved to a database. Add your Firebase config to{' '}
              <code className="bg-amber-100 px-1 rounded">.env.local</code> to enable saving.
            </div>
          )}

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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Agreed Next Step <span className="text-red-500">*</span>
            </label>
            <select
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select next step…</option>
              {NEXT_STEP_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <input
              value={nextStepNotes}
              onChange={(e) => setNextStepNotes(e.target.value)}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes on next step (e.g. date, who to include)…"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Call Notes</label>
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

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">
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
