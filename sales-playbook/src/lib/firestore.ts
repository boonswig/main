'use client'

import { db } from './firebase'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  where,
  QueryConstraint,
} from 'firebase/firestore'
import { CallRecord } from '@/types'

const COLLECTION = 'calls'

export async function saveCall(record: Omit<CallRecord, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...record,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

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
