# Content Pipeline

How industry-specific playbook content is created, reviewed, frozen, and
changed. This is the workflow that keeps content **stable and trustworthy**:
generated once, reviewed for effectiveness, then frozen — not regenerated on
every call, and not changed except through the Admin dashboard.

## Core invariant

> **Playbook content is generated OFFLINE, reviewed by a human, frozen into
> `data/playbook.json`, and changed only through the Admin dashboard. The
> running app NEVER generates playbook content.**

## The five steps

```
1. SOURCES        Curated resources for an industry, uploaded to Vertex.ai
        │
        ▼
2. GENERATE       scripts/generate-industry-content.ts  (offline, one-time)
   (offline)      → grounded in Vertex sources only
                  → validated against docs/playbook.schema.json
                  → writes data/drafts/<industry>.json   (NOT live)
        │
        ▼
3. REVIEW         Human checks effectiveness, accuracy, tone; edits the draft.
        │
        ▼
4. APPROVE/FREEZE Approved content gets provenance stamped (approvedAt set) and
                  is promoted into data/playbook.json + Firestore via Admin.
        │
        ▼
5. CHANGE         Only via Admin dashboard. Re-running the generator targets the
   (admin only)   DRAFT area again — it never silently overwrites live content.
```

### 1. Sources (Vertex.ai)
Each industry maps to a set of curated source documents in Vertex.ai. Record
which sources back which industry in
[INDUSTRY_PLAYBOOKS.md](./INDUSTRY_PLAYBOOKS.md). Content must be **grounded** in
these sources (RAG / grounded generation), not free-form model output.

### 2. Generate (offline, one-time)
- Entry point: `scripts/generate-industry-content.ts` (a stub today — see
  [AI_INTEGRATION.md](./AI_INTEGRATION.md)).
- Output target: **`data/drafts/<industry>.json`** — never `data/playbook.json`.
- Output must validate against
  [playbook.schema.json](./playbook.schema.json). Invalid shape = hard fail.
- Each generated item is stamped with `provenance`:
  ```json
  { "source": "vertex", "sourceRefs": ["..."], "generatedAt": "ISO", "version": 1 }
  ```
  Note: **no `approvedAt`** yet — it is a draft.

### 3. Review
A human reviews the draft for effectiveness and correctness and edits freely.
Drafts in `data/drafts/` may be committed for traceability but are **never read
by the running app**.

### 4. Approve & freeze
On approval:
- Stamp `reviewedBy` and `approvedAt` (presence of `approvedAt` = live/frozen).
- Promote into `data/playbook.json` **and** Firestore `playbook/current` via the
  Admin dashboard (the only sanctioned writer — see
  [ARCHITECTURE.md](./ARCHITECTURE.md)).
- Commit the updated `data/playbook.json`.

### 5. Change later
- Edits to live content happen **only** through the Admin dashboard.
- To regenerate from updated sources, re-run the generator → it writes a fresh
  **draft** → review → promote. The generator must never overwrite live content
  automatically.

## Rules for agents
- An LLM/agent may run or extend the generator and write to `data/drafts/`.
- An LLM/agent must **not** hand-edit content in `data/playbook.json`, and must
  **not** wire content generation into any runtime route.
- After producing a draft, **stop and hand off** for human review.

## Stable ids
Generated content must use **stable ids**. Answer-chip ids in particular are
referenced by `CloseRecommendation.chipIds`; regenerating with new ids silently
breaks close recommendations. Preserve ids across regenerations where the
content is conceptually the same.
