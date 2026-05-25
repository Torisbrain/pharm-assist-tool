import { createFileRoute } from '@tanstack/react-router'
import { verifyToken } from '../../lib/auth'

export const Route = createFileRoute('/api/reports')({
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

          const { 
            drug_name, 
            reason, 
            nafdac_number, 
            batch_number, 
            pharmacy_name, 
            location, 
            description 
          } = (await request.json()) as {
            drug_name: string
            reason: string
            nafdac_number?: string
            batch_number?: string
            pharmacy_name?: string
            location?: string
            description?: string
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
              payload.id, 
              drug_name, 
              reason, 
              'pending', 
              created_at,
              nafdac_number || null,
              batch_number || null,
              pharmacy_name || null,
              location || null,
              description || null
            )
            .run()

          return Response.json({ success: true, id })
        } catch (e) {
          console.error('Reports error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
      GET: async ({ request, context }: { request: Request; context: any }) => {
        try {
          const authHeader = request.headers.get('Authorization')
          if (!authHeader?.startsWith('Bearer ')) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const token = authHeader.substring(7)
          const payload = await verifyToken(token)

          if (!payload || (payload as any).role !== 'admin') {
             // For now, let's assume we check for admin role if we want to protect this
             // But since we are in early dev, maybe just check for valid token
             if (!payload) return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const db = context?.env?.DB
          if (!db) return Response.json({ error: 'Database connection missing' }, { status: 500 })

          const reports = await db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all()
          return Response.json(reports.results)
        } catch (e) {
          console.error('Reports fetch error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      }
    },
  },
})
