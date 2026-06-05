'use client'

import { SIGNALS } from '@/lib/signals'
import { getPitchOpener } from '@/lib/pitchBriefing'

const CHIP_STYLE: Record<string, string> = {
  blue:   'bg-blue-500/20 text-blue-200 border border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-200 border border-purple-500/30',
  red:    'bg-red-500/20 text-red-200 border border-red-500/30',
  amber:  'bg-amber-500/20 text-amber-200 border border-amber-500/30',
  orange: 'bg-orange-500/20 text-orange-200 border border-orange-500/30',
  slate:  'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  indigo: 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30',
}

interface Props {
  signalIds: string[]
}

export default function PitchBriefing({ signalIds }: Props) {
  if (signalIds.length === 0) {
    return (
      <div className="mx-6 mt-4 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
        <p className="text-xs text-slate-400">
          No gaps tagged in discovery — head back to tag what you heard and the pitch will tailor itself.
        </p>
      </div>
    )
  }

  const signals = signalIds.map((id) => SIGNALS.find((s) => s.id === id)).filter(Boolean) as typeof SIGNALS
  const opener = getPitchOpener(signalIds)

  return (
    <div className="mx-6 mt-4 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-slate-800">
        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          Tailored to this conversation — {signalIds.length} gap{signalIds.length !== 1 ? 's' : ''} identified
        </p>
      </div>

      {/* Gaps */}
      <div className="px-4 py-3 flex flex-wrap gap-1.5 border-b border-slate-800">
        {signals.map((s) => (
          <span key={s.id} className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${CHIP_STYLE[s.color]}`}>
            {s.emoji} {s.label}
          </span>
        ))}
      </div>

      {/* Opener */}
      <div className="px-4 py-3">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1.5">How to open this pitch</p>
        <p className="text-sm text-white leading-relaxed">{opener}</p>
      </div>

      {/* Which talking points to lead with */}
      <div className="px-4 pb-3 pt-1 border-t border-slate-800">
        <p className="text-xs text-slate-500 mb-1">Lead with the talking points that address their gaps — then cover the rest.</p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from(new Set(signals.flatMap((s) => s.pitchTpIds))).map((tpId) => {
            const labels: Record<string, string> = {
              'p-tp-cep': '🔒 CEP security perimeter',
              'p-tp-cameyo': '🖥️ Cameyo app delivery',
              'p-tp-byod': '📱 BYOD managed profile',
              'p-tp-deployment': '⚡ Fast deployment',
              'p-tp-integration': '🔗 Workspace / Microsoft fit',
            }
            return (
              <span key={tpId} className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
                {labels[tpId] ?? tpId}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
