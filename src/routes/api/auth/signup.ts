import { createFileRoute } from '@tanstack/react-router'
import { hashPassword, createToken } from '../../../lib/auth'
import { sendEmail } from '../../../lib/resend'
import { signupConfirmationTemplate } from '../../../lib/email-templates'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const Route = createFileRoute('/api/auth/signup')({
  server: {
    handlers: {
      POST: async ({ request, context }: { request: Request; context: any }) => {
        try {
          const body = await request.json()
          const result = signupSchema.safeParse(body)
          if (!result.success) {
            return Response.json({ error: 'Invalid input' }, { status: 400 })
          }

          const { email, password } = result.data
          // Access Cloudflare D1 from context.env
          const db = context?.env?.DB

          if (!db) {
            console.error('Database connection missing in context:', context)
            return Response.json({ error: 'Database connection missing' }, { status: 500 })
          }

          const id = crypto.randomUUID()
          const passwordHash = await hashPassword(password)
          const createdAt = Date.now()

          await db
            .prepare(
              'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)'
            )
            .bind(id, email, passwordHash, createdAt)
            .run()

          const token = await createToken({ id, email })

          // Send confirmation email asynchronously
          context.ctx.waitUntil(
            sendEmail({
              apiKey: context.env.RESEND_API_KEY,
              to: email,
              subject: 'Welcome to PharmVerify NG',
              html: signupConfirmationTemplate(email.split('@')[0]),
            })
          )

          return Response.json({ token, user: { id, email } })
        } catch (e: any) {
          console.error('Signup error:', e)
          if (e.message?.includes('UNIQUE constraint failed')) {
            return Response.json({ error: 'User already exists' }, { status: 400 })
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
