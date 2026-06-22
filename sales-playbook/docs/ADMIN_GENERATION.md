# Admin Generation (design)

How an admin generates suggested content from a source, reviews/amends it, and
saves it live. This is the **primary trigger** for the content pipeline
([CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md)).

> Status: **design doc**. Not yet implemented. This is the agreed target so the
> build stays consistent.

## Goal

In the Admin pane:
1. Pick a **source** (a Vertex industry corpus, a Google Doc URL, or pasted
   text).
2. Click **Generate suggested content**.
3. Review a **diff** of suggestions vs. current content; edit anything.
4. **Save** → content goes live to reps via the existing Firestore sync.

This keeps a human in the loop and never generates content during a live call.

## Source abstraction

All generation is "generate from a source." Treat sources uniformly so the same
review/save UI serves every case:

```ts
type GenerationSource =
  | { kind: 'vertex'; industry: string }      // grounded on the industry corpus
  | { kind: 'googleDoc'; url: string }         // parsed Google Doc
  | { kind: 'text'; content: string }          // pasted text
```

Each source resolves to grounding text/refs, then the same generate → validate →
diff → save path runs. Record which Vertex sources back which industry in
[INDUSTRY_PLAYBOOKS.md](./INDUSTRY_PLAYBOOKS.md).

## API route (proposed)

`POST /api/admin/generate-content` — **admin role only** (gate with the existing
auth; reject `rep`).

Request:
```jsonc
{
  "source": { "kind": "vertex", "industry": "healthcare" },
  "target": "stage" | "trialWorkflow",   // what shape to produce
  "stageId": "discovery"                   // when target=stage
}
```

Response: a **draft** (never persisted by this route) — schema-valid items
stamped with provenance (`source`, `sourceRefs`, `generatedAt`, no `approvedAt`),
plus a computed diff against current content (see merge below).

Hard requirements:
- Server-side credentials only (Vertex / Google). Never expose keys to client.
- Validate every generated item against
  [playbook.schema.json](./playbook.schema.json); reject invalid output.
- This route **does not write** `data/playbook.json` or Firestore. Saving is a
  separate, explicit admin action that reuses the existing save path
  (`PUT /api/playbook` + `savePlaybook`).
- Degrade gracefully: if the source/model is unconfigured, return HTTP 503 with
  a helpful message (match the `parse-bdr-notes` pattern).

## Grounding (Vertex)

- Upload curated resources into a **Vertex AI Search data store** (or RAG Engine
  corpus), tagged/partitioned by industry.
- Generate with Gemini on Vertex AI **grounded** on that store — the model must
  cite/stay within the curated material, not free-associate.
- Put `sourceRefs` (doc ids/uris used) into each item's provenance for audit.

## Google Doc ingestion

- **Private docs:** Google Docs API via a **service account**; share the doc
  with the service account, fetch and export to text server-side.
- **Shared/published docs:** the plain-text export endpoint
  (`/export?format=txt`).
- Either way the extracted text becomes a `text`/`googleDoc` source feeding the
  same pipeline.

## Review / diff UI

- Show **adds / updates / orphans** distinctly (see the merge strategy in
  [CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md)).
- Per-item accept / edit / reject. Nothing is live until **Save**.
- Industry-targeted output must set `industries[]` appropriately and will be
  tagged in the rep UI (see [INDUSTRY_PLAYBOOKS.md](./INDUSTRY_PLAYBOOKS.md)).
- On Save: stamp `reviewedBy` + `approvedAt`, merge preserving IDs, write via the
  existing save path.

## Stable IDs

Follow the merge/match rules in [CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md)
("Stable IDs & the merge strategy"). The diff UI is where orphaned items
(existing content with no generated match) are surfaced for a keep/remove
decision — never auto-deleted.

## What this does NOT change

- The rep call flow stays read-only and never calls a model.
- The Admin dashboard remains the only sanctioned writer of live content.
- UI stays a fixed contract — generation produces **data**, never UI
  ([UI_RULES.md](./UI_RULES.md), [CHANGE_CONTROL.md](./CHANGE_CONTROL.md)).
