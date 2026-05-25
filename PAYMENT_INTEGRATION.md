# Payment Integration Documentation

This document outlines the integration between Paystack and Grey.co for PharmVerify NG.

## Architecture

We use **Paystack** as the primary payment gateway for handling recurring SaaS subscriptions. Funds are then settled into a **Grey.co NGN Virtual Account**.

### Why this flow?
1. **Recurring Billing:** Paystack provides robust support for Nigerian card subscriptions, automated retries, and plan management.
2. **Settlement:** Grey.co virtual accounts allow the owner to receive NGN and easily convert/move funds globally.

## Implementation Details

### 1. Paystack Configuration (Manual Steps)
- Log in to the [Paystack Dashboard](https://dashboard.paystack.com).
- Go to **Settings > Payouts**.
- Set the **Payout Account** to the Grey.co NGN Virtual Account details:
  - **Account Number:** 4549240645527872
  - **Bank Name:** (As provided in your Grey dashboard)
- Create the following Plans in Paystack to match the IDs in `src/lib/paystack.ts`:
  - **Pro Plan:** ₦2,000/month
  - **Pharmacy Plan:** ₦5,000/month

### 2. Environment Variables
Ensure the following keys are set in your deployment environment (e.g., Cloudflare Wrangler secrets):
- `PAYSTACK_SECRET_KEY`: Your Paystack Secret Key (live or test).
- `PAYSTACK_PUBLIC_KEY`: Your Paystack Public Key.

### 3. Webhook Setup
- In Paystack Dashboard, go to **Settings > API Keys & Webhooks**.
- Set the Webhook URL to: `https://your-domain.com/api/payment/webhook`.
- Ensure the `api/payment/webhook` route is accessible and the signature verification is active.

## Code Structure

- `src/lib/paystack.ts`: API wrapper for transaction initialization and verification.
- `src/routes/api/payment/initialize.ts`: Server-side endpoint to start a checkout session.
- `src/routes/api/payment/webhook.ts`: Handler for Paystack events (`subscription.create`, `charge.success`).
- `src/routes/dashboard.tsx`: Frontend integration for the "Upgrade" buttons.

## Settlement to Grey.co
Since the settlement is configured at the Paystack account level, no additional code is required to move funds from Paystack to Grey. All successful payments will automatically be processed according to your Paystack payout schedule into the Grey virtual account.
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
