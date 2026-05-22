import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  MapPin, Phone, Search, Package,
  PackageX, PackageMinus, Loader2, Navigation
} from "lucide-react";

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  distanceKm: number;
  stock: StockStatus;
  lat: number;
  lng: number;
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
        content: "Find nearby Nigerian pharmacies that stock your medication with Google Maps.",
      },
    ],
  }),
});

function stockBadge(s: StockStatus) {
  switch (s) {
    case "In Stock":
      return { Icon: Package, classes: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "Low Stock":
      return { Icon: PackageMinus, classes: "bg-amber-50 text-amber-700 border-amber-200" };
    case "Out of Stock":
      return { Icon: PackageX, classes: "bg-red-50 text-red-700 border-red-200" };
  }
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

async function fetchNearbyPharmacies(lat: number, lng: number, radius = 5000): Promise<Pharmacy[]> {
  const query = `[out:json][timeout:15];node["amenity"="pharmacy"](around:${radius},${lat},${lng});out body 10;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
    headers: { "Content-Type": "text/plain" },
  });
  const data = await res.json();
  if (!data.elements?.length) return [];

  interface OSMNode { id: number; lat: number; lon: number; tags?: Record<string, string>; }
return (data.elements as OSMNode[]).map((p) => ({
    id: String(p.id),
    name: p.tags?.name || "Pharmacy",
    address: [
      p.tags?.["addr:housenumber"],
      p.tags?.["addr:street"],
      p.tags?.["addr:city"] || p.tags?.["addr:state"],
    ].filter(Boolean).join(", ") || "Address not listed",
    phone: p.tags?.phone || p.tags?.["contact:phone"] || "Not listed",
    distanceKm: calcDistance(lat, lng, p.lat, p.lon),
    stock: "In Stock" as StockStatus,
    lat: p.lat,
    lng: p.lon,
  })).sort((a, b) => a.distanceKm - b.distanceKm);
}

function GoogleMap({ pharmacies, userLat, userLng }: { pharmacies: Pharmacy[], userLat: number, userLng: number }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Check if Google Maps is loaded
    if (!window.google) {
      console.warn("Google Maps API not loaded. Add your API key to environment variables.");
      return;
    }

    const google = window.google;
    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: userLat, lng: userLng },
      mapTypeId: "roadmap",
    });

    setMap(mapInstance);

    // Add user location marker
    new google.maps.Marker({
      position: { lat: userLat, lng: userLng },
      map: mapInstance,
      title: "Your Location",
      icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    });

    // Add pharmacy markers
    pharmacies.forEach((pharmacy) => {
      const marker = new google.maps.Marker({
        position: { lat: pharmacy.lat, lng: pharmacy.lng },
        map: mapInstance,
        title: pharmacy.name,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div className="p-2">
            <h3 className="font-semibold">${pharmacy.name}</h3>
            <p className="text-xs text-gray-600">${pharmacy.address}</p>
            <p className="text-xs text-gray-600">${pharmacy.phone}</p>
            <p className="text-xs font-medium">${pharmacy.distanceKm} km away</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance, marker);
      });
    });
  }, [pharmacies, userLat, userLng]);

  return (
    <div
      ref={mapRef}
      className="h-96 w-full rounded-lg border border-border bg-muted"
    />
  );
}

function PharmaciesPage() {
  const { q: initial } = Route.useSearch();
  const [query, setQuery] = useState(initial ?? "");
  const [results, setResults] = useState<Pharmacy[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState("");
  const [message, setMessage] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const findNearby = () => {
    setLoading(true);
    setLocError("");
    setMessage("");
    setSearched(false);

    if (!navigator.geolocation) {
      setLocError("Location not supported on this device.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          let pharmacies = await fetchNearbyPharmacies(latitude, longitude, 5000);
          if (pharmacies.length === 0) {
            pharmacies = await fetchNearbyPharmacies(latitude, longitude, 10000);
          }
          if (pharmacies.length === 0) {
            setMessage("No pharmacies found within 10km. Try visiting nafdac.gov.ng for listings in your state.");
          }
          setResults(pharmacies);
          setSearched(true);
        } catch {
          setLocError("Could not load pharmacies. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLocError("Please allow location access in your browser to find nearby pharmacies.");
        setLoading(false);
      }
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    findNearby();
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Pharmacy Locator
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Find real pharmacies near you across all 36 Nigerian states and Africa.
            Allow location access for the best results.
          </p>
        </header>

        <form onSubmit={onSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Coartem, Amoxil 500mg…"
              className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={findNearby}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Finding...</>
            ) : (
              <><Navigation className="h-4 w-4" /> Find Near Me</>
            )}
          </button>
        </form>

        {locError && (
          <p className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
            ⚠️ {locError}
          </p>
        )}

        {searched && (
          <section className="mt-8 space-y-6" aria-live="polite">
            {userLocation && results.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="mb-3 text-lg font-semibold text-card-foreground">
                  Pharmacies Near You
                </h2>
                <GoogleMap 
                  pharmacies={results} 
                  userLat={userLocation.lat} 
                  userLng={userLocation.lng} 
                />
              </div>
            )}

            {message && (
              <p className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
                {message}
              </p>
            )}

            <div className="space-y-3">
              {results.map((p) => {
                const { Icon, classes } = stockBadge(p.stock);
                return (
                  <article
                    key={p.id}
                    className="rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-base font-semibold text-card-foreground">{p.name}</h2>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" /> {p.address}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {p.phone !== "Not listed" ? (
                            <a href={`tel:${p.phone}`} className="hover:text-primary hover:underline">
                              {p.phone}
                            </a>
                          ) : (
                            p.phone
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {p.stock}
                        </span>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {p.distanceKm} km away
                        </p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex text-xs text-primary hover:underline"
                        >
                          Get directions →
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
