import { readPlaybook } from '@/lib/playbook'
import PlaybookClient from '@/components/playbook/PlaybookClient'

export default function PlaybookPage() {
  const playbook = readPlaybook()
  return <PlaybookClient playbook={playbook} />
}
