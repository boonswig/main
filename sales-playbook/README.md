# Sales Playbook

A guided sales enablement web app for reps to use during live customer calls. Walk through Qualification → Discovery → Product Pitch → Objection Handling → Close with real-time checklists, talking points, and objection handlers.

## Features

- **Guided stage flow** — 5 built-in SaaS stages, fully editable
- **Stage progress tracker** — visual progress bars + checkboxes per item
- **Call notes panel** — persistent scratchpad, export as `.txt`
- **Global search** — instant ⌘K search across all content
- **Rep login** — JWT auth, two roles: `rep` and `admin`
- **Admin CMS** — edit all content, add/remove stages, manage users — no code needed

## Stack

- **Next.js 16** (App Router, Turbopack) · **Tailwind CSS v4** · **NextAuth v4** · **JSON files** (no DB needed)

## Getting Started

```bash
cd sales-playbook
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default accounts

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@company.com    | admin123  |
| Rep   | rep@company.com      | rep123    |

> ⚠️ Change these via Admin → Users before deploying.

## Data

All content lives in `data/playbook.json` and `data/users.json`. The Admin panel writes changes back to these files in real time.

## Deployment note

This app writes to local JSON files, so it needs a host with a **persistent writable filesystem** (VPS, Railway, Render, Docker volume). For Vercel, migrate the data layer to a database (e.g. Supabase).

---



```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
