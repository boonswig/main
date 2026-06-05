'use client'

import { useState } from 'react'

interface Phase {
  id: string
  timing: string
  title: string
  who: string
  steps: string[]
  outcome: string
  product: 'cep' | 'cameyo' | 'both'
}

const PHASES: Phase[] = [
  {
    id: 'setup',
    timing: 'Day 1–2',
    title: 'Admin Console setup',
    who: 'IT admin (2–4 hrs)',
    steps: [
      'Connect Chrome Admin Console to your directory (Workspace or Azure AD/Entra ID)',
      'Configure baseline security policies in test mode — safe browsing, extension controls, DLP rules',
      'Identify 10 pilot users across one team or use case',
    ],
    outcome: 'Admin Console live, policies drafted, pilot group identified.',
    product: 'cep',
  },
  {
    id: 'pilot-cep',
    timing: 'Day 3–5',
    title: 'CEP pilot goes live',
    who: '10 pilot users — no action needed from them',
    steps: [
      'Push managed Chrome profile to pilot users via directory — users just sign into Chrome as normal',
      'Policies apply silently — users see no visible change in their browser',
      'IT admin sees first telemetry: extensions, download events, Safe Browsing triggers',
    ],
    outcome: '10 users fully managed. First real browser telemetry visible to IT.',
    product: 'cep',
  },
  {
    id: 'pilot-cameyo',
    timing: 'Day 3–7',
    title: 'First app live in Cameyo',
    who: 'Cameyo onboarding team + IT admin',
    steps: [
      'Cameyo packages the target Windows application (Cameyo handles this — typically 1–2 days)',
      'Publish the app to pilot users — they open a Chrome tab and the app appears',
      'Validate: app functions correctly, performance acceptable, IT can manage access',
    ],
    outcome: 'Legacy Windows app accessible from any device via Chrome — no Citrix, no local install.',
    product: 'cameyo',
  },
  {
    id: 'review',
    timing: 'Week 2–4',
    title: 'Pilot review and policy refinement',
    who: 'IT admin + pilot users (5-min survey)',
    steps: [
      'Review telemetry: any unexpected extensions, DLP events, or Safe Browsing blocks?',
      'Refine DLP rules based on what you see — tighten download controls, add upload restrictions',
      'Collect user feedback — most users report no visible change to their work',
      'Build the internal business case: data from real usage, not estimates',
    ],
    outcome: 'Validated security posture, refined policies, internal sign-off evidence ready.',
    product: 'both',
  },
  {
    id: 'rollout',
    timing: 'Month 1–2',
    title: 'Organisation-wide rollout',
    who: 'IT admin (no endpoint visits needed)',
    steps: [
      'Push managed profiles to all users via directory — zero endpoint visits required',
      'Expand Cameyo to all users needing legacy app access',
      'Enable advanced DLP policies: upload controls, clipboard restrictions, screen capture DLP',
      'Connect browser telemetry to your SIEM or security dashboard',
    ],
    outcome: 'Full org on managed Chrome. Legacy app delivery modernised. Browser telemetry live.',
    product: 'both',
  },
  {
    id: 'optimise',
    timing: 'Month 2–3',
    title: 'Decommission and optimise',
    who: 'IT admin',
    steps: [
      'Decommission Citrix / VDI infrastructure as Cameyo handles all app delivery',
      'Fine-tune alert rules and SIEM integration based on real event patterns',
      'Run first compliance report — browser controls evidence ready for audit',
    ],
    outcome: 'Cost savings realised. Citrix decommissioned. Compliance posture documented.',
    product: 'both',
  },
]

const PRODUCT_BADGE: Record<Phase['product'], string> = {
  cep: 'bg-blue-100 text-blue-700',
  cameyo: 'bg-purple-100 text-purple-700',
  both: 'bg-slate-100 text-slate-600',
}

const PRODUCT_LABEL: Record<Phase['product'], string> = {
  cep: 'CEP',
  cameyo: 'Cameyo',
  both: 'CEP + Cameyo',
}

interface Props {
  variant?: 'close' | 'objection'
}

export default function AdoptionRoadmap({ variant = 'close' }: Props) {
  const [collapsed, setCollapsed] = useState(variant === 'objection')
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)

  return (
    <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🗺️</span>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">
              {variant === 'objection' ? 'What does adoption actually look like?' : 'Adoption roadmap'}
            </p>
            <p className="text-xs text-slate-400">
              {variant === 'objection'
                ? 'Day 1 to full deployment — no infrastructure project required'
                : 'Day 1 to full deployment — CEP + Cameyo'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Full org in 60–90 days
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? '' : 'rotate-180'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {!collapsed && (
        <>
          {/* Trusted advisor framing */}
          <div className="px-5 py-3 bg-emerald-50 border-t border-b border-emerald-100">
            <p className="text-xs text-emerald-800 leading-relaxed">
              <strong>This is not an infrastructure project.</strong> There are no servers to procure, no imaging cycles, no phased Windows migrations. For a 500-seat organisation, the journey from first admin console login to full deployment is typically 60–90 days — with meaningful security improvements visible within the first week.
            </p>
          </div>

          {/* Timeline */}
          <div className="p-5 space-y-2">
            {PHASES.map((phase, idx) => {
              const isExpanded = expandedPhase === phase.id
              return (
                <div key={phase.id} className="relative">
                  {/* Connector line */}
                  {idx < PHASES.length - 1 && (
                    <div className="absolute left-[1.375rem] top-[2.5rem] w-px h-[calc(100%-0.5rem)] bg-slate-100 z-0" />
                  )}
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                    className="relative z-10 w-full flex items-start gap-3 text-left"
                  >
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white border-2 border-emerald-300 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-emerald-600">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-100 px-4 py-3 hover:border-slate-200 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-xs font-bold text-slate-400">{phase.timing}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRODUCT_BADGE[phase.product]}`}>
                              {PRODUCT_LABEL[phase.product]}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800">{phase.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{phase.who}</p>
                        </div>
                        <svg
                          className={`w-4 h-4 text-slate-300 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                          <ul className="space-y-1.5">
                            {phase.steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-emerald-400 flex-shrink-0 mt-0.5">→</span>
                                <span className="text-xs text-slate-600 leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                            <span className="text-xs font-semibold text-emerald-700">Outcome: </span>
                            <span className="text-xs text-emerald-800">{phase.outcome}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Footer message */}
          <div className="px-5 pb-5">
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-700">No endpoint visits. No infrastructure procurement. No user retraining.</strong>{' '}
                The pilot starts with 10 users and costs nothing to validate — and you can expand or stop at any point. The question isn&rsquo;t whether this is complex; it&rsquo;s just what use case to start with.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
