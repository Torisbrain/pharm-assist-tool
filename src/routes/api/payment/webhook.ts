import { createFileRoute } from '@tanstack/react-router'
import { verifyWebhookSignature } from '../../../lib/paystack'
import { sendEmail } from '../../../lib/resend'
import { subscriptionReceiptTemplate } from '../../../lib/email-templates'

export const Route = createFileRoute('/api/payment/webhook')({
  server: {
    handlers: {
      POST: async ({ request, context }: { request: Request; context: any }) => {
        try {
          const body = await request.text()
          const signature = request.headers.get('x-paystack-signature')
          const secretKey = context.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_key'

          if (!signature || !await verifyWebhookSignature(body, signature, secretKey)) {
            return Response.json({ error: 'Invalid signature' }, { status: 401 })
          }

          const event = JSON.parse(body)
          const db = context?.env?.DB

          if (!db) {
            return Response.json({ error: 'Database connection missing' }, { status: 500 })
          }

          if (event.event === 'subscription.create' || event.event === 'charge.success') {
            const data = event.data
            const email = data.customer.email
            const planCode = data.plan?.plan_code
            const reference = data.reference
            const amount = data.amount / 100 // Convert from kobo to Naira

            // Find user by email
            const user = await db
              .prepare('SELECT id FROM users WHERE email = ?')
              .bind(email)
              .first()

            if (user) {
              let planName = 'free'
              if (planCode === 'PLN_pro_123') planName = 'pro'
              if (planCode === 'PLN_pharm_456') planName = 'pharmacy'

              // Update user plan
              await db
                .prepare('UPDATE users SET plan = ? WHERE id = ?')
                .bind(planName, user.id)
                .run()

              // Upsert subscription
              const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
              await db
                .prepare(
                  'INSERT INTO subscriptions (user_id, plan, paystack_ref, expires_at, active) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET plan=excluded.plan, paystack_ref=excluded.paystack_ref, expires_at=excluded.expires_at, active=excluded.active'
                )
                .bind(user.id, planName, reference, expiresAt, 1)
                .run()

              // Send receipt email asynchronously
              context.ctx.waitUntil(
                sendEmail({
                  apiKey: context.env.RESEND_API_KEY,
                  to: email,
                  subject: `Your PharmVerify NG Subscription: ${planName.toUpperCase()}`,
                  html: subscriptionReceiptTemplate(planName, amount),
                })
              )
            }
          }

          return Response.json({ status: 'success' })
        } catch (e) {
          console.error('Webhook error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
