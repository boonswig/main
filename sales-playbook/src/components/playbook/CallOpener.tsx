'use client'

import { useState, useEffect } from 'react'
import { PreCallContext, OpenerStyle, OpenerRule } from '@/types'

// Default styles (used if playbook.openerStyles is empty/unset)
const DEFAULT_STYLES: OpenerStyle[] = [
  {
    id: 'consultative',
    label: 'Consultative',
    tag: 'Question-led',
    tagColorKey: 'blue',
    opener: `Hi {{name}}, great to connect — thanks for making the time. Before I tell you anything about what we do, I'd love to understand your setup first. It means anything I share will actually be relevant to you rather than a generic pitch. Would that be OK?`,
    agenda: `My plan for today: a few questions about how your team handles browsers, applications, and security — then I'll share specifically what Chrome Enterprise Premium and Cameyo do — and we'll decide together whether there's a fit. Does that sound useful?`,
    bridge: `Great. Let me start with browsers — it's usually where we find the most interesting gaps. How are browsers managed across {{company}} today?`,
  },
  {
    id: 'challenger',
    label: 'Challenger',
    tag: 'Insight-led',
    tagColorKey: 'amber',
    opener: `Hi {{name}}, thanks for making time. I looked at a few companies your size before this call and there are usually two or three things around browser security and application delivery that create real risk — often without anyone on the IT side realising it until it becomes a problem. I'd like to ask you a few questions to see whether any of those apply to {{company}}.`,
    agenda: `I'll keep it focused — a few questions about your environment, then a targeted view of where Chrome Enterprise Premium and Cameyo fit in. If it's not relevant, I'll tell you straight and we can wrap up early. Fair?`,
    bridge: `Let me start here: how are browsers managed across your organisation today — does IT push policies centrally, or are users largely running whatever they like?`,
  },
  {
    id: 'direct',
    label: 'Direct',
    tag: 'No-fluff',
    tagColorKey: 'slate',
    opener: `Hi {{name}}, good to speak. Quick intro — I work with companies your size on two things: securing the browser layer across managed and unmanaged devices, and modernising legacy Windows application delivery without VDI infrastructure. Rather than pitch you straight away, three quick questions to understand your setup, and I'll be honest about whether we can actually help.`,
    agenda: `Questions about your environment, then what Chrome Enterprise Premium and Cameyo do, then an honest conversation about fit. Shouldn't take long.`,
    bridge: `First question: how are browsers managed at {{company}} today?`,
  },
  {
    id: 'warm',
    label: 'Warm',
    tag: 'Relationship-first',
    tagColorKey: 'green',
    opener: `Hi {{name}}, really good to meet you. I always find these calls are much more useful when I take the time to understand what someone's actually dealing with day-to-day before I start talking about products. So if it's OK with you, I'd love to hear a bit about your setup first.`,
    agenda: `I'll ask a few questions about your environment, then share what Chrome Enterprise Premium and Cameyo can do, and we'll have a proper conversation about whether there's a fit. No pressure — just a useful chat. Sound good?`,
    bridge: `Brilliant. So tell me about {{company}} — how are things managed from a browser and application standpoint today? Centralised IT, or more distributed?`,
  },
]

const TAG_COLORS: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700',
  amber:  'bg-amber-100 text-amber-700',
  slate:  'bg-slate-100 text-slate-600',
  green:  'bg-emerald-100 text-emerald-700',
  purple: 'bg-purple-100 text-purple-700',
  red:    'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  teal:   'bg-teal-100 text-teal-700',
}

function fillTemplate(template: string, name: string, company: string): string {
  return template
    .replace(/\{\{name\}\}/g, name || '[Name]')
    .replace(/\{\{company\}\}/g, company || 'your organisation')
}

