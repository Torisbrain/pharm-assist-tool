import { createFileRoute } from "@tanstack/react-router";

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

interface OSMElement {
  id: number;
  type: "node" | "way";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export const Route = createFileRoute("/api/pharmacies")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        let body: { lat?: number; lng?: number; query?: string; radius?: number };
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }

        let searchLat = body.lat;
        let searchLng = body.lng;
        const radius = Math.min(Math.max(body.radius ?? 8000, 500), 50000);
        const query = (body.query ?? "").trim();

        try {
          // 1. Geocode if query is provided and no coordinates
          if (query && (typeof searchLat !== "number" || typeof searchLng !== "number")) {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                query + ", Nigeria"
              )}&format=json&limit=1`,
              {
                headers: {
                  "User-Agent": "PharmVerify-NG/1.0",
                },
              }
            );
            if (geoRes.ok) {
              const geoData = (await geoRes.json()) as any[];
              if (geoData.length > 0) {
                searchLat = parseFloat(geoData[0].lat);
                searchLng = parseFloat(geoData[0].lon);
              } else {
                return json({ error: "Location not found" }, 404);
              }
            } else {
              return json({ error: "Geocoding service unavailable" }, 502);
            }
          }

          if (typeof searchLat !== "number" || typeof searchLng !== "number") {
             // Default to Lagos if still no coordinates and no query
             searchLat = 6.4550575;
             searchLng = 3.3941795;
          }

          // 2. Search by coordinates using Overpass API
          const overpassQuery = `
            [out:json][timeout:25];
            (
              node["amenity"="pharmacy"](around:${radius},${searchLat},${searchLng});
              way["amenity"="pharmacy"](around:${radius},${searchLat},${searchLng});
            );
            out center 20;
          `;

          const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "data=" + encodeURIComponent(overpassQuery),
          });

          if (!res.ok) {
            return json({ error: "Overpass API error" }, 502);
          }

          const data = (await res.json()) as { elements: OSMElement[] };

          const places = data.elements
            .map((e) => ({
              ...e,
              calculatedLat: e.lat ?? e.center?.lat,
              calculatedLon: e.lon ?? e.center?.lon,
            }))
            .filter((e) => e.calculatedLat && e.calculatedLon)
            .map((e) => ({
              id: String(e.id),
              name: e.tags?.name ?? e.tags?.["name:en"] ?? "Pharmacy",
              address:
                [
                  e.tags?.["addr:housenumber"],
                  e.tags?.["addr:street"],
                  e.tags?.["addr:city"],
                  e.tags?.["addr:state"],
                ]
                  .filter(Boolean)
                  .join(", ") ||
                e.tags?.["addr:full"] ||
                "Address not listed",
              phone: e.tags?.phone ?? e.tags?.["contact:phone"] ?? "Not listed",
              lat: e.calculatedLat!,
              lng: e.calculatedLon!,
              rating: null,
              ratingCount: 0,
              status: "OPERATIONAL",
              distanceKm: haversine(searchLat!, searchLng!, e.calculatedLat!, e.calculatedLon!),
            }))
            .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

          return json({ 
            places,
            center: { lat: searchLat, lng: searchLng }
          });
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
        }
      },
    },
  },
});
