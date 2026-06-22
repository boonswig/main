<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Read the docs before changing anything

`docs/` is the source of truth for how this app looks, behaves, and changes.
**Start with [docs/CHANGE_CONTROL.md](docs/CHANGE_CONTROL.md)** and read the doc
relevant to your change. Full index in [docs/README.md](docs/README.md):

- **CHANGE_CONTROL.md** — the charter; read before any change.
- **UI_RULES.md** — styling, colors, components, layout, icons.
- **UX_FLOW.md** — screens, navigation, the call flow.
- **ARCHITECTURE.md** — stack, data layer (JSON + Firestore), where logic lives.
- **DATA_MODEL.md** + **playbook.schema.json** — content shape (incl. the Close stage).
- **CONTENT_PIPELINE.md** — generate → review → freeze workflow (admin or script trigger).
- **ADMIN_GENERATION.md** — admin "Generate from source" flow (Vertex / Google Doc / text).
- **TRIAL_WORKFLOW.md** — config-driven free-trial workflow (data, not generated UI).
- **INDUSTRY_PLAYBOOKS.md** — industry targeting + UI tagging / standard-only toggle.
- **AI_INTEGRATION.md** — Gemini (runtime) vs Vertex (offline) boundary.

Non-negotiables: **playbook content is data, not code; it is generated offline,
reviewed, frozen, and changed only through the Admin dashboard. Never generate
playbook content at runtime. Never hand-edit `data/playbook.json` content.**
