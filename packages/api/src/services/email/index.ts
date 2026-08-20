import type { EmailProvider } from './provider';
import { MailgunEmailProvider } from './providers/mailgun';
import { SendgridEmailProvider } from './providers/sendgrid';
import {
  type RenderCommentApprovedOptions,
  type RenderLinkApprovedOptions,
  renderCommentApprovedEmail,
  renderLinkApprovedEmail,
} from './templates';

export * from './provider';
export * from './templates';

export function getEmailProvider(providerName?: string): EmailProvider | null {
  const provider = (providerName || process.env.EMAIL_PROVIDER || '').toLowerCase();

  switch (provider) {
    case 'mailgun':
      return new MailgunEmailProvider();
    case 'sendgrid':
      return new SendgridEmailProvider();
    default:
      if (provider) {
        console.warn(`[EmailService] Provider '${provider}' is not supported yet.`);
      }
      return null;
  }
}

export interface SendLinkApprovedNotificationOptions extends RenderLinkApprovedOptions {
  applicantEmail: string;
  enabled?: boolean;
  provider?: string;
}

export async function sendLinkApprovedNotification(
  options: SendLinkApprovedNotificationOptions,
): Promise<void> {
  try {
    if (options.enabled === false) {
      console.log('[EmailService] Email notification skipped (disabled in site.config.ts).');
      return;
    }

    const provider = getEmailProvider(options.provider);
    if (!provider) {
      console.log('[EmailService] Email notification skipped (provider disabled or unavailable).');
      return;
    }

    const { subject, html, text } = renderLinkApprovedEmail(options);
    const result = await provider.sendEmail({
      to: options.applicantEmail,
      subject,
      html,
      text,
    });

    if (result.success) {
      console.log(
        `[EmailService] Link approval notification sent to ${options.applicantEmail} (msgId: ${result.messageId})`,
      );
    } else {
      console.error(
        `[EmailService] Failed to send link approval email to ${options.applicantEmail}: ${result.error}`,
      );
    }
  } catch (err) {
    console.error('[EmailService] Unexpected error sending link approval notification:', err);
  }
}

export interface SendCommentApprovedNotificationOptions extends RenderCommentApprovedOptions {
  authorEmail: string;
  enabled?: boolean;
  provider?: string;
}

export async function sendCommentApprovedNotification(
  options: SendCommentApprovedNotificationOptions,
): Promise<void> {
  try {
    if (options.enabled === false) {
      console.log('[EmailService] Email notification skipped (disabled in site.config.ts).');
      return;
    }

    const provider = getEmailProvider(options.provider);
    if (!provider) {
      console.log('[EmailService] Email notification skipped (provider disabled or unavailable).');
      return;
    }

    const { subject, html, text } = renderCommentApprovedEmail(options);
    const result = await provider.sendEmail({
      to: options.authorEmail,
      subject,
      html,
      text,
    });

    if (result.success) {
      console.log(
        `[EmailService] Comment approval notification sent to ${options.authorEmail} (msgId: ${result.messageId})`,
      );
    } else {
      console.error(
        `[EmailService] Failed to send comment approval email to ${options.authorEmail}: ${result.error}`,
      );
    }
  } catch (err) {
    console.error('[EmailService] Unexpected error sending comment approval notification:', err);
  }
}
