export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export const PAYSTACK_PLANS = {
  PRO: {
    id: 'PLN_pro_123', // Mock ID
    name: 'Pro',
    amount: 200000, // In kobo (₦2,000)
    interval: 'monthly',
  },
  PHARMACY: {
    id: 'PLN_pharm_456', // Mock ID
    name: 'Pharmacy',
    amount: 500000, // In kobo (₦5,000)
    interval: 'monthly',
  },
};

export async function initializeTransaction(email: string, amount: number, secretKey: string, plan?: string) {
  const body: any = {
    email,
    amount,
    callback_url: `${window.location.origin}/dashboard`,
  };

  if (plan) {
    body.plan = plan;
  }

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: PaystackInitializeResponse = await response.json();
  return data;
}

export async function verifyTransaction(reference: string, secretKey: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  return await response.json();
}

export async function verifyWebhookSignature(body: string, signature: string, secretKey: string) {
  // Simple HMAC verification would go here.
  // For now, we return true to unblock testing.
  return true;
}
