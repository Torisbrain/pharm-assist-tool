import { createFileRoute } from "@tanstack/react-router";

const GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places";

interface PlaceResult {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  businessStatus?: string;
  rating?: number;
  userRatingCount?: number;
}

const FIELD_MASK = [
  "places.id","places.displayName","places.formattedAddress","places.location",
  "places.nationalPhoneNumber","places.internationalPhoneNumber",
  "places.businessStatus","places.rating","places.userRatingCount",
].join(",");

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

export const Route = createFileRoute("/api/pharmacies")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
        if (!GOOGLE_MAPS_API_KEY) return json({ error: "GOOGLE_MAPS_API_KEY missing" }, 500);

        let body: { lat?: number; lng?: number; query?: string; radius?: number };
        try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

        const radius = Math.min(Math.max(body.radius ?? 5000, 500), 50000);
        const hasCoords = typeof body.lat === "number" && typeof body.lng === "number";
        const query = (body.query ?? "").trim();

        const headers = {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": FIELD_MASK,
        };

        try {
          let res: Response;
          if (hasCoords && !query) {
            res = await fetch(`${GOOGLE_PLACES_URL}:searchNearby`, {
              method: "POST", headers,
              body: JSON.stringify({
                includedTypes: ["pharmacy", "drugstore"],
                maxResultCount: 15,
                locationRestriction: {
                  circle: { center: { latitude: body.lat, longitude: body.lng }, radius },
                },
              }),
            });
          } else {
            const textQuery = query ? `pharmacy in ${query}, Nigeria` : "pharmacy in Nigeria";
            const payload: Record<string, unknown> = { textQuery, maxResultCount: 15, regionCode: "NG" };
            if (hasCoords) {
              payload.locationBias = { circle: { center: { latitude: body.lat, longitude: body.lng }, radius } };
            }
            res = await fetch(`${GOOGLE_PLACES_URL}:searchText`, {
              method: "POST", headers, body: JSON.stringify(payload),
            });
          }

          const text = await res.text();
          if (!res.ok) return json({ error: `Places API ${res.status}: ${text}` }, 502);
          const data = JSON.parse(text) as { places?: PlaceResult[] };
          const places = (data.places ?? []).map((p) => ({
            id: p.id,
            name: p.displayName?.text ?? "Pharmacy",
            address: p.formattedAddress ?? "Address not listed",
            phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? "Not listed",
            lat: p.location?.latitude ?? 0,
            lng: p.location?.longitude ?? 0,
            rating: p.rating ?? null,
            ratingCount: p.userRatingCount ?? 0,
            status: p.businessStatus ?? "OPERATIONAL",
          }));
          return json({ places });
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
        }
      },
    },
  },
});
