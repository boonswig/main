'use client'

import { Stage, PreCallContext } from '@/types'
import { Session } from 'next-auth'
import Link from 'next/link'
import { industryName } from '@/lib/industries'

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-emerald-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  red: 'bg-red-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
}

const COLOR_ACTIVE_BG: Record<string, string> = {
  blue: 'bg-blue-900/40',
  purple: 'bg-purple-900/40',
  green: 'bg-emerald-900/40',
  orange: 'bg-orange-900/40',
  teal: 'bg-teal-900/40',
  red: 'bg-red-900/40',
  pink: 'bg-pink-900/40',
  indigo: 'bg-indigo-900/40',
}

const COLOR_TEXT: Record<string, string> = {
  blue: 'text-blue-300',
  purple: 'text-purple-300',
  green: 'text-emerald-300',
  orange: 'text-orange-300',
  teal: 'text-teal-300',
  red: 'text-red-300',
  pink: 'text-pink-300',
  indigo: 'text-indigo-300',
}

interface Props {
  stages: Stage[]
  activeStageId: string
  onSelectStage: (id: string) => void
  stageProgress: (stage: Stage) => { done: number; total: number }
  session: Session | null
  onNewCall: () => void
  onSignOut: () => void
  context: PreCallContext | null
}

export default function StageSidebar({
  stages,
  activeStageId,
  onSelectStage,
  stageProgress,
  session,
  onNewCall,
  onSignOut,
  context,
}: Props) {
  return (
    <div className="w-64 flex-shrink-0 bg-slate-900 flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Sales Playbook</p>
            <p className="text-slate-400 text-xs">Live call guide</p>
          </div>
        </div>
      </div>

      {/* Customer context */}
      {context?.companyName && (
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">On call with</p>
          <p className="text-white text-sm font-semibold leading-tight truncate">{context.companyName}</p>
          {context.contactName && (
            <p className="text-slate-400 text-xs mt-0.5 truncate">{context.contactName}{context.contactTitle ? ` · ${context.contactTitle}` : ''}</p>
          )}
          {context.industry && (
            <span className="inline-block mt-1.5 text-xs bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-full">
              {industryName(context.industry)}
            </span>
          )}
        </div>
      )}

      {/* New Call button */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={onNewCall}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Call
        </button>
      </div>

      {/* Stage list */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 pb-1">Stages</p>
        {stages.map((stage, idx) => {
          const { done, total } = stageProgress(stage)
          const isActive = stage.id === activeStageId
          const isComplete = total > 0 && done === total
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          const dot = COLOR_MAP[stage.color] ?? 'bg-slate-500'
          const activeBg = COLOR_ACTIVE_BG[stage.color] ?? 'bg-slate-800'
          const activeText = COLOR_TEXT[stage.color] ?? 'text-slate-300'

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className={`w-full text-left px-3 py-3 rounded-xl transition group ${
                isActive ? `${activeBg} ring-1 ring-white/10` : 'hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Step number / completion indicator */}
                <div
                  className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                    isComplete
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? `${dot} text-white`
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {isComplete ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-tight truncate ${
                      isActive ? activeText : 'text-slate-300'
                    }`}
                  >
                    {stage.name}
                  </p>
                  {total > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isComplete ? 'bg-emerald-500' : dot
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        {done}/{total}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        {session?.user?.role === 'admin' && (
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-xs transition w-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </Link>
        )}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-slate-300 font-medium">
              {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 truncate">{session?.user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out"
            className="text-slate-500 hover:text-slate-300 transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
