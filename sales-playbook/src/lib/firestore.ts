'use client'

import { db } from './firebase'
import {
  collection,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
  where,
  getDocs,
  QueryConstraint,
} from 'firebase/firestore'
import { CallRecord, Playbook } from '@/types'

const COLLECTION = 'calls'

export const firestoreConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY
)

export async function fetchAllCalls(): Promise<CallRecord[]> {
  if (!firestoreConfigured) return []
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  } as CallRecord))
}

export async function saveCall(record: Omit<CallRecord, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...record,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

// ── Playbook ──────────────────────────────────────────────────

export async function savePlaybook(playbook: Playbook): Promise<void> {
  if (!firestoreConfigured) return
  await setDoc(doc(db, 'playbook', 'current'), {
    ...playbook,
    updatedAt: serverTimestamp(),
  })
}

export function subscribeToPlaybook(
  callback: (playbook: Playbook) => void
): () => void {
  if (!firestoreConfigured) return () => {}
  return onSnapshot(doc(db, 'playbook', 'current'), (snap) => {
    if (snap.exists()) {
      const { updatedAt: _ts, ...data } = snap.data()
      callback(data as Playbook)
    }
  })
}

// ── Calls ─────────────────────────────────────────────────────

export function subscribeToCalls(
  callback: (records: CallRecord[]) => void,
  filters?: { intent?: string; industry?: string }
): () => void {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]

  if (filters?.intent)   constraints.push(where('intent',   '==', filters.intent))
  if (filters?.industry) constraints.push(where('industry', '==', filters.industry))

  const q = query(collection(db, COLLECTION), ...constraints)

  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      } as CallRecord
    })
    callback(records)
  })
}
