import nodemailer from 'nodemailer'

/**
 * OTP email delivery over Gmail SMTP using an App Password.
 * Configure in .env:
 *   SMTP_USER = your Gmail address
 *   SMTP_PASS = 16-character Google App Password (https://myaccount.google.com/apppasswords)
 */
export function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
}

export async function sendOtpEmail(to: string, code: string): Promise<{ sent: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return { sent: false, error: 'SMTP not configured' }
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `ForgeOS verification code: ${code}`,
      text: `Your ForgeOS sign-in code is ${code}. It expires in 10 minutes. If you did not request it, you can ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #c2410c; margin-bottom: 8px;">ForgeOS</h2>
          <p style="color: #444; font-size: 15px;">Use this verification code to sign in:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 16px; text-align: center; color: #9a3412; margin: 16px 0;">${code}</div>
          <p style="color: #666; font-size: 13px;">This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p>
        </div>
      `,
    })
    return { sent: true }
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : String(err) }
  }
}
