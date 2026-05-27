import { readPlaybook } from '@/lib/playbook'
import AdminClient from '@/components/admin/AdminClient'

export default function AdminPage() {
  const playbook = readPlaybook()
  return <AdminClient initialPlaybook={playbook} />
}
