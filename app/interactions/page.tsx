'use client'

import Link from 'next/link'
import { FormEvent, Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import type { InteractionResult } from '@/lib/schema'

function InteractionStatusBadge({ status }: { status: InteractionResult['status'] }) {
  const styles = {
    SAFE: 'bg-green-100 text-green-800 border-green-200',
    CAUTION: 'bg-orange-100 text-orange-800 border-orange-200',
    DANGEROUS: 'bg-red-100 text-red-800 border-red-200',
  }[status]

  return (
    <span
      className={`inline-block rounded-full border px-4 py-1.5 text-sm font-bold uppercase ${styles}`}
    >
      {status}
    </span>
  )
}

function InteractionsContent() {
  const searchParams = useSearchParams()
  const [drugInputs, setDrugInputs] = useState(['', ''])
  const [result, setResult] = useState<InteractionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const prefill = searchParams.get('drug')
    if (prefill) {
      setDrugInputs([prefill, ''])
    }
  }, [searchParams])

  function updateDrug(index: number, value: string) {
    setDrugInputs((prev) => prev.map((d, i) => (i === index ? value : d)))
  }

  function addDrugField() {
    setDrugInputs((prev) => [...prev, ''])
  }

  function removeDrugField(index: number) {
    if (drugInputs.length <= 2) return
    setDrugInputs((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const drugs = drugInputs.map((d) => d.trim()).filter(Boolean)
    if (drugs.length < 2) {
      setError('Enter at least two drug names')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs }),
      })

      const data = (await res.json()) as InteractionResult & { error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? 'Interaction check failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-green-900">Drug Interaction Checker</h1>
        <p className="mt-2 text-gray-600">
          Enter two or more medicines to check for possible interactions.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
        {drugInputs.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => updateDrug(index, e.target.value)}
              placeholder={`Drug ${index + 1}`}
              className="flex-1 rounded-xl border border-green-200 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
            {drugInputs.length > 2 && (
              <button
                type="button"
                onClick={() => removeDrugField(index)}
                className="rounded-lg border border-red-200 p-3 text-red-600 hover:bg-red-50"
                aria-label="Remove drug"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addDrugField}
          className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-900"
        >
          <Plus className="h-4 w-4" /> Add another drug
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking…
            </>
          ) : (
            'Check Interactions'
          )}
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-4 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-green-900">Interaction result</h2>
            <InteractionStatusBadge status={result.status} />
          </div>

          <p className="text-sm text-gray-500">
            Checked: {new Date(result.checkedAt).toLocaleString('en-NG')}
          </p>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Explanation</h3>
            <p className="mt-1 text-gray-700">{result.explanation}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Recommendation</h3>
            <p className="mt-1 text-gray-700">{result.recommendation}</p>
          </div>

          <Link
            href="/pharmacies"
            className="inline-block rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            Speak to a pharmacist
          </Link>

          <p className="text-xs text-gray-500">
            This is informational only. Not a substitute for professional medical advice.
          </p>
        </div>
      )}
    </div>
  )
}

export default function InteractionsPage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-600">Loading…</p>}>
      <InteractionsContent />
    </Suspense>
  )
}
