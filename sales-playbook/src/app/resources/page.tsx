import { promises as fs } from 'fs'
import path from 'path'
import ResourcesClient from '@/components/resources/ResourcesClient'
import { Playbook } from '@/types'

export default async function ResourcesPage() {
  const file = path.join(process.cwd(), 'data', 'playbook.json')
  const raw = await fs.readFile(file, 'utf8')
  const playbook: Playbook = JSON.parse(raw)
  return <ResourcesClient playbook={playbook} />
}
