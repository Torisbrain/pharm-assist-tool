import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ShieldCheck, ShieldAlert, ShieldQuestion, Pill, ArrowRight } from "lucide-react";
import { DB, searchDrugs, type Drug, type Status } from "@/lib/drugs";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PharmVerify NG — Verify Nigerian Drugs" },
      {
        name: "description",
        content:
          "Verify Nigerian drugs by name or NAFDAC number. Check manufacturer, NAFDAC status, and generic alternatives.",
      },
    ],
  }),
});

function StatusBadge({ status }: { status: Status }) {
  const map = {
    Verified: {
      icon: ShieldCheck,
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    Flagged: {
      icon: ShieldAlert,
      classes: "bg-red-50 text-red-700 border-red-200",
    },
    Unknown: {
      icon: ShieldQuestion,
      classes: "bg-muted text-muted-foreground border-border",
    },
  } as const;
  const { icon: Icon, classes } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${classes}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

function Index() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Drug | "unknown" | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(searchDrugs(query));
    setSearched(true);
  };

  const suggestions = !searched
    ? DB.slice(0, 6).map((d) => d.name)
    : [];

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Pill className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Verify any drug in seconds
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search by drug name or NAFDAC number to check authenticity, manufacturer, and safer alternatives.
          </p>
        </header>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Panadol Extra or A4-0123"
              className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Verify Drug
          </button>
        </form>

        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Try:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  setResult(searchDrugs(s));
                  setSearched(true);
                }}
                className="rounded-full border border-border bg-secondary px-2.5 py-1 text-secondary-foreground hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <section className="mt-8" aria-live="polite">
          {searched && result === "unknown" && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground">No match found</h2>
                <StatusBadge status="Unknown" />
              </div>
              <p className="text-sm text-muted-foreground">
                We couldn't find "{query}" in the NAFDAC registry. Verify the spelling or NAFDAC number, and report suspicious products to NAFDAC.
              </p>
              <a
                href={`https://nafdac.gov.ng/our-services/registered-products/?search=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Search "{query}" on nafdac.gov.ng
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {result && result !== "unknown" && (
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground">{result.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">NAFDAC No. {result.nafdac}</p>
                </div>
                <StatusBadge status={result.status} />
              </div>

              <dl className="space-y-3 border-t border-border pt-4">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Manufacturer</dt>
                  <dd className="mt-1 text-sm text-foreground">{result.manufacturer}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Generic Alternatives</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {result.generics.map((g) => (
                      <span key={g} className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                        {g}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <a
                  href={`https://nafdac.gov.ng/our-services/registered-products/?search=${encodeURIComponent(result.nafdac)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Verify on nafdac.gov.ng
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <Link
                  to="/pharmacies"
                  search={{ q: result.name }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Find this drug nearby
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {result.status === "Flagged" && (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  This product has been flagged. Do not consume without consulting a licensed pharmacist.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            to="/interactions"
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <h3 className="text-base font-semibold text-card-foreground">Drug Interaction Checker</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add multiple drugs to see how they interact.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open checker <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link
            to="/pharmacies"
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <h3 className="text-base font-semibold text-card-foreground">Pharmacy Locator</h3>
            <p className="mt-1 text-sm text-muted-foreground">Find nearby pharmacies that stock your medication.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Locate <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}
