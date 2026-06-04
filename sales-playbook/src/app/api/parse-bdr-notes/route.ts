import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { INDUSTRIES } from '@/lib/industries'

const INDUSTRY_IDS = INDUSTRIES.map((i) => i.id).join(', ')

const EXTRACTION_PROMPT = `You are a sales assistant. Extract key information from these BDR (Business Development Representative) notes and return ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

The JSON must have exactly these fields:
{
  "companyName": "string — name of the prospect company",
  "industry": "string — one of: ${INDUSTRY_IDS}, or empty string if unknown",
  "companySize": "string — e.g. '50-200 employees', 'Enterprise (1000+)', 'SMB', or empty string",
  "leadSource": "string — how they came to us, e.g. 'Inbound demo request', 'Cold outreach', 'Referral from X', or empty string",
  "currentSolution": "string — what tool, process, or vendor they currently use, or empty string",
  "knownPainPoints": "string — brief summary of the main pain points or challenges mentioned",
  "contactName": "string — primary contact's name, or empty string",
  "contactTitle": "string — primary contact's job title, or empty string"
}

BDR Notes:
`

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return NextResponse.json(
      { error: 'Gemini API key not configured. Add GEMINI_API_KEY to your .env.local file.' },
      { status: 503 }
    )
  }

  const { notes } = await req.json()
  if (!notes?.trim()) {
    return NextResponse.json({ error: 'No notes provided' }, { status: 400 })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(EXTRACTION_PROMPT + notes)
    const text = result.response.text().trim()

    // Strip markdown code fences if Gemini wraps in ```json … ```
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const extracted = JSON.parse(cleaned)

    return NextResponse.json({ extracted })
  } catch (err) {
    console.error('Gemini extraction error:', err)
    return NextResponse.json(
      { error: 'Failed to extract information from notes. Check your API key and try again.' },
      { status: 500 }
    )
  }
}
