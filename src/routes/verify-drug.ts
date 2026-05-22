import { createAPIFileRoute } from "@tanstack/start/api";

export const APIRoute = createAPIFileRoute("/api/verify-drug")({
  POST: async ({ request }) => {
    const { query } = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are a Nigerian drug verification assistant. For the drug "${query}", respond ONLY with a JSON object (no markdown) with these fields: name, nafdacNumber, manufacturer, status (one of: Verified/Flagged/Unknown), activeIngredient, dosage, alternatives (array of strings), explanation, warning.`
        }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    return Response.json(JSON.parse(clean));
  }
});
