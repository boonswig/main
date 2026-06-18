# UX Flow

The canonical screen flow and each screen's contract. The order and
responsibilities here are fixed; see [CHANGE_CONTROL.md](./CHANGE_CONTROL.md).

## The flow

```
/login  →  /pre-call  →  /playbook  →  End Call modal  →  /dashboard
                            │
                            ├─ Qualification
                            ├─ Discovery
                            ├─ Product Pitch
                            ├─ Objection Handling
                            └─ Close

/admin  (admin role only — content & user management)
```

## Screen contracts

### `/login`
- **Owns:** authentication via NextAuth (credentials). Roles: `rep`, `admin`.
- **Must not:** expose admin tools to `rep`.

### `/pre-call`
- **Owns:** capturing `PreCallContext` (rep name, company, **industry**,
  contact, BANT, BDR notes). Optionally parses BDR notes via the
  `parse-bdr-notes` AI route. Persists to **localStorage**.
- **Invariant:** **industry is chosen here, once.** Everything downstream reads
  it and treats it as read-only. Industry is the key that drives industry-
  specific content (see [INDUSTRY_PLAYBOOKS.md](./INDUSTRY_PLAYBOOKS.md)).
- **Must not:** persist call telemetry (that's End Call).

### `/playbook`
- **Owns:** the live guided call. Renders the 5 stages, talking points,
  questions, objections — filtered by the selected industry. Call notes,
  global ⌘K search, signal tracking, smart prompts, the Close stage.
- **Data:** SSR seed from `data/playbook.json` (`readPlaybook()`), then
  subscribes to the Firestore `playbook/current` doc for live updates so admin
  edits appear without redeploy.
- **Invariant:** content is **read** here, never generated. Filtering is by
  `industries[]` / `industryTips` only.
- **Industry visibility:** industry-specific items are **tagged/badged** so the
  rep knows they're tailored, and a per-session "Show standard only" toggle lets
  the rep fall back to the industry-agnostic set. Presentation only — it does not
  change the selected industry. See [UI_RULES.md](./UI_RULES.md) and
  [INDUSTRY_PLAYBOOKS.md](./INDUSTRY_PLAYBOOKS.md).

### End Call modal
- **Owns:** capturing the outcome — `CallIntent`, `nextStep`, notes, signals,
  tool rating — and writing a `CallRecord` to **Firestore**.

### `/dashboard`
- **Owns:** read-only analytics over `CallRecord`s (intents, signals, tool
  ratings, CSV export). Has its own lightweight auth gate (`dashboard-auth`).
- **Must not:** edit playbook content.

### `/admin`  (admin only)
- **Owns:** the **only** sanctioned editing of live content — stages, openers,
  industry notes, close recommendations, users. Writes to both
  `data/playbook.json` (via `PUT /api/playbook`) and Firestore
  `playbook/current`.
- This is the promotion gate for reviewed content
  (see [CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md)).

## Adding features

Add capability **inside** an existing screen's contract. Inserting, reordering,
or merging screens is a structural change — surface it as a decision first.
