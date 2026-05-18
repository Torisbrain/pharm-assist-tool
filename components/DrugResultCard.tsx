'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  AlertTriangle,
  Check,
  Copy,
  HelpCircle,
  Shield,
} from 'lucide-react'
import type { Drug } from '@/lib/schema'

interface DrugResultCardProps {
  drug: Drug
  warning?: string
  explanation?: string
  onSearch: (query: string) => void
}

function formatCategory(category: string) {
  if (!category || category === 'unknown') return 'Unknown'
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function StatusBadge({ status }: { status: Drug['status'] }) {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-800">
        <Shield className="h-4 w-4" aria-hidden />
        VERIFIED
      </span>
    )
  }
  if (status === 'FLAGGED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-800">
        <AlertTriangle className="h-4 w-4" aria-hidden />
        FLAGGED
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
      <HelpCircle className="h-4 w-4" aria-hidden />
      UNKNOWN
    </span>
  )
}

export default function DrugResultCard({
  drug,
  warning,
  explanation,
  onSearch,
}: DrugResultCardProps) {
  const [copied, setCopied] = useState(false)

  async function copyNafdac() {
    await navigator.clipboard.writeText(drug.nafdacNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
      <div className="absolute right-4 top-4">
        <StatusBadge status={drug.status} />
      </div>

      <div className="pr-28">
        <h2 className="text-2xl font-bold text-green-900">{drug.name}</h2>
      </div>

      <div className="mt-4 space-y-3 text-sm text-gray-700">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-gray-900">NAFDAC Number:</span>
          <code className="rounded bg-green-50 px-2 py-0.5 text-green-900">
            {drug.nafdacNumber}
          </code>
          <button
            type="button"
            onClick={copyNafdac}
            className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-50"
            aria-label="Copy NAFDAC number"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        </div>

        <p>
          <span className="font-medium text-gray-900">Manufacturer:</span>{' '}
          {drug.manufacturer}{' '}
          <a
            href="https://www.nafdac.gov.ng/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-green-700 hover:underline"
          >
            Verify on NAFDAC.gov.ng →
          </a>
        </p>

        <p>
          <span className="font-medium text-gray-900">Active ingredient:</span>{' '}
          {drug.activeIngredient}
        </p>

        <p>
          <span className="font-medium text-gray-900">Dosage:</span> {drug.dosage}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-800">
            {formatCategory(drug.category)}
          </span>
          <span className="text-gray-500">
            Last verified: {formatDate(drug.lastVerified)}
          </span>
        </div>
      </div>

      {drug.status === 'FLAGGED' && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          ⚠️ This drug has been flagged by NAFDAC. Do not purchase or consume it.
        </div>
      )}

      {drug.status === 'UNKNOWN' && (
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          ⚠️ Not found in NAFDAC registry. Exercise caution and consult a pharmacist.
        </div>
      )}

      {(warning || explanation) && (
        <p className="mt-3 text-sm text-gray-600">{warning || explanation}</p>
      )}

      {drug.alternatives.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-green-900">
            Generic alternatives
          </p>
          <div className="flex flex-wrap gap-2">
            {drug.alternatives.map((alt) => (
              <button
                key={alt}
                type="button"
                onClick={() => onSearch(alt)}
                className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-800 transition hover:bg-green-100"
              >
                {alt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/interactions?drug=${encodeURIComponent(drug.name)}`}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
        >
          Check Interactions
        </Link>
        <Link
          href="/pharmacies"
          className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
        >
          Speak to a pharmacist
        </Link>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        This is informational only. Not a substitute for professional medical advice.
      </p>
    </div>
  )
}
