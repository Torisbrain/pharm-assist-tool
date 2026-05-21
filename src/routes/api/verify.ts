import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';

export const APIRoute = createAPIFileRoute('/api/verify')({
  POST: async ({ request }) => {
    try {
      const { query } = await request.json();

      if (!query?.trim()) {
        return json({
          name: 'Unknown',
          nafdacNumber: 'N/A',
          manufacturer: 'N/A',
          status: 'UNKNOWN',
          activeIngredient: 'N/A',
          dosage: 'N/A',
          alternatives: [],
          explanation: 'Please enter a drug name.',
          warning: ''
        });
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `You are a Nigerian pharmaceutical expert with deep knowledge of NAFDAC registered drugs.

The user searched for: "${query}"

Rules:
- Real drug sold in Nigeria: status = VERIFIED
- Looks counterfeit or suspicious: status = FLAGGED
- Completely unrecognised: status = UNKNOWN
- Use real Nigerian manufacturers: Emzor, Fidson, May & Baker, Neimeth, SKG Pharma, GlaxoSmithKline Nigeria, Pfizer Nigeria, Swipha, Orange Drugs
- NAFDAC number format: A4-XXXX or B4-XXXX
- Always suggest 3 real generic alternatives
- explanation: one plain sentence about the drug

Return JSON only. No markdown. No text outside JSON:
{
  "name": "",
  "nafdacNumber": "",
  "manufacturer": "",
  "status": "VERIFIED",
  "activeIngredient": "",
  "dosage": "",
  "category": "",
  "alternatives": ["", "", ""],
  "explanation": "",
  "warning": ""
}`
          }]
        })
      });

      const data = await response.json();
      let text = data?.content?.[0]?.text || '';
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const drug = JSON.parse(text);
      return json(drug);

    } catch (error) {
      console.error('Verify error:', error);
      return json({
        name: 'Unknown Drug',
        nafdacNumber: 'Not found',
        manufacturer: 'Not found',
        status: 'UNKNOWN',
        activeIngredient: 'Unknown',
        dosage: 'Unknown',
        alternatives: [],
        explanation: 'Could not verify. Please check nafdac.gov.ng or consult a pharmacist.',
        warning: 'Exercise caution with unverified drugs.'
      });
    }
  }
});
