'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Playbook, Stage, PreCallContext } from '@/types'
import { subscribeToPlaybook } from '@/lib/firestore'
import StageSidebar from './StageSidebar'
import StageContent from './StageContent'
import CallNotesPanel from './CallNotesPanel'
import SearchModal from './SearchModal'
import EndCallModal from './EndCallModal'
import SmartPromptCard from './SmartPromptCard'
import IndustryNotesPanel from './IndustryNotesPanel'
import PitchBriefing from './PitchBriefing'
import CloseStage from './CloseStage'
import DiscoveryTransition from './DiscoveryTransition'
import PitchTransition from './PitchTransition'
import CallOpener from './CallOpener'
import AdoptionRoadmap from './AdoptionRoadmap'

interface Props {
  playbook: Playbook
}

const NOTES_KEY          = 'sales-playbook-notes'
const COMPLETED_KEY      = 'sales-playbook-completed'
const CONTEXT_KEY        = 'sales-playbook-context'
const TAGGED_ANSWERS_KEY = 'sales-playbook-tagged-answers'

const STAGE_COLORS: Record<string, string> = {
  blue:   'bg-blue-600',
  purple: 'bg-purple-600',
  green:  'bg-emerald-600',
  orange: 'bg-orange-600',
  teal:   'bg-teal-600',
  red:    'bg-red-600',
  pink:   'bg-pink-600',
  indigo: 'bg-indigo-600',
}

