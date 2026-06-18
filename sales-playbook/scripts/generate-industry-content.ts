/**
 * generate-industry-content.ts — OFFLINE, one-time industry content generator.
 *
 * Reads curated sources for an industry from Vertex.ai, generates playbook
 * content GROUNDED in those sources, validates it against
 * docs/playbook.schema.json, stamps provenance, and writes a DRAFT to
 * data/drafts/<industry>.json.
 *
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ THIS SCRIPT MUST NEVER:                                           │
 *   │   • write data/playbook.json                                     │
 *   │   • write to Firestore                                           │
 *   │   • run as part of the live app / any route                     │
 *   │ Promotion of a reviewed draft into live content is a human step  │
 *   │ done through the Admin dashboard. See docs/CONTENT_PIPELINE.md.  │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Usage (once wired up):
 *   npx tsx scripts/generate-industry-content.ts --industry healthcare
 *
 * Status: STUB. The Vertex call, grounding, and validation are marked TODO.
 */

import fs from 'fs'
import path from 'path'
// import Ajv from 'ajv'
// import { VertexAI } from '@google-cloud/vertexai'

interface ContentProvenance {
  source: 'vertex'
  sourceRefs: string[]
  generatedAt: string
  version: number
  // NOTE: reviewedBy / approvedAt are intentionally NOT set here.
  // They are added by a human during review/promotion. Their absence
  // marks this content as an unreviewed draft.
}

function arg(flag: string): string {
  const i = process.argv.indexOf(flag)
  return i >= 0 ? (process.argv[i + 1] ?? '') : ''
}

const DRAFTS_DIR = path.join(process.cwd(), 'data', 'drafts')

async function loadVertexSources(_industry: string): Promise<string[]> {
  // TODO: resolve the curated Vertex.ai resources for this industry and return
  // their refs/ids (and/or fetch their text for grounding).
  throw new Error('loadVertexSources: not implemented — see docs/CONTENT_PIPELINE.md')
}

async function generateGrounded(
  _industry: string,
  _sourceRefs: string[],
): Promise<{ questions: unknown[]; talkingPoints: unknown[]; objections: unknown[] }> {
  // TODO: call Vertex.ai with grounded generation against the sources.
  // Output items must conform to docs/playbook.schema.json (Question /
  // TalkingPoint / Objection), use STABLE ids, and tag industries: [industry].
  throw new Error('generateGrounded: not implemented — see docs/AI_INTEGRATION.md')
}

function validateAgainstSchema(_draft: unknown): void {
  // TODO: load docs/playbook.schema.json and validate each item with Ajv.
  // Fail loudly (throw) on any schema violation — never write invalid drafts.
}

function stampProvenance<T extends object>(item: T, sourceRefs: string[]): T & { provenance: ContentProvenance } {
  return {
    ...item,
    provenance: {
      source: 'vertex',
      sourceRefs,
      generatedAt: new Date().toISOString(),
      version: 1,
    },
  }
}

async function main(): Promise<void> {
  const industry = arg('--industry')
  if (!industry) {
    console.error('Usage: tsx scripts/generate-industry-content.ts --industry <id>')
    process.exit(1)
  }

  const sourceRefs = await loadVertexSources(industry)
  const raw = await generateGrounded(industry, sourceRefs)

  const draft = {
    questions: raw.questions.map((q) => stampProvenance(q as object, sourceRefs)),
    talkingPoints: raw.talkingPoints.map((t) => stampProvenance(t as object, sourceRefs)),
    objections: raw.objections.map((o) => stampProvenance(o as object, sourceRefs)),
  }

  validateAgainstSchema(draft)

  fs.mkdirSync(DRAFTS_DIR, { recursive: true })
  const out = path.join(DRAFTS_DIR, `${industry}.json`)
  fs.writeFileSync(out, JSON.stringify(draft, null, 2), 'utf-8')

  console.log(`Draft written to ${out}`)
  console.log('Next: review for effectiveness, then promote via the Admin dashboard.')
  console.log('This script does NOT touch data/playbook.json or Firestore by design.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
