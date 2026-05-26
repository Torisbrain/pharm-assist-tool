import { createFileRoute } from '@tanstack/react-router'
import { verifyToken } from '../../../lib/auth'

export const Route = createFileRoute('/api/user/keys')({
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

          const keys = await db
            .prepare('SELECT id, key, usage_count, last_used_at, created_at FROM api_keys WHERE user_id = ?')
            .bind(payload.id)
            .all()

          return Response.json({ keys: keys.results })
        } catch (e) {
          console.error('GET API keys error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
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

          const db = context?.env?.DB
          if (!db) return Response.json({ error: 'Database connection missing' }, { status: 500 })

          // Check for Pharmacy plan
          const user = await db.prepare('SELECT plan FROM users WHERE id = ?').bind(payload.id).first()
          const subscription = await db.prepare('SELECT active FROM subscriptions WHERE user_id = ? AND plan = "pharmacy"').bind(payload.id).first()

          if (user?.plan !== 'pharmacy' && (!subscription || !subscription.active)) {
             return Response.json({ error: 'Pharmacy plan required' }, { status: 403 })
          }

          const id = crypto.randomUUID()
          const key = `ah_${crypto.randomUUID().replace(/-/g, '')}`
          const created_at = Date.now()

          await db
            .prepare('INSERT INTO api_keys (id, user_id, key, created_at) VALUES (?, ?, ?, ?)')
            .bind(id, payload.id, key, created_at)
            .run()

          return Response.json({ success: true, key: { id, key, created_at } })
        } catch (e) {
          console.error('POST API keys error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      }
    }
  }
})
