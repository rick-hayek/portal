'use client';

import {
  AlertCircle,
  Check,
  Clock,
  Code2,
  Copy,
  Database,
  Globe,
  Plus,
  Play,
  RotateCcw,
  Send,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useState } from 'react';
import { ToolHeader } from '@/components/tools/ToolHeader';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  AuthConfig,
  BodyType,
  KeyValuePair,
  buildUrlWithParams,
  encodeBasicAuth,
  generateCurlCommand,
  generateFetchCode,
  parseUrlQueryParams,
  prettifyJson,
} from '@/lib/http-client-utils';

interface HistoryItem {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  duration?: number;
}

export default function HttpClientPage() {
  const t = useTranslations('ToolsHttpClient');

  // Request State
  const [method, setMethod] = useState<string>('GET');
  const [url, setUrl] = useState<string>('https://jsonplaceholder.typicode.com/posts/1');
  const [useProxy, setUseProxy] = useState<boolean>(false);

  // Request Tabs
  const [activeReqTab, setActiveReqTab] = useState<'params' | 'headers' | 'body' | 'auth'>(
    'params',
  );

  // Params State
  const [paramsList, setParamsList] = useState<KeyValuePair[]>([]);

  // Headers State
  const [headersList, setHeadersList] = useState<KeyValuePair[]>([
    { id: 'h-1', key: 'Accept', value: 'application/json', enabled: true },
  ]);

  // Body State
  const [bodyType, setBodyType] = useState<BodyType>('none');
  const [bodyText, setBodyText] = useState<string>('');

  // Auth State
  const [authConfig, setAuthConfig] = useState<AuthConfig>({
    type: 'none',
    bearerToken: '',
    basicUser: '',
    basicPass: '',
    apiKeyName: 'api_key',
    apiKeyValue: '',
    apiKeyAddTo: 'header',
  });

  // Response State
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    duration: number;
    isCorsError?: boolean;
    errorMsg?: string;
  } | null>(null);

  const [activeResTab, setActiveResTab] = useState<'body' | 'headers' | 'code'>('body');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('portal_http_client_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save history item
  const saveToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: `hist-${Date.now()}`,
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev.slice(0, 9)];
      try {
        localStorage.setItem('portal_http_client_history', JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  // Handle URL change & auto-sync Params tab
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    const parsed = parseUrlQueryParams(newUrl);
    if (parsed.params.length > 0) {
      setParamsList(parsed.params);
    }
  };

  // Sync Params tab edits back to URL string
  const handleParamsChange = (newParams: KeyValuePair[]) => {
    setParamsList(newParams);
    const updatedUrl = buildUrlWithParams(url, newParams);
    setUrl(updatedUrl);
  };

  // Preset Loaders
  const loadPreset = (type: 'indexnow' | 'httpbinGet' | 'httpbinPost' | 'jsonplaceholder') => {
    if (type === 'indexnow') {
      setMethod('POST');
      const targetUrl = 'https://api.indexnow.org/indexnow';
      setUrl(targetUrl);
      setBodyType('json');
      const samplePayload = {
        host: 'your_domain.com',
        key: 'YOUR_INDEXNOW_KEY',
        keyLocation: 'https://your_domain.com/YOUR_INDEXNOW_KEY.txt',
        urlList: ['https://your_domain.com/', 'https://your_domain.com/blog/new_post'],
      };
      setBodyText(JSON.stringify(samplePayload, null, 2));
      setActiveReqTab('body');
    } else if (type === 'httpbinGet') {
      setMethod('GET');
      setUrl('https://httpbin.org/get?sample=1');
      setParamsList([{ id: 'p-1', key: 'sample', value: '1', enabled: true }]);
      setBodyType('none');
    } else if (type === 'httpbinPost') {
      setMethod('POST');
      setUrl('https://httpbin.org/post');
      setBodyType('json');
      setBodyText(
        JSON.stringify(
          { message: 'Hello from Portal HTTP Client', timestamp: Date.now() },
          null,
          2,
        ),
      );
      setActiveReqTab('body');
    } else if (type === 'jsonplaceholder') {
      setMethod('GET');
      setUrl('https://jsonplaceholder.typicode.com/posts/1');
      setBodyType('none');
    }
  };

  // Execute Request
  const sendRequest = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResponse(null);
    const startTime = Date.now();

    // Prepare full URL with params
    const fullUrl = buildUrlWithParams(url, paramsList);

    // Prepare effective headers
    const effectiveHeaders: Record<string, string> = {};
    headersList.forEach((h) => {
      if (h.enabled && h.key.trim()) {
        effectiveHeaders[h.key.trim()] = h.value;
      }
    });

    // Attach Auth Headers or Query Params
    if (authConfig.type === 'bearer' && authConfig.bearerToken) {
      effectiveHeaders['Authorization'] = `Bearer ${authConfig.bearerToken}`;
    } else if (authConfig.type === 'basic' && (authConfig.basicUser || authConfig.basicPass)) {
      effectiveHeaders['Authorization'] =
        `Basic ${encodeBasicAuth(authConfig.basicUser, authConfig.basicPass)}`;
    } else if (
      authConfig.type === 'apiKey' &&
      authConfig.apiKeyAddTo === 'header' &&
      authConfig.apiKeyName
    ) {
      effectiveHeaders[authConfig.apiKeyName] = authConfig.apiKeyValue;
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

    let targetUrl = fullUrl;
    if (
      authConfig.type === 'apiKey' &&
      authConfig.apiKeyAddTo === 'query' &&
      authConfig.apiKeyName
    ) {
      const sep = targetUrl.includes('?') ? '&' : '?';
      targetUrl += `${sep}${encodeURIComponent(authConfig.apiKeyName)}=${encodeURIComponent(authConfig.apiKeyValue)}`;
    }

    try {
      if (useProxy) {
        // Send via Server Proxy API
        const proxyRes = await fetch('/api/tools/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            method,
            headers: effectiveHeaders,
            body:
              ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && bodyType !== 'none'
                ? bodyText
                : undefined,
          }),
        });

        const proxyData = await proxyRes.json();

        if (proxyData.isProxyError) {
          setResponse({
            status: proxyRes.status,
            statusText: proxyData.error || 'Proxy Error',
            headers: {},
            body: proxyData.error || 'Failed to reach endpoint via Proxy',
            duration: Date.now() - startTime,
            errorMsg: proxyData.error,
          });
        } else {
          setResponse({
            status: proxyData.status,
            statusText: proxyData.statusText || 'OK',
            headers: proxyData.headers || {},
            body: proxyData.body || '',
            duration: proxyData.duration || Date.now() - startTime,
          });

          saveToHistory({
            method,
            url: targetUrl,
            status: proxyData.status,
            statusText: proxyData.statusText,
            duration: proxyData.duration,
          });
        }
      } else {
        // Direct Browser Fetch
        const fetchOptions: RequestInit = {
          method: method.toUpperCase(),
          headers: effectiveHeaders,
        };

        if (
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()) &&
          bodyType !== 'none' &&
          bodyText
        ) {
          fetchOptions.body = bodyText;
        }

        const directRes = await fetch(targetUrl, fetchOptions);
        const duration = Date.now() - startTime;

        const bodyData = await directRes.text();
        const resHeaders: Record<string, string> = {};
        directRes.headers.forEach((v, k) => {
          resHeaders[k] = v;
        });

        setResponse({
          status: directRes.status,
          statusText: directRes.statusText || 'OK',
          headers: resHeaders,
          body: bodyData,
          duration,
        });

        saveToHistory({
          method,
          url: targetUrl,
          status: directRes.status,
          statusText: directRes.statusText,
          duration,
        });
      }
    } catch (err: any) {
      setResponse({
        status: 0,
        statusText: 'CORS or Network Error',
        headers: {},
        body:
          err?.message || 'Failed to fetch. This request might have been blocked by CORS policy.',
        duration: Date.now() - startTime,
        isCorsError: true,
        errorMsg: err?.message,
      });

      saveToHistory({
        method,
        url: targetUrl,
        status: 0,
        statusText: 'CORS Error',
        duration: Date.now() - startTime,
      });
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut listener (Cmd/Ctrl + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        sendRequest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Copy Helper
  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Method Color Map
  const methodColors: Record<string, { bg: string; text: string; border: string }> = {
    GET: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
    },
    POST: {
      bg: 'bg-sky-500/10 dark:bg-sky-500/20',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-500/30',
    },
    PUT: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30',
    },
    PATCH: {
      bg: 'bg-violet-500/10 dark:bg-violet-500/20',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-500/30',
    },
    DELETE: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
    },
    HEAD: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30',
    },
    OPTIONS: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/20',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-500/30',
    },
  };

  const currMethodStyle = methodColors[method] || methodColors['GET'];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8 pt-6 pb-20">
      <ToolHeader
        title={t('title')}
        description={t('description')}
        icon={<Send className="h-6 w-6" />}
        iconBgColor="bg-[rgba(14,165,233,0.1)] text-sky-500"
      />

      {/* Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="text-xs font-semibold text-[var(--portal-color-text-tertiary)] uppercase tracking-wider mr-2">
          {t('presetsTitle')}:
        </span>
        <button
          type="button"
          onClick={() => loadPreset('indexnow')}
          className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400 transition-transform hover:scale-105 cursor-pointer"
        >
          <span>🚀 {t('presets.indexnow')}</span>
        </button>
        <button
          type="button"
          onClick={() => loadPreset('httpbinGet')}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-1 text-xs font-medium text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] hover:border-[var(--portal-color-primary)] transition-all cursor-pointer"
        >
          <span>{t('presets.httpbinGet')}</span>
        </button>
        <button
          type="button"
          onClick={() => loadPreset('httpbinPost')}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-1 text-xs font-medium text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] hover:border-[var(--portal-color-primary)] transition-all cursor-pointer"
        >
          <span>{t('presets.httpbinPost')}</span>
        </button>
        <button
          type="button"
          onClick={() => loadPreset('jsonplaceholder')}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-1 text-xs font-medium text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] hover:border-[var(--portal-color-primary)] transition-all cursor-pointer"
        >
          <span>{t('presets.jsonplaceholder')}</span>
        </button>
      </div>

      {/* Main Request Input Box */}
      <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-4 sm:p-6 shadow-sm space-y-4">
        {/* URL + Method Selector Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Method Dropdown */}
          <div className="w-full sm:w-auto shrink-0">
            <Dropdown
              value={method}
              onChange={(val) => setMethod(val)}
              options={[
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
                { value: 'PATCH', label: 'PATCH' },
                { value: 'DELETE', label: 'DELETE' },
                { value: 'HEAD', label: 'HEAD' },
                { value: 'OPTIONS', label: 'OPTIONS' },
              ]}
              className={`!w-full sm:!w-32 rounded-xl border px-3 py-2 text-sm font-bold tracking-wide transition-all ${currMethodStyle.bg} ${currMethodStyle.text} ${currMethodStyle.border}`}
              menuClassName="!w-36"
            />
          </div>

          {/* URL Input */}
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={t('urlPlaceholder')}
              className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-4 py-2.5 text-sm font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] focus:ring-2 focus:ring-[var(--portal-color-primary)]/20 transition-all"
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={sendRequest}
            disabled={loading || !url.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--portal-color-primary)] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[var(--portal-color-primary)]/90 disabled:opacity-50 transition-all cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{t('sending')}</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>{t('send')}</span>
              </>
            )}
          </button>
        </div>

        {/* Proxy Option Toggle Bar */}
        <div className="flex flex-col gap-2 pt-1 border-t border-[var(--portal-color-border)]/50 text-xs">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)]">
              <input
                type="checkbox"
                checked={useProxy}
                onChange={(e) => setUseProxy(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--portal-color-border)] text-[var(--portal-color-primary)] focus:ring-[var(--portal-color-primary)] cursor-pointer"
              />
              <span className="font-medium">{t('useProxy')}</span>
            </label>

            <span className="hidden sm:inline text-[var(--portal-color-text-tertiary)]">
              ⌨️ Shortcut:{' '}
              <kbd className="rounded border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-1.5 py-0.5 text-[10px] font-mono">
                Cmd/Ctrl + Enter
              </kbd>
            </span>
          </div>

          {/* Proxy Security Caution Banner */}
          {useProxy && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs text-amber-600 dark:text-amber-400 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{t('proxyNotice')}</span>
            </div>
          )}
        </div>

        {/* Request Tabs & Content */}
        <div className="pt-2">
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-[var(--portal-color-border)] gap-6">
            {(['params', 'headers', 'body', 'auth'] as const).map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => setActiveReqTab(tabKey)}
                className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                  activeReqTab === tabKey
                    ? 'border-[var(--portal-color-primary)] text-[var(--portal-color-primary)]'
                    : 'border-transparent text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)]'
                }`}
              >
                {t(`tabs.${tabKey}`)}
                {tabKey === 'params' && paramsList.filter((p) => p.enabled && p.key).length > 0 && (
                  <span className="ml-1.5 rounded-full bg-[var(--portal-color-primary)]/10 text-[var(--portal-color-primary)] px-1.5 py-0.5 text-[10px]">
                    {paramsList.filter((p) => p.enabled && p.key).length}
                  </span>
                )}
                {tabKey === 'headers' &&
                  headersList.filter((h) => h.enabled && h.key).length > 0 && (
                    <span className="ml-1.5 rounded-full bg-[var(--portal-color-primary)]/10 text-[var(--portal-color-primary)] px-1.5 py-0.5 text-[10px]">
                      {headersList.filter((h) => h.enabled && h.key).length}
                    </span>
                  )}
                {tabKey === 'body' && bodyType !== 'none' && (
                  <span className="ml-1.5 rounded-full bg-amber-500/10 text-amber-500 px-1.5 py-0.5 text-[10px]">
                    {bodyType}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Panel Content */}
          <div className="pt-4">
            {/* 1. Params Tab */}
            {activeReqTab === 'params' && (
              <div className="space-y-3">
                {paramsList.map((param, index) => (
                  <div key={param.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={param.enabled}
                      onChange={(e) => {
                        const updated = [...paramsList];
                        updated[index].enabled = e.target.checked;
                        handleParamsChange(updated);
                      }}
                      className="h-4 w-4 rounded border-[var(--portal-color-border)] text-[var(--portal-color-primary)]"
                    />
                    <input
                      type="text"
                      value={param.key}
                      onChange={(e) => {
                        const updated = [...paramsList];
                        updated[index].key = e.target.value;
                        handleParamsChange(updated);
                      }}
                      placeholder="Parameter Key"
                      className="w-1/3 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-1.5 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => {
                        const updated = [...paramsList];
                        updated[index].value = e.target.value;
                        handleParamsChange(updated);
                      }}
                      placeholder="Value"
                      className="flex-1 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-1.5 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = paramsList.filter((_, i) => i !== index);
                        handleParamsChange(updated);
                      }}
                      className="p-1.5 text-[var(--portal-color-text-tertiary)] hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    handleParamsChange([
                      ...paramsList,
                      { id: `p-${Date.now()}`, key: '', value: '', enabled: true },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--portal-color-primary)] hover:underline cursor-pointer pt-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Parameter</span>
                </button>
              </div>
            )}

            {/* 2. Headers Tab */}
            {activeReqTab === 'headers' && (
              <div className="space-y-3">
                {headersList.map((header, index) => (
                  <div key={header.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) => {
                        const updated = [...headersList];
                        updated[index].enabled = e.target.checked;
                        setHeadersList(updated);
                      }}
                      className="h-4 w-4 rounded border-[var(--portal-color-border)] text-[var(--portal-color-primary)]"
                    />
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) => {
                        const updated = [...headersList];
                        updated[index].key = e.target.value;
                        setHeadersList(updated);
                      }}
                      placeholder="Header Key (e.g. Content-Type)"
                      className="w-1/3 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-1.5 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => {
                        const updated = [...headersList];
                        updated[index].value = e.target.value;
                        setHeadersList(updated);
                      }}
                      placeholder="Header Value"
                      className="flex-1 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-1.5 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => setHeadersList(headersList.filter((_, i) => i !== index))}
                      className="p-1.5 text-[var(--portal-color-text-tertiary)] hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setHeadersList([
                        ...headersList,
                        { id: `h-${Date.now()}`, key: '', value: '', enabled: true },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--portal-color-primary)] hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Header</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setHeadersList((prev) => [
                          ...prev,
                          {
                            id: `h-${Date.now()}`,
                            key: 'Content-Type',
                            value: 'application/json',
                            enabled: true,
                          },
                        ])
                      }
                      className="rounded border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-2 py-1 text-[10px] text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)]"
                    >
                      + JSON Header
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Body Tab */}
            {activeReqTab === 'body' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-semibold text-[var(--portal-color-text-secondary)]">
                    Body Type:
                  </span>
                  {(['none', 'json', 'form', 'text'] as const).map((bType) => (
                    <label key={bType} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="bodyType"
                        checked={bodyType === bType}
                        onChange={() => setBodyType(bType)}
                        className="text-[var(--portal-color-primary)] focus:ring-[var(--portal-color-primary)]"
                      />
                      <span className="font-medium text-[var(--portal-color-text)]">
                        {t(`bodyType.${bType}`)}
                      </span>
                    </label>
                  ))}
                </div>

                {bodyType !== 'none' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--portal-color-text-tertiary)]">
                        Payload Content
                      </span>
                      {bodyType === 'json' && (
                        <button
                          type="button"
                          onClick={() => {
                            const res = prettifyJson(bodyText);
                            if (res.formatted) setBodyText(res.formatted);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--portal-color-primary)] hover:underline cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Auto Format JSON</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      rows={8}
                      placeholder={
                        bodyType === 'json'
                          ? '{\n  "key": "value"\n}'
                          : bodyType === 'form'
                            ? 'key1=value1&key2=value2'
                            : 'Enter body payload...'
                      }
                      className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] p-3 font-mono text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 4. Auth Tab */}
            {activeReqTab === 'auth' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-semibold text-[var(--portal-color-text-secondary)]">
                    Auth Type:
                  </span>
                  {(['none', 'bearer', 'basic', 'apiKey'] as const).map((aType) => (
                    <label key={aType} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="authType"
                        checked={authConfig.type === aType}
                        onChange={() => setAuthConfig({ ...authConfig, type: aType })}
                        className="text-[var(--portal-color-primary)] focus:ring-[var(--portal-color-primary)]"
                      />
                      <span className="font-medium text-[var(--portal-color-text)]">
                        {t(`authType.${aType}`)}
                      </span>
                    </label>
                  ))}
                </div>

                {authConfig.type === 'bearer' && (
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--portal-color-text-secondary)]">
                      Token String
                    </label>
                    <input
                      type="text"
                      value={authConfig.bearerToken}
                      onChange={(e) =>
                        setAuthConfig({ ...authConfig, bearerToken: e.target.value })
                      }
                      placeholder="eyJhbGciOiJIUzI1Ni..."
                      className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 font-mono text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                  </div>
                )}

                {authConfig.type === 'basic' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--portal-color-text-secondary)]">
                        Username
                      </label>
                      <input
                        type="text"
                        value={authConfig.basicUser}
                        onChange={(e) =>
                          setAuthConfig({ ...authConfig, basicUser: e.target.value })
                        }
                        placeholder="admin"
                        className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 font-mono text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--portal-color-text-secondary)]">
                        Password
                      </label>
                      <input
                        type="password"
                        value={authConfig.basicPass}
                        onChange={(e) =>
                          setAuthConfig({ ...authConfig, basicPass: e.target.value })
                        }
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 font-mono text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                      />
                    </div>
                  </div>
                )}

                {authConfig.type === 'apiKey' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--portal-color-text-secondary)]">
                        Key Name
                      </label>
                      <input
                        type="text"
                        value={authConfig.apiKeyName}
                        onChange={(e) =>
                          setAuthConfig({ ...authConfig, apiKeyName: e.target.value })
                        }
                        placeholder="X-API-Key"
                        className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 font-mono text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--portal-color-text-secondary)]">
                        Key Value
                      </label>
                      <input
                        type="text"
                        value={authConfig.apiKeyValue}
                        onChange={(e) =>
                          setAuthConfig({ ...authConfig, apiKeyValue: e.target.value })
                        }
                        placeholder="secret_key_123"
                        className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 font-mono text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--portal-color-text-secondary)]">
                        Add To
                      </label>
                      <select
                        value={authConfig.apiKeyAddTo}
                        onChange={(e) =>
                          setAuthConfig({
                            ...authConfig,
                            apiKeyAddTo: e.target.value as 'header' | 'query',
                          })
                        }
                        className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs font-medium text-[var(--portal-color-text)] outline-none"
                      >
                        <option value="header">Header</option>
                        <option value="query">Query Parameter</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Response Display Section */}
      <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--portal-color-border)] pb-4 gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-base sm:text-lg font-bold text-[var(--portal-color-text)]">
              {t('response.title')}
            </h2>

            {response && (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-bold ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : response.status >= 400
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {response.status > 0
                    ? `${response.status} ${response.statusText}`
                    : 'CORS / Network Error'}
                </span>

                <span className="inline-flex items-center gap-1 text-xs text-[var(--portal-color-text-secondary)]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{response.duration} ms</span>
                </span>

                <span className="inline-flex items-center gap-1 text-xs text-[var(--portal-color-text-secondary)]">
                  <Database className="h-3.5 w-3.5" />
                  <span>{(new Blob([response.body]).size / 1024).toFixed(2)} KB</span>
                </span>
              </div>
            )}
          </div>

          {/* Response Sub Tabs */}
          {response && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveResTab('body')}
                className={`rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeResTab === 'body'
                    ? 'bg-[var(--portal-color-primary)] text-white'
                    : 'text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-surface-alt)]'
                }`}
              >
                {t('response.tabs.body')}
              </button>
              <button
                type="button"
                onClick={() => setActiveResTab('headers')}
                className={`rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeResTab === 'headers'
                    ? 'bg-[var(--portal-color-primary)] text-white'
                    : 'text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-surface-alt)]'
                }`}
              >
                {t('response.tabs.headers')}
              </button>
              <button
                type="button"
                onClick={() => setActiveResTab('code')}
                className={`rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeResTab === 'code'
                    ? 'bg-[var(--portal-color-primary)] text-white'
                    : 'text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-surface-alt)]'
                }`}
              >
                {t('response.tabs.code')}
              </button>
            </div>
          )}
        </div>

        {/* Response Body Content */}
        {!response ? (
          <div className="rounded-xl border border-dashed border-[var(--portal-color-border)] p-12 text-center text-xs text-[var(--portal-color-text-tertiary)]">
            <Globe className="mx-auto h-8 w-8 mb-2 opacity-50 text-[var(--portal-color-primary)]" />
            <p>{t('response.noResponse')}</p>
          </div>
        ) : response.isCorsError ? (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-600 dark:text-rose-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{t('response.corsErrorTitle')}</span>
            </div>
            <p>{t('response.corsErrorDesc')}</p>
          </div>
        ) : (
          <div>
            {/* 1. Body View */}
            {activeResTab === 'body' && (
              <div className="space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(response.body, 'body')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-2.5 py-1 text-xs font-medium text-[var(--portal-color-text)] hover:border-[var(--portal-color-primary)] transition-all cursor-pointer"
                  >
                    {copiedType === 'body' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {copiedType === 'body' ? t('response.copied') : t('response.copyBody')}
                    </span>
                  </button>
                </div>
                <pre className="max-h-[400px] overflow-auto rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] p-4 font-mono text-xs text-[var(--portal-color-text)] leading-relaxed">
                  {prettifyJson(response.body).formatted}
                </pre>
              </div>
            )}

            {/* 2. Headers View */}
            {activeResTab === 'headers' && (
              <div className="overflow-x-auto rounded-xl border border-[var(--portal-color-border)]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] text-[var(--portal-color-text-secondary)] font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Header Key</th>
                      <th className="px-4 py-2.5">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--portal-color-border)] font-mono text-[var(--portal-color-text)]">
                    {Object.entries(response.headers).map(([k, v]) => (
                      <tr key={k}>
                        <td className="px-4 py-2 text-[var(--portal-color-primary)]">{k}</td>
                        <td className="px-4 py-2 break-all">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Code Snippet Export View */}
            {activeResTab === 'code' && (
              <div className="space-y-6">
                {/* cURL Snippet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--portal-color-text)]">
                      cURL Command
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          generateCurlCommand({
                            method,
                            url: buildUrlWithParams(url, paramsList),
                            headers: headersList,
                            bodyType,
                            body: bodyText,
                            auth: authConfig,
                          }),
                          'curl',
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-2.5 py-1 text-xs font-medium text-[var(--portal-color-text)] hover:border-[var(--portal-color-primary)] transition-all cursor-pointer"
                    >
                      {copiedType === 'curl' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {copiedType === 'curl' ? t('response.copied') : t('response.copyCurl')}
                      </span>
                    </button>
                  </div>
                  <pre className="overflow-auto rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] p-4 font-mono text-xs text-[var(--portal-color-text)]">
                    {generateCurlCommand({
                      method,
                      url: buildUrlWithParams(url, paramsList),
                      headers: headersList,
                      bodyType,
                      body: bodyText,
                      auth: authConfig,
                    })}
                  </pre>
                </div>

                {/* Fetch Snippet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--portal-color-text)]">
                      JavaScript Fetch
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          generateFetchCode({
                            method,
                            url: buildUrlWithParams(url, paramsList),
                            headers: headersList,
                            bodyType,
                            body: bodyText,
                            auth: authConfig,
                          }),
                          'fetch',
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-2.5 py-1 text-xs font-medium text-[var(--portal-color-text)] hover:border-[var(--portal-color-primary)] transition-all cursor-pointer"
                    >
                      {copiedType === 'fetch' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {copiedType === 'fetch' ? t('response.copied') : t('response.copyFetch')}
                      </span>
                    </button>
                  </div>
                  <pre className="overflow-auto rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] p-4 font-mono text-xs text-[var(--portal-color-text)]">
                    {generateFetchCode({
                      method,
                      url: buildUrlWithParams(url, paramsList),
                      headers: headersList,
                      bodyType,
                      body: bodyText,
                      auth: authConfig,
                    })}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Drawer */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-4 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--portal-color-border)] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">
              {t('history.title')}
            </h3>
            <button
              type="button"
              onClick={() => {
                setHistory([]);
                localStorage.removeItem('portal_http_client_history');
              }}
              className="text-xs text-rose-500 hover:underline cursor-pointer"
            >
              {t('history.clear')}
            </button>
          </div>

          <div className="divide-y divide-[var(--portal-color-border)]/50">
            {history.map((h) => (
              <div
                key={h.id}
                onClick={() => {
                  setMethod(h.method);
                  handleUrlChange(h.url);
                }}
                className="flex items-center justify-between py-2 text-xs cursor-pointer hover:bg-[var(--portal-color-surface-alt)] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`font-mono font-bold ${methodColors[h.method]?.text || 'text-slate-500'}`}
                  >
                    {h.method}
                  </span>
                  <span className="font-mono text-[var(--portal-color-text)] truncate max-w-md">
                    {h.url}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {h.status !== undefined && (
                    <span
                      className={`font-semibold ${h.status >= 200 && h.status < 300 ? 'text-emerald-500' : 'text-amber-500'}`}
                    >
                      {h.status}
                    </span>
                  )}
                  {h.duration !== undefined && (
                    <span className="text-[var(--portal-color-text-tertiary)]">
                      {h.duration} ms
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
