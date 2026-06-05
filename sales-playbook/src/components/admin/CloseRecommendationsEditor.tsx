'use client'

import { useState } from 'react'
import { CloseRecommendation, NEXT_STEP_OPTIONS } from '@/types'

interface Props {
  recs: CloseRecommendation[]
  onChange: (recs: CloseRecommendation[]) => void
}

const EMPTY: Omit<CloseRecommendation, 'id'> = {
  chipIds: [],
  nextStep: NEXT_STEP_OPTIONS[0],
  askThis: '',
  rationale: '',
}

export default function CloseRecommendationsEditor({ recs, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CloseRecommendation | null>(null)

  function startNew() {
    const rec: CloseRecommendation = { id: `cr-${Date.now()}`, ...EMPTY }
    setDraft(rec)
    setEditingId(rec.id)
  }

  function startEdit(rec: CloseRecommendation) {
    setDraft({ ...rec })
    setEditingId(rec.id)
  }

  function cancelEdit() {
    setDraft(null)
    setEditingId(null)
  }

  function saveEdit() {
    if (!draft) return
    const exists = recs.some((r) => r.id === draft.id)
    if (exists) {
      onChange(recs.map((r) => (r.id === draft.id ? draft : r)))
    } else {
      onChange([...recs, draft])
    }
    cancelEdit()
  }

  function deleteRec(id: string) {
    if (!confirm('Delete this recommendation?')) return
    onChange(recs.filter((r) => r.id !== id))
  }

  function setChipIds(raw: string) {
    if (!draft) return
    setDraft({ ...draft, chipIds: raw.split(',').map((s) => s.trim()).filter(Boolean) })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Close Recommendations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            When discovery chips are tagged, the recommended close card surfaces the best matching next step with suggested language.
          </p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add recommendation
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {recs.length === 0 && (
          <div className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-xl">
            No close recommendations yet. Add one to enable smart close suggestions.
          </div>
        )}
        {recs.map((rec) => (
          <div key={rec.id} className="border border-slate-200 rounded-xl p-4 bg-white">
            {editingId === rec.id && draft ? (
              <RecForm
                draft={draft}
                onChange={setDraft}
                onChipIds={setChipIds}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{rec.nextStep}</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-1">{rec.rationale || <span className="text-slate-400 italic">No rationale</span>}</p>
                  <p className="text-xs text-slate-400">
                    Chips: {rec.chipIds.length > 0 ? rec.chipIds.join(', ') : <span className="italic">none</span>}
                  </p>
                  {rec.askThis && (
                    <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">&ldquo;{rec.askThis}&rdquo;</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => startEdit(rec)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteRec(rec.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* New item inline form */}
        {editingId && !recs.find((r) => r.id === editingId) && draft && (
          <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
            <RecForm
              draft={draft}
              onChange={setDraft}
              onChipIds={setChipIds}
              onSave={saveEdit}
              onCancel={cancelEdit}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function RecForm({
  draft,
  onChange,
  onChipIds,
  onSave,
  onCancel,
}: {
  draft: CloseRecommendation
  onChange: (d: CloseRecommendation) => void
  onChipIds: (raw: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Next step</label>
          <select
            value={draft.nextStep}
            onChange={(e) => onChange({ ...draft, nextStep: e.target.value })}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {NEXT_STEP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Trigger chip IDs <span className="text-slate-400 font-normal">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={draft.chipIds.join(', ')}
            onChange={(e) => onChipIds(e.target.value)}
            placeholder="e.g. has-citrix-rds, legacy-erp"
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Rationale <span className="text-slate-400 font-normal">(shown in card)</span></label>
        <input
          type="text"
          value={draft.rationale}
          onChange={(e) => onChange({ ...draft, rationale: e.target.value })}
          placeholder="Brief explanation of why this next step fits"
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Words to use <span className="text-slate-400 font-normal">(suggested language)</span></label>
        <textarea
          rows={3}
          value={draft.askThis}
          onChange={(e) => onChange({ ...draft, askThis: e.target.value })}
          placeholder="Write the suggested language the rep should use to ask for this next step…"
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          Cancel
        </button>
        <button onClick={onSave} className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          Save
        </button>
      </div>
    </div>
  )
}
