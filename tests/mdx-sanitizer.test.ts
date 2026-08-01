import { describe, expect, it } from 'vitest';
import { sanitizeMdxContent } from '../apps/web/src/lib/mdx-sanitizer';

describe('sanitizeMdxContent', () => {
  it('escapes unclosed plain text angle brackets like <RP Name>', () => {
    const input = '解决方法是：Set-AdfsRelyingPartyTrust -TargetName <RP Name> -SamlResponseSignature MessageAndAssertion';
    const output = sanitizeMdxContent(input);
    expect(output).toContain('&lt;RP Name&gt;');
    expect(output).not.toContain('<RP Name>');
  });

  it('does NOT escape angle brackets inside fenced code blocks', () => {
    const input = '```bash\nSet-AdfsRelyingPartyTrust -TargetName <RP Name>\n```';
    const output = sanitizeMdxContent(input);
    expect(output).toBe(input);
  });

  it('does NOT escape angle brackets inside inline code', () => {
    const input = 'Run `Set-AdfsRelyingPartyTrust -TargetName <RP Name>` to fix.';
    const output = sanitizeMdxContent(input);
    expect(output).toBe(input);
  });

  it('preserves registered custom JSX components like <AdSense />', () => {
    const input = 'Header text\n<AdSense />\nFooter text';
    const output = sanitizeMdxContent(input, ['AdSense']);
    expect(output).toBe(input);
  });

  it('preserves valid standard HTML tags', () => {
    const input = '<div><p>Hello <strong>World</strong></p><br/></div>';
    const output = sanitizeMdxContent(input);
    expect(output).toBe(input);
  });

  it('escapes unclosed non-standard tags in mixed text', () => {
    const input = 'Check <IP:Port> and <User_ID> before proceeding.';
    const output = sanitizeMdxContent(input);
    expect(output).toBe('Check &lt;IP:Port&gt; and &lt;User_ID&gt; before proceeding.');
  });
});
