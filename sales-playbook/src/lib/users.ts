import fs from 'fs'
import path from 'path'
import { UsersData, User } from '@/types'

const DATA_PATH = path.join(process.cwd(), 'data', 'users.json')

export function readUsers(): UsersData {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8')
  return JSON.parse(raw) as UsersData
}

export function writeUsers(data: UsersData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export function findUserByEmail(email: string): User | undefined {
  const { users } = readUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}
