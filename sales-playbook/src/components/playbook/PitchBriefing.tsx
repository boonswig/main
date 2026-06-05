'use client'

import { Question, AnswerChip } from '@/types'

interface TaggedChip {
  questionLabel: string
  chip: AnswerChip
  isCameyo: boolean
}

interface Props {
  taggedAnswers: Record<string, string[]>
  questions: Question[]
}

function collectTaggedChips(taggedAnswers: Record<string, string[]>, questions: Question[]): TaggedChip[] {
  return questions.flatMap((q) => {
    const taggedIds = taggedAnswers[q.id] ?? []
    return taggedIds.flatMap((chipId) => {
      const chip = q.answerChips?.find((c) => c.id === chipId)
      if (!chip) return []
      return [{ questionLabel: q.question, chip, isCameyo: q.id === 'd-q-legacy-apps' }]
    })
  })
}

function getPitchOpener(taggedChips: TaggedChip[]): string {
  if (taggedChips.length === 0) return ''
  const hasCameyo = taggedChips.some((t) => t.isCameyo)
  const hasCep = taggedChips.some((t) => !t.isCameyo)

  if (hasCameyo && hasCep) {
    return "I want to show you two things that work together. Chrome Enterprise Premium secures the browser layer for everything you described around security and data control. Cameyo eliminates your Windows infrastructure dependency — apps stream in a Chrome tab, no Citrix, no servers. Together they're a browser-first platform that addresses everything we just discussed."
  }
  if (hasCameyo) {
    return "Based on what you've described, Cameyo is the right starting point. Any Windows application — your legacy tools, your ERP — streams in a Chrome tab from the cloud. No servers to build, no client to install. Your users see no difference; your IT team loses the infrastructure overhead."
  }
  return "Chrome Enterprise Premium turns the browser into your security perimeter. Policy-controlled, DLP-enforced, threat-protected — deployed to existing Chrome browsers in hours. Everything we talked about — the visibility gaps, the data controls, the unmanaged devices — CEP addresses at the browser layer without replacing anything you already have."
}

export default function PitchBriefing({ taggedAnswers, questions }: Props) {
  const taggedChips = collectTaggedChips(taggedAnswers, questions)

  if (taggedChips.length === 0) {
    return (
      <div className="mx-6 mt-4 rounded-xl border border-dashed border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-400 text-center">
          No gaps tagged in discovery — go back to tag what you heard and the pitch will personalise itself.
        </p>
      </div>
    )
  }

  const opener = getPitchOpener(taggedChips)
  const cepChips = taggedChips.filter((t) => !t.isCameyo)
  const cameyoChips = taggedChips.filter((t) => t.isCameyo)

  return (
    <div className="mx-6 mt-4 space-y-3">
      {/* Opening line */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">How to open</p>
        <p className="text-sm text-blue-900 leading-relaxed italic">&ldquo;{opener}&rdquo;</p>
      </div>

      {/* CEP response cards */}
      {cepChips.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">
            🔒 Chrome Enterprise Premium — address their specific gaps
          </p>
          <div className="space-y-2">
            {cepChips.map(({ chip }) => (
              <div key={chip.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">{chip.label}</span>
                  <span className="text-xs text-blue-600 font-medium whitespace-nowrap flex-shrink-0">CEP</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{chip.pitchBullet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cameyo response cards */}
      {cameyoChips.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">
            🖥️ Cameyo — modernise their application delivery
          </p>
          <div className="space-y-2">
            {cameyoChips.map(({ chip }) => (
              <div key={chip.id} className="rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <span className="text-xs font-semibold text-purple-800">{chip.label}</span>
                  <span className="text-xs text-purple-600 font-medium whitespace-nowrap flex-shrink-0">Cameyo</span>
                </div>
                <p className="text-xs text-purple-900 leading-relaxed">{chip.pitchBullet}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
