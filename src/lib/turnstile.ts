interface TurnstileResult {
  success: boolean;
  'error-codes'?: string[];
}

export async function verifyTurnstile(
  token: string,
  remoteIp: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  const secret = process.env.TURNSTILE_SECRET || '';
  if (!secret) {
    // No secret configured — skip verification
    return { success: true };
  }

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: remoteIp,
    }),
  });

  const result: TurnstileResult = await res.json();
  return {
    success: result.success,
    errorCodes: result['error-codes'],
  };
}
