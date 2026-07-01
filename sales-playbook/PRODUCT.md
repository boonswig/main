# CEP + Cameyo Sales Enablement Tool — Product Overview

## What This Is

A web-based sales enablement hub for Chrome Enterprise Premium (CEP) and Cameyo account executives and BDRs. It helps reps run better first calls, log outcomes, prep between calls, and access a shared resource library — all connected to a live admin-managed content layer and analytics dashboard.

## Core Problem

First calls are typically 20–25 minutes with time-poor SMB IT decision-makers. The best possible outcome is **earning a committed next step** (demo, deep-dive call, or trial) — not a sale. The tool exists to help reps maximise that chance by arriving prepared, staying focused during the call, and capturing useful data after.

## The Three Modes

### 1. Guided Call (`/playbook`)
Hand-held call flow for reps who want structure. Five stages:
- **Open** — role/industry-aware opener script with auto-selection
- **Discovery** — context-aware prompts, tagged answer chips, "ask this next" card
- **Pitch** — personalised briefing based on discovery signals
- **Objections** — response library, adoption roadmap
- **Close** — recommended next step based on signals, words to use, one-click log call

Features: Firestore live sync (admin changes appear mid-call), floating industry notes panel, keyword trigger search, BDR notes AI extraction (Gemini), SalesLoft email integration.

### 2. Log a Call (`/pre-call` → quick log)
Lightweight post-call capture without the guided flow. For experienced reps or follow-up logging. Captures: use case, key signals, next step, resources sent, intent rating.

### 3. Resources & Prep (`/resources`)
Browseable content library for pre-call prep and self-study. Three card types:
- **Discovery Questions** — expandable with rationale, "listen for" tips, follow-up suggestion
- **Pitch Cards** — use case value props with key points, copyable
- **Resource Links** — URLs to share with customers or use as internal reference, searchable via ⌘K

All content is admin-editable and live via Firestore.

## The First Call Framework

### Goal
Generate enough interest and trust that the customer commits to a specific next step — a demo, deep-dive, or trial. Not to sell. Not to cover everything.

### Structure (20 minutes)
| Phase | Time | What happens |
|---|---|---|
| Open | 0–2 min | Intro, agenda, set low-pressure tone |
| Anchor question | 2–4 min | "What made you take this call today?" — then listen |
| Use case exploration | 4–13 min | 2 targeted follow-up questions, tap use case chips |
| Value | 13–18 min | One clear value prop matched to their situation |
| Close | 18–20 min | Agree one next step, use suggested language |

### The Five Use Cases
1. **Contractor Access** — controlling what contractors can do on personal devices
2. **BYOD / Personal Devices** — enforcing policies without MDM
3. **Data Protection** — preventing sensitive data leaving via the browser
4. **Gen AI Oversight** — governing which AI tools employees use and what goes in
5. **Web Filtering** — phishing protection and URL blocking on any device/network
6. **Citrix / VDI Replacement** — Cameyo delivering Windows apps via Chrome

### Pre-Call Signals That Shape the Conversation
- Contact title/role → tone and vocabulary
- Lead source → intent level (inbound = evaluating; cold = earn it first)
- Current solution → Citrix/VDI = TCO conversation; nothing managed = security angle
- Contractor situation → contractor branch immediately
- BYOD situation → personal device access gap

### Close Framework (not a script — pointers)
- Mirror their use case back to them
- Frame next step as specific and low-commitment ("30-minute session focused on exactly that")
- Offer trial OR demo — let them pick
- Mention something you'll send in the meantime
- Ask for a specific day/time

## Data & Admin

### Admin (`/admin`)
- Edit all playbook content: stages, questions, talking points, objections
- Configure: close recommendations, call opener styles/rules, industry notes
- Manage resource library: questions bank, pitch cards, resource links (URLs)
- All saves dual-write to JSON file + Firestore simultaneously

### Dashboard (`/dashboard`)
- Live call analytics from Firestore: intent breakdown, top signals, next step mix, industry mix, rep activity, weekly volume, playbook rating
- Call log with expandable rows
- CSV export (all fields)

### Firestore Structure
- `playbook/current` — live playbook document (subscribed to in PlaybookClient and ResourcesClient)
- `calls` collection — one document per logged call

### Pre-Call Search (Resume)
Pre-call page searches all Firestore call records by company/contact name to pre-fill form for follow-up calls.

## Tech Stack
- Next.js 16+ (App Router, `'use client'` where needed)
- Tailwind CSS v4 (CSS-first, no config file)
- TypeScript strict mode
- Firebase/Firestore (client SDK)
- Gemini 1.5 Flash (BDR notes extraction, email generation)
- SalesLoft v2 API (email sending from end-call modal)

## Key Files
- `src/types/index.ts` — all TypeScript interfaces
- `src/lib/firestore.ts` — Firestore helpers (save/subscribe)
- `src/lib/smartPrompt.ts` — stage-specific "ask this next" card logic
- `data/playbook.json` — source-of-truth baseline content
- `src/components/playbook/PlaybookClient.tsx` — main guided call UI
- `src/components/resources/ResourcesClient.tsx` — resources hub
- `src/components/admin/AdminClient.tsx` — admin panel
- `src/components/dashboard/DashboardClient.tsx` — analytics
