import { createFileRoute } from '@tanstack/react-router'
import { sendEmail } from '../../../lib/resend'
import { drugAlertTemplate } from '../../../lib/email-templates'
import { z } from 'zod'

const alertSchema = z.object({
  drugName: z.string(),
  reason: z.string(),
  targetPlan: z.enum(['free', 'pro', 'pharmacy', 'all']).default('all'),
})

export const Route = createFileRoute('/api/admin/broadcast-alert')({
  server: {
    handlers: {
      POST: async ({ request, context }: { request: Request; context: any }) => {
        try {
          // Simple auth check (in production, use a more robust admin check)
          const authHeader = request.headers.get('Authorization');
          if (authHeader !== `Bearer \${context.env.ADMIN_SECRET_KEY}`) {
             return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const body = await request.json()
          const result = alertSchema.safeParse(body)
          if (!result.success) {
            return Response.json({ error: 'Invalid input' }, { status: 400 })
          }

          const { drugName, reason, targetPlan } = result.data
          const db = context?.env?.DB

          if (!db) {
            return Response.json({ error: 'Database connection missing' }, { status: 500 })
          }

          // Fetch users based on targetPlan
          let query = 'SELECT email FROM users';
          let params: any[] = [];
          if (targetPlan !== 'all') {
            query += ' WHERE plan = ?';
            params.push(targetPlan);
          }

          const users = await db.prepare(query).bind(...params).all();
          const emails = users.results.map((u: any) => u.email);

          if (emails.length === 0) {
            return Response.json({ status: 'No users found' });
          }

          // Send alerts in batches of 50 (Resend limit per call)
          const batchSize = 50;
          for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            context.ctx.waitUntil(
              sendEmail({
                apiKey: context.env.RESEND_API_KEY,
                to: batch,
                subject: `SAFETY ALERT: \${drugName}`,
                html: drugAlertTemplate(drugName, reason),
              })
            );
          }

          return Response.json({ status: 'success', usersNotified: emails.length })
        } catch (e) {
          console.error('Broadcast error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
