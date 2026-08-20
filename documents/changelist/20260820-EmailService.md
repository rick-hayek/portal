# Pluggable Email Service Component & Notification Triggers

Design and implement a pluggable Email Service architecture configurable via `site.config.ts`, with Mailgun and SendGrid provider implementations. When enabled, the system automatically sends notification emails when friend link applications and guest comments are approved by administrators.

## User Decisions & Feedback Incorporated

1. **Sender Info**: Uses `EMAIL_SERVICE_SENDER_NAME` (e.g. `Voocii Support`) and `EMAIL_SERVICE_SENDER_ADDRESS` / `EMAIL_SERVICE_SENDER` (e.g. `support@voocii.com`).
2. **Locale alignment**: Email templates adapt to `siteConfig.site.locale` (e.g., `zh-CN` / `en-US`).
3. **Extensible Providers**: Supports both `mailgun` and `sendgrid` (and extensible structure for others like `smtp` / `resend`).

## Proposed Changes

### Configuration & Shared Types

#### [MODIFY] [types.ts](file:///Users/rick/src/portal/packages/shared/src/types.ts)
- Add `email` configuration section to the `SiteConfig` interface:
  ```ts
  email?: {
    enabled: boolean;
    provider: 'mailgun' | 'sendgrid' | 'smtp' | 'resend' | string;
  };
  ```

#### [MODIFY] [schema.ts](file:///Users/rick/src/portal/packages/config/src/schema.ts)
- Extend `siteConfigSchema` to validate the `email` configuration block.

#### [MODIFY] [site.config.ts](file:///Users/rick/src/portal/apps/web/src/site.config.ts)
- Add email configuration option:
  ```ts
  email: {
    enabled: true,
    provider: 'mailgun',
  }
  ```

---

### Email Service Infrastructure

#### [NEW] [provider.ts](file:///Users/rick/src/portal/packages/api/src/services/email/provider.ts)
- Define `EmailProvider` interface and `SendEmailOptions` data types.

#### [NEW] [mailgun.ts](file:///Users/rick/src/portal/packages/api/src/services/email/providers/mailgun.ts)
- Implement `MailgunEmailProvider` using native `fetch` and Basic Authentication (`api:${apiKey}`) to call Mailgun REST API (`/v3/${domain}/messages`).

#### [NEW] [sendgrid.ts](file:///Users/rick/src/portal/packages/api/src/services/email/providers/sendgrid.ts)
- Implement `SendgridEmailProvider` using native `fetch` calling SendGrid v3 API (`https://api.sendgrid.com/v3/mail/send`) with Bearer token authentication (`EMAIL_SERVICE_API_KEY`).

#### [NEW] [index.ts](file:///Users/rick/src/portal/packages/api/src/services/email/index.ts)
- Implement factory `getEmailService()` that inspects site configuration and returns the active provider (`MailgunEmailProvider`, `SendgridEmailProvider`, etc.) or a disabled `NullEmailProvider`.
- Provide helper methods `sendLinkApprovedEmail` and `sendCommentApprovedEmail`.

#### [NEW] [templates.ts](file:///Users/rick/src/portal/packages/api/src/services/email/templates.ts)
- Locale-aligned HTML & text templates for:
  - Friend link approval notification (supports Chinese and English based on site locale).
  - Guest comment approval notification (supports Chinese and English based on site locale).

---

### Triggers in Admin API Router

#### [MODIFY] [admin.ts](file:///Users/rick/src/portal/packages/api/src/routers/admin.ts)
- **`linkUpdate`**:
  - Check existing link status before updating.
  - If status transitions from `pending`/`rejected` to `approved` and `link.email` exists, trigger `sendLinkApprovedEmail`.
- **`commentModerate`**:
  - Fetch existing comment with post details before updating.
  - If status transitions from `pending`/`spam` to `approved` and `comment.authorEmail` exists, trigger `sendCommentApprovedEmail`.

---

## Verification Plan

### Automated Tests
- Run `pnpm --filter @portal/web typecheck` and `pnpm test` to verify TypeScript contracts and unit test suites.
- Create unit tests in `packages/api` for Mailgun and SendGrid providers and `getEmailService` (mocking `fetch`).

### Manual Verification
- Test approving a pending friend link with an email address from the admin panel and verify email dispatch / logs.
- Test approving a pending guest comment with an author email from the admin panel and verify email dispatch / logs.
