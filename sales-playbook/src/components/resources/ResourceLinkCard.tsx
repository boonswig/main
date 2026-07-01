'use client'

import { useState } from 'react'
import { ResourceLink, USE_CASES } from '@/types'

interface Props {
  resource: ResourceLink
  onFilterUseCase: (id: string) => void
}

export default function ResourceLinkCard({ resource, onFilterUseCase }: Props) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(resource.url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ucLabels = USE_CASES.filter((uc) => resource.useCases?.includes(uc.id))
  const isInternal = resource.type === 'internal'

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition ${
      isInternal ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 hover:border-teal-200'
    }`}>
      <div className="px-5 py-4">
        {/* Type + use case tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isInternal ? 'bg-slate-100 text-slate-500' : 'bg-teal-100 text-teal-700'
          }`}>
            {isInternal ? '🔒 Internal' : '📤 Customer-facing'}
          </span>
          {ucLabels.map((uc) => (
            <button
              key={uc.id}
              onClick={() => onFilterUseCase(uc.id)}
              className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition"
            >
              {uc.emoji} {uc.label}
            </button>
          ))}
        </div>

        <p className="text-sm font-bold text-slate-800 mb-1">{resource.title}</p>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">{resource.description}</p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open
          </a>
          <button
            onClick={copyLink}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
              copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>
    </div>
  )
}
