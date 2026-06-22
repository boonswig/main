# Content Pipeline

How playbook content is created, reviewed, frozen, and changed. This is the
workflow that keeps content **stable and trustworthy**: generated from curated
sources, reviewed for effectiveness, then frozen — not regenerated on every
call, and not changed except through a human-reviewed save.

## Core invariant (read this carefully)

> **Generation happens at AUTHORING time, never during a live rep call.**
> Playbook content is generated from curated sources, **reviewed and amended by
> a human**, then frozen into `data/playbook.json` (+ Firestore `playbook/current`)
> through a save. The running call flow only ever *reads* content.

"Authoring time" includes **an admin clicking a Generate button** — a human is
in the loop and reviews before anything goes live. What is forbidden is the app
calling an LLM to produce questions/talking points/objections *while a rep is on
a call*. See [AI_INTEGRATION.md](./AI_INTEGRATION.md).

## Two triggers, one pipeline

Generation can be kicked off two ways. Both feed the **same** review → freeze →
save flow:

1. **Admin pane (primary):** an admin selects a source and clicks "Generate
   suggested content," reviews a diff, edits, and saves. This is the day-to-day
   path. Design: [ADMIN_GENERATION.md](./ADMIN_GENERATION.md).
2. **Offline script (batch/bootstrap):** `scripts/generate-industry-content.ts`
   for bulk or first-time generation. Writes drafts to `data/drafts/` for review.

Neither path writes live content without a human review + save.

## The flow

```
1. SOURCES        Curated material the model is grounded on:
                   • Vertex AI Search data store / RAG corpus (per industry)
                   • A linked Google Doc / pasted text (e.g. a trial SOP)
        │
        ▼
2. GENERATE       Trigger: Admin "Generate" button (primary) OR offline script.
                   • grounded ONLY in the selected source(s)
                   • output validated against docs/playbook.schema.json
                   • output is a DRAFT (no approvedAt)
        │
        ▼
3. REVIEW         Human reviews a diff (generated vs current), checks
                   effectiveness/accuracy/tone, and edits freely.
        │
        ▼
4. APPROVE/FREEZE On save: stamp provenance (reviewedBy, approvedAt), merge
                   into data/playbook.json + Firestore playbook/current.
        │
        ▼
5. PROPAGATE      Reps' PlaybookClient is subscribed to playbook/current, so the
                   change appears on their next render — no redeploy. Changes
                   only ever happen through this save path.
```

### How an update actually reaches reps (worked example: new healthcare info)
1. Add/refresh the healthcare material in the Vertex source.
2. Admin pane → select **Healthcare** → **Generate suggested content**.
3. Backend grounds Gemini on the healthcare source, returns schema-valid drafts.
4. Admin reviews the diff, amends, **Save**.
5. Save writes JSON + Firestore `playbook/current`; subscribed reps see it live.

The "last mile" (live propagation) is the **existing** Firestore sync — see
[ARCHITECTURE.md](./ARCHITECTURE.md). Generation only adds the *front* of the
pipeline.

## Stable IDs & the merge strategy (the hard part)

Regeneration must **preserve IDs** for conceptually-unchanged items. Answer-chip
IDs are referenced by `CloseRecommendation.chipIds`; fresh IDs silently break
close recommendations.

Rules for any generator (admin or script):
- Generate a **stable slug** per item (e.g. derived from a normalized title /
  canonical key), and map slug → existing ID before assigning IDs.
- On regeneration, **match** generated items to existing ones by slug:
  - match found → keep the existing `id`, update the body;
  - no match → new item with a new `id`;
  - existing item with no generated match → **never auto-delete**; flag it in the
    review UI for the human to keep or remove.
- Never renumber or reassign IDs in bulk.
- Surface adds / updates / orphans separately in the review diff so the human
  sees exactly what changes.

## Provenance

Every generated item carries `provenance` (`ContentProvenance` in
`src/types/index.ts`):

```json
{ "source": "vertex", "sourceRefs": ["..."], "generatedAt": "ISO", "version": 1 }
```

- A **draft** has no `approvedAt`.
- On save, the admin path stamps `reviewedBy` and `approvedAt` — presence of
  `approvedAt` marks content as reviewed/frozen/live.

## Rules for agents
- An LLM/agent may build or run the generator and write to `data/drafts/`.
- An LLM/agent must **not** hand-edit live content in `data/playbook.json`, and
  must **not** wire generation into any runtime *call* route. The admin generate
  route is fine because it is gated by human review + save.
- After producing a draft, **stop and hand off** for human review.
