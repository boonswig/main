'use client'

import { useState } from 'react'
import { PreCallContext } from '@/types'

interface ScriptParts {
  opener: string
  agenda: string
  bridge: string
}

interface Style {
  id: string
  label: string
  tag: string
  tagColor: string
  build: (name: string, company: string) => ScriptParts
}

const STYLES: Style[] = [
  {
    id: 'consultative',
    label: 'Consultative',
    tag: 'Question-led',
    tagColor: 'bg-blue-100 text-blue-700',
    build: (name, company) => ({
      opener: `Hi ${name || '[Name]'}, great to connect — thanks for making the time. Before I tell you anything about what we do, I'd love to understand your setup first. It means anything I share will actually be relevant to you rather than a generic pitch. Would that be OK?`,
      agenda: `My plan for today: a few questions about how your team handles browsers, applications, and security — then I'll share specifically what Chrome Enterprise Premium and Cameyo do — and we'll decide together whether there's a fit. Does that sound useful?`,
      bridge: `Great. Let me start with browsers — it's usually where we find the most interesting gaps. How are browsers managed across ${company || 'your organisation'} today?`,
    }),
  },
  {
    id: 'challenger',
    label: 'Challenger',
    tag: 'Insight-led',
    tagColor: 'bg-amber-100 text-amber-700',
    build: (name, company) => ({
      opener: `Hi ${name || '[Name]'}, thanks for making time. I looked at a few companies your size before this call and there are usually two or three things around browser security and application delivery that create real risk — often without anyone on the IT side realising it until it becomes a problem. I'd like to ask you a few questions to see whether any of those apply to ${company || 'your organisation'}.`,
      agenda: `I'll keep it focused — a few questions about your environment, then a targeted view of where Chrome Enterprise Premium and Cameyo fit in. If it's not relevant, I'll tell you straight and we can wrap up early. Fair?`,
      bridge: `Let me start here: how are browsers managed across your organisation today — does IT push policies centrally, or are users largely running whatever they like?`,
    }),
  },
  {
    id: 'direct',
    label: 'Direct',
    tag: 'No-fluff',
    tagColor: 'bg-slate-100 text-slate-600',
    build: (name, company) => ({
      opener: `Hi ${name || '[Name]'}, good to speak. Quick intro — I work with companies your size on two things: securing the browser layer across managed and unmanaged devices, and modernising legacy Windows application delivery without VDI infrastructure. Rather than pitch you straight away, three quick questions to understand your setup, and I'll be honest about whether we can actually help.`,
      agenda: `Questions about your environment, then what Chrome Enterprise Premium and Cameyo do, then an honest conversation about fit. Shouldn't take long.`,
      bridge: `First question: how are browsers managed at ${company || 'your organisation'} today?`,
    }),
  },
  {
    id: 'warm',
    label: 'Warm',
    tag: 'Relationship-first',
    tagColor: 'bg-emerald-100 text-emerald-700',
    build: (name, company) => ({
      opener: `Hi ${name || '[Name]'}, really good to meet you. I always find these calls are much more useful when I take the time to understand what someone's actually dealing with day-to-day before I start talking about products. So if it's OK with you, I'd love to hear a bit about your setup first.`,
      agenda: `I'll ask a few questions about your environment, then share what Chrome Enterprise Premium and Cameyo can do, and we'll have a proper conversation about whether there's a fit. No pressure — just a useful chat. Sound good?`,
      bridge: `Brilliant. So tell me about ${company || 'your organisation'} — how are things managed from a browser and application standpoint today? Centralised IT, or more distributed?`,
    }),
  },
]

interface Props {
  context: PreCallContext | null
}

export default function CallOpener({ context }: Props) {
  const [selectedId, setSelectedId] = useState('consultative')
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)

  const name = context?.contactName?.split(' ')[0] ?? ''
  const company = context?.companyName ?? ''

  const style = STYLES.find((s) => s.id === selectedId) ?? STYLES[0]
  const parts = style.build(name, company)

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
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.tagColor}`}>
            {style.label}
          </span>
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
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                  s.id === selectedId
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-slate-200 text-slate-500 hover:border-slate-400'
                }`}
              >
                {s.label}
                <span className={`ml-1.5 hidden sm:inline opacity-60`}>{s.tag}</span>
              </button>
            ))}
          </div>

          {/* Script */}
          <div className="px-5 py-4 space-y-4">
            <ScriptBlock
              label="Opening line"
              number={1}
              text={parts.opener}
              hint="Get their agreement before starting discovery."
            />
            <ScriptBlock
              label="Set the agenda"
              number={2}
              text={parts.agenda}
              hint="Frame the call — questions → pitch → next steps. Gets their buy-in upfront."
            />
            <ScriptBlock
              label="Into discovery"
              number={3}
              text={parts.bridge}
              hint="First discovery question — leads naturally into the cards below."
            />
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