function autoSelectStyle(
  rules: OpenerRule[],
  context: PreCallContext | null
): string | null {
  if (!context || rules.length === 0) return null
  const title = (context.contactTitle ?? '').toLowerCase()
  const industry = (context.industry ?? '').toLowerCase()

  const matches = rules
    .filter((rule) => {
      const titleMatch =
        rule.titleKeywords.length === 0 ||
        rule.titleKeywords.some((kw) => title.includes(kw.toLowerCase()))
      const industryMatch =
        rule.industries.length === 0 ||
        rule.industries.some((ind) => industry.includes(ind.toLowerCase()))
      return titleMatch && industryMatch
    })
    .sort((a, b) => b.priority - a.priority)

  return matches[0]?.styleId ?? null
}

interface Props {
  context: PreCallContext | null
  openerStyles?: OpenerStyle[]
  openerRules?: OpenerRule[]
}

export default function CallOpener({ context, openerStyles, openerRules }: Props) {
  const styles = openerStyles?.length ? openerStyles : DEFAULT_STYLES
  const rules  = openerRules ?? []

  const [selectedId, setSelectedId] = useState(styles[0]?.id ?? 'consultative')
  const [autoSelectedId, setAutoSelectedId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)

  // Auto-select on mount / when context or rules change
  useEffect(() => {
    const best = autoSelectStyle(rules, context)
    if (best && styles.find((s) => s.id === best)) {
      setSelectedId(best)
      setAutoSelectedId(best)
    }
  }, [context?.contactTitle, context?.industry, rules.length])

  const name    = context?.contactName?.split(' ')[0] ?? ''
  const company = context?.companyName ?? ''

  const style = styles.find((s) => s.id === selectedId) ?? styles[0]
  if (!style) return null

  const parts = {
    opener: fillTemplate(style.opener, name, company),
    agenda: style.agenda,
    bridge: fillTemplate(style.bridge, name, company),
  }

  function handleCopy() {
    const full = [
      `OPENING LINE\n${parts.opener}`,
      `AGENDA\n${parts.agenda}`,
      `FIRST QUESTION\n${parts.bridge}`,
    ].join('\n\n')
    navigator.clipboard.writeText(full).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tagClass = TAG_COLORS[style.tagColorKey] ?? 'bg-slate-100 text-slate-600'

  return (
    <div className="mx-6 mt-4 rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🎙️</span>
          <span className="text-sm font-bold text-slate-800">Call Opener</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagClass}`}>
            {style.label}
          </span>
          {autoSelectedId === selectedId && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Auto-selected
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <>
          {/* Style selector */}
          <div className="px-5 pb-3 flex gap-2 flex-wrap border-b border-slate-100">
            {styles.map((s) => {
              const tc = TAG_COLORS[s.tagColorKey] ?? 'bg-slate-100 text-slate-600'
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelectedId(s.id); setAutoSelectedId(null) }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                    s.id === selectedId
                      ? 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-200 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  {s.label}
                  <span className="ml-1.5 hidden sm:inline opacity-60">{s.tag}</span>
                </button>
              )
            })}
          </div>

          {/* Script */}
          <div className="px-5 py-4 space-y-4">
            <ScriptBlock label="Opening line"    number={1} text={parts.opener} hint="Get their agreement before starting discovery." />
            <ScriptBlock label="Set the agenda"  number={2} text={parts.agenda} hint="Frame the call — questions → pitch → next steps. Gets their buy-in upfront." />
            <ScriptBlock label="Into discovery"  number={3} text={parts.bridge} hint="First discovery question — leads naturally into the cards below." />
          </div>

          {/* Footer */}
          <div className="px-5 pb-4 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {name ? `Using contact: ${name}` : 'Add contact name in pre-call for personalised script'}
              {company ? ` · ${company}` : ''}
            </p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy script
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function ScriptBlock({ label, number, text, hint }: { label: string; number: number; text: string; hint: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
          {number}
        </span>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</p>
      </div>
      <div className="ml-7 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
        <p className="text-sm text-slate-800 leading-relaxed italic">&ldquo;{text}&rdquo;</p>
      </div>
      <p className="ml-7 mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  )
}
