'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Playbook, Stage, StageColor, CloseRecommendation, OpenerStyle, OpenerRule, IndustryNote, ResourceLink } from '@/types'
import { savePlaybook as firestoreSavePlaybook, firestoreConfigured } from '@/lib/firestore'
import StageEditor from './StageEditor'
import UserManager from './UserManager'
import CloseRecommendationsEditor from './CloseRecommendationsEditor'
import OpenerEditor from './OpenerEditor'
import IndustryNotesEditor from './IndustryNotesEditor'
import ResourceLibraryEditor from './ResourceLibraryEditor'

const COLORS: StageColor[] = ['blue', 'purple', 'green', 'orange', 'teal', 'red', 'pink', 'indigo']

const COLOR_DOT: Record<string, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-emerald-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  red: 'bg-red-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
}

interface Props {
  initialPlaybook: Playbook
}

type View = 'stage' | 'close' | 'opener' | 'industry' | 'resources' | 'users'

export default function AdminClient({ initialPlaybook }: Props) {
  const [playbook, setPlaybook] = useState<Playbook>(initialPlaybook)
  const [selectedStageId, setSelectedStageId] = useState<string | null>(
    initialPlaybook.stages[0]?.id ?? null
  )
  const [view, setView] = useState<View>('stage')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const stages = [...playbook.stages].sort((a, b) => a.order - b.order)
  const selectedStage = stages.find((s) => s.id === selectedStageId) ?? null

  async function savePlaybook(updated: Playbook) {
    setSaving(true)
    setSaveStatus('idle')
    try {
      // Write to JSON file (existing)
      const res = await fetch('/api/playbook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error('Save failed')

      // Write to Firestore (live sync for reps)
      if (firestoreConfigured) {
        await firestoreSavePlaybook(updated)
      }

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const updateStage = useCallback(
    (updatedStage: Stage) => {
      const updated: Playbook = {
        ...playbook,
        stages: playbook.stages.map((s) => (s.id === updatedStage.id ? updatedStage : s)),
      }
      setPlaybook(updated)
      savePlaybook(updated)
    },
    [playbook]
  )

  const updateCloseRecs = useCallback(
    (closeRecommendations: CloseRecommendation[]) => {
      const updated: Playbook = { ...playbook, closeRecommendations }
      setPlaybook(updated)
      savePlaybook(updated)
    },
    [playbook]
  )

  const updateOpenerStyles = useCallback(
    (openerStyles: OpenerStyle[]) => {
      const updated: Playbook = { ...playbook, openerStyles }
      setPlaybook(updated)
      savePlaybook(updated)
    },
    [playbook]
  )

  const updateOpenerRules = useCallback(
    (openerRules: OpenerRule[]) => {
      const updated: Playbook = { ...playbook, openerRules }
      setPlaybook(updated)
      savePlaybook(updated)
    },
    [playbook]
  )

  const updateIndustryNotes = useCallback(
    (industryNotes: IndustryNote[]) => {
      const updated: Playbook = { ...playbook, industryNotes }
      setPlaybook(updated)
      savePlaybook(updated)
    },
    [playbook]
  )

  const updateResourceLinks = useCallback(
    (links: ResourceLink[]) => {
      const updated: Playbook = { ...playbook, resourceLinks: links }
      setPlaybook(updated)
      savePlaybook(updated)
    },
    [playbook]
  )

  function addStage() {
    const maxOrder = stages.reduce((max, s) => Math.max(max, s.order), 0)
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: 'New Stage',
      order: maxOrder + 1,
      description: '',
      color: 'blue',
      icon: 'Target',
      questions: [],
      talkingPoints: [],
      objections: [],
    }
    const updated = { ...playbook, stages: [...playbook.stages, newStage] }
    setPlaybook(updated)
    setSelectedStageId(newStage.id)
    setView('stage')
    savePlaybook(updated)
  }

  function deleteStage(id: string) {
    if (!confirm('Delete this stage? This cannot be undone.')) return
    const updated = { ...playbook, stages: playbook.stages.filter((s) => s.id !== id) }
    setPlaybook(updated)
    if (selectedStageId === id) setSelectedStageId(updated.stages[0]?.id ?? null)
    savePlaybook(updated)
  }

  function moveStage(id: string, dir: 'up' | 'down') {
    const sorted = [...stages]
    const idx = sorted.findIndex((s) => s.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === sorted.length - 1) return
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    const newStages = sorted.map((s) => ({ ...s }))
    const aOrder = newStages[idx].order
    newStages[idx].order = newStages[swapIdx].order
    newStages[swapIdx].order = aOrder
    const updated = { ...playbook, stages: newStages }
    setPlaybook(updated)
    savePlaybook(updated)
  }

  const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
    {
      id: 'users',
      label: 'Manage Users',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'close',
      label: 'Close Recommendations',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'opener',
      label: 'Call Opener',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      id: 'industry',
      label: 'Industry Notes',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'resources',
      label: 'Resource Library',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Admin sidebar */}
      <div className="w-64 flex-shrink-0 bg-slate-900 flex flex-col h-full">
        {/* Header */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Admin Panel</p>
              <p className="text-slate-400 text-xs">Content management</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="px-3 pt-4 pb-2">
          <Link
            href="/playbook"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-xs transition w-full mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Playbook
          </Link>

          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSelectedStageId(null) }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition mb-1 ${
                view === item.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Stage list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stages</p>
            <button onClick={addStage} title="Add stage" className="text-slate-400 hover:text-slate-200 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="space-y-1">
            {stages.map((stage, idx) => (
              <div
                key={stage.id}
                className={`group flex items-center gap-2 rounded-xl px-2 py-2 cursor-pointer transition ${
                  selectedStageId === stage.id && view === 'stage'
                    ? 'bg-slate-700 ring-1 ring-white/10'
                    : 'hover:bg-slate-800'
                }`}
                onClick={() => { setSelectedStageId(stage.id); setView('stage') }}
              >
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${COLOR_DOT[stage.color] ?? 'bg-slate-500'}`} />
                <span className="flex-1 text-sm text-slate-300 truncate">{stage.name}</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveStage(stage.id, 'up') }}
                    disabled={idx === 0}
                    className="p-0.5 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveStage(stage.id, 'down') }}
                    disabled={idx === stages.length - 1}
                    className="p-0.5 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteStage(stage.id) }}
                    className="p-0.5 text-red-400 hover:text-red-300"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-1">
          {saveStatus !== 'idle' && (
            <div className={`text-xs px-3 py-1.5 rounded-lg text-center ${
              saveStatus === 'saved' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
            }`}>
              {saveStatus === 'saved' ? '✓ Changes saved' : '✗ Save failed'}
            </div>
          )}
          {saving && (
            <div className="text-xs px-3 py-1.5 rounded-lg text-center bg-slate-800 text-slate-400">
              Saving…
            </div>
          )}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-xs transition w-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        {view === 'users' ? (
          <UserManager />
        ) : view === 'close' ? (
          <CloseRecommendationsEditor
            recs={playbook.closeRecommendations ?? []}
            onChange={updateCloseRecs}
          />
        ) : view === 'opener' ? (
          <OpenerEditor
            styles={playbook.openerStyles ?? []}
            rules={playbook.openerRules ?? []}
            onChangeStyles={updateOpenerStyles}
            onChangeRules={updateOpenerRules}
          />
        ) : view === 'industry' ? (
          <IndustryNotesEditor
            notes={playbook.industryNotes ?? []}
            onChange={updateIndustryNotes}
          />
        ) : view === 'resources' ? (
          <ResourceLibraryEditor
            resourceLinks={playbook.resourceLinks ?? []}
            onChange={updateResourceLinks}
          />
        ) : selectedStage ? (
          <StageEditor
            stage={selectedStage}
            onChange={updateStage}
            colors={COLORS}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Select a stage from the sidebar or add a new one.
          </div>
        )}
      </main>
    </div>
  )
}
