import { NextRequest, NextResponse } from 'next/server'

// ─── SalesLoft API integration ────────────────────────────────────────────────
//
// Setup steps:
//   1. In SalesLoft: Settings → API → CRM Integrations → API Keys → Create Key
//   2. Scope needed: "emails:write" (and "people:read" if you want person lookup)
//   3. Add to .env.local:
//        SALESLOFT_API_KEY=your_api_key_here
//
// How it works:
//   1. Looks up the SalesLoft person record by recipient email address
//      (if found, associates the email with the person for activity tracking)
//   2. Sends the email via SalesLoft's one-off email endpoint
//
// Note: SalesLoft requires your rep's email to be configured as a mailbox in
// SalesLoft. The API uses the mailbox associated with the API key's owner.
// ─────────────────────────────────────────────────────────────────────────────

const SALESLOFT_BASE = 'https://api.salesloft.com/v2'

export interface SendSalesloftPayload {
  to: string         // recipient email address
  subject: string
  body: string       // plain text body
  repEmail?: string  // optional — used to pick the right mailbox if rep has multiple
}

interface SalesloftPerson {
  id: number
  email_address: string
  first_name: string
  last_name: string
}

async function findPersonByEmail(
  apiKey: string,
  email: string
): Promise<SalesloftPerson | null> {
  try {
    const res = await fetch(
      `${SALESLOFT_BASE}/people.json?email_addresses[]=${encodeURIComponent(email)}&per_page=1`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    )
    if (!res.ok) return null
    const json = await res.json()
    return (json.data?.[0] as SalesloftPerson) ?? null
  } catch {
    return null
  }
}

async function getMailboxes(apiKey: string): Promise<{ id: number; email_address: string }[]> {
  try {
    const res = await fetch(`${SALESLOFT_BASE}/email_templates/mailboxes.json?per_page=5`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.SALESLOFT_API_KEY

  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: 'SALESLOFT_API_KEY not configured in .env.local' },
      { status: 503 }
    )
  }

  let payload: SendSalesloftPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!payload.to || !payload.subject || !payload.body) {
    return NextResponse.json({ error: 'Missing to, subject, or body' }, { status: 400 })
  }

  // Find the SalesLoft person record (optional — enriches activity tracking)
  const person = await findPersonByEmail(apiKey, payload.to)

  // Get the rep's mailbox (SalesLoft sends from the key owner's connected mailbox)
  const mailboxes = await getMailboxes(apiKey)
  const mailbox = payload.repEmail
    ? mailboxes.find((m) => m.email_address === payload.repEmail) ?? mailboxes[0]
    : mailboxes[0]

  if (!mailbox) {
    return NextResponse.json(
      { error: 'No SalesLoft mailbox found. Connect a mailbox in SalesLoft → Settings → Emails.' },
      { status: 422 }
    )
  }

  // Send the email via SalesLoft
  const sendBody: Record<string, unknown> = {
    to: payload.to,
    subject: payload.subject,
    body: payload.body,
    mailbox_address_id: mailbox.id,
    send_at: 'now',
  }
  if (person) {
    sendBody.person_id = person.id
  }

  const sendRes = await fetch(`${SALESLOFT_BASE}/emails.json`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sendBody),
  })

  if (!sendRes.ok) {
    const errText = await sendRes.text()
    console.error('[send-salesloft-email] SalesLoft error:', errText)
    return NextResponse.json(
      { error: 'SalesLoft API error — check server logs' },
      { status: 500 }
    )
  }

  const result = await sendRes.json()
  return NextResponse.json({
    ok: true,
    personFound: !!person,
    salesloftEmailId: result.data?.id,
  })
}
