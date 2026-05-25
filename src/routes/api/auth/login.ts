import { createFileRoute } from '@tanstack/react-router'
import { comparePassword, createToken } from '../../../lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request, context }: { request: Request; context: any }) => {
        try {
          const body = await request.json()
          const result = loginSchema.safeParse(body)
          if (!result.success) {
            return Response.json({ error: 'Invalid input' }, { status: 400 })
          }

          const { email, password } = result.data
          const db = context?.env?.DB

          if (!db) {
            console.error('Database connection missing in context:', context)
            return Response.json({ error: 'Database connection missing' }, { status: 500 })
          }

          const user: any = await db
            .prepare('SELECT * FROM users WHERE email = ?')
            .bind(email)
            .first()

          if (!user) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 })
          }

          const isValid = await comparePassword(password, user.password_hash)
          if (!isValid) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 })
          }

          const token = await createToken({ id: user.id, email: user.email })

          return Response.json({ token, user: { id: user.id, email: user.email } })
        } catch (e) {
          console.error('Login error:', e)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
