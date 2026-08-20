import type { EmailProvider } from './provider';
import { MailgunEmailProvider } from './providers/mailgun';
import { SendgridEmailProvider } from './providers/sendgrid';
import {
  type RenderCommentApprovedOptions,
  type RenderCommentReplyOptions,
  type RenderLinkApprovedOptions,
  type RenderPostNewCommentOptions,
  renderCommentApprovedEmail,
  renderCommentReplyEmail,
  renderLinkApprovedEmail,
  renderPostNewCommentEmail,
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

export interface SendCommentReplyNotificationOptions extends RenderCommentReplyOptions {
  recipientEmail: string;
  enabled?: boolean;
  provider?: string;
}

export async function sendCommentReplyNotification(
  options: SendCommentReplyNotificationOptions,
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

    const { subject, html, text } = renderCommentReplyEmail(options);
    const result = await provider.sendEmail({
      to: options.recipientEmail,
      subject,
      html,
      text,
    });

    if (result.success) {
      console.log(
        `[EmailService] Comment reply notification sent to ${options.recipientEmail} (msgId: ${result.messageId})`,
      );
    } else {
      console.error(
        `[EmailService] Failed to send comment reply email to ${options.recipientEmail}: ${result.error}`,
      );
    }
  } catch (err) {
    console.error('[EmailService] Unexpected error sending comment reply notification:', err);
  }
}

export interface SendPostNewCommentNotificationOptions extends RenderPostNewCommentOptions {
  authorEmail: string;
  enabled?: boolean;
  provider?: string;
}

export async function sendPostNewCommentNotification(
  options: SendPostNewCommentNotificationOptions,
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

    const { subject, html, text } = renderPostNewCommentEmail(options);
    const result = await provider.sendEmail({
      to: options.authorEmail,
      subject,
      html,
      text,
    });

    if (result.success) {
      console.log(
        `[EmailService] Post new comment notification sent to ${options.authorEmail} (msgId: ${result.messageId})`,
      );
    } else {
      console.error(
        `[EmailService] Failed to send post new comment email to ${options.authorEmail}: ${result.error}`,
      );
    }
  } catch (err) {
    console.error('[EmailService] Unexpected error sending post new comment notification:', err);
  }
}

export async function dispatchCommentNotifications(params: {
  prisma: any;
  comment: {
    id: string;
    postId: string;
    parentId?: string | null;
    authorName: string;
    authorEmail?: string | null;
    content: string;
    locale?: string | null;
  };
  siteConfig?: any;
}): Promise<void> {
  try {
    const { prisma, comment, siteConfig } = params;
    const enabled = siteConfig?.email?.enabled ?? false;
    const provider = siteConfig?.email?.enabled ? siteConfig.email.provider : undefined;
    if (!enabled) return;

    const siteTitle = siteConfig?.site.title || 'Voocii';
    const siteUrl = (siteConfig?.site.url || 'https://voocii.com').replace(/\/+$/, '');
    const locale = comment.locale || siteConfig?.site.locale || 'zh';

    if (comment.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: comment.parentId },
      });

      if (parentComment?.authorEmail && parentComment.authorEmail !== comment.authorEmail) {
        const parentUser = await prisma.user.findUnique({
          where: { email: parentComment.authorEmail },
          select: { receiveNotifications: true },
        });

        if (!parentUser || parentUser.receiveNotifications !== false) {
          const post = await prisma.post.findUnique({
            where: { id: comment.postId },
            select: { title: true, slug: true },
          });

          await sendCommentReplyNotification({
            recipientEmail: parentComment.authorEmail,
            recipientName: parentComment.authorName,
            replierName: comment.authorName,
            postTitle: post?.title || 'Article',
            postUrl: `${siteUrl}/blog/${post?.slug || ''}`,
            replyContent: comment.content,
            siteTitle,
            siteUrl,
            locale,
            enabled,
            provider,
          });
        }
      }
    } else {
      const post = await prisma.post.findUnique({
        where: { id: comment.postId },
        include: { author: { select: { email: true, name: true, receiveNotifications: true } } },
      });

      if (
        post?.author?.email &&
        post.author.email !== comment.authorEmail &&
        post.author.receiveNotifications !== false
      ) {
        await sendPostNewCommentNotification({
          authorEmail: post.author.email,
          authorName: post.author.name || 'Author',
          commenterName: comment.authorName,
          postTitle: post.title,
          postUrl: `${siteUrl}/blog/${post.slug}`,
          commentContent: comment.content,
          siteTitle,
          siteUrl,
          locale,
          enabled,
          provider,
        });
      }
    }
  } catch (err) {
    console.error('[EmailService] Unexpected error dispatching comment notifications:', err);
  }
}
