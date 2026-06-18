# Data Model

The shape of all playbook content. The **authoritative** definition is
`src/types/index.ts`; the **machine contract** is
[playbook.schema.json](./playbook.schema.json). This doc is the human-readable
description. **If you change the shape, update all three in the same commit.**

## Top level: `Playbook`

```ts
interface Playbook {
  stages: Stage[]
  closeRecommendations?: CloseRecommendation[]
  openerRules?: OpenerRule[]
  openerStyles?: OpenerStyle[]
  industryNotes?: IndustryNote[]
}
```

Stored in `data/playbook.json` and Firestore `playbook/current`.

## `Stage`

```ts
interface Stage {
  id: string
  name: string
  order: number          // stages render in ascending order
  description: string
  color: StageColor      // semantic key — see UI_RULES.md
  icon: string           // lucide icon name
  questions: Question[]
  talkingPoints: TalkingPoint[]
  objections: Objection[]
}
```

The 5 built-in stages: Qualification → Discovery → Product Pitch →
Objection Handling → Close. Stages are editable via Admin.

## Content items

`Question`, `TalkingPoint`, and `Objection` are the unit of content. They share
the **industry targeting** fields and (proposed) provenance:

```ts
// common targeting fields on Question / TalkingPoint / Objection
industries?: string[]                 // show only for these industry ids, or ['all']/empty = all
industryTips?: Record<string, string> // per-industry overlay text, keyed by industry id
keywords?: string[]                   // power ⌘K search + keyword triggers
provenance?: ContentProvenance        // generation/review audit (see CONTENT_PIPELINE.md)
```

- **Question** — `question`, `purpose`, `followUps[]`, optional `answerChips[]`.
  - **AnswerChip** — `id`, `label`, `pitchBullet`, optional `sayThis`,
    optional `deepDive { howItWorks, additionalProtections[], proofPoint? }`.
    Chip `id`s are referenced by close recommendations (below) — **stable ids
    matter.**
- **TalkingPoint** — `title`, `content`, `tips[]`.
- **Objection** — `objection`, `response`, `tips[]`.

### Industry resolution (render rule)
A content item shows for the selected industry when:
`industries` is empty/absent **OR** includes the industry id **OR** includes
`'all'`. This mirrors `itemMatchesIndustry()` in `StageContent.tsx`. Per-industry
`industryTips[industryId]` is overlaid on top. See
[INDUSTRY_PLAYBOOKS.md](./INDUSTRY_PLAYBOOKS.md) for the UI tagging/toggle rules.

## Openers

- **OpenerStyle** — `id`, `label`, `tag`, `tagColorKey`, plus templated
  `opener` / `agenda` / `bridge` strings using `{{name}}`, `{{company}}`.
- **OpenerRule** — routes a contact to a style: `titleKeywords[]` (matched
  against contact title), `industries[]`, `styleId`, `priority` (higher wins).

## Industry notes

- **IndustryNote** — `id`, `industry` (matches `INDUSTRIES` id), `label`,
  `talkingPoints: IndustryTalkingPoint[]`.
- **IndustryTalkingPoint** — `id`, `title`, `content`, optional `tips[]`.
Rendered in the `IndustryNotesPanel`; edited via the Admin industry-notes editor.

## The Close stage structure

The Close stage has **two layers** — document both, because they behave
differently:

### 1. Data-driven smart recommendation (in `playbook.json`)
- **CloseRecommendation** — `id`, `chipIds[]`, `nextStep`, `askThis`,
  `rationale`.
- **Matching logic** (`findBestRec` in `CloseStage.tsx` / `SmartCloseCard.tsx`):
  the rep tags answer chips during Discovery (`taggedAnswers`). Each
  recommendation scores by how many of its `chipIds` appear in the tagged set;
  the highest-scoring recommendation (score > 0) is surfaced as the suggested
  next step, with `askThis` language and `rationale`.
- **NEXT_STEP_OPTIONS** — the fixed enum of valid `nextStep` values
  (`src/types/index.ts`). `CloseRecommendation.nextStep` and the End Call
  `nextStep` must come from this list.

### 2. Component-embedded presets (currently hardcoded — known divergence)
These are **not** in `playbook.json` today; they live in component source:
- **Close option presets** — `CloseOption[]` in `CloseStage.tsx` and
  `CloseOptions.tsx` (`demo`, `pilot`, `stakeholder-call`, `send-resources`),
  each with `emoji`, `title`, `timing`, `suggested` language, `nextStep`.
- **Adoption roadmap** — `Phase[]` in `AdoptionRoadmap.tsx` (product-specific:
  `cep` / `cameyo`), each with `timing`, `title`, `who`, `steps[]`, `outcome`.

> ⚠️ **Known divergence from "content is data."** The presets and roadmap are
> hardcoded, so they are **not** editable via Admin and are **not** industry-
> filtered. If/when these need to vary by industry or be admin-editable, they
> must be migrated into `Playbook` (new typed fields + schema + Admin editor)
> rather than edited in component source. Do not hand-extend these arrays as a
> content change — see [CHANGE_CONTROL.md](./CHANGE_CONTROL.md).

## Call records (telemetry, Firestore)

- **CallRecord** — context snapshot + `intent: CallIntent`, `nextStep`,
  `nextStepNotes`, `signals[]` (tagged discovery chip labels), `toolRating` (1–5).
- **CallIntent** — `highintent | exploratory | timing | notafit`, styled via
  `INTENT_CONFIG`.

## Pre-call context (localStorage)
- **PreCallContext** — rep/company/contact fields, **industry**, BANT booleans,
  `bdrNotes`, `timestamp`. Drives industry filtering and opener selection.
