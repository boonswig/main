import { NextResponse } from 'next/server'
import { readPlaybook, writePlaybook } from '@/lib/playbook'
import { Playbook } from '@/types'

export async function GET() {
  try {
    return NextResponse.json(readPlaybook())
  } catch {
    return NextResponse.json({ error: 'Failed to read playbook' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Playbook
    body.stages.sort((a, b) => a.order - b.order)
    writePlaybook(body)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to write playbook' }, { status: 500 })
  }
}
