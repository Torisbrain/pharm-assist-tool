# PharmVerify NG

Verify Nigerian medicines against a local drug registry, with Claude API fallback for unknown products and a drug interaction checker.

## Setup

1. Copy environment variables:

   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Anthropic API key to `.env.local`:

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Install dependencies and run:

   ```bash
   npm install
   npm run dev
   ```

4. On Railway, set `ANTHROPIC_API_KEY` in service variables.

## API

- `POST /api/verify` — body: `{ "query": "Panadol Extra" }`
- `POST /api/interaction` — body: `{ "drugs": ["Warfarin 5mg", "Ibuprofen 400mg"] }`

## Data

- `lib/drugs.json` — 20 Nigerian medicines (demo NAFDAC numbers)
- `lib/schema.ts` — TypeScript interfaces
