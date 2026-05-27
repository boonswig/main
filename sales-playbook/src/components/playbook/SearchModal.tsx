'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Playbook, SearchResult, StageColor } from '@/types'

const BADGE_COLOR: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-emerald-100 text-emerald-700',
  orange: 'bg-orange-100 text-orange-700',
  teal: 'bg-teal-100 text-teal-700',
  red: 'bg-red-100 text-red-700',
  pink: 'bg-pink-100 text-pink-700',
  indigo: 'bg-indigo-100 text-indigo-700',
}

const TYPE_LABEL: Record<string, string> = {
  question: 'Question',
  'talking-point': 'Talking Point',
  objection: 'Objection',
}

interface Props {
  playbook: Playbook
  onClose: () => void
  onNavigate: (stageId: string) => void
}

function buildIndex(playbook: Playbook): SearchResult[] {
  const results: SearchResult[] = []
  for (const stage of playbook.stages) {
    for (const q of stage.questions) {
      results.push({
        stageId: stage.id,
        stageName: stage.name,
        stageColor: stage.color as StageColor,
        type: 'question',
        id: q.id,
        title: q.question,
        content: [q.purpose, ...q.followUps].filter(Boolean).join(' · '),
      })
    }
    for (const tp of stage.talkingPoints) {
      results.push({
        stageId: stage.id,
        stageName: stage.name,
        stageColor: stage.color as StageColor,
        type: 'talking-point',
        id: tp.id,
        title: tp.title,
        content: tp.content,
      })
    }
    for (const obj of stage.objections) {
      results.push({
        stageId: stage.id,
        stageName: stage.name,
        stageColor: stage.color as StageColor,
        type: 'objection',
        id: obj.id,
        title: obj.objection,
        content: obj.response,
      })
    }
  }
  return results
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(re)
  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export default function SearchModal({ playbook, onClose, onNavigate }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const index = useRef(buildIndex(playbook))

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      setResults([])
      setSelected(0)
      return
    }
    const terms = q.split(/\s+/)
    const filtered = index.current.filter((r) => {
      const haystack = `${r.title} ${r.content} ${r.stageName} ${TYPE_LABEL[r.type]}`.toLowerCase()
      return terms.every((t) => haystack.includes(t))
    })
    setResults(filtered.slice(0, 20))
    setSelected(0)
  }, [query])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((prev) => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && results[selected]) {
        onNavigate(results[selected].stageId)
      }
    },
    [results, selected, onClose, onNavigate]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search questions, talking points, objections…"
            className="flex-1 text-slate-800 placeholder-slate-400 focus:outline-none text-sm"
          />
          <kbd className="text-xs bg-slate-100 border border-slate-200 px-1.5 py-1 rounded text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <ul>
                {results.map((r, i) => {
                  const badge = BADGE_COLOR[r.stageColor] ?? 'bg-slate-100 text-slate-700'
                  return (
                    <li key={r.id}>
                      <button
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 transition ${
                          i === selected ? 'bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                        onClick={() => onNavigate(r.stageId)}
                        onMouseEnter={() => setSelected(i)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${badge}`}>
                              {r.stageName}
                            </span>
                            <span className="text-xs text-slate-400">{TYPE_LABEL[r.type]}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {highlight(r.title, query)}
                          </p>
                          {r.content && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                              {highlight(r.content, query)}
                            </p>
                          )}
                        </div>
                        {i === selected && (
                          <kbd className="text-xs bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 flex-shrink-0 mt-1">
                            ↵
                          </kbd>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="px-4 py-6 text-center text-slate-400 text-sm">
            Type to search across all stages
            <p className="text-xs mt-1 text-slate-300">
              Use ↑↓ to navigate, ↵ to jump to stage, ESC to close
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
