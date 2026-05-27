import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { readPlaybook, writePlaybook } from '@/lib/playbook'
import { Playbook } from '@/types'

export async function GET() {
  try {
    const data = readPlaybook()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to read playbook' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as Playbook
    // Sort stages by order before saving
    body.stages.sort((a, b) => a.order - b.order)
    writePlaybook(body)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to write playbook' }, { status: 500 })
  }
}
