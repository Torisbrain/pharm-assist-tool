import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, ShieldCheck, BarChart3, MapPin, Pill,
  ArrowRight, CheckCircle, AlertCircle, TrendingUp
} from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — PharmVerify NG" },
      {
        name: "description",
        content: "Explore PharmVerify NG features: Drug verification, pharmacy locator, interaction checker, and more.",
      },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  const features = [
    {
      id: "verification",
      title: "Drug Verification",
      description: "Verify Nigerian drugs by name or NAFDAC number to check authenticity and manufacturer.",
      icon: ShieldCheck,
      link: "/",
    },
    {
      id: "locator",
      title: "Pharmacy Locator",
      description: "Find nearby pharmacies across Nigeria and Africa with real-time Google Maps integration.",
      icon: MapPin,
      link: "/pharmacies",
    },
    {
      id: "interactions",
      title: "Interaction Checker",
      description: "Check how multiple drugs interact with each other before consumption.",
      icon: AlertCircle,
      link: "/interactions",
    },
    {
      id: "alternatives",
      title: "Generic Alternatives",
      description: "Get recommended cheaper generic alternatives for expensive brand-name drugs.",
      icon: TrendingUp,
      link: "/",
    },
    {
      id: "safety",
      title: "Safety Dashboard",
      description: "Pharmacy owners can manage inventory and drug listings safely.",
      icon: BarChart3,
      link: "/dashboard",
    },
    {
      id: "nafdac",
      title: "NAFDAC Integration",
      description: "Direct links to NAFDAC database for official drug registration verification.",
      icon: CheckCircle,
      link: "https://nafdac.gov.ng",
    },
  ];

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            PharmVerify NG Features
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your trusted platform for pharmaceutical verification and pharmacy access across Africa
          </p>
        </header>

        {/* Features Grid */}
        <section className="mb-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isExternal = feature.id === "nafdac";

              return (
                <article
                  key={feature.id}
                  className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/40 hover:bg-accent hover:shadow-md"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold text-card-foreground">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  <div className="mt-4">
                    {isExternal ? (
                      <a
                        href={feature.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        Visit NAFDAC <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <Link
                        to={feature.link}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        Learn more <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold text-card-foreground">
            Ready to verify your medications?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Start with our drug verification tool or find a nearby pharmacy in your area.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
              Verify Drug
            </Link>
            <Link
              to="/pharmacies"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <MapPin className="h-4 w-4" />
              Find Pharmacy
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
