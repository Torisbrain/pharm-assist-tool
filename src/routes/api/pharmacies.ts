python3 << 'PYEOF'
code = '''import { createFileRoute } from "@tanstack/react-router";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

interface OSMNode {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export const Route = createFileRoute("/api/pharmacies")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        let body: { lat?: number; lng?: number; query?: string; radius?: number };
        try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

        const radius = Math.min(Math.max(body.radius ?? 8000, 500), 50000);
        const hasCoords = typeof body.lat === "number" && typeof body.lng === "number";
        const query = (body.query ?? "").trim();

        try {
          let overpassQuery = "";

          if (hasCoords && !query) {
            // Search by coordinates
            overpassQuery = `
              [out:json][timeout:25];
              (
                node["amenity"="pharmacy"](around:${radius},${body.lat},${body.lng});
                way["amenity"="pharmacy"](around:${radius},${body.lat},${body.lng});
              );
              out center 20;
            `;
          } else {
            // Search by city name in Nigeria
            const area = query || "Nigeria";
            overpassQuery = `
              [out:json][timeout:25];
              area["name"~"${area}","i"]["boundary"="administrative"]->.searchArea;
              (
                node["amenity"="pharmacy"](area.searchArea);
                way["amenity"="pharmacy"](area.searchArea);
              );
              out center 20;
            `;
          }

          const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "data=" + encodeURIComponent(overpassQuery),
          });

          if (!res.ok) {
            return json({ error: "Overpass API error" }, 502);
          }

          const data = await res.json() as { elements: OSMNode[] };

          const places = (data.elements as OSMNode[])
            .filter((e) => e.lat && e.lon)
            .map((e) => ({
              id: String(e.id),
              name: e.tags?.name ?? e.tags?.["name:en"] ?? "Pharmacy",
              address: [
                e.tags?.["addr:housenumber"],
                e.tags?.["addr:street"],
                e.tags?.["addr:city"],
                e.tags?.["addr:state"],
              ].filter(Boolean).join(", ") || e.tags?.["addr:full"] || "Address not listed",
              phone: e.tags?.phone ?? e.tags?.["contact:phone"] ?? "Not listed",
              lat: e.lat,
              lng: e.lon,
              rating: null,
              ratingCount: 0,
              status: "OPERATIONAL",
              distanceKm:
                hasCoords && body.lat && body.lng
                  ? haversine(body.lat, body.lng, e.lat, e.lon)
                  : null,
            }))
            .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

          return json({ places });
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
        }
      },
    },
  },
});
'''
open('src/routes/api/pharmacies.ts', 'w').write(code)
print("Done")
PYEOF

git add src/routes/api/pharmacies.ts
git commit -m "feat: switch pharmacy search to OpenStreetMap/Overpass (free, no billing)"
git push
