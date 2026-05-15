import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Plus, X } from "lucide-react";
import { useState } from "react";
import { Search, ShieldCheck, ShieldAlert, ShieldQuestion, Pill } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PharmVerify NG — Drug Search" },
      {
        name: "description",
        content:
          "Verify Nigerian drugs by name or NAFDAC number. Check manufacturer, NAFDAC status, and generic alternatives.",
      },
    ],
  }),
});

type Status = "Verified" | "Flagged" | "Unknown";

interface Drug {
  name: string;
  nafdac: string;
  manufacturer: string;
  status: Status;
  generics: string[];
}

const DB: Drug[] = [
  {
    name: "Panadol Extra",
    nafdac: "A4-0123",
    manufacturer: "GlaxoSmithKline Nigeria",
    status: "Verified",
    generics: ["Paracetamol 500mg", "Emzor Paracetamol", "M&B Paracetamol"],
  },
  {
    name: "Amoxil 500mg",
    nafdac: "A4-7781",
    manufacturer: "GSK Pharmaceuticals",
    status: "Verified",
    generics: ["Amoxicillin 500mg", "Fidson Amoxicillin", "Emzor Amoxil"],
  },
  {
    name: "Coartem",
    nafdac: "A4-5566",
    manufacturer: "Novartis Pharma AG",
    status: "Verified",
    generics: ["Artemether/Lumefantrine", "Lonart", "Amatem Forte"],
  },
  {
    name: "Postinor-2",
    nafdac: "A4-9912",
    manufacturer: "Gedeon Richter Plc",
    status: "Flagged",
    generics: ["Levonorgestrel 0.75mg", "Plan B"],
  },
  {
    name: "Flagyl 200mg",
    nafdac: "A4-3344",
    manufacturer: "Sanofi Aventis Nigeria",
    status: "Verified",
    generics: ["Metronidazole 200mg", "Emzol", "Fidson Metronidazole"],
  },
  {
    name: "Augmentin 625mg",
    nafdac: "A4-2210",
    manufacturer: "GlaxoSmithKline",
    status: "Verified",
    generics: ["Amoxicillin/Clavulanate", "Clavulin", "Fidson Augmentin"],
  },
  {
    name: "Ciprotab 500mg",
    nafdac: "A4-4421",
    manufacturer: "Fidson Healthcare Plc",
    status: "Verified",
    generics: ["Ciprofloxacin 500mg", "Ciproxin", "Emzor Ciprofloxacin"],
  },
  {
    name: "Lonart DS",
    nafdac: "A4-6677",
    manufacturer: "Bliss GVS Pharma",
    status: "Verified",
    generics: ["Artemether/Lumefantrine 80/480mg", "Coartem", "Amatem Forte"],
  },
  {
    name: "Tylenol",
    nafdac: "A4-1188",
    manufacturer: "Johnson & Johnson",
    status: "Verified",
    generics: ["Paracetamol 500mg", "Panadol", "Emzor Paracetamol"],
  },
  {
    name: "Ventolin Inhaler",
    nafdac: "A4-8834",
    manufacturer: "GlaxoSmithKline",
    status: "Verified",
    generics: ["Salbutamol Inhaler", "Asthalin", "Salbutol"],
  },
  {
    name: "Glucophage 500mg",
    nafdac: "A4-5512",
    manufacturer: "Merck Serono",
    status: "Verified",
    generics: ["Metformin 500mg", "Diaformin", "Emzor Metformin"],
  },
  {
    name: "Lipitor 20mg",
    nafdac: "A4-7723",
    manufacturer: "Pfizer Inc.",
    status: "Verified",
    generics: ["Atorvastatin 20mg", "Atorlip", "Storvas"],
  },
  {
    name: "Amatem Forte",
    nafdac: "A4-3398",
    manufacturer: "Emzor Pharmaceutical",
    status: "Verified",
    generics: ["Artemether/Lumefantrine", "Coartem", "Lonart"],
  },
  {
    name: "Zinnat 500mg",
    nafdac: "A4-9087",
    manufacturer: "GlaxoSmithKline",
    status: "Verified",
    generics: ["Cefuroxime 500mg", "Ceftin", "Cefurox"],
  },
  {
    name: "Diclofenac Sodium 50mg",
    nafdac: "A4-2256",
    manufacturer: "Emzor Pharmaceutical",
    status: "Verified",
    generics: ["Voltaren", "Cataflam", "Dicloflam"],
  },
  {
    name: "Loratadine 10mg",
    nafdac: "A4-6645",
    manufacturer: "Fidson Healthcare Plc",
    status: "Verified",
    generics: ["Claritin", "Lorano", "Emzor Loratadine"],
  },
  {
    name: "Septrin",
    nafdac: "A4-1102",
    manufacturer: "GlaxoSmithKline",
    status: "Verified",
    generics: ["Co-trimoxazole", "Bactrim", "Sulfamethoxazole/Trimethoprim"],
  },
  {
    name: "Omeprazole 20mg",
    nafdac: "A4-4478",
    manufacturer: "May & Baker Nigeria",
    status: "Verified",
    generics: ["Losec", "Omez", "Emzor Omeprazole"],
  },
  {
    name: "Tramadol 100mg",
    nafdac: "B4-0099",
    manufacturer: "Unknown Importer",
    status: "Flagged",
    generics: ["Tramal", "Ultram"],
  },
  {
    name: "Codeine Linctus",
    nafdac: "B4-0042",
    manufacturer: "Emzor Pharmaceutical",
    status: "Flagged",
    generics: ["Benylin with Codeine", "Phensedyl"],
  },
  {
    name: "Vitamin C 1000mg",
    nafdac: "A4-7754",
    manufacturer: "Emzor Pharmaceutical",
    status: "Verified",
    generics: ["Ascorbic Acid", "Redoxon", "Celin"],
  },
  {
    name: "Folic Acid 5mg",
    nafdac: "A4-3321",
    manufacturer: "May & Baker Nigeria",
    status: "Verified",
    generics: ["Folvite", "Emzor Folic Acid"],
  },
];

