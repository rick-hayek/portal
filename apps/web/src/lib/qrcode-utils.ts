/**
 * QR Code Data Formatting Utilities
 */

export type QrType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone' | 'sms';

export interface WifiData {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  url: string;
  address: string;
  note: string;
}

export interface EmailData {
  email: string;
  subject: string;
  body: string;
}

export interface PhoneData {
  phone: string;
}

export interface SmsData {
  phone: string;
  message: string;
}

/**
 * Escapes characters for Wi-Fi QR string (\, ;, ,, :)
 */
function escapeWifiString(str: string): string {
  return str.replace(/([\\;,":])/g, '\\$1');
}

/**
 * Formats data into standard protocol string based on QR type
 */
export function buildQrPayload(
  type: QrType,
  data: {
    url?: string;
    text?: string;
    wifi?: WifiData;
    vcard?: VCardData;
    email?: EmailData;
    phone?: PhoneData;
    sms?: SmsData;
  },
): string {
  switch (type) {
    case 'url': {
      const url = (data.url || '').trim();
      if (!url) return '';
      if (!/^https?:\/\//i.test(url) && !url.startsWith('//')) {
        return `https://${url}`;
      }
      return url;
    }
    case 'text':
      return data.text || '';
    case 'wifi': {
      const { ssid = '', password = '', encryption = 'WPA', hidden = false } = data.wifi || {};
      if (!ssid.trim()) return '';
      const encType = encryption === 'nopass' ? 'nopass' : encryption;
      let payload = `WIFI:T:${encType};S:${escapeWifiString(ssid)};`;
      if (encryption !== 'nopass' && password) {
        payload += `P:${escapeWifiString(password)};`;
      }
      if (hidden) {
        payload += 'H:true;';
      }
      payload += ';';
      return payload;
    }
    case 'vcard': {
      const v = data.vcard || {
        firstName: '',
        lastName: '',
        organization: '',
        title: '',
        phone: '',
        email: '',
        url: '',
        address: '',
        note: '',
      };
      const fullName =
        `${v.lastName}${v.firstName}`.trim() || `${v.firstName} ${v.lastName}`.trim();
      if (!fullName && !v.phone && !v.email && !v.organization) {
        return '';
      }
      const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
      if (v.lastName || v.firstName) {
        lines.push(`N:${v.lastName};${v.firstName};;;`);
      }
      if (fullName) {
        lines.push(`FN:${fullName}`);
      }
      if (v.organization) {
        lines.push(`ORG:${v.organization}`);
      }
      if (v.title) {
        lines.push(`TITLE:${v.title}`);
      }
      if (v.phone) {
        lines.push(`TEL;TYPE=CELL:${v.phone}`);
      }
      if (v.email) {
        lines.push(`EMAIL;TYPE=WORK:${v.email}`);
      }
      if (v.url) {
        lines.push(`URL:${v.url}`);
      }
      if (v.address) {
        lines.push(`ADR;TYPE=WORK:;;${v.address.replace(/\n/g, ' ')};;;;`);
      }
      if (v.note) {
        lines.push(`NOTE:${v.note.replace(/\n/g, ' ')}`);
      }
      lines.push('END:VCARD');
      return lines.join('\n');
    }
    case 'email': {
      const { email = '', subject = '', body = '' } = data.email || {};
      if (!email.trim()) return '';
      const params = new URLSearchParams();
      if (subject) params.set('subject', subject);
      if (body) params.set('body', body);
      const query = params.toString();
      return `mailto:${email.trim()}${query ? `?${query}` : ''}`;
    }
    case 'phone': {
      const phone = (data.phone?.phone || '').trim();
      if (!phone) return '';
      return `tel:${phone}`;
    }
    case 'sms': {
      const { phone = '', message = '' } = data.sms || {};
      if (!phone.trim()) return '';
      return `smsto:${phone.trim()}:${message}`;
    }
    default:
      return '';
  }
}
