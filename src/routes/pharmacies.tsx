import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  MapPin, Phone, Search, Package, Loader2, Navigation, Star,
} from "lucide-react";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm: number | null;
  rating: number | null;
  ratingCount: number;
  status: string;
}

type Sp = { q?: string };

export const Route = createFileRoute("/pharmacies")({
  validateSearch: (s: Record<string, unknown>): Sp => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: PharmaciesPage,
  head: () => ({
    meta: [
      { title: "Pharmacy Locator — PharmVerify NG" },
      {
        name: "description",
        content: "Find real Nigerian pharmacies near you with Google Maps and Places.",
      },
    ],
  }),
});

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

declare global {
  interface Window {
    google?: any;
    __pvInitMap?: () => void;
    __pvMapReady?: boolean;
  }
}

let mapsLoadingPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.__pvMapReady && window.google?.maps) return Promise.resolve();
  if (mapsLoadingPromise) return mapsLoadingPromise;
  if (!BROWSER_KEY) return Promise.reject(new Error("Missing Google Maps browser key"));

  mapsLoadingPromise = new Promise((resolve, reject) => {
    window.__pvInitMap = () => {
      window.__pvMapReady = true;
      resolve();
    };
    const s = document.createElement("script");
    const channel = TRACKING_ID ? `&channel=${TRACKING_ID}` : "";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&loading=async&callback=__pvInitMap${channel}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return mapsLoadingPromise;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function GMap({
  pharmacies,
  center,
  userLocation,
  selectedId,
  onSelect,
}: {
  pharmacies: Pharmacy[];
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<Record<string, any>>({});
  const infos = useRef<Record<string, any>>({});
  const openInfo = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current || !window.google) return;
        if (!mapInstance.current) {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            zoom: 13,
            center,
            mapTypeControl: false,
            streetViewControl: false,
          });
        } else {
          mapInstance.current.setCenter(center);
        }

        // Clear existing markers + infos
        Object.values(markers.current).forEach((m: any) => m.setMap(null));
        Object.values(infos.current).forEach((i: any) => i.close());
        markers.current = {};
        infos.current = {};
        openInfo.current = null;

        const google = window.google;
        const bounds = new google.maps.LatLngBounds();

        if (userLocation) {
          const userMarker = new google.maps.Marker({
            position: userLocation,
            map: mapInstance.current,
            title: "Your location",
            icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          });
          markers.current["__user"] = userMarker;
          bounds.extend(userLocation);
        }

        pharmacies.forEach((p) => {
          if (!p.lat || !p.lng) return;
          const marker = new google.maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map: mapInstance.current,
            title: p.name,
          });
          const info = new google.maps.InfoWindow({
            content: `
              <div style="font-family: system-ui; padding: 4px; max-width: 240px;">
                <div style="font-weight:600; margin-bottom:4px;">${p.name}</div>
                <div style="font-size:12px; color:#555;">${p.address}</div>
                ${p.phone !== "Not listed" ? `<div style="font-size:12px; color:#555; margin-top:4px;">📞 ${p.phone}</div>` : ""}
                ${p.rating ? `<div style="font-size:12px; margin-top:4px;">⭐ ${p.rating} (${p.ratingCount})</div>` : ""}
              </div>
            `,
          });
          marker.addListener("click", () => onSelect(p.id));
          markers.current[p.id] = marker;
          infos.current[p.id] = info;
          bounds.extend({ lat: p.lat, lng: p.lng });
        });

        if (!bounds.isEmpty() && (pharmacies.length > 0 || userLocation)) {
          mapInstance.current.fitBounds(bounds, 60);
        }
      })
      .catch((e) => console.error("Maps load error:", e));

    return () => {
      cancelled = true;
    };
  }, [pharmacies, center, userLocation, onSelect]);

  // React to selection: open info window, bounce marker, pan to it
  useEffect(() => {
    if (!selectedId || !window.google || !mapInstance.current) return;
    const marker = markers.current[selectedId];
    const info = infos.current[selectedId];
    if (!marker || !info) return;

    if (openInfo.current && openInfo.current !== info) openInfo.current.close();
    info.open(mapInstance.current, marker);
    openInfo.current = info;

    mapInstance.current.panTo(marker.getPosition());
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    const t = window.setTimeout(() => marker.setAnimation(null), 1400);
    return () => window.clearTimeout(t);
  }, [selectedId, pharmacies]);

  return <div ref={mapRef} className="h-[420px] w-full rounded-lg border border-border bg-muted" />;
}

