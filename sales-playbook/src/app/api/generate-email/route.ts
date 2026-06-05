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

  const contactFirst = d.contactName?.split(' ')[0] || 'there'

  return `You are ${d.repName || 'a Google Chrome Enterprise sales rep'} writing a follow-up email immediately after a sales call.

CALL CONTEXT:
- Contact: ${contact || 'the prospect'} at ${d.company || 'their company'}${d.industry ? ` (${d.industry}${d.companySize ? ', ' + d.companySize : ''})` : ''}
${d.currentSolution ? `- Current solution they're replacing or supplementing: ${d.currentSolution}` : ''}
- What they told you they care about / pain points from the call: ${signalsLine}
- Agreed next step: ${d.nextStep || 'follow up'}
${d.nextStepNotes ? `- Next step specifics (date, attendees, focus): ${d.nextStepNotes}` : ''}
${d.notes?.trim() ? `- Your notes from the call: ${d.notes.trim()}` : ''}

WRITE a short, warm follow-up email. The goal: make the customer feel genuinely heard, clearly confirm or drive the next step, and leave them looking forward to it.

STRUCTURE — follow this exactly:
1. Greeting: "Hi ${contactFirst},"
2. 1–2 sentences that show you were listening — reference something specific they said (a pain point, a project, a constraint, something from the notes). Do not be generic.
3. 1 sentence connecting what they described to why the next step is worth their time. Be specific, not vague.
4. The next step stated clearly and with momentum. If a date/time was mentioned, name it ("I'll send a calendar invite for Thursday — does that still work?"). If not, suggest two specific slots rather than saying "let me know a time".
5. One short closing line that builds confidence or anticipation — make them feel the next step is worth showing up to.
6. Sign off: "${repFirst || '[your name]'}"

RULES:
- Use contractions throughout (I'm, we'll, you'll, they'll) — "I am" and "we will" sound stiff and formal
- Do NOT open with: "I hope this email finds you well", "Great speaking with you", "I wanted to reach out", "Just following up", "Touching base", "Circling back", "Per our conversation", "As discussed"
- Do NOT use: "synergy", "leverage", "solution" (as a noun), "game-changer", "exciting opportunity", "best-in-class", "seamlessly", "robust", "empower", "deep dive" (as a verb)
- No bullet points. No feature lists. No walls of text.
- Sound like a person who was actually on the call, not a template

FORMAT — respond with exactly this, nothing else before or after:
SUBJECT: [subject line — specific to their situation, no marketing speak]

[email body]`
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
