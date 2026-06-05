'use client'

import { useState } from 'react'
import { IndustryNote, IndustryTalkingPoint } from '@/types'
import { INDUSTRIES } from '@/lib/industries'

interface Props {
  notes: IndustryNote[]
  onChange: (notes: IndustryNote[]) => void
}

export default function IndustryNotesEditor({ notes, onChange }: Props) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>(notes[0]?.industry ?? INDUSTRIES[0].id)
  const [editingTpId, setEditingTpId] = useState<string | null>(null)
  const [tpDraft, setTpDraft] = useState<IndustryTalkingPoint | null>(null)

  const currentNote = notes.find((n) => n.industry === selectedIndustry)
  const talkingPoints = currentNote?.talkingPoints ?? []

  function ensureNote(industryId: string): IndustryNote {
    const existing = notes.find((n) => n.industry === industryId)
    if (existing) return existing
    const ind = INDUSTRIES.find((i) => i.id === industryId)
    return { id: `in-${industryId}`, industry: industryId, label: ind?.name ?? industryId, talkingPoints: [] }
  }

  function updateNote(updated: IndustryNote) {
    const exists = notes.some((n) => n.industry === updated.industry)
    onChange(exists ? notes.map((n) => n.industry === updated.industry ? updated : n) : [...notes, updated])
  }

  function addTp() {
    const tp: IndustryTalkingPoint = { id: `tp-${Date.now()}`, title: '', content: '', tips: [] }
    setTpDraft(tp)
    setEditingTpId(tp.id)
  }

  function saveTp() {
    if (!tpDraft) return
    const note = ensureNote(selectedIndustry)
    const exists = note.talkingPoints.some((t) => t.id === tpDraft.id)
    const updated: IndustryNote = {
      ...note,
      talkingPoints: exists
        ? note.talkingPoints.map((t) => t.id === tpDraft.id ? tpDraft : t)
        : [...note.talkingPoints, tpDraft],
    }
    updateNote(updated)
    setTpDraft(null)
    setEditingTpId(null)
  }

  function deleteTp(id: string) {
    if (!confirm('Delete this talking point?')) return
    const note = ensureNote(selectedIndustry)
    updateNote({ ...note, talkingPoints: note.talkingPoints.filter((t) => t.id !== id) })
  }

  function startEdit(tp: IndustryTalkingPoint) {
    setTpDraft({ ...tp, tips: [...(tp.tips ?? [])] })
    setEditingTpId(tp.id)
  }

  function cancelEdit() { setTpDraft(null); setEditingTpId(null) }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Industry Talking Points</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Reps see these in a persistent panel during the call when a prospect's industry matches. Accessible from any stage.
        </p>
      </div>

      {/* Industry tabs */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200 pb-0">
        {INDUSTRIES.map((ind) => {
          const hasContent = notes.find((n) => n.industry === ind.id)?.talkingPoints.length ?? 0
          return (
            <button
              key={ind.id}
              onClick={() => { setSelectedIndustry(ind.id); cancelEdit() }}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 -mb-px transition flex items-center gap-1.5 ${
                selectedIndustry === ind.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {ind.name}
              {hasContent > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  selectedIndustry === ind.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {hasContent}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Talking points for selected industry */}
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            onClick={addTp}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add talking point
          </button>
        </div>

        {talkingPoints.length === 0 && !(editingTpId && !talkingPoints.find((t) => t.id === editingTpId)) && (
          <div className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-xl">
            No talking points for {INDUSTRIES.find((i) => i.id === selectedIndustry)?.name ?? selectedIndustry} yet.
          </div>
        )}

        {talkingPoints.map((tp) => (
          <div key={tp.id} className="border border-slate-200 rounded-xl bg-white">
            {editingTpId === tp.id && tpDraft ? (
              <TpForm draft={tpDraft} onChange={setTpDraft} onSave={saveTp} onCancel={cancelEdit} />
            ) : (
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{tp.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{tp.content}</p>
                  {tp.tips && tp.tips.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">{tp.tips.length} tip{tp.tips.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => startEdit(tp)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => deleteTp(tp.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* New item form */}
        {editingTpId && !talkingPoints.find((t) => t.id === editingTpId) && tpDraft && (
          <div className="border border-blue-200 rounded-xl bg-blue-50 p-4">
            <TpForm draft={tpDraft} onChange={setTpDraft} onSave={saveTp} onCancel={cancelEdit} />
          </div>
        )}
      </div>
    </div>
  )
}

function TpForm({
  draft, onChange, onSave, onCancel,
}: {
  draft: IndustryTalkingPoint
  onChange: (d: IndustryTalkingPoint) => void
  onSave: () => void
  onCancel: () => void
}) {
  const [tipsRaw, setTipsRaw] = useState((draft.tips ?? []).join('\n'))

  function handleTipsChange(val: string) {
    setTipsRaw(val)
    onChange({ ...draft, tips: val.split('\n').map((s) => s.trim()).filter(Boolean) })
  }

  return (
    <div className="space-y-3 p-1">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          placeholder="e.g. Regulatory compliance (FCA / PCI-DSS)"
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Content</label>
        <textarea
          rows={3}
          value={draft.content}
          onChange={(e) => onChange({ ...draft, content: e.target.value })}
          placeholder="The main talking point — what to say and why it matters for this industry."
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Tips <span className="text-slate-400 font-normal">(one per line)</span>
        </label>
        <textarea
          rows={3}
          value={tipsRaw}
          onChange={(e) => handleTipsChange(e.target.value)}
          placeholder="Name-drop specific regulations or audit bodies&#10;Ask about their last audit cycle&#10;Reference industry peer examples"
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
        />
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">Cancel</button>
        <button onClick={onSave} disabled={!draft.title || !draft.content} className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition">Save</button>
      </div>
    </div>
  )
}
