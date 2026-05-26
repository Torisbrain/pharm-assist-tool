import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Zap, Building2, Shield } from 'lucide-react'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: 'Free',
    description: 'Perfect for occasional drug verification needs.',
    icon: Shield,
    color: 'border-gray-200',
    badgeColor: 'bg-gray-100 text-gray-700',
    features: [
      '5 drug verifications per day',
      'Basic NAFDAC lookup',
      'Pharmacy locator',
      'Email support',
    ],
    cta: 'Get Started',
    paystackPlanCode: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 200000, // ₦2,000 in kobo
    priceLabel: '₦2,000/month',
    description: 'For health-conscious individuals who verify frequently.',
    icon: Zap,
    color: 'border-green-500',
    badgeColor: 'bg-green-100 text-green-700',
    features: [
      'Unlimited drug verifications',
      'Advanced NAFDAC greenbook access',
      'Priority pharmacy locator',
      'Health safety alerts',
      'Verification history',
      'Priority email support',
    ],
    cta: 'Subscribe — ₦2,000/mo',
    paystackPlanCode: 'PLN_pro_consumer',
    popular: true,
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    price: 500000, // ₦5,000 in kobo
    priceLabel: '₦5,000/month',
    description: 'For pharmacy owners and pharmaceutical businesses.',
    icon: Building2,
    color: 'border-blue-500',
    badgeColor: 'bg-blue-100 text-blue-700',
    features: [
      'Everything in Pro',
      'AI-driven inventory intelligence',
      'Business analytics dashboard',
      'API access (10,000 calls/month)',
      'Pharmacy portal listing',
      'Bulk drug verification',
      'Dedicated account manager',
      'SLA support',
    ],
    cta: 'Subscribe — ₦5,000/mo',
    paystackPlanCode: 'PLN_pharmacy_business',
  },
]

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void }
    }
  }
}

function PricingPage() {
  const handlePaystackCheckout = (plan: (typeof PLANS)[number]) => {
    if (!plan.paystackPlanCode) return

    const paystackPublicKey =
      (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY ||
      (typeof window !== 'undefined' && (window as any).__PAYSTACK_PUBLIC_KEY__) ||
      ''

    if (!paystackPublicKey) {
      alert('Payment system is currently unavailable. Please try again later.')
      return
    }

    if (typeof window === 'undefined' || !window.PaystackPop) {
      // Load Paystack inline script dynamically
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.onload = () => openPaystackModal(plan, paystackPublicKey)
      document.head.appendChild(script)
    } else {
      openPaystackModal(plan, paystackPublicKey)
    }
  }

  const openPaystackModal = (
    plan: (typeof PLANS)[number],
    publicKey: string
  ) => {
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: 'user@example.com', // In production: use authenticated user's email
      amount: plan.price,
      currency: 'NGN',
      plan: plan.paystackPlanCode,
      ref: `PV-${plan.id.toUpperCase()}-${Date.now()}`,
      metadata: {
        plan_id: plan.id,
        custom_fields: [
          {
            display_name: 'Plan',
            variable_name: 'plan',
            value: plan.name,
          },
        ],
      },
      callback: (response: { reference: string }) => {
        // Verify payment on backend
        fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: response.reference, plan: plan.id }),
        })
          .then((res) => res.json())
          .then(() => {
            window.location.href = '/dashboard?upgraded=true'
          })
          .catch(() => {
            alert('Payment verification failed. Please contact support.')
          })
      },
      onClose: () => {
        // User closed modal — no action needed
      },
    })
    handler.openIframe()
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Protect yourself from counterfeit drugs. Choose the plan that fits
          your needs. All plans include NAFDAC drug verification.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 ${plan.color} bg-card p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${plan.badgeColor}`}
                >
                  <Icon className="h-4 w-4" />
                  {plan.name}
                </div>
                <div className="text-3xl font-bold mb-1">{plan.priceLabel}</div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.paystackPlanCode ? (
                <button
                  onClick={() => handlePaystackCheckout(plan)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-colors ${
                    plan.popular
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              ) : (
                <a
                  href="/auth/signup"
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-center transition-colors bg-muted hover:bg-muted/80 text-foreground block"
                >
                  {plan.cta}
                </a>
              )}
            </div>
          )
        })}
      </div>

      {/* Trust Badges */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Secure payments powered by Paystack • Cancel anytime • NAFDAC verified
          data
        </p>
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <span>🔒 SSL Encrypted</span>
          <span>🇳🇬 NGN Currency</span>
          <span>📱 Mobile-First</span>
          <span>⚡ Instant Activation</span>
        </div>
      </div>
    </div>
  )
}
