import { json } from "@tanstack/start";
import type { APIEvent } from "@tanstack/start";

export async function POST(event: APIEvent) {
  try {
    const { query } = await event.request.json();

    if (!query || !query.trim()) {
      return json({
        name: query || "Unknown",
        nafdacNumber: "Not found",
        manufacturer: "Not found",
        status: "Unknown",
        activeIngredient: "Unknown",
        dosage: "Unknown",
        alternatives: [],
        explanation: "Please enter a valid drug name or NAFDAC number.",
        warning: "No information available."
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `You are a Nigerian pharmaceutical expert with deep knowledge of NAFDAC registered drugs.

The user searched for: "${query}"

Rules:
- Real drug sold in Nigeria: status = "Verified"
- Looks counterfeit or suspicious: status = "Flagged"
- Completely unrecognised: status = "Unknown"
- Use real Nigerian manufacturers: Emzor, Fidson, May & Baker, Neimeth, SKG Pharma, GlaxoSmithKline Nigeria, Pfizer Nigeria, Swipha, Orange Drugs
- NAFDAC number format: A4-XXXX or B4-XXXX
- Always suggest 3 real generic alternatives
- explanation: one plain sentence about this drug

Return JSON only. No markdown. No text outside JSON:
{
  "name": "",
  "nafdacNumber": "",
  "manufacturer": "",
  "status": "Verified",
  "activeIngredient": "",
  "dosage": "",
  "alternatives": ["", "", ""],
  "explanation": "",
  "warning": ""
}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    let text = data?.content?.[0]?.text || "";
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const drug = JSON.parse(text);
    return json(drug);
  } catch (err) {
    console.error("Verification error:", err);
    return json({
      name: "Unknown",
      nafdacNumber: "Not found",
      manufacturer: "Not found",
      status: "Unknown",
      activeIngredient: "Unknown",
      dosage: "Unknown",
      alternatives: [],
      explanation: "Could not verify this drug. Please check nafdac.gov.ng or consult a pharmacist.",
      warning: "Exercise caution with unverified drugs."
    });
  }
}
