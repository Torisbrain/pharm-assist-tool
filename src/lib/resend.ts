import { Resend } from 'resend';

export const getResendClient = (apiKey?: string) => {
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set. Emails will not be sent.');
    return null;
  }
  return new Resend(apiKey);
};

export const sendEmail = async ({
  apiKey,
  from = 'PharmVerify <notifications@aurahealth.ng>',
  to,
  subject,
  html,
}: {
  apiKey?: string;
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
}) => {
  const resend = getResendClient(apiKey);
  if (!resend) return { error: 'No API key' };

  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return { data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { error };
  }
};
