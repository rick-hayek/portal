import { describe, expect, it } from 'vitest';
import {
  buildUrlWithParams,
  encodeBasicAuth,
  generateCurlCommand,
  generateFetchCode,
  parseUrlQueryParams,
  prettifyJson,
} from '../apps/web/src/lib/http-client-utils';

describe('HTTP Client Helper Utilities', () => {
  it('should parse URL query parameters accurately', () => {
    const rawUrl = 'https://api.example.com/v1/posts?category=tech&page=2&active=true';
    const parsed = parseUrlQueryParams(rawUrl);

    expect(parsed.baseUrl).toBe('https://api.example.com/v1/posts');
    expect(parsed.params.length).toBe(3);
    expect(parsed.params[0]).toEqual(
      expect.objectContaining({ key: 'category', value: 'tech', enabled: true }),
    );
    expect(parsed.params[1]).toEqual(
      expect.objectContaining({ key: 'page', value: '2', enabled: true }),
    );
  });

  it('should build full URL with enabled parameters', () => {
    const baseUrl = 'https://api.example.com/search';
    const params = [
      { id: '1', key: 'q', value: 'hello world', enabled: true },
      { id: '2', key: 'disabled_key', value: 'val', enabled: false },
      { id: '3', key: 'limit', value: '10', enabled: true },
    ];

    const builtUrl = buildUrlWithParams(baseUrl, params);
    expect(builtUrl).toContain('q=hello+world');
    expect(builtUrl).toContain('limit=10');
    expect(builtUrl).not.toContain('disabled_key');
  });

  it('should encode Basic Authentication credentials properly', () => {
    const encoded = encodeBasicAuth('admin', 'secret123');
    expect(encoded).toBe('YWRtaW46c2VjcmV0MTIz');
  });

  it('should generate valid cURL command strings', () => {
    const curl = generateCurlCommand({
      method: 'POST',
      url: 'https://api.indexnow.org/indexnow',
      headers: [{ id: '1', key: 'Accept', value: 'application/json', enabled: true }],
      bodyType: 'json',
      body: '{"host":"voocii.com"}',
      auth: {
        type: 'bearer',
        bearerToken: 'my_token_abc',
        basicUser: '',
        basicPass: '',
        apiKeyName: '',
        apiKeyValue: '',
        apiKeyAddTo: 'header',
      },
    });

    expect(curl).toContain('curl -X POST');
    expect(curl).toContain('"https://api.indexnow.org/indexnow"');
    expect(curl).toContain('-H "Authorization: Bearer my_token_abc"');
    expect(curl).toContain('-H "Content-Type: application/json"');
    expect(curl).toContain('-d "{\\"host\\":\\"voocii.com\\"}"');
  });

  it('should generate JavaScript fetch code snippets', () => {
    const code = generateFetchCode({
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: [],
      bodyType: 'none',
      body: '',
      auth: {
        type: 'none',
        bearerToken: '',
        basicUser: '',
        basicPass: '',
        apiKeyName: '',
        apiKeyValue: '',
        apiKeyAddTo: 'header',
      },
    });

    expect(code).toContain('fetch("https://jsonplaceholder.typicode.com/posts/1"');
    expect(code).toContain('"method": "GET"');
  });

  it('should prettify valid JSON and flag invalid JSON', () => {
    const validJson = '{"name":"test","count":42}';
    const validResult = prettifyJson(validJson);
    expect(validResult.isValid).toBe(true);
    expect(validResult.formatted).toBe('{\n  "name": "test",\n  "count": 42\n}');

    const invalidJson = '{name: test}';
    const invalidResult = prettifyJson(invalidJson);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.formatted).toBe(invalidJson);
  });
});
