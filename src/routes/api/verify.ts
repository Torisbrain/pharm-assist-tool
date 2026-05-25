import { createFileRoute } from "@tanstack/react-router";
import { verifyApiKey } from "../../lib/auth";
import { gbSearch, rowToResult, cleanName } from "../../lib/nafdac";

export const Route = createFileRoute("/api/verify")({
  server: {
    handlers: {
      POST: async ({ request, context }: { request: Request; context: any }) => {
        const apiKey = request.headers.get("X-API-Key");
        if (!apiKey) {
          return Response.json({ error: "Missing API Key" }, { status: 401 });
        }

        const db = context?.env?.DB;
        const apiResult = await verifyApiKey(apiKey, db);
        if (!apiResult) {
          return Response.json({ error: "Invalid or inactive API Key" }, { status: 403 });
        }

        const { query } = (await request.json()) as { query?: string };
        const q = (query || "").trim();
        if (!q) {
          return Response.json({ error: "Empty query" }, { status: 400 });
        }

        const KV = context?.env?.KV;

        try {
          const rows = await gbSearch(q, 5, KV);

          if (rows.length > 0) {
            const row = rows[0];
            const alternatives: string[] = [];
            if (row.ingredient?.ingredient_name) {
              const alts = await gbSearch(row.ingredient.ingredient_name, 8, KV);
              const seen = new Set<string>();
              for (const r of alts) {
                const n = cleanName(r.product_name);
                const key = n.toLowerCase();
                if (n && key !== cleanName(row.product_name).toLowerCase() && !seen.has(key)) {
                  seen.add(key);
                  alternatives.push(n);
                  if (alternatives.length >= 3) break;
                }
              }
            }
            return Response.json(rowToResult(row, alternatives));
          }

          return Response.json({
            name: q,
            nafdacNumber: "Not found",
            manufacturer: "Not found",
            status: "Unknown",
            activeIngredient: "Unknown",
            dosage: "Unknown",
            alternatives: [],
            explanation: "No matching product found in the NAFDAC Greenbook.",
            warning: "Drug not found in NAFDAC Greenbook.",
            source: "NAFDAC Greenbook",
          });
        } catch (err) {
          console.error("API verify error:", err);
          return Response.json({ error: "Verification failed" }, { status: 500 });
        }
      },
    },
  },
});
