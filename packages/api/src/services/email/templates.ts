export interface RenderLinkApprovedOptions {
  applicantName: string;
  applicantUrl: string;
  siteTitle: string;
  siteUrl: string;
  locale?: string;
}

export interface RenderCommentApprovedOptions {
  authorName: string;
  postTitle: string;
  postUrl: string;
  commentContent: string;
  siteTitle: string;
  siteUrl: string;
  locale?: string;
}

export function renderLinkApprovedEmail(options: RenderLinkApprovedOptions) {
  const isZh = options.locale?.toLowerCase().startsWith('zh');

  const subject = isZh
    ? `🎉 【${options.siteTitle}】您的友情链接申请已审核通过！`
    : `🎉 [${options.siteTitle}] Your Friend Link Application Has Been Approved!`;

  const title = isZh ? '友情链接申请审核通过' : 'Friend Link Approved';

  const greeting = isZh
    ? `你好，<strong>${escapeHtml(options.applicantName)}</strong>：`
    : `Hello <strong>${escapeHtml(options.applicantName)}</strong>,`;

  const message = isZh
    ? `您在 <strong>${escapeHtml(options.siteTitle)}</strong> 申请的友情链接（${escapeHtml(options.applicantUrl)}）已成功通过审核，现已上线发布！`
    : `Your friend link application for <strong>${escapeHtml(options.applicantUrl)}</strong> on <strong>${escapeHtml(options.siteTitle)}</strong> has been approved and is now live!`;

  const actionText = isZh ? '前往查看友情链接列表' : 'View Links Page';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f7f9; color: #333333; margin: 0; padding: 24px 0; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
    .header { background: #18181b; color: #ffffff; padding: 24px 32px; font-size: 20px; font-weight: 600; }
    .content { padding: 32px; line-height: 1.6; }
    .btn { display: inline-block; background-color: #16a34a; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
    .footer { padding: 20px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${escapeHtml(options.siteTitle)}</div>
    <div class="content">
      <h2 style="margin-top:0; color:#111827;">${title}</h2>
      <p>${greeting}</p>
      <p>${message}</p>
      <p style="margin-top: 24px;">
        <a href="${escapeHtml(options.siteUrl)}/links" class="btn" target="_blank">${actionText}</a>
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${escapeHtml(options.siteTitle)}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

  const text = isZh
    ? `你好 ${options.applicantName}，发自 ${options.siteTitle} 的通知：您申请的友情链接（${options.applicantUrl}）已成功通过审核！访问: ${options.siteUrl}/links`
    : `Hello ${options.applicantName}, notification from ${options.siteTitle}: Your link (${options.applicantUrl}) has been approved! Visit: ${options.siteUrl}/links`;

  return { subject, html, text };
}

export function renderCommentApprovedEmail(options: RenderCommentApprovedOptions) {
  const isZh = options.locale?.toLowerCase().startsWith('zh');

  const subject = isZh
    ? `💬 【${options.siteTitle}】您的评论已通过审核并发布`
    : `💬 [${options.siteTitle}] Your comment has been approved and published`;

  const title = isZh ? '评论审核通过' : 'Comment Approved';

  const greeting = isZh
    ? `你好，<strong>${escapeHtml(options.authorName)}</strong>：`
    : `Hello <strong>${escapeHtml(options.authorName)}</strong>,`;

  const message = isZh
    ? `您在文章 <strong>《${escapeHtml(options.postTitle)}》</strong> 下发表的评论已通过审核。`
    : `Your comment on the post <strong>"${escapeHtml(options.postTitle)}"</strong> has been approved.`;

  const commentQuote = `<blockquote style="background: #f3f4f6; border-left: 4px solid #3b82f6; margin: 16px 0; padding: 12px 16px; border-radius: 4px; color: #4b5563;">${escapeHtml(options.commentContent)}</blockquote>`;

  const actionText = isZh ? '前往文章查看评论' : 'View Post & Comment';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f7f9; color: #333333; margin: 0; padding: 24px 0; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
    .header { background: #18181b; color: #ffffff; padding: 24px 32px; font-size: 20px; font-weight: 600; }
    .content { padding: 32px; line-height: 1.6; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
    .footer { padding: 20px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${escapeHtml(options.siteTitle)}</div>
    <div class="content">
      <h2 style="margin-top:0; color:#111827;">${title}</h2>
      <p>${greeting}</p>
      <p>${message}</p>
      ${commentQuote}
      <p style="margin-top: 24px;">
        <a href="${escapeHtml(options.postUrl)}" class="btn" target="_blank">${actionText}</a>
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${escapeHtml(options.siteTitle)}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

  const text = isZh
    ? `你好 ${options.authorName}，发自 ${options.siteTitle} 的通知：您在《${options.postTitle}》下的评论已发布！阅读文章: ${options.postUrl}`
    : `Hello ${options.authorName}, notification from ${options.siteTitle}: Your comment on "${options.postTitle}" is published! Read post: ${options.postUrl}`;

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
