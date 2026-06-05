'use client'

import { useState } from 'react'
import { OpenerStyle, OpenerRule } from '@/types'

const TAG_COLOR_OPTIONS = [
  { key: 'blue',   label: 'Blue' },
  { key: 'amber',  label: 'Amber' },
  { key: 'slate',  label: 'Slate' },
  { key: 'green',  label: 'Green' },
  { key: 'purple', label: 'Purple' },
  { key: 'red',    label: 'Red' },
  { key: 'orange', label: 'Orange' },
  { key: 'teal',   label: 'Teal' },
] as const

interface Props {
  styles: OpenerStyle[]
  rules: OpenerRule[]
  onChangeStyles: (styles: OpenerStyle[]) => void
  onChangeRules: (rules: OpenerRule[]) => void
}

export default function OpenerEditor({ styles, rules, onChangeStyles, onChangeRules }: Props) {
  const [tab, setTab] = useState<'styles' | 'rules'>('rules')
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null)
  const [styleDraft, setStyleDraft] = useState<OpenerStyle | null>(null)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [ruleDraft, setRuleDraft] = useState<OpenerRule | null>(null)

  // ─── Style editing ────────────────────────────────────────────
  function startEditStyle(s: OpenerStyle) { setStyleDraft({ ...s }); setEditingStyleId(s.id) }
  function cancelStyle() { setStyleDraft(null); setEditingStyleId(null) }
  function saveStyle() {
    if (!styleDraft) return
    const exists = styles.some((s) => s.id === styleDraft.id)
    onChangeStyles(exists ? styles.map((s) => s.id === styleDraft.id ? styleDraft : s) : [...styles, styleDraft])
    cancelStyle()
  }
  function addStyle() {
    const s: OpenerStyle = {
      id: `style-${Date.now()}`,
      label: 'New Style',
      tag: '',
      tagColorKey: 'blue',
      opener: 'Hi {{name}},',
      agenda: '',
      bridge: 'How are browsers managed at {{company}} today?',
    }
    setStyleDraft(s)
    setEditingStyleId(s.id)
  }
  function deleteStyle(id: string) {
    if (!confirm('Delete this opener style?')) return
    onChangeStyles(styles.filter((s) => s.id !== id))
  }

  // ─── Rule editing ─────────────────────────────────────────────
  function startEditRule(r: OpenerRule) { setRuleDraft({ ...r }); setEditingRuleId(r.id) }
  function cancelRule() { setRuleDraft(null); setEditingRuleId(null) }
  function saveRule() {
    if (!ruleDraft) return
    const exists = rules.some((r) => r.id === ruleDraft.id)
    onChangeRules(exists ? rules.map((r) => r.id === ruleDraft.id ? ruleDraft : r) : [...rules, ruleDraft])
    cancelRule()
  }
  function addRule() {
    const r: OpenerRule = {
      id: `rule-${Date.now()}`,
      titleKeywords: [],
      industries: [],
      styleId: styles[0]?.id ?? '',
      priority: 5,
    }
    setRuleDraft(r)
    setEditingRuleId(r.id)
  }
  function deleteRule(id: string) {
    if (!confirm('Delete this rule?')) return
    onChangeRules(rules.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Call Opener</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage opener scripts and auto-selection rules. Rules match on contact title keywords and/or industry — the highest-priority match is auto-selected.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(['rules', 'styles'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-semibold capitalize transition border-b-2 -mb-px ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'rules' ? 'Auto-selection rules' : 'Opener styles'}
          </button>
        ))}
      </div>

      {/* Auto-selection rules */}
      {tab === 'rules' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={addRule}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add rule
            </button>
          </div>
          <p className="text-xs text-slate-400">Rules are evaluated by priority (highest first). A rule matches when ANY title keyword AND/OR ANY industry matches. Leave a list empty to match all.</p>
          {rules.length === 0 && (
            <div className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-200 rounded-xl">
              No rules yet — opener style defaults to the first available.
            </div>
          )}
          {[...rules].sort((a, b) => b.priority - a.priority).map((rule) => (
            <div key={rule.id} className="border border-slate-200 rounded-xl p-4 bg-white">
              {editingRuleId === rule.id && ruleDraft ? (
                <RuleForm
                  draft={ruleDraft}
                  styles={styles}
                  onChange={setRuleDraft}
                  onSave={saveRule}
                  onCancel={cancelRule}
                />
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Priority {rule.priority}
                      </span>
                      <span className="text-xs text-slate-500">→</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {styles.find((s) => s.id === rule.styleId)?.label ?? rule.styleId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Title keywords: {rule.titleKeywords.length > 0 ? rule.titleKeywords.join(', ') : <span className="italic">any</span>}
                    </p>
                    <p className="text-xs text-slate-500">
                      Industries: {rule.industries.length > 0 ? rule.industries.join(', ') : <span className="italic">any</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => startEditRule(rule)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => deleteRule(rule.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* New rule form */}
          {editingRuleId && !rules.find((r) => r.id === editingRuleId) && ruleDraft && (
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
              <RuleForm draft={ruleDraft} styles={styles} onChange={setRuleDraft} onSave={saveRule} onCancel={cancelRule} />
            </div>
          )}
        </div>
      )}

      {/* Opener styles */}
      {tab === 'styles' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={addStyle}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add style
            </button>
          </div>
          <p className="text-xs text-slate-400">Use <code className="bg-slate-100 px-1 rounded">{'{{name}}'}</code> and <code className="bg-slate-100 px-1 rounded">{'{{company}}'}</code> as placeholders in the script templates.</p>
          {styles.map((style) => (
            <div key={style.id} className="border border-slate-200 rounded-xl p-4 bg-white">
              {editingStyleId === style.id && styleDraft ? (
                <StyleForm draft={styleDraft} onChange={setStyleDraft} onSave={saveStyle} onCancel={cancelStyle} />
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-800">{style.label}</span>
                      <span className="text-xs text-slate-400">{style.tag}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 italic">&ldquo;{style.opener.replace(/\{\{name\}\}/g, '[Name]').replace(/\{\{company\}\}/g, '[Company]')}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => startEditStyle(style)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => deleteStyle(style.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {editingStyleId && !styles.find((s) => s.id === editingStyleId) && styleDraft && (
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
              <StyleForm draft={styleDraft} onChange={setStyleDraft} onSave={saveStyle} onCancel={cancelStyle} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RuleForm({
  draft, styles, onChange, onSave, onCancel,
}: {
  draft: OpenerRule
  styles: OpenerStyle[]
  onChange: (r: OpenerRule) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Style to select</label>
          <select
            value={draft.styleId}
            onChange={(e) => onChange({ ...draft, styleId: e.target.value })}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {styles.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
          <input
            type="number"
            value={draft.priority}
            onChange={(e) => onChange({ ...draft, priority: parseInt(e.target.value) || 0 })}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Title keywords <span className="text-slate-400 font-normal">(comma-separated, leave blank to match any title)</span>
        </label>
        <input
          type="text"
          value={draft.titleKeywords.join(', ')}
          onChange={(e) => onChange({ ...draft, titleKeywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          placeholder="e.g. ciso, security, cyber, cto"
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Industries <span className="text-slate-400 font-normal">(comma-separated IDs, leave blank to match any)</span>
        </label>
        <input
          type="text"
          value={draft.industries.join(', ')}
          onChange={(e) => onChange({ ...draft, industries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          placeholder="e.g. financial-services, technology"
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">Cancel</button>
        <button onClick={onSave} className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">Save</button>
      </div>
    </div>
  )
}

function StyleForm({
  draft, onChange, onSave, onCancel,
}: {
  draft: OpenerStyle
  onChange: (s: OpenerStyle) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Label</label>
          <input type="text" value={draft.label} onChange={(e) => onChange({ ...draft, label: e.target.value })}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Tag line</label>
          <input type="text" value={draft.tag} onChange={(e) => onChange({ ...draft, tag: e.target.value })}
            placeholder="e.g. Question-led"
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Tag colour</label>
          <select value={draft.tagColorKey} onChange={(e) => onChange({ ...draft, tagColorKey: e.target.value as OpenerStyle['tagColorKey'] })}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {TAG_COLOR_OPTIONS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>
      {(['opener', 'agenda', 'bridge'] as const).map((field) => (
        <div key={field}>
          <label className="block text-xs font-semibold text-slate-600 mb-1 capitalize">{field}</label>
          <textarea
            rows={3}
            value={draft[field]}
            onChange={(e) => onChange({ ...draft, [field]: e.target.value })}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
          />
        </div>
      ))}
      <div className="flex items-center gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-2 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">Cancel</button>
        <button onClick={onSave} className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">Save</button>
      </div>
    </div>
  )
}
