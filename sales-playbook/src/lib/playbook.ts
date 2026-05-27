import fs from 'fs'
import path from 'path'
import { Playbook } from '@/types'

const DATA_PATH = path.join(process.cwd(), 'data', 'playbook.json')

export function readPlaybook(): Playbook {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8')
  return JSON.parse(raw) as Playbook
}

export function writePlaybook(data: Playbook): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}
