import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json()
  const expected = process.env.DASHBOARD_PASSWORD

  if (!expected) {
    return NextResponse.json({ error: 'DASHBOARD_PASSWORD not set in .env.local' }, { status: 503 })
  }

  if (password === expected) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
}
