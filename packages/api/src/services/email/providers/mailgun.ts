import type { EmailProvider, EmailProviderResult, SendEmailOptions } from '../provider';

export class MailgunEmailProvider implements EmailProvider {
  name = 'mailgun';

  async sendEmail(options: SendEmailOptions): Promise<EmailProviderResult> {
    const apiKey = process.env.EMAIL_SERVICE_API_KEY;
    const domain = process.env.EMAIL_SERVICE_DOMAIN;
    const baseUrl = (process.env.EMAIL_SERVICE_BASE_URL || 'https://api.mailgun.net').replace(/\/+$/, '');

    if (!apiKey || !domain) {
      console.warn('[MailgunEmailProvider] Missing EMAIL_SERVICE_API_KEY or EMAIL_SERVICE_DOMAIN');
      return {
        success: false,
        error: 'Missing Mailgun credentials in environment variables',
      };
    }

    const senderName = options.fromName || process.env.EMAIL_SERVICE_SENDER_NAME || 'Voocii';
    const senderAddress =
      options.fromEmail ||
      process.env.EMAIL_SERVICE_SENDER_ADDRESS ||
      `support@${domain}`;

    const from = `${senderName} <${senderAddress}>`;

    const formData = new URLSearchParams();
    formData.append('from', from);
    formData.append('to', options.to);
    formData.append('subject', options.subject);
    formData.append('html', options.html);
    if (options.text) {
      formData.append('text', options.text);
    }

    try {
      const endpoint = `${baseUrl}/v3/${domain}/messages`;
      const authHeader = `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[MailgunEmailProvider] Failed to send email (${res.status}):`, errorText);
        return {
          success: false,
          error: `Mailgun HTTP ${res.status}: ${errorText}`,
        };
      }

      const data = (await res.json()) as { id?: string; message?: string };
      return {
        success: true,
        messageId: data.id,
      };
    } catch (err: any) {
      console.error('[MailgunEmailProvider] Error sending email:', err);
      return {
        success: false,
        error: err?.message || String(err),
      };
    }
  }
}
