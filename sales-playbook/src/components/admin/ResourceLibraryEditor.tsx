'use client'

import { useState } from 'react'
import { ResourceLink, USE_CASES } from '@/types'

interface Props {
  resourceLinks: ResourceLink[]
  onChange: (links: ResourceLink[]) => void
}

const EMPTY: Omit<ResourceLink, 'id'> = {
  title: '',
  description: '',
  url: '',
  type: 'customer-facing',
  useCases: [],
  industries: [],
}

export default function ResourceLibraryEditor({ resourceLinks, onChange }: Props) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Omit<ResourceLink, 'id'>>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)

  function newId() {
    return `rl-${Date.now()}`
  }

  function setDraftField(field: keyof typeof draft, value: string | string[]) {
    setDraft((prev: Omit<ResourceLink, 'id'>) => ({ ...prev, [field]: value }))
  }

  function toggleDraftUseCase(id: string) {
    const current = draft.useCases ?? []
    setDraftField('useCases', current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id])
  }

  function saveNew() {
    if (!draft.title.trim() || !draft.url.trim()) return
    onChange([...resourceLinks, { ...draft, id: newId() }])
    setDraft(EMPTY)
    setAdding(false)
  }

  function deleteLink(id: string) {
    onChange(resourceLinks.filter((r) => r.id !== id))
  }

  function startEdit(link: ResourceLink) {
    setEditingId(link.id)
    setDraft({ title: link.title, description: link.description, url: link.url, type: link.type, useCases: link.useCases ?? [], industries: link.industries ?? [] })
  }

  function saveEdit() {
    if (!draft.title.trim() || !draft.url.trim()) return
    onChange(resourceLinks.map((r) => r.id === editingId ? { ...draft, id: r.id } : r))
    setEditingId(null)
    setDraft(EMPTY)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Resource Library</h3>
          <p className="text-xs text-slate-500 mt-0.5">Links to share with customers or use as internal reference. Searchable from the ⌘K modal.</p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Resource
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <ResourceForm
          draft={draft}
          onChange={setDraftField}
          onToggleUseCase={toggleDraftUseCase}
          onSave={saveNew}
          onCancel={() => { setAdding(false); setDraft(EMPTY) }}
          saveLabel="Add resource"
        />
      )}

      {/* Resource list */}
      {resourceLinks.length === 0 && !adding ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-sm text-slate-400">No resources yet — add your first link above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resourceLinks.map((link) => (
            <div key={link.id}>
              {editingId === link.id ? (
                <ResourceForm
                  draft={draft}
                  onChange={setDraftField}
                  onToggleUseCase={toggleDraftUseCase}
                  onSave={saveEdit}
                  onCancel={() => { setEditingId(null); setDraft(EMPTY) }}
                  saveLabel="Save changes"
                />
              ) : (
                <div className="flex items-start gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-slate-800">{link.title}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        link.type === 'internal' ? 'bg-slate-100 text-slate-500' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {link.type === 'internal' ? 'Internal' : 'Customer-facing'}
                      </span>
                    </div>
                    {link.description && <p className="text-xs text-slate-500 mb-1">{link.description}</p>}
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block max-w-xs">
                      {link.url}
                    </a>
                    {(link.useCases?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {USE_CASES.filter((uc) => link.useCases?.includes(uc.id)).map((uc) => (
                          <span key={uc.id} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{uc.emoji} {uc.label}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => startEdit(link)} className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Edit</button>
                    <button onClick={() => deleteLink(link.id)} className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResourceForm({
  draft,
  onChange,
  onToggleUseCase,
  onSave,
  onCancel,
  saveLabel,
}: {
  draft: Omit<ResourceLink, 'id'>
  onChange: (field: keyof Omit<ResourceLink, 'id'>, value: string | string[]) => void
  onToggleUseCase: (id: string) => void
  onSave: () => void
  onCancel: () => void
  saveLabel: string
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
          <input
            value={draft.title}
            onChange={(e) => onChange('title', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contractor Access Guide"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">URL *</label>
          <input
            value={draft.url}
            onChange={(e) => onChange('url', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://docs.google.com/..."
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
        <input
          value={draft.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="One line describing what this is and when to use it"
        />
      </div>
      <div className="flex items-center gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
          <div className="flex gap-2">
            {(['customer-facing', 'internal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onChange('type', t)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                  draft.type === t ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                {t === 'customer-facing' ? '📤 Customer-facing' : '🔒 Internal only'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Use cases (optional)</label>
        <div className="flex flex-wrap gap-1.5">
          {USE_CASES.map((uc) => {
            const active = draft.useCases?.includes(uc.id)
            return (
              <button
                key={uc.id}
                onClick={() => onToggleUseCase(uc.id)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border transition ${
                  active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                {uc.emoji} {uc.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={!draft.title.trim() || !draft.url.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-lg transition"
        >
          {saveLabel}
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-white transition">
          Cancel
        </button>
      </div>
    </div>
  )
}
