# AI Integration

Where AI is allowed, where it isn't, and how the offline content pipeline works.

## The boundary

| AI use | Where | Model | Allowed? |
|--------|-------|-------|----------|
| Parse BDR notes → structured context | `POST /api/parse-bdr-notes` (runtime) | Gemini (`@google/generative-ai`) | ✅ Yes |
| Draft follow-up email | `POST /api/generate-email` (runtime) | Gemini | ✅ Yes |
| Generate **playbook content** (admin clicks Generate, human reviews + saves) | `POST /api/admin/generate-content` (authoring time) | Vertex.ai (grounded) | ✅ Admin only, gated by review |
| Generate **playbook content** in bulk / bootstrap | `scripts/generate-industry-content.ts` (offline) | Vertex.ai (grounded) | ✅ Offline only |
| Generate **playbook content during a live rep call** | — | — | ❌ **Forbidden** |

**Rule:** the live call flow never calls an LLM to produce playbook content.
Playbook content is offline-generated, reviewed, and frozen
([CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md)).

## Runtime AI (Gemini) conventions

- Read existing routes (`src/app/api/parse-bdr-notes/route.ts`,
  `generate-email/route.ts`) before adding AI features and match their shape.
- **Key gating:** if the API key is missing/placeholder, return **HTTP 503**
  with a helpful message (see `parse-bdr-notes`). Never crash the route.
- Prompts return **raw JSON only** when structured output is expected; parse
  defensively.
- Keep industry ids in sync with `INDUSTRIES` (the extraction prompt enumerates
  them from `src/lib/industries.ts` — reuse that, don't hardcode).

### Environment variables
- `GEMINI_API_KEY` — runtime Gemini routes.
- Firebase `NEXT_PUBLIC_FIREBASE_*` — live playbook sync + call telemetry
  (optional; app degrades gracefully without them).
- Vertex.ai credentials — used **only** by the offline generator, never shipped
  to or required by the running app.

## Offline pipeline (Vertex)

- Entry point: `scripts/generate-industry-content.ts` (stub — fill in the Vertex
  client, grounding against curated sources, and schema validation).
- It must: pull curated Vertex sources for an industry → generate content
  **grounded only in those sources** → validate against
  [playbook.schema.json](./playbook.schema.json) → stamp `provenance` → write to
  `data/drafts/<industry>.json`.
- It must **never** write `data/playbook.json` or touch Firestore. Promotion is
  a human + Admin step.

## Models
When choosing or upgrading models, prefer the latest capable models and confirm
current model ids rather than relying on memory. Keep the runtime model id in
one place per route so upgrades are a one-line change.
