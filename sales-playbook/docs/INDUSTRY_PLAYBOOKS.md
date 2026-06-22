# Industry Playbooks

How the playbook adapts to the industry selected in pre-call.

## The mechanism (already built)

1. The canonical industry list is `INDUSTRIES` in `src/lib/industries.ts`
   (`id`, `name`, `description`). Industry ids are the join key everywhere.
2. The rep selects an industry **once** in `/pre-call`; it is stored in
   `PreCallContext` (localStorage) and read-only downstream.
3. Content items (`Question`, `TalkingPoint`, `Objection`) target industries via:
   - `industries?: string[]` — show only for these ids (empty/absent or `'all'`
     = show for every industry). Render rule mirrors `itemMatchesIndustry()` in
     `StageContent.tsx`.
   - `industryTips?: Record<string, string>` — extra per-industry text overlaid
     on an item that otherwise shows for everyone.
4. `IndustryNote` provides a whole per-industry panel (`IndustryNotesPanel`).
5. `OpenerRule.industries[]` routes opener style by industry.

## UI requirements for industry content

When industry-specific content is shown, the rep must always know what is
industry-specific vs. standard, and be able to fall back to the standard set.

1. **Tag/highlight industry-specific items.** Any item that is shown *because*
   it targets the selected industry (its `industries[]` names the industry and
   is not just `['all']`/empty), or that is showing an `industryTips[industry]`
   overlay, must carry a clear visual tag — e.g. an "Industry: Healthcare"
   badge — so the rep knows it's tailored. Use the existing tag/badge styling
   conventions in [UI_RULES.md](./UI_RULES.md); do not invent a new chip style.
2. **Toggle to the standard set.** The rep must be able to **hide industry-
   specific content and view only the standard (industry-agnostic) set** —
   items with empty/`['all']` `industries`, with industry tips suppressed. This
   is a per-session view toggle (e.g. "Show standard only"), default **off**
   (industry content shown). It does **not** change the selected industry or any
   stored data — it is presentation only.
3. Tagging and the toggle apply consistently across Questions, Talking Points,
   and Objections (and industry note panels).

> Implementation note: the filter/tag distinction needs to know *why* an item is
> visible. `itemMatchesIndustry()` currently returns a boolean; to tag and to
> support "standard only," compute a small status per item, e.g.
> `'standard' | 'industry'` (industry = targeted at this industry and/or has a
> tip for it). Standard-only view keeps `'standard'` items and drops industry
> overlays.

## Adding a new industry (e.g. healthcare)

1. **Add it to `INDUSTRIES`** in `src/lib/industries.ts` (`id`, `name`,
   `description`). The id is the join key for everything below.
2. **Curate sources** for it in Vertex.ai and record them in the coverage table.
3. **Generate → review → freeze** its content via the pipeline
   ([CONTENT_PIPELINE.md](./CONTENT_PIPELINE.md)). Tag items with the new id in
   `industries[]` and/or add `industryTips[id]`.
4. Optionally add an `IndustryNote` and `OpenerRule`s for it.
5. Update the coverage table below.

Until an industry has reviewed content, generic (`industries: []`) content still
shows, so the flow degrades gracefully.

## Priority verticals

These are the focus verticals (best product-market fit) — build and review their
content first. They are flagged `priority: true` in `INDUSTRIES` and grouped
first (under "Priority verticals", marked ★) in the pre-call industry picker:

- `healthcare` — Healthcare
- `financial-services` — Finance
- `construction` — Construction
- `government-federal` — Government — Federal
- `government-local` — Government — Local

> Note: `financial-services` is the id for the "Finance" priority vertical — the
> id is kept stable so existing content/opener rules keep matching.

## Coverage status

Legend: ✅ done · 🟡 in progress · ⬜ not started · ⭐ priority

| Industry (id) | Priority | Vertex sources | Generated | Reviewed | Live |
|---|---|---|---|---|---|
| healthcare | ⭐ | ⬜ | ⬜ | ⬜ | ⬜ |
| financial-services (Finance) | ⭐ | ⬜ | ⬜ | ⬜ | ⬜ |
| construction | ⭐ | ⬜ | ⬜ | ⬜ | ⬜ |
| government-federal | ⭐ | ⬜ | ⬜ | ⬜ | ⬜ |
| government-local | ⭐ | ⬜ | ⬜ | ⬜ | ⬜ |
| retail | | ⬜ | ⬜ | ⬜ | ⬜ |
| manufacturing | | ⬜ | ⬜ | ⬜ | ⬜ |
| professional-services | | ⬜ | ⬜ | ⬜ | ⬜ |
| technology | | ⬜ | ⬜ | ⬜ | ⬜ |

> Keep this table in sync with `INDUSTRIES` and with what is actually live in
> `data/playbook.json`. It is the at-a-glance source of truth for coverage.
