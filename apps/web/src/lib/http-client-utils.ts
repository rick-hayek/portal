export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthConfig {
  type: 'none' | 'bearer' | 'basic' | 'apiKey';
  bearerToken: string;
  basicUser: string;
  basicPass: string;
  apiKeyName: string;
  apiKeyValue: string;
  apiKeyAddTo: 'header' | 'query';
}

export type BodyType = 'none' | 'json' | 'form' | 'text';

/** Parse query parameters from a URL string */
export function parseUrlQueryParams(fullUrl: string): {
  baseUrl: string;
  params: KeyValuePair[];
} {
  if (!fullUrl) return { baseUrl: '', params: [] };

  try {
    const qIndex = fullUrl.indexOf('?');
    if (qIndex === -1) {
      return { baseUrl: fullUrl, params: [] };
    }

    const baseUrl = fullUrl.slice(0, qIndex);
    const queryString = fullUrl.slice(qIndex + 1);
    const searchParams = new URLSearchParams(queryString);

    const params: KeyValuePair[] = [];
    let idx = 0;
    searchParams.forEach((value, key) => {
      params.push({
        id: `param-${idx++}-${Date.now()}`,
        key,
        value,
        enabled: true,
      });
    });

    return { baseUrl, params };
  } catch {
    return { baseUrl: fullUrl, params: [] };
  }
}

/** Build full URL string combining base URL and active query parameters */
export function buildUrlWithParams(baseUrl: string, params: KeyValuePair[]): string {
  if (!baseUrl) return '';
  const activeParams = params.filter((p) => p.enabled && p.key.trim().length > 0);
  if (activeParams.length === 0) return baseUrl;

  try {
    const urlObj = new URL(baseUrl);
    // Clear existing params first to sync
    urlObj.search = '';
    activeParams.forEach((p) => {
      urlObj.searchParams.append(p.key.trim(), p.value);
    });
    return urlObj.toString();
  } catch {
    // If not a full valid URL yet, do simple string concat
    const cleanBase = baseUrl.split('?')[0];
    const queryStr = activeParams
      .map((p) => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value)}`)
      .join('&');
    return queryStr ? `${cleanBase}?${queryStr}` : cleanBase;
  }
}

/** Encode username & password for HTTP Basic Auth header */
export function encodeBasicAuth(user: string, pass: string): string {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(`${user}:${pass}`);
  }
  return Buffer.from(`${user}:${pass}`).toString('base64');
}

/** Generate cURL command string from request config */
export function generateCurlCommand(config: {
  method: string;
  url: string;
  headers: KeyValuePair[];
  bodyType: BodyType;
  body: string;
  auth: AuthConfig;
}): string {
  const { method, url, headers, bodyType, body, auth } = config;
  const parts: string[] = ['curl -X ' + method.toUpperCase()];

  // Process headers & auth headers
  const effectiveHeaders: Record<string, string> = {};
  headers.forEach((h) => {
    if (h.enabled && h.key.trim()) {
      effectiveHeaders[h.key.trim()] = h.value;
    }
  });

  if (auth.type === 'bearer' && auth.bearerToken) {
    effectiveHeaders['Authorization'] = `Bearer ${auth.bearerToken}`;
  } else if (auth.type === 'basic' && (auth.basicUser || auth.basicPass)) {
    effectiveHeaders['Authorization'] = `Basic ${encodeBasicAuth(auth.basicUser, auth.basicPass)}`;
  } else if (auth.type === 'apiKey' && auth.apiKeyAddTo === 'header' && auth.apiKeyName) {
    effectiveHeaders[auth.apiKeyName] = auth.apiKeyValue;
  }

  // Set default Content-Type header if body present and not specified
  if (
    bodyType === 'json' &&
    !effectiveHeaders['Content-Type'] &&
    !effectiveHeaders['content-type']
  ) {
    effectiveHeaders['Content-Type'] = 'application/json';
  } else if (
    bodyType === 'form' &&
    !effectiveHeaders['Content-Type'] &&
    !effectiveHeaders['content-type']
  ) {
    effectiveHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  // Attach URL (handling API Key query param)
  let targetUrl = url;
  if (auth.type === 'apiKey' && auth.apiKeyAddTo === 'query' && auth.apiKeyName) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    targetUrl += `${separator}${encodeURIComponent(auth.apiKeyName)}=${encodeURIComponent(auth.apiKeyValue)}`;
  }

  parts.push(`"${targetUrl}"`);

  // Add Headers
  for (const [key, val] of Object.entries(effectiveHeaders)) {
    parts.push(`  -H "${key}: ${val.replace(/"/g, '\\"')}"`);
  }

  // Add Body payload
  if (
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()) &&
    bodyType !== 'none' &&
    body
  ) {
    const escapedBody = body.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    parts.push(`  -d "${escapedBody}"`);
  }

  return parts.join(' \\\n');
}

/** Generate JavaScript fetch() snippet from request config */
export function generateFetchCode(config: {
  method: string;
  url: string;
  headers: KeyValuePair[];
  bodyType: BodyType;
  body: string;
  auth: AuthConfig;
}): string {
  const { method, url, headers, bodyType, body, auth } = config;

  const effectiveHeaders: Record<string, string> = {};
  headers.forEach((h) => {
    if (h.enabled && h.key.trim()) {
      effectiveHeaders[h.key.trim()] = h.value;
    }
  });

  if (auth.type === 'bearer' && auth.bearerToken) {
    effectiveHeaders['Authorization'] = `Bearer ${auth.bearerToken}`;
  } else if (auth.type === 'basic' && (auth.basicUser || auth.basicPass)) {
    effectiveHeaders['Authorization'] = `Basic ${encodeBasicAuth(auth.basicUser, auth.basicPass)}`;
  } else if (auth.type === 'apiKey' && auth.apiKeyAddTo === 'header' && auth.apiKeyName) {
    effectiveHeaders[auth.apiKeyName] = auth.apiKeyValue;
  }

  if (
    bodyType === 'json' &&
    !effectiveHeaders['Content-Type'] &&
    !effectiveHeaders['content-type']
  ) {
    effectiveHeaders['Content-Type'] = 'application/json';
  } else if (
    bodyType === 'form' &&
    !effectiveHeaders['Content-Type'] &&
    !effectiveHeaders['content-type']
  ) {
    effectiveHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  let targetUrl = url;
  if (auth.type === 'apiKey' && auth.apiKeyAddTo === 'query' && auth.apiKeyName) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    targetUrl += `${separator}${encodeURIComponent(auth.apiKeyName)}=${encodeURIComponent(auth.apiKeyValue)}`;
  }

  const optionsObj: Record<string, any> = {
    method: method.toUpperCase(),
    headers: effectiveHeaders,
  };

  if (
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()) &&
    bodyType !== 'none' &&
    body
  ) {
    optionsObj.body = body;
  }

  return `// JavaScript fetch snippet\nconst response = await fetch("${targetUrl}", ${JSON.stringify(optionsObj, null, 2)});\nconst data = await response.json();\nconsole.log(data);`;
}

/** Prettify JSON string with indentation, or return raw if invalid */
export function prettifyJson(raw: string): { formatted: string; isValid: boolean } {
  if (!raw.trim()) return { formatted: '', isValid: true };
  try {
    const parsed = JSON.parse(raw);
    return { formatted: JSON.stringify(parsed, null, 2), isValid: true };
  } catch {
    return { formatted: raw, isValid: false };
  }
}
