import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { searchDrugs } from '@/lib/drugs'
import { parseJsonFromModel } from '@/lib/parse-json'
import type { Drug, VerifyFallback, VerifyResponse } from '@/lib/schema'

const MODEL = 'claude-sonnet-4-20250514'

function fallbackToDrug(raw: VerifyFallback, query: string): Drug {
  return {
    id: `ai-${Date.now()}`,
    name: raw.name || query,
    nafdacNumber: raw.nafdacNumber || 'N/A',
    manufacturer: raw.manufacturer || 'Unknown',
    activeIngredient: raw.activeIngredient || 'Unknown',
    dosage: 'Not specified',
    category: 'unknown',
    status: raw.status ?? 'UNKNOWN',
    alternatives: raw.alternatives ?? [],
    lastVerified: new Date().toISOString().slice(0, 10),
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { query?: string }
    const query = body.query?.trim()

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    const local = searchDrugs(query)
    if (local) {
      const response: VerifyResponse = { source: 'registry', drug: local }
      return NextResponse.json(response)
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 },
      )
    }

    const client = new Anthropic({ apiKey })
    const system = `You are a Nigerian pharmaceutical expert. For the drug "${query}", return JSON only, no markdown: {name, nafdacNumber, manufacturer, status, activeIngredient, alternatives:[], explanation, warning}. If unrecognised, set status UNKNOWN.`

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: `Verify this drug: ${query}` }],
    })

    const textBlock = message.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 502 })
    }

    const parsed = parseJsonFromModel<VerifyFallback>(textBlock.text)
    const drug = fallbackToDrug(parsed, query)

    const response: VerifyResponse = {
      source: 'ai',
      drug,
      warning: parsed.warning,
      explanation: parsed.explanation,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Verify API error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
