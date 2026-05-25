import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-at-least-32-chars-long-pharm-verify'
)

export async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload
  } catch (e) {
    return null
  }
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

export async function verifyApiKey(key: string, db: any) {
  const result = await db.prepare('SELECT * FROM api_keys WHERE key = ?').bind(key).first();
  if (!result) return null;
  
  // Check if the user has an active Pharmacy plan
  const subscription = await db.prepare('SELECT active FROM subscriptions WHERE user_id = ? AND plan = "pharmacy"').bind(result.user_id).first();
  if (!subscription || !subscription.active) return null;

  // Update usage count asynchronously
  await db.prepare('UPDATE api_keys SET usage_count = usage_count + 1, last_used_at = ? WHERE key = ?')
    .bind(Date.now(), key)
    .run();

  return result;
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
