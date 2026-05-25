import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/admin/stats')({
  server: {
    handlers: {
      GET: async ({ request, context }: { request: Request; context: any }) => {
        try {
          // Simple auth check
          const authHeader = request.headers.get('Authorization');
          if (authHeader !== `Bearer \${context.env.ADMIN_SECRET_KEY}`) {
             return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const db = context?.env?.DB
          if (!db) return Response.json({ error: 'DB missing' }, { status: 500 })

          const userCount = await db.prepare('SELECT COUNT(*) as count FROM users').first()
          const verificationCount = await db.prepare('SELECT COUNT(*) as count FROM verifications').first()
          const reportCount = await db.prepare('SELECT COUNT(*) as count FROM reports WHERE status = ?').bind('pending').first()
          
          // Simplified revenue calculation
          const revenue = await db.prepare('SELECT SUM(amount) as total FROM verifications WHERE status = ?').bind('paid').first()

          return Response.json({
            userCount: userCount?.count || 0,
            verificationCount: verificationCount?.count || 0,
            reportCount: reportCount?.count || 0,
            revenue: revenue?.total || 0
          })
        } catch (e) {
          console.error('Stats error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