export default function PlaybookClient({ playbook: initialPlaybook }: Props) {
  const router  = useRouter()
  const mainRef = useRef<HTMLElement>(null)

  // Live playbook — updated via Firestore subscription when admin saves
  const [livePlaybook, setLivePlaybook] = useState<Playbook>(initialPlaybook)

  useEffect(() => {
    const unsub = subscribeToPlaybook((fresh) => setLivePlaybook(fresh))
    return unsub
  }, [])

  const stages  = [...livePlaybook.stages].sort((a, b) => a.order - b.order)

  const [activeStageId,    setActiveStageId]    = useState(stages[0]?.id ?? '')
  const [completedItems,   setCompletedItems]   = useState<Record<string, boolean>>({})
  const [notes,            setNotes]            = useState('')
  const [notesOpen,        setNotesOpen]        = useState(false)
  const [searchOpen,       setSearchOpen]       = useState(false)
  const [endCallOpen,      setEndCallOpen]      = useState(false)
  const [context,          setContext]          = useState<PreCallContext | null>(null)
  const [taggedAnswers,    setTaggedAnswers]    = useState<Record<string, string[]>>({})
  const [preferredNextStep, setPreferredNextStep] = useState('')

  // Keyword trigger — managed here so it lives in the sticky bottom bar
  const [keywordInput,    setKeywordInput]    = useState('')
  const [triggerKeywords, setTriggerKeywords] = useState<string[]>([])
  const [triggerMatchCount, setTriggerMatchCount] = useState(0)

  useEffect(() => {
    if (!keywordInput.trim()) { setTriggerKeywords([]); return }
    const terms = keywordInput.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 2)
    setTriggerKeywords(terms)
  }, [keywordInput])

  // Persist / restore state
  useEffect(() => {
    try {
      const savedNotes    = localStorage.getItem(NOTES_KEY)
      if (savedNotes)    setNotes(savedNotes)
      const savedDone     = localStorage.getItem(COMPLETED_KEY)
      if (savedDone)     setCompletedItems(JSON.parse(savedDone))
      const savedCtx      = localStorage.getItem(CONTEXT_KEY)
      if (savedCtx)      setContext(JSON.parse(savedCtx))
      const savedTagged   = localStorage.getItem(TAGGED_ANSWERS_KEY)
      if (savedTagged)   setTaggedAnswers(JSON.parse(savedTagged))
    } catch {}
  }, [])

  useEffect(() => { try { localStorage.setItem(NOTES_KEY,          notes)                    } catch {} }, [notes])
  useEffect(() => { try { localStorage.setItem(COMPLETED_KEY,      JSON.stringify(completedItems)) } catch {} }, [completedItems])
  useEffect(() => { try { localStorage.setItem(TAGGED_ANSWERS_KEY, JSON.stringify(taggedAnswers))  } catch {} }, [taggedAnswers])

  // Scroll to top when stage changes
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeStageId])

  // ⌘K search
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const discoveryStage     = stages.find((s) => s.id === 'discovery')
  const discoveryQuestions = discoveryStage?.questions ?? []

  const toggleAnswer = useCallback((questionId: string, chipId: string) => {
    setTaggedAnswers((prev) => {
      const current = prev[questionId] ?? []
      const updated = current.includes(chipId)
        ? current.filter((id) => id !== chipId)
        : [...current, chipId]
      return { ...prev, [questionId]: updated }
    })
  }, [])

  const chipLabels = discoveryQuestions.flatMap((q) =>
    (taggedAnswers[q.id] ?? []).map(
      (chipId) => q.answerChips?.find((c) => c.id === chipId)?.label ?? chipId
    )
  )

  const toggleItem = useCallback((id: string) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const activeStage = stages.find((s) => s.id === activeStageId) ?? stages[0]
  const activeIdx   = stages.findIndex((s) => s.id === activeStageId)

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
    setTaggedAnswers({})
    setPreferredNextStep('')
    setKeywordInput('')
    setActiveStageId(stages[0]?.id ?? '')
    localStorage.removeItem(NOTES_KEY)
    localStorage.removeItem(COMPLETED_KEY)
    localStorage.removeItem(CONTEXT_KEY)
    localStorage.removeItem(TAGGED_ANSWERS_KEY)
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

  const kwActive = triggerKeywords.length > 0

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

      {/* Main column: top bar + progress strip + scrollable content + sticky nav */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top bar ─────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{activeStage?.name}</h1>
              {context?.industry && (
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  {context.industry.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
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

        {/* ── Stage progress strip ────────────────────────────── */}
        <div className="bg-white border-b border-slate-100 px-6 py-2 flex items-center flex-shrink-0">
          {stages.map((stage, idx) => {
            const isActive   = stage.id === activeStageId
            const { done, total } = stageProgress(stage)
            const isComplete = total > 0 && done === total
            const isPast     = idx < activeIdx
            const dot        = STAGE_COLORS[stage.color] ?? 'bg-slate-500'

            return (
              <div key={stage.id} className="flex items-center">
                <button
                  onClick={() => setActiveStageId(stage.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? `${dot} text-white shadow-sm`
                      : isComplete
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : isPast
                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  {isComplete ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-bold opacity-70">{idx + 1}</span>
                  )}
                  {stage.name}
                </button>
                {idx < stages.length - 1 && (
                  <svg className="w-3.5 h-3.5 text-slate-300 mx-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Scrollable content ───────────────────────────────── */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">

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
                <span className="text-blue-500 line-clamp-1">Pain: {context.knownPainPoints}</span>
              )}
              {context.bdrNotes && (
                <span className="w-full text-blue-500 text-xs line-clamp-1 border-t border-blue-200 pt-1.5 mt-0.5">
                  <span className="font-semibold">BDR:</span> {context.bdrNotes}
                </span>
              )}
            </div>
          )}

          {/* Discovery: call opener — passes openerStyles and openerRules from live playbook */}
          {activeStageId === 'discovery' && (
            <CallOpener
              context={context}
              openerStyles={livePlaybook.openerStyles}
              openerRules={livePlaybook.openerRules}
            />
          )}

          {/* Pitch: personalised briefing */}
          {activeStageId === 'pitch' && (
            <PitchBriefing taggedAnswers={taggedAnswers} questions={discoveryQuestions} />
          )}

          {/* Discovery + Pitch + Objections: context-aware prompt card */}
          {(activeStageId === 'discovery' || activeStageId === 'pitch' || activeStageId === 'objections') && (
            <SmartPromptCard context={context} activeStageId={activeStageId} />
          )}

          {/* Close: unified close stage — guide, AI recommendation, next step picker, CTA */}
          {activeStageId === 'close' && (
            <CloseStage
              closeRecommendations={livePlaybook.closeRecommendations}
              taggedAnswers={taggedAnswers}
              questions={discoveryQuestions}
              selected={preferredNextStep}
              onSelect={setPreferredNextStep}
              onEndCall={() => setEndCallOpen(true)}
            />
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
                taggedAnswers={taggedAnswers}
                onToggleAnswer={toggleAnswer}
                collapseSections={activeStageId === 'discovery' ? ['talkingPoints', 'objections'] : []}
              />
            )}
          </div>

          {/* Discovery: transition to pitch */}
          {activeStageId === 'discovery' && (
            <DiscoveryTransition
              taggedAnswers={taggedAnswers}
              questions={discoveryQuestions}
              onNavigateToPitch={() => setActiveStageId('pitch')}
            />
          )}

          {/* Pitch: buy-in sequence + move to close */}
          {activeStageId === 'pitch' && (
            <PitchTransition
              taggedAnswers={taggedAnswers}
              questions={discoveryQuestions}
              onNavigateToClose={() => setActiveStageId('close')}
            />
          )}

          {/* Objections: adoption roadmap — shows how deployment actually works */}
          {activeStageId === 'objections' && <AdoptionRoadmap variant="objection" />}

          <div className="pb-4" />
        </main>

        {/* ── Sticky bottom nav bar ───────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-2 flex items-center gap-3">

          {/* Prev stage */}
          <div className="w-36 flex-shrink-0">
            {activeIdx > 0 ? (
              <button
                onClick={() => setActiveStageId(stages[activeIdx - 1].id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition w-full"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="truncate">{stages[activeIdx - 1]?.name}</span>
              </button>
            ) : (
              <div />
            )}
          </div>

          {/* Keyword trigger input */}
          <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border transition ${
            kwActive ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
          }`}>
            <svg
              className={`w-3.5 h-3.5 flex-shrink-0 ${kwActive ? 'text-amber-500' : 'text-slate-400'}`}
              fill="currentColor" viewBox="0 0 24 24"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="What did they just say? Type a keyword…"
              className={`flex-1 text-xs bg-transparent focus:outline-none ${
                kwActive ? 'text-amber-900 placeholder-amber-400' : 'text-slate-600 placeholder-slate-400'
              }`}
            />
            {kwActive && triggerMatchCount > 0 && (
              <span className="text-xs font-semibold bg-amber-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                {triggerMatchCount} match{triggerMatchCount !== 1 ? 'es' : ''}
              </span>
            )}
            {kwActive && triggerMatchCount === 0 && (
              <span className="text-xs text-amber-600 flex-shrink-0">no matches</span>
            )}
            {keywordInput && (
              <button
                onClick={() => setKeywordInput('')}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Next stage / End call */}
          <div className="w-36 flex-shrink-0 flex justify-end">
            {activeIdx < stages.length - 1 ? (
              <button
                onClick={() => setActiveStageId(stages[activeIdx + 1].id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-xs text-white font-semibold hover:bg-blue-700 transition w-full justify-end"
              >
                <span className="truncate">{stages[activeIdx + 1]?.name}</span>
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setEndCallOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 text-xs text-white font-semibold hover:bg-red-700 transition w-full justify-end"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
                End Call
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Floating industry notes panel — persistent toggle when industry is known */}
      <IndustryNotesPanel
        industryNotes={livePlaybook.industryNotes ?? []}
        context={context}
      />

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
          playbook={livePlaybook}
          onClose={() => setSearchOpen(false)}
          onNavigate={(stageId) => { setActiveStageId(stageId); setSearchOpen(false) }}
        />
      )}

      {endCallOpen && (
        <EndCallModal
          context={context}
          notes={notes}
          signals={chipLabels}
          preferredNextStep={preferredNextStep}
          onClose={() => setEndCallOpen(false)}
          onSaved={handleCallSaved}
        />
      )}
    </div>
  )
}
