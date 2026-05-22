import { createFileRoute } from "@tanstack/react-router";

const GREENBOOK = "https://greenbook.nafdac.gov.ng";

type GBRow = {
  product_id: number;
  product_name: string;
  NAFDAC: string;
  strength?: string;
  status?: string;
  approval_date?: string;
  expiry_date?: string;
  composition?: string;
  ingredient_id?: number;
  ingredient?: { ingredient_name?: string };
  applicant?: { name?: string };
  form?: { name?: string };
  route?: { name?: string };
  product_category?: { name?: string };
};

async function gbSearch(query: string, length = 10): Promise<GBRow[]> {
  const url = `${GREENBOOK}/?draw=1&start=0&length=${length}&search%5Bvalue%5D=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json",
      "User-Agent": "PharmVerifyNG/1.0",
    },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { data?: GBRow[] };
  return data.data ?? [];
}

function mapStatus(row: GBRow): "Verified" | "Flagged" | "Unknown" {
  const s = (row.status || "").toLowerCase();
  if (row.expiry_date && new Date(row.expiry_date) < new Date()) return "Flagged";
  if (s === "active") return "Verified";
  if (s) return "Flagged";
  return "Unknown";
}

function clean(name: string) {
  return name.replaceAll("#", "").replaceAll("*", "").trim();
}

function rowToResult(row: GBRow, alternatives: string[]) {
  const status = mapStatus(row);
  const cleanName = clean(row.product_name);
  const ingredient = row.ingredient?.ingredient_name || "Unknown";
  return {
    name: cleanName,
    nafdacNumber: row.NAFDAC || "Unknown",
    manufacturer: row.applicant?.name || "Unknown",
    status,
    activeIngredient: ingredient,
    dosage: row.strength || row.composition || "See pack",
    alternatives,
    explanation:
      row.composition ||
      `${cleanName} contains ${ingredient}. Registered under NAFDAC No. ${row.NAFDAC}` +
        (row.approval_date ? `, approved ${row.approval_date}` : "") +
        (row.expiry_date ? `, expires ${row.expiry_date}.` : "."),
    warning:
      status === "Flagged"
        ? "Registration is expired or inactive. Do not use without pharmacist guidance."
        : status === "Verified"
        ? "Always confirm pack details and expiry date before use."
        : "Could not verify this drug. Consult a licensed pharmacist.",
    source: "NAFDAC Greenbook",
  };
}

export const Route = createFileRoute("/api/verify-drug")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { query } = (await request.json()) as { query?: string };
        const q = (query || "").trim();
        if (!q) {
          return Response.json({ error: "Empty query" }, { status: 400 });
        }

        try {
          const rows = await gbSearch(q, 5);

          if (rows.length > 0) {
            const row = rows[0];
            const alternatives: string[] = [];
            if (row.ingredient?.ingredient_name) {
              const alts = await gbSearch(row.ingredient.ingredient_name, 8);
              const seen = new Set<string>();
              for (const r of alts) {
                const n = clean(r.product_name);
                const key = n.toLowerCase();
                if (n && key !== clean(row.product_name).toLowerCase() && !seen.has(key)) {
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
            explanation:
              "No matching product found in the NAFDAC Greenbook (Nigeria's Registered Product Database).",
            warning:
              "Drug not found in NAFDAC Greenbook. Verify directly at greenbook.nafdac.gov.ng or consult a licensed pharmacist before use.",
            source: "NAFDAC Greenbook",
          });
        } catch (err) {
          console.error("Greenbook error:", err);
          return Response.json({
            name: q,
            nafdacNumber: "Lookup failed",
            manufacturer: "Unknown",
            status: "Unknown",
            activeIngredient: "Unknown",
            dosage: "Unknown",
            alternatives: [],
            explanation:
              "Could not reach the NAFDAC Greenbook service. Please try again shortly.",
            warning: "Verification service temporarily unavailable.",
            source: "NAFDAC Greenbook",
          });
        }
      },
    },
  },
});
