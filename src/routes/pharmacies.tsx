import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Search, Package, PackageX, PackageMinus } from "lucide-react";
import { findPharmacies, type Pharmacy, type StockStatus } from "@/lib/pharmacies";

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
        content:
          "Find nearby Nigerian pharmacies that stock your medication, with stock status and distance.",
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

function PharmaciesPage() {
  const { q: initial } = Route.useSearch();
  const [query, setQuery] = useState(initial ?? "");
  const [results, setResults] = useState<Pharmacy[]>(initial ? findPharmacies(initial) : []);
  const [searched, setSearched] = useState(Boolean(initial));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setResults(findPharmacies(query));
    setSearched(true);
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pharmacy Locator</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search for a medication and we'll show 5 nearby pharmacies with current stock status.
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
            type="submit"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Find Pharmacies
          </button>
        </form>

        {searched && (
          <section className="mt-8 space-y-3" aria-live="polite">
            {results.map((p) => {
              const { Icon, classes } = stockBadge(p.stock);
              return (
                <article
                  key={p.name}
                  className="rounded-lg border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-card-foreground">{p.name}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {p.address}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" /> {p.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {p.stock}
                      </span>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {p.distanceKm} km away
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
