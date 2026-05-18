'use client'

import { FormEvent, useCallback, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import DrugResultCard from '@/components/DrugResultCard'
import type { Drug, VerifyResponse } from '@/lib/schema'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [drug, setDrug] = useState<Drug | null>(null)
  const [warning, setWarning] = useState<string | undefined>()
  const [explanation, setExplanation] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verifyDrug = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    setQuery(trimmed)
    setLoading(true)
    setError(null)
    setDrug(null)
    setWarning(undefined)
    setExplanation(undefined)

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      })

      const data = (await res.json()) as VerifyResponse & { error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? 'Verification failed')
      }

      setDrug(data.drug)
      setWarning(data.warning)
      setExplanation(data.explanation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    verifyDrug(query)
  }

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-green-900 md:text-4xl">
          Verify your medicine
        </h1>
        <p className="mt-2 text-gray-600">
          Search by drug name to check NAFDAC registration status in Nigeria.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Panadol Extra, Coartem, Amoxil 500mg"
            className="w-full rounded-xl border border-green-200 py-3 pl-10 pr-4 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying…
            </>
          ) : (
            'Verify Drug'
          )}
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      {drug && (
        <DrugResultCard
          drug={drug}
          warning={warning}
          explanation={explanation}
          onSearch={verifyDrug}
        />
      )}
    </div>
  )
}
