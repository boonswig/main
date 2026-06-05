import { NextRequest, NextResponse } from 'next/server'

const GEMINI_MODEL = 'gemini-1.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export interface GenerateEmailPayload {
  repName: string
  contactName: string
  contactTitle: string
  company: string
  industry: string
  companySize: string
  currentSolution: string
  signals: string[]      // chip labels from discovery — the specific things the customer said
  nextStep: string
  nextStepNotes: string
  notes: string          // rep's freeform call notes
}

function buildPrompt(d: GenerateEmailPayload): string {
  const repFirst = d.repName?.split(' ')[0] || d.repName || ''
  const contact = [d.contactName, d.contactTitle].filter(Boolean).join(', ')

  // The signals are the most important context — they are what the customer
  // actually mentioned caring about. Gemini will reference them specifically.
  const signalsLine = d.signals.length > 0
    ? d.signals.join(', ')
    : 'general interest in modernising browser management or app delivery'

  return `You are ${d.repName || 'a Google Chrome Enterprise sales rep'} writing a follow-up email immediately after a sales call.

CALL CONTEXT:
- Contact: ${contact || 'the prospect'} at ${d.company || 'their company'}${d.industry ? ` (${d.industry}${d.companySize ? ', ' + d.companySize : ''})` : ''}
${d.currentSolution ? `- Current solution they're replacing or supplementing: ${d.currentSolution}` : ''}
- What they told you they care about / pain points from the call: ${signalsLine}
- Agreed next step: ${d.nextStep || 'follow up'}
${d.nextStepNotes ? `- Next step specifics: ${d.nextStepNotes}` : ''}
${d.notes?.trim() ? `- Your notes from the call: ${d.notes.trim()}` : ''}

WRITE a short follow-up email that sounds like a real person wrote it right after hanging up — not an AI, not a template.

RULES — follow all of these:
1. Do NOT open with any of these: "I hope this email finds you well", "Great speaking with you today", "It was great to connect", "I wanted to reach out", "Just following up", "Touching base", "Circling back", "Per our conversation", "As discussed"
2. Open with something specific to what they said — reference the pain points or context directly in the first sentence
3. Body: 3–5 sentences MAX. No walls of text. No bullet point lists of product features.
4. One clear call to action that matches the agreed next step
5. Tone: direct, warm, and consultative — trusted advisor, not a sales rep reading a script
6. Forbidden words and phrases: "synergy", "leverage", "solution" (as a noun), "game-changer", "exciting opportunity", "best-in-class", "seamlessly", "robust", "empower"
7. Do not summarise the whole call or list everything discussed. Pick one or two things and be specific.
8. Sign off with the first name only: ${repFirst || '[your name]'}

FORMAT — respond with exactly this structure, nothing else before or after:
SUBJECT: [subject line — concise, no marketing speak]

[email body — start directly with the first sentence, no greeting label]`
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY not set in .env.local' },
      { status: 503 }
    )
  }

  let payload: GenerateEmailPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const prompt = buildPrompt(payload)

  const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.75,   // creative enough to vary, grounded enough not to hallucinate
        maxOutputTokens: 600,
        topP: 0.9,
      },
    }),
  })

  if (!geminiRes.ok) {
    const errText = await geminiRes.text()
    console.error('[generate-email] Gemini error:', errText)
    return NextResponse.json({ error: 'Gemini API error' }, { status: 500 })
  }

  const json = await geminiRes.json()
  const raw: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Parse SUBJECT and BODY from the structured response
  const subjectMatch = raw.match(/^SUBJECT:\s*(.+)$/m)
  const subject = subjectMatch?.[1]?.trim() ?? ''
  const body = raw.replace(/^SUBJECT:.*$/m, '').trim()

  return NextResponse.json({ subject, body })
}
