import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { parseJsonFromModel } from '@/lib/parse-json'
import type { InteractionApiPayload, InteractionResult } from '@/lib/schema'

const MODEL = 'claude-sonnet-4-20250514'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { drugs?: string[] }
    const drugs = (body.drugs ?? []).map((d) => d.trim()).filter(Boolean)

    if (drugs.length < 2) {
      return NextResponse.json(
        { error: 'Provide at least 2 drug names' },
        { status: 400 },
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 },
      )
    }

    const drugList = drugs.join(', ')
    const prompt = `You are a clinical pharmacist in Nigeria. Check interactions between: ${drugList}. Return JSON only, no markdown: {status:'SAFE'|'CAUTION'|'DANGEROUS', explanation:'2 plain English sentences', recommendation:'one action'}`

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = message.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 502 })
    }

    const parsed = parseJsonFromModel<InteractionApiPayload>(textBlock.text)

    const result: InteractionResult = {
      drugs,
      status: parsed.status,
      explanation: parsed.explanation,
      recommendation: parsed.recommendation,
      checkedAt: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Interaction API error:', error)
    return NextResponse.json({ error: 'Interaction check failed' }, { status: 500 })
  }
}
