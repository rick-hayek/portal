import {
  dispatchCommentNotifications,
  getEmailProvider,
  renderCommentReplyEmail,
  renderLinkApprovedEmail,
  renderPostNewCommentEmail,
  sendCommentApprovedNotification,
  sendLinkApprovedNotification,
} from '../packages/api/src/services/email';
import { MailgunEmailProvider } from '../packages/api/src/services/email/providers/mailgun';
import { SendgridEmailProvider } from '../packages/api/src/services/email/providers/sendgrid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Email Service Component', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      EMAIL_PROVIDER: 'MAILGUN',
      EMAIL_SERVICE_BASE_URL: 'https://api.mailgun.net',
      EMAIL_SERVICE_API_KEY: 'test-api-key',
      EMAIL_SERVICE_DOMAIN: 'example.com',
      EMAIL_SERVICE_SENDER_ADDRESS: 'support@example.com',
      EMAIL_SERVICE_SENDER_NAME: 'Test Site Support',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('instantiates the correct provider using factory', () => {
    const mailgunProvider = getEmailProvider('mailgun');
    expect(mailgunProvider).toBeInstanceOf(MailgunEmailProvider);
    expect(mailgunProvider?.name).toBe('mailgun');

    const sendgridProvider = getEmailProvider('sendgrid');
    expect(sendgridProvider).toBeInstanceOf(SendgridEmailProvider);
    expect(sendgridProvider?.name).toBe('sendgrid');

    const envProvider = getEmailProvider();
    expect(envProvider).toBeInstanceOf(MailgunEmailProvider);

    const unknownProvider = getEmailProvider('unknown');
    expect(unknownProvider).toBeNull();
  });

  it('MailgunEmailProvider sends POST request correctly', async () => {
    const provider = new MailgunEmailProvider();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '<20260820@example.com>', message: 'Queued. Thank you.' }),
    } as Response);

    const result = await provider.sendEmail({
      to: 'applicant@test.com',
      subject: 'Link Approved',
      html: '<p>Approved!</p>',
      text: 'Approved!',
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.mailgun.net/v3/example.com/messages');
    expect(options?.method).toBe('POST');
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('<20260820@example.com>');
  });

  it('SendgridEmailProvider sends POST request correctly', async () => {
    const provider = new SendgridEmailProvider();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'x-message-id': 'sg-msg-123' }),
      text: async () => '',
    } as Response);

    const result = await provider.sendEmail({
      to: 'commenter@test.com',
      subject: 'Comment Approved',
      html: '<p>Comment Approved!</p>',
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.sendgrid.com/v3/mail/send');
    expect(options?.method).toBe('POST');
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('sg-msg-123');
  });

  it('triggers sendLinkApprovedNotification without throwing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'msg-1' }),
    } as Response);

    await expect(
      sendLinkApprovedNotification({
        applicantEmail: 'user@test.com',
        applicantName: 'User Site',
        applicantUrl: 'https://usersite.com',
        siteTitle: 'Voocii',
        siteUrl: 'https://voocii.com',
        locale: 'zh-CN',
      }),
    ).resolves.not.toThrow();
  });

  it('triggers sendCommentApprovedNotification without throwing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'msg-2' }),
    } as Response);

    await expect(
      sendCommentApprovedNotification({
        authorEmail: 'guest@test.com',
        authorName: 'Guest User',
        postTitle: 'React Server Components',
        postUrl: 'https://voocii.com/blog/rsc-guide',
        commentContent: 'Great article!',
        siteTitle: 'Voocii',
        siteUrl: 'https://voocii.com',
        locale: 'en-US',
      }),
    ).resolves.not.toThrow();
  });

  it('skips email notification when enabled is false', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await sendLinkApprovedNotification({
      applicantEmail: 'user@test.com',
      applicantName: 'User Site',
      applicantUrl: 'https://usersite.com',
      siteTitle: 'Voocii',
      siteUrl: 'https://voocii.com',
      enabled: false,
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders Chinese or English template based on submission locale', () => {
    const zhEmail = renderLinkApprovedEmail({
      applicantName: '张三',
      applicantUrl: 'https://zhangsan.com',
      siteTitle: 'Voocii',
      siteUrl: 'https://voocii.com',
      locale: 'zh-CN',
    });
    expect(zhEmail.subject).toContain('您的友情链接申请已审核通过');

    const enEmail = renderLinkApprovedEmail({
      applicantName: 'John',
      applicantUrl: 'https://john.com',
      siteTitle: 'Voocii',
      siteUrl: 'https://voocii.com',
      locale: 'en-US',
    });
    expect(enEmail.subject).toContain('Your Friend Link Application Has Been Approved');
  });

  it('renders comment reply and post new comment email templates correctly', () => {
    const replyEmail = renderCommentReplyEmail({
      recipientName: 'Alice',
      replierName: 'Bob',
      postTitle: 'Next.js 15 Guide',
      postUrl: 'https://voocii.com/blog/next15',
      replyContent: 'Thanks for sharing!',
      siteTitle: 'Voocii',
      siteUrl: 'https://voocii.com',
      locale: 'zh-CN',
    });
    expect(replyEmail.subject).toContain('Bob 回复了您的评论');

    const postCommentEmail = renderPostNewCommentEmail({
      authorName: 'Author Rick',
      commenterName: 'Bob',
      postTitle: 'Next.js 15 Guide',
      postUrl: 'https://voocii.com/blog/next15',
      commentContent: 'Awesome post!',
      siteTitle: 'Voocii',
      siteUrl: 'https://voocii.com',
      locale: 'en-US',
    });
    expect(postCommentEmail.subject).toContain('New comment on your post');
  });

  it('skips dispatching comment notifications if user receiveNotifications is false', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const mockPrisma = {
      comment: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'parent-1',
          authorEmail: 'parent@test.com',
          authorName: 'Parent User',
        }),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({
          email: 'parent@test.com',
          receiveNotifications: false, // User disabled email notifications!
        }),
      },
    };

    await dispatchCommentNotifications({
      prisma: mockPrisma,
      comment: {
        id: 'reply-1',
        postId: 'post-1',
        parentId: 'parent-1',
        authorName: 'Replier',
        authorEmail: 'replier@test.com',
        content: 'Replying here',
        locale: 'zh',
      },
      siteConfig: {
        email: { enabled: true, provider: 'mailgun' },
        site: { title: 'Voocii', url: 'https://voocii.com' },
      },
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
