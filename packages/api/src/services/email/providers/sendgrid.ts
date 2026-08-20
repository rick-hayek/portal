import type { EmailProvider, EmailProviderResult, SendEmailOptions } from '../provider';

export class SendgridEmailProvider implements EmailProvider {
  name = 'sendgrid';

  async sendEmail(options: SendEmailOptions): Promise<EmailProviderResult> {
    const apiKey = process.env.EMAIL_SERVICE_API_KEY;

    if (!apiKey) {
      console.warn('[SendgridEmailProvider] Missing EMAIL_SERVICE_API_KEY');
      return {
        success: false,
        error: 'Missing SendGrid API Key in environment variables',
      };
    }

    const senderName = options.fromName || process.env.EMAIL_SERVICE_SENDER_NAME || 'Voocii';
    const senderAddress =
      options.fromEmail ||
      process.env.EMAIL_SERVICE_SENDER_ADDRESS ||
      'support@voocii.com';

    const payload = {
      personalizations: [
        {
          to: [{ email: options.to }],
        },
      ],
      from: {
        email: senderAddress,
        name: senderName,
      },
      subject: options.subject,
      content: [
        ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
        { type: 'text/html', value: options.html },
      ],
    };

    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[SendgridEmailProvider] Failed to send email (${res.status}):`, errorText);
        return {
          success: false,
          error: `SendGrid HTTP ${res.status}: ${errorText}`,
        };
      }

      const messageId = res.headers.get('x-message-id') || undefined;
      return {
        success: true,
        messageId,
      };
    } catch (err: any) {
      console.error('[SendgridEmailProvider] Error sending email:', err);
      return {
        success: false,
        error: err?.message || String(err),
      };
    }
  }
}
