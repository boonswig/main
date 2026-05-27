'use client'

import { useState } from 'react'
import { Stage, Question, TalkingPoint, Objection, StageColor } from '@/types'

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

const COLOR_RING: Record<string, string> = {
  blue: 'ring-blue-500',
  purple: 'ring-purple-500',
  green: 'ring-emerald-500',
  orange: 'ring-orange-500',
  teal: 'ring-teal-500',
  red: 'ring-red-500',
  pink: 'ring-pink-500',
  indigo: 'ring-indigo-500',
}

type Tab = 'settings' | 'questions' | 'talkingPoints' | 'objections'

interface Props {
  stage: Stage
  onChange: (stage: Stage) => void
  colors: StageColor[]
}

function uid() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function StageEditor({ stage, onChange, colors }: Props) {
  const [tab, setTab] = useState<Tab>('questions')

  function updateField<K extends keyof Stage>(key: K, value: Stage[K]) {
    onChange({ ...stage, [key]: value })
  }

  // ── Questions ────────────────────────────────────────────────
  function addQuestion() {
    const q: Question = { id: uid(), question: '', purpose: '', followUps: [] }
    onChange({ ...stage, questions: [...stage.questions, q] })
  }
  function updateQuestion(updated: Question) {
    onChange({ ...stage, questions: stage.questions.map((q) => (q.id === updated.id ? updated : q)) })
  }
  function deleteQuestion(id: string) {
    onChange({ ...stage, questions: stage.questions.filter((q) => q.id !== id) })
  }

  // ── Talking Points ───────────────────────────────────────────
  function addTalkingPoint() {
    const tp: TalkingPoint = { id: uid(), title: '', content: '', tips: [] }
    onChange({ ...stage, talkingPoints: [...stage.talkingPoints, tp] })
  }
  function updateTalkingPoint(updated: TalkingPoint) {
    onChange({ ...stage, talkingPoints: stage.talkingPoints.map((t) => (t.id === updated.id ? updated : t)) })
  }
  function deleteTalkingPoint(id: string) {
    onChange({ ...stage, talkingPoints: stage.talkingPoints.filter((t) => t.id !== id) })
  }

  // ── Objections ───────────────────────────────────────────────
  function addObjection() {
    const obj: Objection = { id: uid(), objection: '', response: '', tips: [] }
    onChange({ ...stage, objections: [...stage.objections, obj] })
  }
  function updateObjection(updated: Objection) {
    onChange({ ...stage, objections: stage.objections.map((o) => (o.id === updated.id ? updated : o)) })
  }
  function deleteObjection(id: string) {
    onChange({ ...stage, objections: stage.objections.filter((o) => o.id !== id) })
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'settings', label: 'Settings', count: 0 },
    { id: 'questions', label: 'Questions', count: stage.questions.length },
    { id: 'talkingPoints', label: 'Talking Points', count: stage.talkingPoints.length },
    { id: 'objections', label: 'Objections', count: stage.objections.length },
  ]

  return (
    <div className="max-w-3xl">
      {/* Stage header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-3 h-3 rounded-full ${COLOR_DOT[stage.color] ?? 'bg-slate-400'}`} />
          <h1 className="text-2xl font-bold text-slate-800">{stage.name || 'Untitled Stage'}</h1>
        </div>
        <p className="text-sm text-slate-500">
          {stage.questions.length} questions · {stage.talkingPoints.length} talking points · {stage.objections.length} objections
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-xs bg-slate-200 text-slate-600 rounded-full px-1.5 py-0.5">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Stage name</label>
            <input
              value={stage.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Qualification"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={stage.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Brief description shown at the top of the stage page…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => updateField('color', c)}
                  className={`w-8 h-8 rounded-full ${COLOR_DOT[c]} transition ${
                    stage.color === c ? `ring-2 ring-offset-2 ${COLOR_RING[c]}` : 'opacity-60 hover:opacity-100'
                  }`}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Questions tab */}
      {tab === 'questions' && (
        <div className="space-y-3">
          {stage.questions.map((q) => (
            <QuestionCard key={q.id} question={q} onChange={updateQuestion} onDelete={() => deleteQuestion(q.id)} />
          ))}
          <button
            onClick={addQuestion}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Question
          </button>
        </div>
      )}

      {/* Talking Points tab */}
      {tab === 'talkingPoints' && (
        <div className="space-y-3">
          {stage.talkingPoints.map((tp) => (
            <TalkingPointCard key={tp.id} tp={tp} onChange={updateTalkingPoint} onDelete={() => deleteTalkingPoint(tp.id)} />
          ))}
          <button
            onClick={addTalkingPoint}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Talking Point
          </button>
        </div>
      )}

      {/* Objections tab */}
      {tab === 'objections' && (
        <div className="space-y-3">
          {stage.objections.map((obj) => (
            <ObjectionCard key={obj.id} objection={obj} onChange={updateObjection} onDelete={() => deleteObjection(obj.id)} />
          ))}
          <button
            onClick={addObjection}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Objection Handler
          </button>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────

function QuestionCard({ question, onChange, onDelete }: { question: Question; onChange: (q: Question) => void; onDelete: () => void }) {
  const [followUpInput, setFollowUpInput] = useState('')

  function addFollowUp() {
    if (!followUpInput.trim()) return
    onChange({ ...question, followUps: [...question.followUps, followUpInput.trim()] })
    setFollowUpInput('')
  }

  function removeFollowUp(i: number) {
    onChange({ ...question, followUps: question.followUps.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Question</label>
            <input
              value={question.question}
              onChange={(e) => onChange({ ...question, question: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What question will you ask?"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Why ask this?</label>
            <input
              value={question.purpose}
              onChange={(e) => onChange({ ...question, purpose: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What are you trying to learn? (shown to the rep)"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Follow-up questions</label>
            <div className="space-y-1.5 mb-2">
              {question.followUps.map((fu, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                  <span className="text-slate-400 text-sm">→</span>
                  <span className="flex-1 text-sm text-slate-600">{fu}</span>
                  <button onClick={() => removeFollowUp(i)} className="text-slate-400 hover:text-red-500 transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFollowUp()}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a follow-up and press Enter…"
              />
              <button onClick={addFollowUp} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-lg transition">
                Add
              </button>
            </div>
          </div>
        </div>
        <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function TalkingPointCard({ tp, onChange, onDelete }: { tp: TalkingPoint; onChange: (t: TalkingPoint) => void; onDelete: () => void }) {
  const [tipInput, setTipInput] = useState('')

  function addTip() {
    if (!tipInput.trim()) return
    onChange({ ...tp, tips: [...tp.tips, tipInput.trim()] })
    setTipInput('')
  }

  function removeTip(i: number) {
    onChange({ ...tp, tips: tp.tips.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Title</label>
            <input
              value={tp.title}
              onChange={(e) => onChange({ ...tp, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Short title for this talking point"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Content</label>
            <textarea
              value={tp.content}
              onChange={(e) => onChange({ ...tp, content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What should the rep say or do?"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tips</label>
            <div className="space-y-1.5 mb-2">
              {tp.tips.map((tip, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                  <span className="text-slate-400 text-sm">•</span>
                  <span className="flex-1 text-sm text-slate-600">{tip}</span>
                  <button onClick={() => removeTip(i)} className="text-slate-400 hover:text-red-500 transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tipInput}
                onChange={(e) => setTipInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTip()}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tip and press Enter…"
              />
              <button onClick={addTip} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-lg transition">Add</button>
            </div>
          </div>
        </div>
        <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function ObjectionCard({ objection, onChange, onDelete }: { objection: Objection; onChange: (o: Objection) => void; onDelete: () => void }) {
  const [tipInput, setTipInput] = useState('')

  function addTip() {
    if (!tipInput.trim()) return
    onChange({ ...objection, tips: [...objection.tips, tipInput.trim()] })
    setTipInput('')
  }

  function removeTip(i: number) {
    onChange({ ...objection, tips: objection.tips.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">Objection</label>
            <input
              value={objection.objection}
              onChange={(e) => onChange({ ...objection, objection: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-red-100 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="e.g. It's too expensive."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Response</label>
            <textarea
              value={objection.response}
              onChange={(e) => onChange({ ...objection, response: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-emerald-100 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              placeholder="What should the rep say in response?"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tips</label>
            <div className="space-y-1.5 mb-2">
              {objection.tips.map((tip, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                  <span className="text-slate-400 text-sm">•</span>
                  <span className="flex-1 text-sm text-slate-600">{tip}</span>
                  <button onClick={() => removeTip(i)} className="text-slate-400 hover:text-red-500 transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tipInput}
                onChange={(e) => setTipInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTip()}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tip and press Enter…"
              />
              <button onClick={addTip} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-lg transition">Add</button>
            </div>
          </div>
        </div>
        <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
