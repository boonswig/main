import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { INDUSTRIES } from '@/lib/industries'

const INDUSTRY_IDS = INDUSTRIES.map((i) => i.id).join(', ')

const EXTRACTION_PROMPT = `You are a sales assistant. Extract key information from these BDR notes and return ONLY a valid JSON object — no markdown, no explanation, just raw JSON.

Fields:
{
  "companyName": "string",
  "industry": "one of: ${INDUSTRY_IDS}, or empty string",
  "companySize": "string e.g. '50-200 employees' or empty",
  "leadSource": "string or empty",
  "currentSolution": "string or empty",
  "knownPainPoints": "brief summary or empty",
  "contactName": "string or empty",
  "contactTitle": "string or empty"
}

BDR Notes:
`

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return NextResponse.json(
      { error: 'Gemini API key not configured. Add GEMINI_API_KEY to .env.local.' },
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
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    return NextResponse.json({ extracted: JSON.parse(cleaned) })
  } catch (err) {
    console.error('Gemini extraction error:', err)
    return NextResponse.json({ error: 'Extraction failed. Check your API key.' }, { status: 500 })
  }
}
