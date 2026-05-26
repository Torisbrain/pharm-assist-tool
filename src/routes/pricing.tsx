import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₦0",
    period: "forever",
    description: "Get started with basic drug verification.",
    features: [
      "5 verifications per day",
      "Basic NAFDAC lookup",
      "Pharmacy locator",
    ],
    cta: "Get Started",
    paystackAmount: null,
    paystackPlan: null,
    highlight: false,
  },
  {
    id: "pro",
    name: "Consumer Pro",
    price: "₦2,000",
    period: "per month",
    description: "Unlimited verifications and advanced health alerts.",
    features: [
      "Unlimited verifications",
      "Advanced drug interaction alerts",
      "Health history dashboard",
      "Priority support",
      "SMS/email alerts for drug recalls",
    ],
    cta: "Subscribe — ₦2,000/mo",
    paystackAmount: 200000, // in kobo
    paystackPlan: "pro",
    highlight: true,
  },
  {
    id: "pharmacy",
    name: "Pharmacy / B2B",
    price: "₦5,000",
    period: "per month",
    description: "AI intelligence, API access, and business dashboard.",
    features: [
      "Everything in Pro",
      "AI inventory intelligence",
      "API access for integrations",
      "Analytics & revenue dashboard",
      "Bulk verification endpoint",
      "Dedicated account manager",
    ],
    cta: "Subscribe — ₦5,000/mo",
    paystackAmount: 500000, // in kobo
    paystackPlan: "pharmacy",
    highlight: false,
  },
];

function initPaystack(amount: number, plan: string, email: string) {
  const script = document.createElement("script");
  script.src = "https://js.paystack.co/v1/inline.js";
  script.onload = () => {
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
      email,
      amount,
      currency: "NGN",
      ref: `AURA-${plan.toUpperCase()}-${Date.now()}`,
      metadata: { plan },
      callback: (response: { reference: string }) => {
        // redirect to dashboard after successful payment
        window.location.href = `/dashboard?ref=${response.reference}&plan=${plan}`;
      },
      onClose: () => {
        console.log("Payment window closed");
      },
    });
    handler.openIframe();
  };
  document.body.appendChild(script);
}

function PricingPage() {
  const handleSubscribe = (plan: (typeof PLANS)[number]) => {
    if (!plan.paystackAmount) {
      window.location.href = "/";
      return;
    }
    const email = prompt("Enter your email to subscribe:");
    if (!email) return;
    initPaystack(plan.paystackAmount, plan.paystackPlan!, email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Protect your health with verified NAFDAC drug authentication.
            Choose the plan that fits your needs.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-8 flex flex-col shadow-md ${
                plan.highlight
                  ? "bg-green-600 text-white ring-4 ring-green-300 scale-105"
                  : "bg-white text-gray-900"
              }`}
            >
              {plan.highlight && (
                <span className="text-xs font-semibold uppercase tracking-wider bg-white text-green-700 rounded-full px-3 py-1 self-start mb-4">
                  Most Popular
                </span>
              )}
              <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span
                  className={`text-sm ${plan.highlight ? "text-green-100" : "text-gray-500"}`}
                >
                  /{plan.period}
                </span>
              </div>
              <p
                className={`text-sm mb-6 ${plan.highlight ? "text-green-100" : "text-gray-500"}`}
              >
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 text-lg leading-none ${plan.highlight ? "text-green-200" : "text-green-500"}`}
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                  plan.highlight
                    ? "bg-white text-green-700 hover:bg-green-50"
                    : plan.id === "free"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-500 text-sm mt-10">
          All payments processed securely via Paystack. Cancel anytime.
          Questions?{" "}
          <a href="mailto:support@aurahealth.ng" className="text-green-600 underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
