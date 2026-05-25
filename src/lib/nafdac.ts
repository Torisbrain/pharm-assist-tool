const GREENBOOK = "https://greenbook.nafdac.gov.ng";

export type GBRow = {
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

export async function gbSearch(query: string, length = 10, KV?: any): Promise<GBRow[]> {
  const q = query.trim().toLowerCase();
  const cacheKey = `nafdac:search:${q}:${length}`;

  if (KV) {
    try {
      const cached = await KV.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error("KV Cache read error:", e);
    }
  }

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
  const rows = data.data ?? [];

  if (KV && rows.length > 0) {
    try {
      await KV.put(cacheKey, JSON.stringify(rows), { expirationTtl: 604800 });
    } catch (e) {
      console.error("KV Cache write error:", e);
    }
  }

  return rows;
}

export function mapStatus(row: GBRow): "Verified" | "Flagged" | "Unknown" {
  const s = (row.status || "").toLowerCase();
  if (row.expiry_date && new Date(row.expiry_date) < new Date()) return "Flagged";
  if (s === "active") return "Verified";
  if (s) return "Flagged";
  return "Unknown";
}

export function cleanName(name: string) {
  return name.replaceAll("#", "").replaceAll("*", "").trim();
}

export function rowToResult(row: GBRow, alternatives: string[]) {
  const status = mapStatus(row);
  const clean = cleanName(row.product_name);
  const ingredient = row.ingredient?.ingredient_name || "Unknown";
  return {
    name: clean,
    nafdacNumber: row.NAFDAC || "Unknown",
    manufacturer: row.applicant?.name || "Unknown",
    status,
    activeIngredient: ingredient,
    dosage: row.strength || row.composition || "See pack",
    alternatives,
    explanation:
      row.composition ||
      `${clean} contains ${ingredient}. Registered under NAFDAC No. ${row.NAFDAC}` +
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
