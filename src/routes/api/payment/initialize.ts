import { createFileRoute } from '@tanstack/react-router'
import { verifyToken } from '../../../lib/auth'
import { initializeTransaction, PAYSTACK_PLANS } from '../../../lib/paystack'
import { z } from 'zod'

const initializeSchema = z.object({
  planType: z.enum(['PRO', 'PHARMACY']),
})

export const Route = createFileRoute('/api/payment/initialize')({
  server: {
    handlers: {
      POST: async ({ request, context }: { request: Request; context: any }) => {
        try {
          const authHeader = request.headers.get('Authorization')
          if (!authHeader?.startsWith('Bearer ')) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const token = authHeader.substring(7)
          const payload = await verifyToken(token)

          if (!payload) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const body = await request.json()
          const result = initializeSchema.safeParse(body)
          if (!result.success) {
            return Response.json({ error: 'Invalid plan type' }, { status: 400 })
          }

          const secretKey = context.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_key'
          const plan = PAYSTACK_PLANS[result.data.planType]
          const paystackResponse = await initializeTransaction(
            payload.email,
            plan.amount,
            secretKey,
            plan.id
          )

          if (paystackResponse.status) {
            return Response.json({ 
              authorization_url: paystackResponse.data.authorization_url,
              reference: paystackResponse.data.reference 
            })
          } else {
            return Response.json({ error: paystackResponse.message }, { status: 400 })
          }
        } catch (e) {
          console.error('Payment initialization error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
