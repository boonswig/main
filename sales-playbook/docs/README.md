# Project docs — read these first

These documents are the **source of truth for how the Sales Playbook app looks,
behaves, and changes.** Any human or LLM working in this repo must read the
relevant doc before making a change, and must keep the app consistent with it.

If code and a doc disagree, that is a bug: fix one of them deliberately, don't
silently diverge.

## Index

| Doc | Read it before you… |
|-----|----------------------|
| [CHANGE_CONTROL.md](./CHANGE_CONTROL.md) | …make **any** change. This is the charter. |
| [UI_RULES.md](./UI_RULES.md) | …touch styling, colors, components, layout, icons. |
| [UX_FLOW.md](./UX_FLOW.md) | …add/move a screen, change navigation or the call flow. |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | …change the stack, data layer, or where logic lives. |
| [DATA_MODEL.md](./DATA_MODEL.md) | …change content shape or `data/playbook.json`. |
| [playbook.schema.json](./playbook.schema.json) | …generate or validate playbook content (machine contract). |
| [CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md) | …generate, review, or promote industry content. |
| [INDUSTRY_PLAYBOOKS.md](./INDUSTRY_PLAYBOOKS.md) | …add an industry or industry-specific content. |
| [AI_INTEGRATION.md](./AI_INTEGRATION.md) | …touch anything involving Gemini or Vertex. |

## The one-line philosophy

**Playbook content is data, not code. It is generated offline, reviewed,
frozen, and changed only through the Admin dashboard. The UI is a stable
contract, not a canvas.**
