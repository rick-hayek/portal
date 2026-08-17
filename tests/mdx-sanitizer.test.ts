import { describe, expect, it } from 'vitest';
import { sanitizeMdxContent } from '../apps/web/src/lib/mdx-sanitizer';
import rehypeSanitizeHtmlAttrs, {
  parseStyleString,
} from '../apps/web/src/lib/rehype-sanitize-html-attrs';

describe('sanitizeMdxContent', () => {
  it('escapes unclosed plain text angle brackets like <RP Name>', () => {
    const input =
      '解决方法是：Set-AdfsRelyingPartyTrust -TargetName <RP Name> -SamlResponseSignature MessageAndAssertion';
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

  it('normalizes unquoted attributes on HTML tags like <font color=blue>', () => {
    const input = 'These are results for <font color=blue> voovi </font>.';
    const output = sanitizeMdxContent(input);
    expect(output).toBe('These are results for <font color="blue"> voovi </font>.');
  });
});

describe('parseStyleString & rehypeSanitizeHtmlAttrs', () => {
  it('correctly converts CSS style string to camelCase object', () => {
    const styleObj = parseStyleString(
      'color: blue; font-size: 14px; margin-top: 10px; -webkit-transform: scale(1)',
    );
    expect(styleObj).toEqual({
      color: 'blue',
      fontSize: '14px',
      marginTop: '10px',
      webkitTransform: 'scale(1)',
    });
  });

  it('renders all 4 HTML tag test cases with correct colored style attributes in MDX', async () => {
    const { compileMDX } = await import('../apps/web/node_modules/next-mdx-remote/rsc.js');
    const ReactDOMServer = await import('../apps/web/node_modules/react-dom/server.browser.js');

    const source = `## HTML test

**These are results for <font color=blue> voovi </font>**.  

Search instead for <font color=blue> voocii </font>

Search instead for <span style="color: blue"> voocii </span>

Search instead for <span style="color: #2563eb"> voocii </span>`;

    const sanitized = sanitizeMdxContent(source);
    const compiled = await compileMDX({
      source: sanitized,
      options: {
        mdxOptions: {
          rehypePlugins: [rehypeSanitizeHtmlAttrs],
        },
      },
    });

    const html = ReactDOMServer.renderToString(compiled.content);

    // Verify voovi has color: blue style
    expect(html).toContain('style="color:blue"');
    // Verify voocii has color: #2563eb style
    expect(html).toContain('style="color:#2563eb"');
  });
});
