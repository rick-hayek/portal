'use client';

import {
  AlignLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  Globe,
  Mail,
  MessageSquare,
  Palette,
  Phone,
  QrCode,
  Sparkles,
  Trash2,
  Upload,
  UserSquare2,
  Wifi,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import type React from 'react';
import { useMemo, useRef, useState } from 'react';
import { ToolHeader } from '@/components/tools/ToolHeader';
import {
  BUILTIN_LOGOS,
  buildBuiltinLogoDataUrl,
  LOGO_COLOR_PRESETS,
  TAB_DEFAULT_LOGOS,
} from '@/lib/qrcode-icons';
import {
  buildQrPayload,
  type EmailData,
  type PhoneData,
  type QrType,
  type SmsData,
  type VCardData,
  type WifiData,
} from '@/lib/qrcode-utils';

const COLOR_PRESETS = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Midnight', fg: '#0f172a', bg: '#f8fafc' },
  { name: 'Indigo', fg: '#3730a3', bg: '#eef2ff' },
  { name: 'Emerald', fg: '#065f46', bg: '#f0fdf4' },
  { name: 'Sunset', fg: '#9a3412', bg: '#fff7ed' },
  { name: 'Dark Mode', fg: '#f8fafc', bg: '#0f172a' },
];

export default function QrCodePage() {
  const t = useTranslations('ToolsQrcode');

  const [activeTab, setActiveTab] = useState<QrType>('url');

  // Input states
  const [url, setUrl] = useState('https://');
  const [text, setText] = useState('');
  const [wifi, setWifi] = useState<WifiData>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
  });
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [vcard, setVcard] = useState<VCardData>({
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    url: '',
    address: '',
    note: '',
  });
  const [email, setEmail] = useState<EmailData>({
    email: '',
    subject: '',
    body: '',
  });
  const [phone, setPhone] = useState<PhoneData>({ phone: '' });
  const [sms, setSms] = useState<SmsData>({ phone: '', message: '' });

  // Customization states
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isTransparent, setIsTransparent] = useState(false);
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('Q');
  const [includeMargin, setIncludeMargin] = useState(true);
  const [showStyleSettings, setShowStyleSettings] = useState(false);

  // Logo state: defaults to 'globe' for the initial 'url' tab
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>('globe');
  const [logoColor, setLogoColor] = useState<string>('#0f172a');
  const [logoBgColor, setLogoBgColor] = useState<string>('#ffffff');
  const [showLogoBorder, setShowLogoBorder] = useState<boolean>(true);
  const [customLogoSrc, setCustomLogoSrc] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(22);
  const [excavateLogo, setExcavateLogo] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export resolution
  const [exportRes, setExportRes] = useState<number>(1024);

  // Feedback states
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  // Switch tab and automatically select corresponding default logo
  const handleTabChange = (tab: QrType) => {
    setActiveTab(tab);
    const defaultLogo = TAB_DEFAULT_LOGOS[tab];
    if (defaultLogo) {
      setSelectedLogoId(defaultLogo);
      if (level === 'L' || level === 'M') {
        setLevel('Q');
      }
    }
  };

  // Toggle logo selection: clicking active logo deselects & removes it
  const handleSelectLogo = (logoId: string) => {
    if (selectedLogoId === logoId) {
      // Deselect and remove logo from QR
      setSelectedLogoId(null);
    } else {
      setSelectedLogoId(logoId);
      if (level === 'L' || level === 'M') {
        setLevel('Q');
      }
    }
  };

  // Upload custom logo
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size exceeds 2MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogoSrc(event.target?.result as string);
        setSelectedLogoId('custom');
        if (level === 'L' || level === 'M') {
          setLevel('Q');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear logo completely
  const handleRemoveLogo = () => {
    setSelectedLogoId(null);
    setCustomLogoSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Compute QR Payload
  const payload = useMemo(() => {
    return buildQrPayload(activeTab, {
      url,
      text,
      wifi,
      vcard,
      email,
      phone,
      sms,
    });
  }, [activeTab, url, text, wifi, vcard, email, phone, sms]);

  // Compute final logo image URI
  const logoImageSrc = useMemo(() => {
    if (!selectedLogoId) return null;
    if (selectedLogoId === 'custom') {
      return customLogoSrc;
    }
    return buildBuiltinLogoDataUrl(selectedLogoId, logoColor, logoBgColor, showLogoBorder);
  }, [selectedLogoId, customLogoSrc, logoColor, logoBgColor, showLogoBorder]);

  const qrImageSettings = useMemo(() => {
    if (!logoImageSrc) return undefined;
    const logoPx = Math.round((280 * logoSizePercent) / 100);
    return {
      src: logoImageSrc,
      height: logoPx,
      width: logoPx,
      excavate: excavateLogo,
    };
  }, [logoImageSrc, logoSizePercent, excavateLogo]);

  const handleDownloadPng = () => {
    if (!payload) return;
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = exportRes;
    offscreenCanvas.height = exportRes;
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, exportRes, exportRes);

    const a = document.createElement('a');
    a.download = `qrcode_${activeTab}_${Date.now()}.png`;
    a.href = offscreenCanvas.toDataURL('image/png');
    a.click();
  };

  const handleDownloadSvg = () => {
    if (!payload) return;
    const svgElement = svgRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.download = `qrcode_${activeTab}_${Date.now()}.svg`;
    a.href = blobUrl;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleCopyImage = async () => {
    if (!payload) return;
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      });
    } catch (err) {
      console.error('Failed to copy QR code image', err);
    }
  };

  const handleCopyPayload = async () => {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } catch (err) {
      console.error('Failed to copy payload', err);
    }
  };

  const tabs: { id: QrType; label: string; icon: React.ReactNode }[] = [
    { id: 'url', label: t('tabs.url'), icon: <Globe className="h-4 w-4" /> },
    { id: 'text', label: t('tabs.text'), icon: <AlignLeft className="h-4 w-4" /> },
    { id: 'wifi', label: t('tabs.wifi'), icon: <Wifi className="h-4 w-4" /> },
    { id: 'vcard', label: t('tabs.vcard'), icon: <UserSquare2 className="h-4 w-4" /> },
    { id: 'email', label: t('tabs.email'), icon: <Mail className="h-4 w-4" /> },
    { id: 'phone', label: t('tabs.phone'), icon: <Phone className="h-4 w-4" /> },
    { id: 'sms', label: t('tabs.sms'), icon: <MessageSquare className="h-4 w-4" /> },
  ];

  const typeLogos = BUILTIN_LOGOS.filter((l) => l.category === 'type');
  const socialLogos = BUILTIN_LOGOS.filter((l) => l.category === 'social');

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8 pb-12">
      <ToolHeader
        title={t('title')}
        description={t('description')}
        icon={<QrCode className="h-6 w-6" />}
        iconBgColor="bg-[rgba(168,85,247,0.1)] text-purple-500"
      />

      {/* Main Container */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
        {/* Left Column: Types & Inputs & Logo & Styling */}
        <div className="space-y-6 min-w-0">
          {/* Material / Type Selector Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] shadow-xs">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--portal-color-primary)] text-white shadow-xs'
                      : 'text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Input Card */}
          <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5 sm:p-6 shadow-sm space-y-4">
            {/* URL Input */}
            {activeTab === 'url' && (
              <label className="block space-y-2">
                <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                  {t('url.label')}
                </span>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('url.placeholder')}
                  className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2.5 text-sm font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] focus:ring-1 focus:ring-[var(--portal-color-primary)] transition-all"
                />
              </label>
            )}

            {/* Plain Text Input */}
            {activeTab === 'text' && (
              <label className="block space-y-2">
                <div className="flex justify-between items-center">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                    {t('text.label')}
                  </span>
                  <span className="text-[11px] text-[var(--portal-color-text-tertiary)]">
                    {text.length} {t('preview.charCount')}
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('text.placeholder')}
                  className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] p-3.5 text-sm font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] focus:ring-1 focus:ring-[var(--portal-color-primary)] transition-all resize-y"
                />
              </label>
            )}

            {/* Wi-Fi Input */}
            {activeTab === 'wifi' && (
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                    {t('wifi.ssid')}
                  </span>
                  <input
                    type="text"
                    value={wifi.ssid}
                    onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                    placeholder={t('wifi.ssidPlaceholder')}
                    className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2.5 text-sm text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                  />
                </label>

                {wifi.encryption !== 'nopass' && (
                  <div className="space-y-2">
                    <label className="block space-y-2">
                      <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                        {t('wifi.password')}
                      </span>
                      <div className="relative">
                        <input
                          type={showWifiPassword ? 'text' : 'password'}
                          value={wifi.password}
                          onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                          placeholder={t('wifi.passwordPlaceholder')}
                          className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2.5 pr-10 text-sm font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowWifiPassword(!showWifiPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-text)] cursor-pointer"
                        >
                          {showWifiPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="block">
                    <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1.5">
                      {t('wifi.encryption')}
                    </span>
                    <select
                      value={wifi.encryption}
                      onChange={(e) =>
                        setWifi({
                          ...wifi,
                          encryption: e.target.value as 'WPA' | 'WEP' | 'nopass',
                        })
                      }
                      className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs text-[var(--portal-color-text)] outline-none cursor-pointer"
                    >
                      <option value="WPA">{t('wifi.encWpa')}</option>
                      <option value="WEP">{t('wifi.encWep')}</option>
                      <option value="nopass">{t('wifi.encNone')}</option>
                    </select>
                  </label>

                  <div className="flex items-center pt-6 sm:pt-5">
                    <label className="flex items-center gap-2 text-xs font-medium text-[var(--portal-color-text-secondary)] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={wifi.hidden}
                        onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                        className="h-4 w-4 rounded border-[var(--portal-color-border)] text-[var(--portal-color-primary)] accent-[var(--portal-color-primary)]"
                      />
                      <span>{t('wifi.hidden')}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* vCard Input */}
            {activeTab === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                      {t('vcard.lastName')}
                    </span>
                    <input
                      type="text"
                      value={vcard.lastName}
                      onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                      className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                      {t('vcard.firstName')}
                    </span>
                    <input
                      type="text"
                      value={vcard.firstName}
                      onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                      className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                      {t('vcard.organization')}
                    </span>
                    <input
                      type="text"
                      value={vcard.organization}
                      onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                      className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                      {t('vcard.title')}
                    </span>
                    <input
                      type="text"
                      value={vcard.title}
                      onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                      className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                      {t('vcard.phone')}
                    </span>
                    <input
                      type="tel"
                      value={vcard.phone}
                      onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                      className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                      {t('vcard.email')}
                    </span>
                    <input
                      type="email"
                      value={vcard.email}
                      onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                      className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                    {t('vcard.url')}
                  </span>
                  <input
                    type="url"
                    value={vcard.url}
                    onChange={(e) => setVcard({ ...vcard, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                    {t('vcard.address')}
                  </span>
                  <input
                    type="text"
                    value={vcard.address}
                    onChange={(e) => setVcard({ ...vcard, address: e.target.value })}
                    className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                  />
                </label>
              </div>
            )}

            {/* Email Input */}
            {activeTab === 'email' && (
              <div className="space-y-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                    {t('email.email')}
                  </span>
                  <input
                    type="email"
                    value={email.email}
                    onChange={(e) => setEmail({ ...email, email: e.target.value })}
                    placeholder={t('email.emailPlaceholder')}
                    className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                    {t('email.subject')}
                  </span>
                  <input
                    type="text"
                    value={email.subject}
                    onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                    placeholder={t('email.subjectPlaceholder')}
                    className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                    {t('email.body')}
                  </span>
                  <textarea
                    rows={3}
                    value={email.body}
                    onChange={(e) => setEmail({ ...email, body: e.target.value })}
                    placeholder={t('email.bodyPlaceholder')}
                    className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] p-3 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                  />
                </label>
              </div>
            )}

            {/* Phone Input */}
            {activeTab === 'phone' && (
              <label className="block space-y-2">
                <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                  {t('phone.label')}
                </span>
                <input
                  type="tel"
                  value={phone.phone}
                  onChange={(e) => setPhone({ phone: e.target.value })}
                  placeholder={t('phone.placeholder')}
                  className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2.5 text-sm font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                />
              </label>
            )}

            {/* SMS Input */}
            {activeTab === 'sms' && (
              <div className="space-y-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                    {t('sms.phone')}
                  </span>
                  <input
                    type="tel"
                    value={sms.phone}
                    onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                    placeholder={t('sms.phonePlaceholder')}
                    className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text)] mb-1">
                    {t('sms.message')}
                  </span>
                  <textarea
                    rows={3}
                    value={sms.message}
                    onChange={(e) => setSms({ ...sms, message: e.target.value })}
                    placeholder={t('sms.messagePlaceholder')}
                    className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] p-3 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)]"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Center Logo & Icons Card (位于样式定制上方) */}
          <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--portal-color-primary)]" />
                <h3 className="text-sm font-semibold text-[var(--portal-color-text)]">
                  {t('logoSection.title')}
                </h3>
              </div>
              {selectedLogoId && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{t('logoSection.removeLogo')}</span>
                </button>
              )}
            </div>

            <p className="text-xs text-[var(--portal-color-text-secondary)] -mt-2">
              {t('logoSection.subtitle')}
            </p>

            {/* Built-in Type Outline Icons */}
            <div className="space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--portal-color-text-tertiary)]">
                {t('logoSection.typeIcons')}
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {typeLogos.map((logo) => {
                  const isSelected = selectedLogoId === logo.id;
                  return (
                    <button
                      key={logo.id}
                      type="button"
                      onClick={() => handleSelectLogo(logo.id)}
                      title={`${logo.name} (${isSelected ? t('logoSection.deselectHint') : ''})`}
                      className={`relative flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--portal-color-primary)] bg-[var(--portal-color-primary-soft,#f0fdf4)] shadow-xs ring-2 ring-[var(--portal-color-primary)]/20'
                          : 'border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] text-[var(--portal-color-text)] hover:border-[var(--portal-color-primary)] hover:bg-[var(--portal-color-surface-alt)]'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        stroke={isSelected ? logoColor : 'currentColor'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        className="transition-transform group-hover:scale-110"
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: safe static SVG icon paths
                        dangerouslySetInnerHTML={{ __html: logo.paths }}
                      />
                      <span className="text-[10px] font-medium text-[var(--portal-color-text-secondary)] truncate max-w-full">
                        {logo.id}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--portal-color-primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Built-in Social Outline Icons */}
            <div className="space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--portal-color-text-tertiary)]">
                {t('logoSection.socialIcons')}
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {socialLogos.map((logo) => {
                  const isSelected = selectedLogoId === logo.id;
                  return (
                    <button
                      key={logo.id}
                      type="button"
                      onClick={() => handleSelectLogo(logo.id)}
                      title={`${logo.name} (${isSelected ? t('logoSection.deselectHint') : ''})`}
                      className={`relative flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--portal-color-primary)] bg-[var(--portal-color-primary-soft,#f0fdf4)] shadow-xs ring-2 ring-[var(--portal-color-primary)]/20'
                          : 'border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] text-[var(--portal-color-text)] hover:border-[var(--portal-color-primary)] hover:bg-[var(--portal-color-surface-alt)]'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        stroke={isSelected ? logoColor : 'currentColor'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        className="transition-transform group-hover:scale-110"
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: safe static SVG icon paths
                        dangerouslySetInnerHTML={{ __html: logo.paths }}
                      />
                      <span className="text-[10px] font-medium text-[var(--portal-color-text-secondary)] truncate max-w-full">
                        {logo.id}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--portal-color-primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Upload Section */}
            <div className="pt-2 border-t border-[var(--portal-color-border)]">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml"
                onChange={handleCustomLogoUpload}
                className="hidden"
              />

              {customLogoSrc ? (
                <div
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedLogoId === 'custom'
                      ? 'border-[var(--portal-color-primary)] bg-[var(--portal-color-primary-soft,#f0fdf4)] ring-2 ring-[var(--portal-color-primary)]/20'
                      : 'border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] hover:bg-[var(--portal-color-surface-alt)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectLogo('custom')}
                    className="flex-1 flex items-center gap-3 text-left cursor-pointer"
                  >
                    {/* biome-ignore lint/performance/noImgElement: Data URL preview */}
                    <img
                      src={customLogoSrc}
                      alt="Custom logo"
                      className="h-8 w-8 object-contain rounded-lg border border-[var(--portal-color-border)] bg-white p-0.5"
                    />
                    <span className="text-xs font-medium text-[var(--portal-color-text)]">
                      {selectedLogoId === 'custom'
                        ? t('logoSection.deselectHint')
                        : t('logoSection.uploadCustom')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[var(--portal-color-primary)] hover:underline cursor-pointer ml-3 px-2 py-1"
                  >
                    更换图片
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] py-2.5 text-xs font-medium text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-primary)] hover:border-[var(--portal-color-primary)] transition-all cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>{t('logoSection.uploadCustom')}</span>
                </button>
              )}
            </div>

            {/* Logo Settings & Color Palette (When a logo is selected) */}
            {selectedLogoId && (
              <div className="space-y-4 pt-3 border-t border-[var(--portal-color-border)] animate-in fade-in duration-200">
                {/* Icon Color Palette (for built-in outline icons) */}
                {selectedLogoId !== 'custom' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <span className="block text-xs font-semibold text-[var(--portal-color-text-secondary)]">
                        {t('logoSection.iconColor')}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {LOGO_COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setLogoColor(preset.color)}
                            className={`h-6 w-6 rounded-full border transition-transform cursor-pointer ${
                              logoColor === preset.color
                                ? 'scale-110 ring-2 ring-[var(--portal-color-primary)] ring-offset-2'
                                : 'hover:scale-105 border-black/10'
                            }`}
                            style={{ backgroundColor: preset.color }}
                            title={preset.name}
                          />
                        ))}
                        <div className="flex items-center gap-1 ml-2">
                          <input
                            type="color"
                            value={logoColor}
                            onChange={(e) => setLogoColor(e.target.value)}
                            className="h-6 w-6 rounded-md border border-[var(--portal-color-border)] cursor-pointer p-0"
                          />
                          <input
                            type="text"
                            value={logoColor}
                            onChange={(e) => setLogoColor(e.target.value)}
                            className="w-20 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-2 py-0.5 text-[11px] font-mono text-[var(--portal-color-text)] uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-xs font-semibold text-[var(--portal-color-text-secondary)]">
                        {t('logoSection.iconBgColor')}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={logoBgColor}
                          onChange={(e) => setLogoBgColor(e.target.value)}
                          className="h-6 w-6 rounded-md border border-[var(--portal-color-border)] cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          value={logoBgColor}
                          onChange={(e) => setLogoBgColor(e.target.value)}
                          className="w-20 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-2 py-0.5 text-[11px] font-mono text-[var(--portal-color-text)] uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Logo Size, Border and Excavate Controls */}
                <div className="space-y-3">
                  <label className="space-y-1 block">
                    <div className="flex justify-between text-xs text-[var(--portal-color-text-secondary)]">
                      <span className="font-semibold">{t('logoSection.logoSize')}</span>
                      <span>{logoSizePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={30}
                      value={logoSizePercent}
                      onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                      className="w-full accent-[var(--portal-color-primary)] cursor-pointer"
                    />
                  </label>

                  <div className="flex flex-wrap gap-4 pt-1">
                    {selectedLogoId !== 'custom' && (
                      <label className="flex items-center gap-2 text-xs font-medium text-[var(--portal-color-text)] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showLogoBorder}
                          onChange={(e) => setShowLogoBorder(e.target.checked)}
                          className="h-4 w-4 rounded border-[var(--portal-color-border)] text-[var(--portal-color-primary)] accent-[var(--portal-color-primary)]"
                        />
                        <span>{t('logoSection.showBorder')}</span>
                      </label>
                    )}

                    <label className="flex items-center gap-2 text-xs font-medium text-[var(--portal-color-text)] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={excavateLogo}
                        onChange={(e) => setExcavateLogo(e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--portal-color-border)] text-[var(--portal-color-primary)] accent-[var(--portal-color-primary)]"
                      />
                      <span>{t('logoSection.excavate')}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Style Customization Collapsible Panel (样式定制) */}
          <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setShowStyleSettings(!showStyleSettings)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-[var(--portal-color-text)] hover:bg-[var(--portal-color-bg)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-[var(--portal-color-primary)]" />
                <span>{t('customization.title')}</span>
              </div>
              {showStyleSettings ? (
                <ChevronUp className="h-4 w-4 text-[var(--portal-color-text-secondary)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--portal-color-text-secondary)]" />
              )}
            </button>

            {showStyleSettings && (
              <div className="p-5 pt-0 border-t border-[var(--portal-color-border)] space-y-5">
                {/* Color presets */}
                <div className="space-y-2 pt-4">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text-secondary)]">
                    Color Presets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setFgColor(preset.fg);
                          setBgColor(preset.bg);
                          setIsTransparent(false);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--portal-color-border)] px-2.5 py-1 text-xs font-medium text-[var(--portal-color-text)] hover:border-[var(--portal-color-primary)] transition-all cursor-pointer"
                      >
                        <div
                          className="h-3 w-3 rounded-full border border-black/10"
                          style={{
                            background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`,
                          }}
                        />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1.5">
                    <span className="block text-xs font-semibold text-[var(--portal-color-text-secondary)]">
                      {t('customization.fgColor')}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="h-8 w-8 rounded-lg border border-[var(--portal-color-border)] cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-2.5 py-1 text-xs font-mono text-[var(--portal-color-text)] uppercase"
                      />
                    </div>
                  </label>

                  <label className="block space-y-1.5">
                    <span className="block text-xs font-semibold text-[var(--portal-color-text-secondary)]">
                      {t('customization.bgColor')}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        disabled={isTransparent}
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-8 w-8 rounded-lg border border-[var(--portal-color-border)] cursor-pointer p-0.5 disabled:opacity-30"
                      />
                      <input
                        type="text"
                        disabled={isTransparent}
                        value={isTransparent ? 'Transparent' : bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-2.5 py-1 text-xs font-mono text-[var(--portal-color-text)] uppercase disabled:opacity-50"
                      />
                    </div>
                  </label>
                </div>

                {/* Transparent Background & Margin */}
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium text-[var(--portal-color-text)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isTransparent}
                      onChange={(e) => setIsTransparent(e.target.checked)}
                      className="h-4 w-4 rounded border-[var(--portal-color-border)] text-[var(--portal-color-primary)] accent-[var(--portal-color-primary)]"
                    />
                    <span>{t('customization.transparentBg')}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-[var(--portal-color-text)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeMargin}
                      onChange={(e) => setIncludeMargin(e.target.checked)}
                      className="h-4 w-4 rounded border-[var(--portal-color-border)] text-[var(--portal-color-primary)] accent-[var(--portal-color-primary)]"
                    />
                    <span>{t('customization.margin')}</span>
                  </label>
                </div>

                {/* Error Correction Level */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text-secondary)]">
                    {t('customization.level')}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevel(lvl)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          level === lvl
                            ? 'border-[var(--portal-color-primary)] bg-[var(--portal-color-primary)] text-white shadow-xs'
                            : 'border-[var(--portal-color-border)] text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]'
                        }`}
                      >
                        {lvl === 'L' && t('customization.levelL')}
                        {lvl === 'M' && t('customization.levelM')}
                        {lvl === 'Q' && t('customization.levelQ')}
                        {lvl === 'H' && t('customization.levelH')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live QR Preview & Actions */}
        <div className="sticky top-20 space-y-5 min-w-0">
          <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 shadow-sm flex flex-col items-center justify-center text-center min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--portal-color-text-tertiary)] mb-4">
              {t('preview.title')}
            </h2>

            {/* QR Code Canvas Box */}
            <div className="relative p-6 rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] flex items-center justify-center min-h-[300px] w-full overflow-hidden shadow-inner">
              {payload ? (
                <>
                  {/* Canvas for rendering, downloading PNG, and copy */}
                  <div ref={canvasRef} className="flex items-center justify-center">
                    <QRCodeCanvas
                      value={payload}
                      size={240}
                      bgColor={isTransparent ? 'transparent' : bgColor}
                      fgColor={fgColor}
                      level={level}
                      marginSize={includeMargin ? 2 : 0}
                      imageSettings={qrImageSettings}
                    />
                  </div>

                  {/* Hidden SVG for Vector Download */}
                  <div ref={svgRef} className="hidden">
                    <QRCodeSVG
                      value={payload}
                      size={512}
                      bgColor={isTransparent ? 'transparent' : bgColor}
                      fgColor={fgColor}
                      level={level}
                      marginSize={includeMargin ? 2 : 0}
                      imageSettings={qrImageSettings}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-[var(--portal-color-text-tertiary)] p-8">
                  <QrCode className="h-12 w-12 opacity-20" />
                  <p className="text-xs">{t('preview.empty')}</p>
                </div>
              )}
            </div>

            {/* Payload preview snippet (允许换行、折叠/滚动展示) */}
            {payload && (
              <div className="w-full mt-3 flex flex-col gap-1.5 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] p-3 text-left">
                <div className="flex items-center justify-between gap-2 border-b border-[var(--portal-color-border)]/60 pb-1.5 text-[11px] text-[var(--portal-color-text-tertiary)]">
                  <span className="font-semibold">{t('preview.payloadPreview')}</span>
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="flex items-center gap-1 text-[var(--portal-color-primary)] hover:opacity-80 transition-opacity cursor-pointer font-medium"
                    title={t('preview.copyPayload')}
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">{t('preview.copiedPayload')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>{t('preview.copyPayload')}</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="max-h-28 overflow-y-auto font-mono text-[11px] text-[var(--portal-color-text-secondary)] leading-relaxed break-all whitespace-pre-wrap select-all">
                  {payload}
                </div>
              </div>
            )}

            {/* Export & Download Controls */}
            {payload && (
              <div className="w-full space-y-3 mt-5">
                {/* Resolution selector */}
                <div className="flex items-center justify-between text-xs text-[var(--portal-color-text-secondary)] px-1">
                  <span>{t('preview.resolution')}</span>
                  <div className="flex gap-1">
                    {[512, 1024, 2048].map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setExportRes(res)}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all cursor-pointer ${
                          exportRes === res
                            ? 'bg-[var(--portal-color-primary)] text-white'
                            : 'bg-[var(--portal-color-bg)] text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)]'
                        }`}
                      >
                        {res}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--portal-color-primary)] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{t('preview.downloadPng')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSvg}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-4 py-2.5 text-xs font-semibold text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{t('preview.downloadSvg')}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyImage}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--portal-color-border)] px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    copiedImage
                      ? 'bg-green-50 border-green-200 text-green-700 dark:bg-[rgba(20,83,45,0.2)] dark:border-green-800 dark:text-green-400'
                      : 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]'
                  }`}
                >
                  {copiedImage ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      <span>{t('preview.copiedImage')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{t('preview.copyImage')}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
