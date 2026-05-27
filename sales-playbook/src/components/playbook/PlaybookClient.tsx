'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Playbook, Stage } from '@/types'
import StageSidebar from './StageSidebar'
import StageContent from './StageContent'
import CallNotesPanel from './CallNotesPanel'
import SearchModal from './SearchModal'

interface Props {
  playbook: Playbook
}

const NOTES_KEY = 'sales-playbook-notes'
const COMPLETED_KEY = 'sales-playbook-completed'

export default function PlaybookClient({ playbook }: Props) {
  const { data: session } = useSession()
  const stages = [...playbook.stages].sort((a, b) => a.order - b.order)

  const [activeStageId, setActiveStageId] = useState(stages[0]?.id ?? '')
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState('')
  const [notesOpen, setNotesOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTES_KEY)
      if (saved) setNotes(saved)
      const savedCompleted = localStorage.getItem(COMPLETED_KEY)
      if (savedCompleted) setCompletedItems(JSON.parse(savedCompleted))
    } catch {}
  }, [])

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, notes)
    } catch {}
  }, [notes])

  // Save completed items
  useEffect(() => {
    try {
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedItems))
    } catch {}
  }, [completedItems])

  // Keyboard shortcut: Cmd/Ctrl+K → search
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

  // Compute per-stage completion counts
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

  const handleNewCall = useCallback(() => {
    if (confirm('Start a new call? This will clear all checked items and notes.')) {
      setCompletedItems({})
      setNotes('')
      setActiveStageId(stages[0]?.id ?? '')
      localStorage.removeItem(NOTES_KEY)
      localStorage.removeItem(COMPLETED_KEY)
    }
  }, [stages])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <StageSidebar
        stages={stages}
        activeStageId={activeStageId}
        onSelectStage={setActiveStageId}
        stageProgress={stageProgress}
        session={session}
        onNewCall={handleNewCall}
        onSignOut={() => signOut({ callbackUrl: '/login' })}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{activeStage?.name}</h1>
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
                  {notes.length > 99 ? '99+' : notes.split('\n').filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Stage content */}
        <div className="p-6">
          {activeStage && (
            <StageContent
              stage={activeStage}
              completedItems={completedItems}
              onToggleItem={toggleItem}
            />
          )}
        </div>

        {/* Stage navigation */}
        <div className="px-6 pb-8 flex justify-between">
          {stages.findIndex((s) => s.id === activeStageId) > 0 && (
            <button
              onClick={() => {
                const idx = stages.findIndex((s) => s.id === activeStageId)
                setActiveStageId(stages[idx - 1].id)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous: {stages[stages.findIndex((s) => s.id === activeStageId) - 1]?.name}
            </button>
          )}
          <div className="ml-auto">
            {stages.findIndex((s) => s.id === activeStageId) < stages.length - 1 && (
              <button
                onClick={() => {
                  const idx = stages.findIndex((s) => s.id === activeStageId)
                  setActiveStageId(stages[idx + 1].id)
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 transition"
              >
                Next: {stages[stages.findIndex((s) => s.id === activeStageId) + 1]?.name}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Call notes panel */}
      {notesOpen && (
        <CallNotesPanel
          notes={notes}
          onChange={setNotes}
          onClose={() => setNotesOpen(false)}
          stageName={activeStage?.name}
        />
      )}

      {/* Search modal */}
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
    </div>
  )
}
