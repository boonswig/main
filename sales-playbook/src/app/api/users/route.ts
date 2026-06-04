import { NextResponse } from 'next/server'
import { readUsers, writeUsers } from '@/lib/users'
import bcrypt from 'bcryptjs'
import { User } from '@/types'

export async function GET() {
  const { users } = readUsers()
  const safeUsers = users.map(({ id, name, email, role }) => ({ id, name, email, role }))
  return NextResponse.json({ users: safeUsers })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, password, role } = body

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const data = readUsers()
  const existing = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash,
    role,
  }

  data.users.push(newUser)
  writeUsers(data)

  return NextResponse.json({ success: true, user: { id: newUser.id, name, email, role } })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  const data = readUsers()
  const before = data.users.length
  data.users = data.users.filter((u) => u.id !== id)

  if (data.users.length === before) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  writeUsers(data)
  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id, name, email, password, role } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  const data = readUsers()
  const userIndex = data.users.findIndex((u) => u.id === id)
  if (userIndex === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (name) data.users[userIndex].name = name
  if (email) data.users[userIndex].email = email
  if (role) data.users[userIndex].role = role
  if (password) {
    data.users[userIndex].passwordHash = await bcrypt.hash(password, 10)
  }

  writeUsers(data)
  const u = data.users[userIndex]
  return NextResponse.json({ success: true, user: { id: u.id, name: u.name, email: u.email, role: u.role } })
}
