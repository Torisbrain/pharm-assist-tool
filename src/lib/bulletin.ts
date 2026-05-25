import { sendEmail } from './resend';
import { weeklySafetyBulletinTemplate } from './email-templates';

export const sendWeeklyBulletin = async (db: any, env: any, ctx: any) => {
  try {
    // In a real app, you'd calculate actual stats from the DB
    const users = await db.prepare('SELECT email FROM users').all();
    const emails = users.results.map((u: any) => u.email);

    if (emails.length === 0) return;

    // Batching emails
    const batchSize = 50;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      ctx.waitUntil(
        sendEmail({
          apiKey: env.RESEND_API_KEY,
          to: batch,
          subject: 'Weekly Drug Safety Bulletin - PharmVerify NG',
          html: weeklySafetyBulletinTemplate(3), // Mocked count
        })
      );
    }
  } catch (error) {
    console.error('Weekly bulletin error:', error);
  }
};
