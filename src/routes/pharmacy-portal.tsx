import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Boxes,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldQuestion,
} from "lucide-react";
import { DB } from "@/lib/drugs";

export const Route = createFileRoute("/pharmacy-portal")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Pharmacy Dashboard — PharmVerify NG" },
      {
        name: "description",
        content: "B2B pharmacy portal: manage inventory, verify suppliers, and view NAFDAC alerts.",
      },
    ],
  }),
});

type Section = "inventory" | "supplier" | "alerts";

interface InventoryItem {
  name: string;
  nafdac: string;
  qty: number;
  status: "OK" | "Low" | "Expiring";
}

const INVENTORY: InventoryItem[] = [
  { name: "Panadol Extra", nafdac: "A4-0123", qty: 240, status: "OK" },
  { name: "Coartem", nafdac: "A4-5566", qty: 18, status: "Low" },
  { name: "Amoxil 500mg", nafdac: "A4-7781", qty: 96, status: "OK" },
  { name: "Flagyl 200mg", nafdac: "A4-3344", qty: 12, status: "Low" },
  { name: "Ciprotab 500mg", nafdac: "A4-4421", qty: 45, status: "Expiring" },
  { name: "Ventolin Inhaler", nafdac: "A4-8834", qty: 30, status: "OK" },
  { name: "Lipitor 20mg", nafdac: "A4-7723", qty: 22, status: "OK" },
  { name: "Warfarin 5mg", nafdac: "A4-3390", qty: 8, status: "Low" },
];

const ALERTS = [
  {
    date: "2026-05-12",
    title: "Counterfeit Tramadol 100mg detected",
    region: "Lagos",
    severity: "High",
  },
  {
    date: "2026-05-09",
    title: "Recall: Postinor-2 (Batch PN-9912-B)",
    region: "Nationwide",
    severity: "High",
  },
  {
    date: "2026-05-02",
    title: "Substandard Codeine Linctus seized",
    region: "Kano",
    severity: "Medium",
  },
  {
    date: "2026-04-27",
    title: "Unregistered antimalarial advisory",
    region: "Port Harcourt",
    severity: "Medium",
  },
  {
    date: "2026-04-18",
    title: "Storage temperature warning — Insulin",
    region: "Nationwide",
    severity: "Low",
  },
];

const NAV: { id: Section; label: string; icon: typeof Boxes }[] = [
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "supplier", label: "Verify Supplier", icon: ShieldCheck },
  { id: "alerts", label: "NAFDAC Alerts", icon: Bell },
];

function statusPill(s: InventoryItem["status"]) {
  switch (s) {
    case "OK":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Low":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Expiring":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

function severityPill(s: string) {
  if (s === "High") return "bg-red-50 text-red-700 border-red-200";
  if (s === "Medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-sky-50 text-sky-700 border-sky-200";
}

function DashboardPage() {
  const [section, setSection] = useState<Section>("inventory");

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-background">
      <aside className="w-56 shrink-0 border-r border-border bg-sidebar">
        <div className="px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pharmacy Portal
          </p>
          <p className="mt-1 text-sm font-semibold text-sidebar-foreground">HealthPlus — Ikeja</p>
        </div>
        <nav className="px-2 pb-4">
          {NAV.map((n) => {
            const active = section === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSection(n.id)}
                className={`mb-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-accent"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-x-auto p-6 sm:p-8">
        {section === "inventory" && <InventoryView />}
        {section === "supplier" && <SupplierView />}
        {section === "alerts" && <AlertsView />}
      </main>
    </div>
  );
}

function InventoryView() {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Current stock levels and NAFDAC registration status.
        </p>
      </header>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Drug</th>
              <th className="px-4 py-3 text-left font-medium">NAFDAC No.</th>
              <th className="px-4 py-3 text-right font-medium">Quantity</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {INVENTORY.map((i) => (
              <tr key={i.nafdac} className="text-foreground">
                <td className="px-4 py-3 font-medium">{i.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.nafdac}</td>
                <td className="px-4 py-3 text-right">{i.qty}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusPill(i.status)}`}
                  >
                    {i.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SupplierView() {
  const [supplier, setSupplier] = useState("");
  const [nafdac, setNafdac] = useState("");
  const [result, setResult] = useState<null | {
    ok: boolean;
    drug?: (typeof DB)[number];
  }>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = DB.find(
      (d) =>
        d.nafdac.toLowerCase().replace(/[-\s]/g, "") === nafdac.toLowerCase().replace(/[-\s]/g, ""),
    );
    if (!found) return setResult({ ok: false });
    setResult({ ok: found.status === "Verified", drug: found });
  };

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify Supplier</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cross-check a supplier shipment against the NAFDAC registry.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="grid max-w-xl gap-4 rounded-lg border border-border bg-card p-5"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Supplier name</label>
          <input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="e.g. Emzor Pharmaceutical"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            NAFDAC number on shipment
          </label>
          <input
            value={nafdac}
            onChange={(e) => setNafdac(e.target.value)}
            placeholder="e.g. A4-5566"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={!supplier || !nafdac}
          className="justify-self-start rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          Verify Supplier
        </button>
      </form>

      {result && (
        <div className="mt-5 max-w-xl">
          {result.ok && result.drug ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-800">Supplier verified</p>
                <p className="mt-1 text-emerald-700">
                  NAFDAC No. {result.drug.nafdac} matches <strong>{result.drug.name}</strong> by{" "}
                  {result.drug.manufacturer}.
                </p>
              </div>
            </div>
          ) : result.drug ? (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
              <div className="text-sm">
                <p className="font-semibold text-red-800">Flagged product</p>
                <p className="mt-1 text-red-700">
                  {result.drug.name} (NAFDAC {result.drug.nafdac}) is currently flagged. Do not
                  accept this shipment.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <ShieldQuestion className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="text-sm">
                <p className="font-semibold text-amber-800">No match in registry</p>
                <p className="mt-1 text-amber-700">
                  We could not find that NAFDAC number. Reject the shipment and report to NAFDAC.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function AlertsView() {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">NAFDAC Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recent recalls, counterfeit advisories, and safety bulletins.
        </p>
      </header>
      <ul className="space-y-3">
        {ALERTS.map((a) => (
          <li key={a.title} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-card-foreground">{a.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.region} · {a.date}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${severityPill(a.severity)}`}
              >
                {a.severity}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
