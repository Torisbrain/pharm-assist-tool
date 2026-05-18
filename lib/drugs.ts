import drugsData from './drugs.json'
import type { Drug } from './schema'

export const drugs: Drug[] = drugsData as Drug[]

export function normalizeQuery(value: string): string {
  return value.trim().toLowerCase()
}

export function searchDrugs(query: string): Drug | undefined {
  const q = normalizeQuery(query)
  if (!q) return undefined
  return drugs.find((drug) => normalizeQuery(drug.name).includes(q))
}
