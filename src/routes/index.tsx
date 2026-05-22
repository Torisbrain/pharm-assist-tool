import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, ShieldCheck, ShieldAlert, ShieldQuestion,
  Pill, ArrowRight, Loader2
} from "lucide-react";

type Status = "Verified" | "Flagged" | "Unknown";

interface DrugResult {
  name: string;
  nafdacNumber: string;
  manufacturer: string;
  status: Status;
  activeIngredient: string;
  dosage: string;
  alternatives: string[];
  explanation: string;
  warning: string;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "PharmVerify NG — Verify Nigerian Drugs",
      },
      {
        name: "description",
        content: "Verify Nigerian drugs by name or NAFDAC number.",
      },
    ],
  }),
  component: Index,
});

function StatusBadge({ status }: { status: Status }) {
  const map = {
    Verified: {
      icon: ShieldCheck,
      classes: "border-green-200 bg-green-50 text-green-700",
    },
    Flagged: {
      icon: ShieldAlert,
      classes: "border-red-200 bg-red-50 text-red-700",
    },
    Unknown: {
      icon: ShieldQuestion,
      classes: "border-yellow-200 bg-yellow-50 text-yellow-700",
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

const SUGGESTIONS = [
  "Panadol Extra", "Amoxil 500mg", "Coartem",
  "Postinor-2", "Flagyl 200mg", "Augmentin 625mg"
];

function Index() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DrugResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/verify-drug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const drug = await response.json();
      setResult(drug);
    } catch (err) {
      console.error("Search error:", err);
      setResult({
        name: searchQuery,
        nafdacNumber: "Not found",
        manufacturer: "Not found",
        status: "Unknown",
        activeIngredient: "Unknown",
        dosage: "Unknown",
        alternatives: [],
        explanation: "Could not verify this drug. Please check nafdac.gov.ng or consult a pharmacist.",
        warning: "Exercise caution with unverified drugs."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <header className="text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-sm text-secondary-foreground">
            <Pill className="h-4 w-4" />
            Nigerian Drug Verification
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Verify any drug in seconds
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search by drug name or NAFDAC number to check authenticity, manufacturer, and safer alternatives.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search drug name or NAFDAC number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 pl-9 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
            ) : (
              "Verify Drug"
            )}
          </button>
        </form>

        {!searched && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setQuery(s); handleSearch(s); }}
                className="rounded-full border border-border bg-secondary px-2.5 py-1 text-secondary-foreground hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <section className="mt-8" aria-live="polite">
          {loading && (
            <div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-card p-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking NAFDAC database...</p>
            </div>
          )}

          {!loading && searched && result && (
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground">{result.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">NAFDAC No. {result.nafdacNumber}</p>
                </div>
                <StatusBadge status={result.status} />
              </div>

              <dl className="space-y-3 border-t border-border pt-4">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Manufacturer</dt>
                  <dd className="mt-1 text-sm text-foreground">{result.manufacturer}</dd>
                </div>
                {result.activeIngredient && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active Ingredient</dt>
                    <dd className="mt-1 text-sm text-foreground">{result.activeIngredient}</dd>
                  </div>
                )}
                {result.explanation && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">About this drug</dt>
                    <dd className="mt-1 text-sm text-foreground">{result.explanation}</dd>
                  </div>
                )}
                {result.alternatives?.length > 0 && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Generic Alternatives</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {result.alternatives.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => { setQuery(g); handleSearch(g); }}
                          className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground hover:bg-accent cursor-pointer"
                        >
                          {g}
                        </button>
                       ))}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <a
                  href={`https://nafdac.gov.ng/our-services/registered-products/?search=${encodeURIComponent(result.nafdacNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Verify on nafdac.gov.ng <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <Link
                  to="/pharmacies"
                  search={{ q: result.name }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Find this drug nearby <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {result.status === "Flagged" && (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  ⚠️ This product has been flagged. Do not consume without consulting a licensed pharmacist.
                </p>
              )}
              {result.status === "Unknown" && (
                <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-700">
                  <p className="mb-2">
                    ⚠️ This drug was not found in our database. Search the official NAFDAC Greenbook to double-check before use.
                  </p>
                  <a
                    href={`https://greenbook.nafdac.gov.ng/?search=${encodeURIComponent(query || result.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-yellow-600 px-3 py-1.5 font-medium text-white hover:bg-yellow-700"
                  >
                    Search NAFDAC Greenbook <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                AI-assisted results. Not a substitute for professional medical advice.
              </p>
            </div>
          )}
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link to="/interactions" className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent">
            <h3 className="text-base font-semibold text-card-foreground">Drug Interaction Checker</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add multiple drugs to see how they interact.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open checker <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link to="/pharmacies" className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent">
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
