import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Plus, X, ShieldCheck, Stethoscope } from "lucide-react";
import {
  DB,
  ACTIVE_INGREDIENT,
  findInteraction,
  getEvidence,
  severityClasses,
  evidenceClasses,
  EVIDENCE_DESCRIPTION,
  SEVERITY_ACTION,
  type Interaction,
} from "@/lib/drugs";

export const Route = createFileRoute("/interactions")({
  component: InteractionsPage,
  head: () => ({
    meta: [
      { title: "Drug Interaction Checker — PharmVerify NG" },
      { name: "description", content: "Check Nigerian medications for known drug-drug interactions with severity and clinical guidance." },
    ],
  }),
});

type MockStatus = "SAFE" | "CAUTION" | "DANGEROUS";

const STATUS_STYLES: Record<MockStatus, { card: string; badge: string; icon: string }> = {
  SAFE: {
    card: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-600 text-white",
    icon: "text-emerald-600",
  },
  CAUTION: {
    card: "border-amber-200 bg-amber-50",
    badge: "bg-amber-500 text-white",
    icon: "text-amber-600",
  },
  DANGEROUS: {
    card: "border-red-200 bg-red-50",
    badge: "bg-red-600 text-white",
    icon: "text-red-600",
  },
};

function computeMockStatus(drugs: string[]): { status: MockStatus; explanation: string } {
  const lower = drugs.map((d) => d.toLowerCase());
  const hasWarfarin = lower.some((d) => d.includes("warfarin"));
  const hasAspirin = lower.some((d) => d.includes("aspirin"));
  if (hasWarfarin && hasAspirin) {
    return {
      status: "DANGEROUS",
      explanation:
        "Combining Warfarin with Aspirin significantly raises the risk of serious bleeding. Do not take these together without direct supervision from a doctor or pharmacist.",
    };
  }
  const hasDuplicate = new Set(lower).size !== lower.length;
  if (hasDuplicate) {
    return {
      status: "CAUTION",
      explanation:
        "You've added the same medication more than once, which can lead to accidental double-dosing. Please confirm your prescription with a pharmacist before taking another dose.",
    };
  }
  return {
    status: "SAFE",
    explanation:
      "No dangerous interactions were detected between these medications based on our checks. As always, confirm with a licensed pharmacist before starting or combining treatments.",
  };
}

function InteractionsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [picker, setPicker] = useState("");
  const [result, setResult] = useState<{ status: MockStatus; explanation: string; drugs: string[] } | null>(null);

  const available = DB.map((d) => d.name);

  const addDrug = () => {
    if (!picker) return;
    setSelected([...selected, picker]);
    setPicker("");
    setResult(null);
  };

  const remove = (idx: number) => {
    setSelected(selected.filter((_, i) => i !== idx));
    setResult(null);
  };

  const handleCheck = () => {
    if (selected.length < 2) return;
    setResult({ ...computeMockStatus(selected), drugs: [...selected] });
  };

  const findings: { drugA: string; drugB: string; interaction: Interaction }[] = [];
  if (result) {
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const ingA = ACTIVE_INGREDIENT[selected[i]];
        const ingB = ACTIVE_INGREDIENT[selected[j]];
        if (!ingA || !ingB) continue;
        const hit = findInteraction(ingA, ingB);
        if (hit) findings.push({ drugA: selected[i], drugB: selected[j], interaction: hit });
      }
    }
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Drug Interaction Checker</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add the medications you're taking to see how they interact. Always confirm with a licensed pharmacist.
          </p>
        </header>

        <div className="flex gap-2">
          <select
            value={picker}
            onChange={(e) => setPicker(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select a drug…</option>
            {available.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addDrug}
            disabled={!picker}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {selected.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selected.map((name, idx) => (
              <span key={`${name}-${idx}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                {name}
                <button type="button" onClick={() => remove(idx)} className="text-muted-foreground hover:text-foreground" aria-label={`Remove ${name}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleCheck}
          disabled={selected.length < 2}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" /> Check Interactions
        </button>
        {selected.length < 2 && (
          <p className="mt-2 text-xs text-muted-foreground">Add at least 2 medications to run a check.</p>
        )}

        {result && (
          <div className={`mt-6 rounded-xl border p-5 ${STATUS_STYLES[result.status].card}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {result.status === "SAFE" ? (
                  <CheckCircle2 className={`h-6 w-6 ${STATUS_STYLES[result.status].icon}`} />
                ) : (
                  <AlertTriangle className={`h-6 w-6 ${STATUS_STYLES[result.status].icon}`} />
                )}
                <span className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${STATUS_STYLES[result.status].badge}`}>
                  {result.status}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {result.drugs.length} medication{result.drugs.length === 1 ? "" : "s"} checked
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{result.explanation}</p>
            <a
              href="tel:+2348000000000"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Stethoscope className="h-4 w-4" /> Consult a pharmacist
            </a>
          </div>
        )}


        {result && selected.length >= 2 && (
          <div className="mt-4">
            {findings.length === 0 ? (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">No known interactions found</p>
                  <p className="mt-1 text-xs text-emerald-700">Always confirm with a licensed pharmacist before combining medications.</p>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {findings.map((f, idx) => (
                  <li key={idx} className={`flex items-start gap-3 rounded-lg border p-4 ${severityClasses(f.interaction.severity)}`}>
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{f.drugA} ↔ {f.drugB}</span>
                        <span className="rounded-full border border-current px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                          {f.interaction.severity}
                        </span>
                        {(() => {
                          const ev = getEvidence(f.interaction);
                          return (
                            <span title={EVIDENCE_DESCRIPTION[ev]} className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${evidenceClasses(ev)}`}>
                              {ev} evidence
                            </span>
                          );
                        })()}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed">{f.interaction.note}</p>
                      <p className="mt-1 text-[11px] italic opacity-80">{EVIDENCE_DESCRIPTION[getEvidence(f.interaction)]}</p>
                      <div className="mt-2 rounded-md border border-current/30 bg-background/40 px-3 py-2">
                        <p className="text-xs font-semibold">Recommended: {SEVERITY_ACTION[f.interaction.severity].label}</p>
                        <p className="mt-0.5 text-xs leading-relaxed opacity-90">{SEVERITY_ACTION[f.interaction.severity].detail}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
