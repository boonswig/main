'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Playbook, Stage, PreCallContext } from '@/types'
import StageSidebar from './StageSidebar'
import StageContent from './StageContent'
import CallNotesPanel from './CallNotesPanel'
import SearchModal from './SearchModal'
import KeywordTriggerBar from './KeywordTriggerBar'
import EndCallModal from './EndCallModal'
import SmartPromptCard from './SmartPromptCard'
import SignalChips from './SignalChips'
import PitchBriefing from './PitchBriefing'
import CloseOptions from './CloseOptions'

interface Props {
  playbook: Playbook
}

const NOTES_KEY = 'sales-playbook-notes'
const COMPLETED_KEY = 'sales-playbook-completed'
const CONTEXT_KEY = 'sales-playbook-context'
const SIGNALS_KEY = 'sales-playbook-signals'

export default function PlaybookClient({ playbook }: Props) {
  const router = useRouter()
  const stages = [...playbook.stages].sort((a, b) => a.order - b.order)

  const [activeStageId, setActiveStageId] = useState(stages[0]?.id ?? '')
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState('')
  const [notesOpen, setNotesOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [endCallOpen, setEndCallOpen] = useState(false)
  const [context, setContext] = useState<PreCallContext | null>(null)
  const [triggerKeywords, setTriggerKeywords] = useState<string[]>([])
  const [triggerMatchCount, setTriggerMatchCount] = useState(0)
  const [signals, setSignals] = useState<string[]>([])
  const [preferredNextStep, setPreferredNextStep] = useState('')

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(NOTES_KEY)
      if (savedNotes) setNotes(savedNotes)
      const savedCompleted = localStorage.getItem(COMPLETED_KEY)
      if (savedCompleted) setCompletedItems(JSON.parse(savedCompleted))
      const savedContext = localStorage.getItem(CONTEXT_KEY)
      if (savedContext) setContext(JSON.parse(savedContext))
      const savedSignals = localStorage.getItem(SIGNALS_KEY)
      if (savedSignals) setSignals(JSON.parse(savedSignals))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem(NOTES_KEY, notes) } catch {}
  }, [notes])

  useEffect(() => {
    try { localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedItems)) } catch {}
  }, [completedItems])

  useEffect(() => {
    try { localStorage.setItem(SIGNALS_KEY, JSON.stringify(signals)) } catch {}
  }, [signals])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toggleItem = useCallback((id: string) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const activeStage = stages.find((s) => s.id === activeStageId) ?? stages[0]

  const stageProgress = useCallback(
    (stage: Stage) => {
      const allIds = [
        ...stage.questions.map((q) => q.id),
        ...stage.talkingPoints.map((t) => t.id),
        ...stage.objections.map((o) => o.id),
      ]
      const done = allIds.filter((id) => completedItems[id]).length
      return { done, total: allIds.length }
    },
    [completedItems]
  )

  function clearCall() {
    setCompletedItems({})
    setNotes('')
    setContext(null)
    setSignals([])
    setPreferredNextStep('')
    setActiveStageId(stages[0]?.id ?? '')
    localStorage.removeItem(NOTES_KEY)
    localStorage.removeItem(COMPLETED_KEY)
    localStorage.removeItem(CONTEXT_KEY)
    localStorage.removeItem(SIGNALS_KEY)
  }

  const handleNewCall = useCallback(() => {
    if (confirm('Start a new call? This will clear all checked items and notes without saving.')) {
      clearCall()
      router.push('/pre-call')
    }
  }, [stages, router])

  const handleCallSaved = useCallback(() => {
    clearCall()
    router.push('/pre-call')
  }, [stages, router])

  const activeIdx = stages.findIndex((s) => s.id === activeStageId)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <StageSidebar
        stages={stages}
        activeStageId={activeStageId}
        onSelectStage={setActiveStageId}
        stageProgress={stageProgress}
        onNewCall={handleNewCall}
        onEndCall={() => setEndCallOpen(true)}
        context={context}
      />

      <main className="flex-1 overflow-y-auto pb-20">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{activeStage?.name}</h1>
              {context?.industry && (
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  {context.industry.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5 max-w-xl">{activeStage?.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
              title="Search (⌘K)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
            </button>
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${
                notesOpen
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline">Notes</span>
              {notes.length > 0 && (
                <span className="hidden sm:inline-flex items-center justify-center w-5 h-5 text-xs bg-blue-600 text-white rounded-full">
                  {notes.split('\n').filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Context banner */}
        {context?.companyName && (
          <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-2 font-semibold text-blue-800">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {context.companyName}
            </div>
            {context.contactName && (
              <span className="text-blue-600">
                {context.contactName}{context.contactTitle ? ` · ${context.contactTitle}` : ''}
              </span>
            )}
            {context.currentSolution && (
              <span className="text-blue-500">
                Currently: <span className="font-medium">{context.currentSolution}</span>
              </span>
            )}
            {context.knownPainPoints && (
              <span className="text-blue-500 line-clamp-1">
                Pain: {context.knownPainPoints}
              </span>
            )}
          </div>
        )}

        <SmartPromptCard context={context} activeStageId={activeStageId} />

        {/* Discovery: gap signal chips */}
        {activeStageId === 'discovery' && (
          <SignalChips selected={signals} onChange={setSignals} />
        )}

        {/* Pitch: tailored briefing based on identified gaps */}
        {activeStageId === 'pitch' && (
          <PitchBriefing signalIds={signals} />
        )}

        {/* Close: agreed next step selector */}
        {activeStageId === 'close' && (
          <CloseOptions selected={preferredNextStep} onSelect={setPreferredNextStep} />
        )}

        {/* Stage content */}
        <div className="p-6">
          {activeStage && (
            <StageContent
              stage={activeStage}
              completedItems={completedItems}
              onToggleItem={toggleItem}
              industry={context?.industry ?? ''}
              triggerKeywords={triggerKeywords}
              onMatchCountChange={setTriggerMatchCount}
            />
          )}
        </div>

        {/* Stage navigation */}
        <div className="px-6 pb-8 flex justify-between">
          {activeIdx > 0 && (
            <button
              onClick={() => setActiveStageId(stages[activeIdx - 1].id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous: {stages[activeIdx - 1]?.name}
            </button>
          )}
          <div className="ml-auto">
            {activeIdx < stages.length - 1 ? (
              <button
                onClick={() => setActiveStageId(stages[activeIdx + 1].id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 transition"
              >
                Next: {stages[activeIdx + 1]?.name}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setEndCallOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-sm text-white font-semibold hover:bg-red-700 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
                End Call &amp; Save
              </button>
            )}
          </div>
        </div>
      </main>

      {notesOpen && (
        <CallNotesPanel
          notes={notes}
          onChange={setNotes}
          onClose={() => setNotesOpen(false)}
          stageName={activeStage?.name}
          context={context}
        />
      )}

      {searchOpen && (
        <SearchModal
          playbook={playbook}
          onClose={() => setSearchOpen(false)}
          onNavigate={(stageId) => {
            setActiveStageId(stageId)
            setSearchOpen(false)
          }}
        />
      )}

      {endCallOpen && (
        <EndCallModal
          context={context}
          notes={notes}
          signals={signals}
          preferredNextStep={preferredNextStep}
          onClose={() => setEndCallOpen(false)}
          onSaved={handleCallSaved}
        />
      )}

      <KeywordTriggerBar
        onTrigger={setTriggerKeywords}
        onClear={() => setTriggerKeywords([])}
        matchCount={triggerMatchCount}
      />
    </div>
  )
}
