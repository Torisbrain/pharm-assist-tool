import { createFileRoute } from '@tanstack/react-router'
import { verifyToken } from '../../lib/auth'

export const Route = createFileRoute('/api/reports')({
  server: {
    handlers: {
      POST: async ({ request, context }: { request: Request; context: any }) => {
        try {
          const body = (await request.json()) as {
            drug_name: string
            reason: string
            nafdac_number?: string
            batch_number?: string
            pharmacy_name?: string
            location?: string
            description?: string
          }

          if (!body.drug_name || !body.reason) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 })
          }

          // Optional Auth
          let user_id = null
          const authHeader = request.headers.get('Authorization')
          if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const payload = await verifyToken(token)
            if (payload) {
              user_id = payload.id
            }
          }

          const db = context?.env?.DB
          if (!db) return Response.json({ error: 'Database connection missing' }, { status: 500 })

          const id = crypto.randomUUID()
          const created_at = Math.floor(Date.now() / 1000)

          await db
            .prepare(
              'INSERT INTO reports (id, user_id, drug_name, reason, status, created_at, nafdac_number, batch_number, pharmacy_name, location, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            )
            .bind(
              id, 
              user_id, 
              body.drug_name, 
              body.reason, 
              'pending', 
              created_at,
              body.nafdac_number || null,
              body.batch_number || null,
              body.pharmacy_name || null,
              body.location || null,
              body.description || null
            )
            .run()

          return Response.json({ success: true, id })
        } catch (e) {
          console.error('Reports error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      }
    },
  },
})
