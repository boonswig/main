# Change Control

This is the charter that keeps the app from drifting. Read it before **any**
change. It exists so that adding features never produces major or unpredictable
changes to the UI or to playbook content.

## Golden rules

1. **The UI is a contract.** Visual changes must conform to
   [UI_RULES.md](./UI_RULES.md). Do not introduce new colors, spacing scales,
   fonts, or component patterns ad hoc.
2. **The flow is fixed.** The screen order and each screen's responsibilities
   are defined in [UX_FLOW.md](./UX_FLOW.md). Add capability *within* a screen;
   do not reorder, merge, or insert screens without an explicit decision.
3. **Playbook content is data, not code.** It lives in `data/playbook.json`
   (committed source of truth) and the Firestore `playbook/current` doc (live
   runtime copy). See [ARCHITECTURE.md](./ARCHITECTURE.md).
4. **Content is generated at authoring time, never during a live call.** The app
   must not call an LLM to produce questions, talking points, or objections while
   a rep is on a call. Generation is triggered by an admin (Generate button) or
   an offline script, then **reviewed by a human and saved** before going live.
   See [CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md) and
   [ADMIN_GENERATION.md](./ADMIN_GENERATION.md).
5. **The Admin dashboard is the only sanctioned writer of live content.**
   Promotion of reviewed content into `data/playbook.json` + Firestore happens
   through Admin (or a reviewed pipeline step), never by hand-editing JSON in a
   feature branch and never by an autonomous agent.
6. **Schema is the law for content shape.** Generated or edited content must
   validate against [playbook.schema.json](./playbook.schema.json), which
   mirrors `src/types/index.ts`. If you change the shape, change all three
   (types, schema, DATA_MODEL.md) in the same commit.

## Pre-change checklist

Before opening a change, answer these. If any answer is "yes," follow the
linked doc.

- [ ] Does it change colors, spacing, typography, icons, or component look? → **UI_RULES.md**
- [ ] Does it add/move/remove a screen, route, or change navigation? → **UX_FLOW.md**
- [ ] Does it change the data layer or where logic lives? → **ARCHITECTURE.md**
- [ ] Does it change the shape of playbook content? → update **types + schema + DATA_MODEL.md** together
- [ ] Does it hand-edit `data/playbook.json` content? → **STOP.** Use the Admin dash / pipeline instead
- [ ] Does it make the app generate playbook content at runtime? → **FORBIDDEN**
- [ ] Does it add a new industry? → **INDUSTRY_PLAYBOOKS.md**

## For LLM agents specifically

- You may edit **code and docs**. You may **not** hand-author or rewrite
  entries in `data/playbook.json` as part of a feature change — that content is
  human-reviewed editorial material.
- When asked to add industry content, run/extend the offline pipeline that
  writes to `data/drafts/`, then stop and ask a human to review and promote.
- When in doubt about whether a change is "structural" (flow/UI/data shape),
  treat it as structural and surface the decision rather than guessing.
