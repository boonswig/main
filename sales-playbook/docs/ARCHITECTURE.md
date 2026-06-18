# Architecture

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19**
- **Tailwind CSS v4**
- **NextAuth v4** (credentials provider; roles `rep` / `admin`)
- **Google Generative AI** (Gemini) for two runtime helper routes only
- **Firebase / Firestore** for live playbook sync + call telemetry
- Content persisted as **JSON files** in `data/`

> ⚠️ This is Next.js 16 — APIs and conventions differ from older versions.
> See `AGENTS.md`; consult `node_modules/next/dist/docs/` before writing
> framework code.

## Where things live

```
src/app/            routes (App Router) + API route handlers
src/components/      UI, grouped by area: pre-call / playbook / admin / dashboard
src/lib/            data access + domain logic (playbook, firestore, auth, industries, …)
src/types/          all shared types — the content shape source of truth
data/               playbook.json, users.json   (committed content)
data/drafts/        generated, UNreviewed industry content (NOT live)
docs/               this documentation set
scripts/            offline tooling (e.g. industry content generation)
```

## The data layer (important)

There are **two stores** for playbook content, and they must stay in sync:

| Store | Role | Written by |
|-------|------|-----------|
| `data/playbook.json` | Committed **source of truth** + SSR seed (`readPlaybook()`) | `PUT /api/playbook` (Admin) |
| Firestore `playbook/current` | **Live runtime copy** reps subscribe to for instant updates | `savePlaybook()` (Admin) |

Flow at runtime:
1. `/playbook` server-renders from `data/playbook.json`.
2. `PlaybookClient` subscribes to Firestore `playbook/current` and overrides the
   seed with live content.
3. The Admin dash writes **both** stores on save — that is the only sanctioned
   write path for live content.

Other data:
- **Users:** `data/users.json` (bcrypt hashes), managed via Admin.
- **Call telemetry:** Firestore `calls` collection (`CallRecord`), written by the
  End Call modal, read by `/dashboard`.
- **Pre-call context:** browser **localStorage** only (not persisted server-side).

### Graceful degradation
Firestore is optional: `firestoreConfigured` gates all Firestore calls. With no
Firebase env vars, the app still runs off `data/playbook.json` (no live sync, no
telemetry). Keep this property — never make Firestore a hard dependency for the
core call flow.

## Deployment constraint
The app writes to local JSON files, so it needs a host with a **persistent
writable filesystem** (VPS, Railway, Render, Docker volume). On ephemeral hosts
(e.g. Vercel) the JSON writes won't persist — rely on Firestore as the live
store there, and treat `data/playbook.json` as the seed.

## AI boundary
See [AI_INTEGRATION.md](./AI_INTEGRATION.md). In short: Gemini is used **only**
for `parse-bdr-notes` and `generate-email`. Vertex is used **only** in the
**offline** content pipeline. The live call flow never calls an LLM to produce
playbook content.