function PharmaciesPage() {
  const { q: initial } = Route.useSearch();
  const [query, setQuery] = useState(initial ?? "");
  const [results, setResults] = useState<Pharmacy[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 9.082, lng: 8.6753 }); // Nigeria
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    const el = cardRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const runSearch = useCallback(
    async (opts: { lat?: number; lng?: number; query?: string }) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/pharmacies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...opts, radius: 8000 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Search failed");

        const pharmacies: Pharmacy[] = (data.places ?? []).map((p: Pharmacy) => ({
          ...p,
          distanceKm:
            opts.lat != null && opts.lng != null && p.lat && p.lng
              ? haversine(opts.lat, opts.lng, p.lat, p.lng)
              : null,
        }));
        pharmacies.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
        setResults(pharmacies);
        setSearched(true);

        if (pharmacies.length > 0) {
          setCenter(
            opts.lat != null && opts.lng != null
              ? { lat: opts.lat, lng: opts.lng }
              : { lat: pharmacies[0].lat, lng: pharmacies[0].lng }
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const findNearby = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Location not supported. Try searching by city instead.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        runSearch({ lat: loc.lat, lng: loc.lng, query: query.trim() || undefined });
      },
      () => {
        setLoading(false);
        setError("Location access denied. Try searching by city name.");
      },
      { timeout: 10000 }
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      findNearby();
      return;
    }
    runSearch({ query: query.trim() });
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pharmacy Locator</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Find real pharmacies near you across Nigeria — powered by Google Places.
            Search by city (e.g. <em>Lagos</em>, <em>Abuja</em>, <em>Ibadan</em>) or use your location.
          </p>
        </header>

        <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="City or area (e.g. Lekki, Wuse 2, Enugu)…"
              className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
          <button
            type="button"
            onClick={findNearby}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-70"
          >
            <Navigation className="h-4 w-4" /> Near me
          </button>
        </form>

        {error && (
          <p className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
            ⚠️ {error}
          </p>
        )}

        {searched && (
          <section className="mt-8 space-y-6" aria-live="polite">
            {results.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="mb-3 text-lg font-semibold text-card-foreground">
                  {results.length} pharmac{results.length === 1 ? "y" : "ies"} found
                </h2>
                <GMap pharmacies={results} center={center} userLocation={userLocation} />
              </div>
            )}

            {results.length === 0 && !loading && (
              <p className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
                No pharmacies found. Try a different city or area.
              </p>
            )}

            <div className="space-y-3">
              {results.map((p) => (
                <article
                  key={p.id}
                  className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-card-foreground">{p.name}</h3>
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {p.address}
                      </p>
                      {p.phone !== "Not listed" && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <a href={`tel:${p.phone}`} className="hover:text-primary hover:underline">
                            {p.phone}
                          </a>
                        </p>
                      )}
                      {p.rating != null && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {p.rating} ({p.ratingCount} reviews)
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <Package className="h-3.5 w-3.5" />
                        {p.status === "OPERATIONAL" ? "Open" : p.status}
                      </span>
                      {p.distanceKm != null && (
                        <p className="mt-2 text-sm font-medium text-foreground">{p.distanceKm} km</p>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}&query_place_id=${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex text-xs text-primary hover:underline"
                      >
                        Directions →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
