import { createFileRoute } from '@tanstack/react-router'
import { verifyToken } from '../../../lib/auth'

export const Route = createFileRoute('/api/auth/me')({
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

          if (!db) {
            console.error('Database connection missing in context:', context)
            return Response.json({ error: 'Database connection missing' }, { status: 500 })
          }

          const user = await db
            .prepare('SELECT id, email, plan FROM users WHERE id = ?')
            .bind(payload.id)
            .first()

          if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 })
          }

          return Response.json({ user })
        } catch (e) {
          console.error('Auth Me error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
