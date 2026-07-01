'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Playbook, USE_CASES, UseCaseQuestion, RepPitchCard, ResourceLink } from '@/types'
import { subscribeToPlaybook, firestoreConfigured } from '@/lib/firestore'
import { INDUSTRIES } from '@/lib/industries'
import QuestionCard from './QuestionCard'
import PitchCard from './PitchCard'
import ResourceLinkCard from './ResourceLinkCard'

type ContentType = 'all' | 'questions' | 'pitch' | 'resources'

interface Props {
  playbook: Playbook
}

export default function ResourcesClient({ playbook: initialPlaybook }: Props) {
  const [livePlaybook, setLivePlaybook] = useState<Playbook>(initialPlaybook)
  const [activeUseCases, setActiveUseCases] = useState<string[]>([])
  const [activeIndustries, setActiveIndustries] = useState<string[]>([])
  const [contentType, setContentType] = useState<ContentType>('all')
  const [entryMode, setEntryMode] = useState(true) // show entry tiles until a filter is set

  useEffect(() => {
    if (!firestoreConfigured) return
    const unsub = subscribeToPlaybook((fresh) => setLivePlaybook(fresh))
    return unsub
  }, [])

  function toggleUseCase(id: string) {
    setEntryMode(false)
    setActiveUseCases((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleIndustry(id: string) {
    setEntryMode(false)
    setActiveIndustries((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function clearAll() {
    setActiveUseCases([])
    setActiveIndustries([])
    setContentType('all')
    setEntryMode(true)
  }

  const questions = useMemo((): UseCaseQuestion[] => {
    const all = livePlaybook.useCaseQuestions ?? []
    if (activeUseCases.length === 0 && activeIndustries.length === 0) return all
    return all.filter((q) => {
      const ucMatch = activeUseCases.length === 0 || q.useCases.some((uc) => activeUseCases.includes(uc))
      const indMatch = activeIndustries.length === 0 || !q.industries?.length || q.industries.some((i) => activeIndustries.includes(i))
      return ucMatch && indMatch
    })
  }, [livePlaybook, activeUseCases, activeIndustries])

  const pitchCards = useMemo((): RepPitchCard[] => {
    const all = livePlaybook.pitchCards ?? []
    if (activeUseCases.length === 0 && activeIndustries.length === 0) return all
    return all.filter((c) => {
      const ucMatch = activeUseCases.length === 0 || c.useCases.some((uc) => activeUseCases.includes(uc))
      const indMatch = activeIndustries.length === 0 || !c.industries?.length || c.industries.some((i) => activeIndustries.includes(i))
      return ucMatch && indMatch
    })
  }, [livePlaybook, activeUseCases, activeIndustries])

  const resources = useMemo((): ResourceLink[] => {
    const all = livePlaybook.resourceLinks ?? []
    if (activeUseCases.length === 0 && activeIndustries.length === 0) return all
    return all.filter((r) => {
      const ucMatch = activeUseCases.length === 0 || !r.useCases?.length || r.useCases.some((uc) => activeUseCases.includes(uc))
      const indMatch = activeIndustries.length === 0 || !r.industries?.length || r.industries.some((i) => activeIndustries.includes(i))
      return ucMatch && indMatch
    })
  }, [livePlaybook, activeUseCases, activeIndustries])

  const hasFilters = activeUseCases.length > 0 || activeIndustries.length > 0 || contentType !== 'all'
  const showQuestions = contentType === 'all' || contentType === 'questions'
  const showPitch = contentType === 'all' || contentType === 'pitch'
  const showResources = contentType === 'all' || contentType === 'resources'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">Resources &amp; Prep</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/playbook" className="text-slate-400 hover:text-slate-200 text-xs transition">← Live Call</Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 text-xs transition">Dashboard</Link>
          <Link href="/admin" className="text-slate-400 hover:text-slate-200 text-xs transition">Admin</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Entry tiles — shown until a filter is applied */}
        {entryMode && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Resources &amp; Prep</h1>
            <p className="text-slate-500 text-sm mb-6">Browse by what you need right now, or filter by use case and industry.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  emoji: '📞',
                  title: 'Prep for a call',
                  desc: 'Pick your industry to see the most relevant questions and pitch cards',
                  action: () => { setEntryMode(false); setContentType('questions') },
                },
                {
                  emoji: '📚',
                  title: 'Learn a use case',
                  desc: 'Deep dive into a specific use case — questions, pitch, and resources',
                  action: () => { setEntryMode(false) },
                },
                {
                  emoji: '📤',
                  title: 'Find something to send',
                  desc: 'Browse customer-facing resources to share before or after a call',
                  action: () => { setEntryMode(false); setContentType('resources') },
                },
              ].map((tile) => (
                <button
                  key={tile.title}
                  onClick={tile.action}
                  className="text-left bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-sm transition group"
                >
                  <span className="text-3xl mb-3 block">{tile.emoji}</span>
                  <p className="text-sm font-bold text-slate-800 mb-1 group-hover:text-blue-700">{tile.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{tile.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 space-y-3">
          {/* Use case chips */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Use Case</p>
            <div className="flex flex-wrap gap-2">
              {USE_CASES.map((uc) => {
                const active = activeUseCases.includes(uc.id)
                return (
                  <button
                    key={uc.id}
                    onClick={() => toggleUseCase(uc.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      active
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    <span>{uc.emoji}</span> {uc.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Industry + type row */}
          <div className="flex items-start gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Industry</p>
              <div className="flex flex-wrap gap-1.5">
                {INDUSTRIES.map((ind) => {
                  const active = activeIndustries.includes(ind.id)
                  return (
                    <button
                      key={ind.id}
                      onClick={() => toggleIndustry(ind.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                        active
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300'
                      }`}
                    >
                      {ind.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-shrink-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Show</p>
              <div className="flex gap-1.5">
                {(['all', 'questions', 'pitch', 'resources'] as ContentType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setContentType(t); setEntryMode(false) }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                      contentType === t
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {t === 'all' ? 'All' : t === 'questions' ? 'Questions' : t === 'pitch' ? 'Pitch Cards' : 'Resources'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {hasFilters && (
            <div className="pt-1 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {showQuestions && `${questions.length} question${questions.length !== 1 ? 's' : ''}`}
                {showQuestions && showPitch && ' · '}
                {showPitch && `${pitchCards.length} pitch card${pitchCards.length !== 1 ? 's' : ''}`}
                {(showQuestions || showPitch) && showResources && ' · '}
                {showResources && `${resources.length} resource${resources.length !== 1 ? 's' : ''}`}
              </p>
              <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600 transition">
                Clear filters ×
              </button>
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="space-y-8">
          {showQuestions && questions.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Discovery Questions <span className="text-slate-400 font-normal ml-1">({questions.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map((q) => (
                  <QuestionCard key={q.id} question={q} onFilterUseCase={toggleUseCase} />
                ))}
              </div>
            </section>
          )}

          {showPitch && pitchCards.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Pitch Cards <span className="text-slate-400 font-normal ml-1">({pitchCards.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pitchCards.map((card) => (
                  <PitchCard key={card.id} card={card} onFilterUseCase={toggleUseCase} />
                ))}
              </div>
            </section>
          )}

          {showResources && resources.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Resources <span className="text-slate-400 font-normal ml-1">({resources.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((r) => (
                  <ResourceLinkCard key={r.id} resource={r} onFilterUseCase={toggleUseCase} />
                ))}
              </div>
            </section>
          )}

          {!entryMode && questions.length === 0 && pitchCards.length === 0 && resources.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400 text-sm">No content matches the current filters.</p>
              <button onClick={clearAll} className="mt-2 text-blue-600 text-sm hover:underline">Clear filters</button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
