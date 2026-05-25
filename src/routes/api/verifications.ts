import { createFileRoute } from '@tanstack/react-router'
import { verifyToken } from '../../lib/auth'

export const Route = createFileRoute('/api/verifications')({
  server: {
    handlers: {
      GET: async ({ request, context }: { request: Request; context: any }) => {
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

          const db = context?.env?.DB
          if (!db) return Response.json({ error: 'Database connection missing' }, { status: 500 })

          const results = await db
            .prepare('SELECT * FROM verifications WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50')
            .bind(payload.id)
            .all()

          return Response.json({ verifications: results.results })
        } catch (e) {
          console.error('Verifications error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
