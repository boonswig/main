# UI Rules

The visual contract for the app. These rules are **descriptive of what is
already built** — follow them so new work blends in instead of restyling.

This is a **live-call tool**. The rep is talking to a customer while using it.
Every UI decision is judged by: *can the rep scan it in two seconds without
losing the conversation?*

## Stack

- **Next.js 16** App Router + **React 19**
- **Tailwind CSS v4** (imported via `@import "tailwindcss"` in
  `src/app/globals.css`) — utility classes only, no separate CSS modules
- **lucide-react** for all icons
- **Inter** font, loaded in `src/app/layout.tsx` via `next/font/google`

Do not add a CSS-in-JS library, a component framework, or a second icon set.

## Color system

Colors are **semantic keys**, not raw hex. Two enumerations are the law:

- **Stage colors** — `StageColor` in `src/types/index.ts`:
  `blue | purple | green | orange | teal | red | pink | indigo`
- **Tag colors** — `tagColorKey` on `OpenerStyle`:
  `blue | amber | slate | green | purple | red | orange | teal`

Rules:
- A new stage or tag picks an existing key. Do **not** invent new color names or
  drop raw hex values into components.
- Map keys to Tailwind classes in the same place the existing components do;
  reuse that map rather than re-deriving it.
- Intent colors are fixed in `INTENT_CONFIG` (`src/types/index.ts`) — reuse it,
  don't hardcode intent styling.

## Icons

- lucide-react only. Stage/section icons are referenced by **string name**
  (`Stage.icon`), resolved through the existing icon lookup. Add an icon by
  extending that lookup, not by importing icons ad hoc across components.

## Layout & components

Reuse the established patterns in `src/components/playbook/`:
- **Card / panel** surfaces with consistent rounding, border, and padding.
- **Sidebar** for stage navigation (`StageSidebar`).
- **Floating / docked panels** for notes and objections rather than full-screen
  takeovers.

Rules:
- Match the existing spacing scale and rounding; don't introduce new ones.
- Talking points and the next action must be reachable **without scrolling past
  the fold** on a laptop. Density over decoration.
- No mid-call modal traps. Modals are for discrete decisions (End Call, Search);
  the main flow stays navigable.
- Keep components presentational; content comes from the playbook data, never
  hardcoded copy in JSX.

## Industry-specific content (tagging + standard-only toggle)

The rep must always be able to tell tailored content from the standard set, and
opt out of tailoring. (Full behavior in [INDUSTRY_PLAYBOOKS.md](./INDUSTRY_PLAYBOOKS.md).)

- **Tag it.** Any item shown because it targets the selected industry, or that
  shows an `industryTips[industry]` overlay, gets a clear badge (e.g. "Industry:
  Healthcare"). Use the existing tag/badge styling (the same conventions as
  opener `tagColorKey` chips and intent tags) — do **not** invent a new chip
  style or color.
- **Standard-only toggle.** Provide a per-session "Show standard only" control
  that hides industry-targeted items and suppresses industry tips, leaving the
  industry-agnostic set. Default **off** (industry content shown). It is
  presentation only — it must not change the selected industry or any stored
  data.
- Apply tagging and the toggle consistently across Questions, Talking Points,
  Objections, and industry note panels.

## Tone & copy

- Imperative, short, rep-facing ("Ask this", "Say this", "Next step").
- Customer-facing language lives in the **data** (`sayThis`, `opener`,
  `askThis`), not in components.

## Do / Don't

✅ **Do**: add a new stage with `color: 'teal'` and an existing icon key; render
its content through `StageContent`.

❌ **Don't**: add a stage with `color: '#1f9d8a'`, a new gradient style, and a
bespoke card layout that only that stage uses.