function searchDrugs(q: string): Drug | "unknown" | null {
  const query = q.trim().toLowerCase();
  if (!query) return null;
  const found = DB.find(
    (d) =>
      d.name.toLowerCase().includes(query) ||
      d.nafdac.toLowerCase().replace(/[-\s]/g, "") ===
        query.replace(/[-\s]/g, ""),
  );
  return found ?? "unknown";
}

function StatusBadge({ status }: { status: Status }) {
  const map = {
    Verified: {
      icon: ShieldCheck,
      classes:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
    },
    Flagged: {
      icon: ShieldAlert,
      classes:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
    },
    Unknown: {
      icon: ShieldQuestion,
      classes:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
    },
  } as const;
  const { icon: Icon, classes } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${classes}`}
    >
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

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Pill className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            PharmVerify NG
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search for a drug by name or NAFDAC number to verify its status.
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
            Search
          </button>
        </form>

        <section className="mt-8" aria-live="polite">
          {searched && result === "unknown" && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-card-foreground">
                  No match found
                </h2>
                <StatusBadge status="Unknown" />
              </div>
              <p className="text-sm text-muted-foreground">
                We couldn't find "{query}" in the NAFDAC registry. Verify the
                spelling or NAFDAC number, and report suspicious products to
                NAFDAC.
              </p>
              <a
                href={`https://nafdac.gov.ng/our-services/registered-products/?search=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                title={`Searches nafdac.gov.ng for "${query}"`}
              >
                Search "{query}" on nafdac.gov.ng
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
              </a>
            </div>
          )}

          {result && result !== "unknown" && (
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground">
                    {result.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    NAFDAC No. {result.nafdac}
                  </p>
                </div>
                <StatusBadge status={result.status} />
              </div>

              <dl className="space-y-3 border-t border-border pt-4">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Manufacturer
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {result.manufacturer}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Generic Alternatives
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {result.generics.map((g) => (
                      <span
                        key={g}
                        className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                      >
                        {g}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>

              <a
                href={`https://nafdac.gov.ng/our-services/registered-products/?search=${encodeURIComponent(result.nafdac)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                title={`Searches nafdac.gov.ng for NAFDAC No. ${result.nafdac}`}
              >
                Verify {result.manufacturer} record on nafdac.gov.ng
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
              </a>

              {result.status === "Flagged" && (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  This product has been flagged. Do not consume without
                  consulting a licensed pharmacist.
                </p>
              )}
            </div>
          )}
        </section>

        <InteractionChecker />
      </div>
    </main>
  );
}

type Severity = "Major" | "Moderate" | "Minor";

interface Interaction {
  a: string; // active ingredient (lowercase)
  b: string;
  severity: Severity;
  note: string;
}

// Map drug brand -> primary active ingredient (lowercase keyword)
const ACTIVE_INGREDIENT: Record<string, string> = {
  "Panadol Extra": "paracetamol",
  Tylenol: "paracetamol",
  "Amoxil 500mg": "amoxicillin",
  "Augmentin 625mg": "amoxicillin",
  Coartem: "artemether",
  "Lonart DS": "artemether",
  "Amatem Forte": "artemether",
  "Postinor-2": "levonorgestrel",
  "Flagyl 200mg": "metronidazole",
  "Ciprotab 500mg": "ciprofloxacin",
  "Ventolin Inhaler": "salbutamol",
  "Glucophage 500mg": "metformin",
  "Lipitor 20mg": "atorvastatin",
  "Zinnat 500mg": "cefuroxime",
  "Diclofenac Sodium 50mg": "diclofenac",
  "Loratadine 10mg": "loratadine",
  Septrin: "co-trimoxazole",
  "Omeprazole 20mg": "omeprazole",
  "Tramadol 100mg": "tramadol",
  "Codeine Linctus": "codeine",
  "Vitamin C 1000mg": "ascorbic acid",
  "Folic Acid 5mg": "folic acid",
};

const INTERACTIONS: Interaction[] = [
  {
    a: "tramadol",
    b: "codeine",
    severity: "Major",
    note: "Combined opioids increase risk of respiratory depression, sedation, and overdose.",
  },
  {
    a: "tramadol",
    b: "paracetamol",
    severity: "Minor",
    note: "Generally safe combination, but watch total daily paracetamol dose (max 4g).",
  },
  {
    a: "diclofenac",
    b: "paracetamol",
    severity: "Minor",
    note: "Often co-prescribed; monitor for GI irritation with prolonged diclofenac use.",
  },
  {
    a: "ciprofloxacin",
    b: "metformin",
    severity: "Moderate",
    note: "Ciprofloxacin may alter blood glucose levels in patients on metformin.",
  },
  {
    a: "atorvastatin",
    b: "ciprofloxacin",
    severity: "Moderate",
    note: "Increased risk of myopathy/rhabdomyolysis when combined.",
  },
  {
    a: "metronidazole",
    b: "atorvastatin",
    severity: "Moderate",
    note: "Metronidazole may increase atorvastatin levels — monitor for muscle pain.",
  },
  {
    a: "omeprazole",
    b: "atorvastatin",
    severity: "Minor",
    note: "Minor pharmacokinetic interaction; clinically usually insignificant.",
  },
  {
    a: "co-trimoxazole",
    b: "metformin",
    severity: "Major",
    note: "Increases risk of hypoglycemia. Monitor blood sugar closely.",
  },
  {
    a: "codeine",
    b: "paracetamol",
    severity: "Minor",
    note: "Common combination (e.g., co-codamol). Respect paracetamol daily limit.",
  },
  {
    a: "amoxicillin",
    b: "levonorgestrel",
    severity: "Moderate",
    note: "Antibiotics may reduce hormonal contraceptive effectiveness — use backup method.",
  },
  {
    a: "salbutamol",
    b: "atorvastatin",
    severity: "Minor",
    note: "No significant interaction expected.",
  },
];

function findInteraction(ingA: string, ingB: string): Interaction | undefined {
  return INTERACTIONS.find(
    (i) =>
      (i.a === ingA && i.b === ingB) || (i.a === ingB && i.b === ingA),
  );
}

function severityClasses(s: Severity) {
  switch (s) {
    case "Major":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900";
    case "Moderate":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900";
    case "Minor":
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900";
  }
}

const SEVERITY_ACTION: Record<Severity, { label: string; detail: string }> = {
  Major: {
    label: "Avoid this combination",
    detail:
      "Do not take together unless explicitly directed by a physician. Seek immediate pharmacist or doctor review.",
  },
  Moderate: {
    label: "Use with caution — consult a pharmacist",
    detail:
      "May be acceptable with monitoring or dose adjustment. Confirm with a licensed pharmacist before continuing both.",
  },
  Minor: {
    label: "Take extra precautions",
    detail:
      "Generally safe together; observe dosage limits and watch for unusual side effects.",
  },
};

function InteractionChecker() {
  const [selected, setSelected] = useState<string[]>([]);
  const [picker, setPicker] = useState("");

  const available = DB.map((d) => d.name).filter((n) => !selected.includes(n));

  const addDrug = () => {
    if (!picker || selected.includes(picker)) return;
    setSelected([...selected, picker]);
    setPicker("");
  };

  const remove = (name: string) =>
    setSelected(selected.filter((n) => n !== name));

  // Compute pairwise interactions
  const findings: { drugA: string; drugB: string; interaction: Interaction }[] =
    [];
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const ingA = ACTIVE_INGREDIENT[selected[i]];
      const ingB = ACTIVE_INGREDIENT[selected[j]];
      if (!ingA || !ingB) continue;
      const hit = findInteraction(ingA, ingB);
      if (hit) {
        findings.push({
          drugA: selected[i],
          drugB: selected[j],
          interaction: hit,
        });
      }
    }
  }

  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          Drug Interaction Checker
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the medications you're taking to check for known interactions.
        </p>
      </div>

      <div className="flex gap-2">
        <select
          value={picker}
          onChange={(e) => setPicker(e.target.value)}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select a drug…</option>
          {available.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addDrug}
          disabled={!picker}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {selected.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selected.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground"
            >
              {name}
              <button
                type="button"
                onClick={() => remove(name)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {selected.length >= 2 && (
        <div className="mt-6">
          {findings.length === 0 ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  No known interactions found
                </p>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                  Always confirm with a licensed pharmacist before combining
                  medications.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {findings.map((f, idx) => (
                <li
                  key={idx}
                  className={`flex items-start gap-3 rounded-lg border p-4 ${severityClasses(f.interaction.severity)}`}
                >
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">
                        {f.drugA} ↔ {f.drugB}
                      </span>
                      <span className="rounded-full border border-current px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                        {f.interaction.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed">
                      {f.interaction.note}
                    </p>
                    <div className="mt-2 rounded-md border border-current/30 bg-background/40 px-3 py-2">
                      <p className="text-xs font-semibold">
                        Recommended: {SEVERITY_ACTION[f.interaction.severity].label}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed opacity-90">
                        {SEVERITY_ACTION[f.interaction.severity].detail}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
