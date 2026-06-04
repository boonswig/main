'use client'

import { PreCallContext } from '@/types'

interface Props {
  notes: string
  onChange: (v: string) => void
  onClose: () => void
  stageName?: string
  context?: PreCallContext | null
}

export default function CallNotesPanel({ notes, onChange, onClose, stageName, context }: Props) {
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0
  const lineCount = notes.split('\n').filter(Boolean).length

  function handleExport() {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const contextBlock = context?.companyName
      ? [
          `Company:  ${context.companyName}`,
          context.contactName ? `Contact:  ${context.contactName}${context.contactTitle ? ` (${context.contactTitle})` : ''}` : '',
          context.industry    ? `Industry: ${context.industry}` : '',
          context.currentSolution ? `Current solution: ${context.currentSolution}` : '',
          context.knownPainPoints ? `Known pain points: ${context.knownPainPoints}` : '',
        ].filter(Boolean).join('\n') + '\n'
      : ''
    const header = `Sales Call Notes — ${date}\n${'='.repeat(50)}\n${contextBlock}\n`
    const blob = new Blob([header + notes], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call-notes-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleCopy() {
    navigator.clipboard.writeText(notes)
  }

  return (
    <div className="w-80 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Call Notes</h3>
          {stageName && (
            <p className="text-xs text-slate-400 mt-0.5">Currently on: {stageName}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Textarea */}
      <div className="flex-1 p-4 flex flex-col">
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Take notes during the call…\n\nTip: Jot down key answers, concerns, and commitments as they come up.`}
          className="flex-1 w-full resize-none text-sm text-slate-700 placeholder-slate-300 focus:outline-none leading-relaxed"
          spellCheck
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{wordCount} words · {lineCount} lines</span>
          {notes.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all notes?')) onChange('')
              }}
              className="text-red-400 hover:text-red-600 transition"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={!notes.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <button
            onClick={handleExport}
            disabled={!notes.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-xs text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export .txt
          </button>
        </div>
      </div>
    </div>
  )
}
