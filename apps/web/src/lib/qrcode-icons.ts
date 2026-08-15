/**
 * Built-in Minimalist Outline Vector Icons for QR Code
 */

export interface BuiltinLogoDef {
  id: string;
  name: string;
  category: 'type' | 'social';
  paths: string;
}

export const BUILTIN_LOGOS: BuiltinLogoDef[] = [
  // QR Type default icons
  {
    id: 'globe',
    name: 'URL / 网址',
    category: 'type',
    paths:
      '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  },
  {
    id: 'text',
    name: 'Text / 文本',
    category: 'type',
    paths:
      '<line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/>',
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    category: 'type',
    paths:
      '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
  },
  {
    id: 'vcard',
    name: 'vCard / 名片',
    category: 'type',
    paths:
      '<path d="M18 21a6 6 0 0 0-12 0"/><circle cx="12" cy="11" r="4"/><rect width="18" height="18" x="3" y="3" rx="2"/>',
  },
  {
    id: 'mail',
    name: 'Email / 邮件',
    category: 'type',
    paths:
      '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  },
  {
    id: 'phone',
    name: 'Phone / 电话',
    category: 'type',
    paths:
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  },
  {
    id: 'sms',
    name: 'SMS / 短信',
    category: 'type',
    paths: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  },

  // Social & Popular icons
  {
    id: 'github',
    name: 'GitHub',
    category: 'social',
    paths:
      '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  },
  // {
  //   id: 'microsoft',
  //   name: 'Microsoft',
  //   category: 'social',
  //   paths:
  //     '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
  // },
  {
    id: 'x',
    name: 'X (Twitter)',
    category: 'social',
    paths:
      '<path d="M4 4l11.733 16h4.267l-11.733-16z"/><path d="M4 20l6.768-6.768m2.464-2.464l6.768-6.768"/>',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'social',
    paths: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    paths:
      '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'social',
    paths:
      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'social',
    paths: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'social',
    paths:
      '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3v6Z"/>',
  },
];

export const TAB_DEFAULT_LOGOS: Record<string, string> = {
  url: 'globe',
  text: 'text',
  wifi: 'wifi',
  vcard: 'vcard',
  email: 'mail',
  phone: 'phone',
  sms: 'sms',
};

export const LOGO_COLOR_PRESETS = [
  { name: 'Dark', color: '#0f172a' },
  { name: 'Primary', color: '#536746' },
  { name: 'Blue', color: '#2563eb' },
  { name: 'Indigo', color: '#4f46e5' },
  { name: 'Emerald', color: '#059669' },
  { name: 'Amber', color: '#d97706' },
  { name: 'Rose', color: '#e11d48' },
  { name: 'Purple', color: '#9333ea' },
];

/**
 * Builds a vector SVG data URL with a clean rounded background container and the icon paths.
 */
export function buildBuiltinLogoDataUrl(
  iconId: string,
  strokeColor = '#000000',
  fillBgColor = '#ffffff',
  showBorder = true,
): string {
  const item = BUILTIN_LOGOS.find((l) => l.id === iconId);
  if (!item) return '';

  const borderAttr = showBorder
    ? `stroke="${strokeColor}" stroke-width="3" stroke-opacity="0.15"`
    : 'stroke="none"';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="24" fill="${fillBgColor}" ${borderAttr}/>
  <g transform="translate(18, 18) scale(2.666)" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    ${item.paths}
  </g>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
