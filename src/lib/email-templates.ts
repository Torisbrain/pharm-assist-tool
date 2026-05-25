export const signupConfirmationTemplate = (name: string) => `
  <h1>Welcome to PharmVerify NG, \${name}!</h1>
  <p>Thank you for joining Nigeria's most trusted drug safety platform.</p>
  <p>You can now start verifying your medications instantly via the NAFDAC Greenbook.</p>
  <br />
  <p>Stay safe,</p>
  <p>The AuraHealth Team</p>
`;

export const subscriptionReceiptTemplate = (planName: string, amount: number) => `
  <h1>Payment Successful</h1>
  <p>Thank you for upgrading to the <strong>\${planName}</strong>.</p>
  <p>Amount Paid: ₦\${amount.toLocaleString()}</p>
  <p>Your unlimited verifications are now active.</p>
  <br />
  <p>Stay safe,</p>
  <p>The AuraHealth Team</p>
`;

export const drugAlertTemplate = (drugName: string, reason: string) => `
  <h1 style="color: red;">URGENT: Safety Alert</h1>
  <p>A safety alert has been issued for <strong>\${drugName}</strong>.</p>
  <p><strong>Reason:</strong> \${reason}</p>
  <p>If you have this medication, please discontinue use and consult your pharmacist immediately.</p>
  <br />
  <p>Stay safe,</p>
  <p>The AuraHealth Team</p>
`;

export const weeklySafetyBulletinTemplate = (alertsCount: number) => `
  <h1>Weekly Safety Bulletin</h1>
  <p>This week, we processed over 10,000 verifications across Nigeria.</p>
  <p>There were \${alertsCount} new drug safety alerts issued by NAFDAC.</p>
  <p>Log in to your dashboard to see the latest updates.</p>
  <br />
  <p>Stay safe,</p>
  <p>The AuraHealth Team</p>
`;
