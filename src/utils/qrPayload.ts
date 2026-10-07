import type { QRData } from '../types';

/**
 * Escapes characters for Wi-Fi QR code syntax:
 * \ -> \\
 * ; -> \;
 * , -> \,
 * : -> \:
 * " -> \"
 */
export function escapeWifiString(str: string): string {
  return str.replace(/([\\;,:"'])/g, '\\$1');
}

/**
 * Builds standard payload string for the selected QR code data
 */
export function buildQRPayload(data: QRData): string {
  switch (data.type) {
    case 'url': {
      const trimmed = data.url.trim();
      if (!trimmed) return '';
      if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
      }
      return trimmed;
    }

    case 'text':
      return data.text.trim();

    case 'email': {
      const email = data.email.email.trim();
      if (!email) return '';
      const params = new URLSearchParams();
      if (data.email.subject.trim()) params.append('subject', data.email.subject.trim());
      if (data.email.body.trim()) params.append('body', data.email.body.trim());
      const query = params.toString();
      return query ? `mailto:${email}?${query}` : `mailto:${email}`;
    }

    case 'phone': {
      const phone = data.phone.phone.trim();
      if (!phone) return '';
      return `tel:${phone}`;
    }

    case 'wifi': {
      const { ssid, password, encryption, hidden } = data.wifi;
      if (!ssid.trim()) return '';
      const enc = encryption === 'nopass' ? 'nopass' : encryption;
      const s = escapeWifiString(ssid.trim());
      const p = enc !== 'nopass' ? escapeWifiString(password) : '';
      const h = hidden ? 'true' : 'false';
      return `WIFI:T:${enc};S:${s};${p ? `P:${p};` : ''}H:${h};;`;
    }

    case 'sms': {
      const phone = data.sms.phone.trim();
      const message = data.sms.message.trim();
      if (!phone) return '';
      return message ? `smsto:${phone}:${message}` : `smsto:${phone}`;
    }

    case 'vcard': {
      const { firstName, lastName, phone, email, company, jobTitle, website, address } = data.vcard;
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName.trim()};${firstName.trim()};;;`,
        `FN:${[firstName.trim(), lastName.trim()].filter(Boolean).join(' ')}`,
      ];
      if (company.trim()) lines.push(`ORG:${company.trim()}`);
      if (jobTitle.trim()) lines.push(`TITLE:${jobTitle.trim()}`);
      if (phone.trim()) lines.push(`TEL;TYPE=CELL:${phone.trim()}`);
      if (email.trim()) lines.push(`EMAIL:${email.trim()}`);
      if (website.trim()) lines.push(`URL:${website.trim()}`);
      if (address.trim()) lines.push(`ADR:;;${address.trim()};;;;`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    default:
      return '';
  }
}

/**
 * Validates the inputs for the given QR code type.
 * Returns an array of error messages. If empty, input is valid.
 */
export function validateQRData(data: QRData): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  switch (data.type) {
    case 'url': {
      const trimmed = data.url.trim();
      if (!trimmed) {
        errors.url = 'URL cannot be empty';
      } else {
        const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i;
        if (!urlPattern.test(trimmed) && !trimmed.startsWith('localhost')) {
          errors.url = 'Please enter a valid website address (e.g. example.com or https://...)';
        }
      }
      break;
    }

    case 'text':
      if (!data.text.trim()) {
        errors.text = 'Text content cannot be empty';
      }
      break;

    case 'email': {
      const email = data.email.email.trim();
      if (!email) {
        errors.email = 'Recipient email address is required';
      } else {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          errors.email = 'Please enter a valid email address';
        }
      }
      break;
    }

    case 'phone': {
      const phone = data.phone.phone.trim();
      if (!phone) {
        errors.phone = 'Phone number is required';
      } else {
        const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{5,15}$/;
        if (!phonePattern.test(phone)) {
          errors.phone = 'Please enter a valid phone number (e.g., +1 234 567 8900)';
        }
      }
      break;
    }

    case 'wifi': {
      const { ssid, password, encryption } = data.wifi;
      if (!ssid.trim()) {
        errors.ssid = 'Network name (SSID) is required';
      }
      if (encryption === 'WPA' && password.length < 8) {
        errors.password = 'WPA/WPA2 passwords must be at least 8 characters';
      }
      break;
    }

    case 'sms': {
      const phone = data.sms.phone.trim();
      if (!phone) {
        errors.phone = 'Phone number is required';
      }
      break;
    }

    case 'vcard': {
      const { firstName, lastName, phone, email } = data.vcard;
      if (!firstName.trim() && !lastName.trim()) {
        errors.name = 'Please provide at least a first or last name';
      }
      if (email.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.trim())) {
          errors.email = 'Invalid email address';
        }
      }
      if (!phone.trim() && !email.trim()) {
        errors.contact = 'Provide at least a phone number or email address';
      }
      break;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates a human-friendly label for a QR data object
 */
export function getQRSummary(data: QRData): string {
  switch (data.type) {
    case 'url':
      return data.url ? `URL: ${data.url}` : 'Empty URL';
    case 'text':
      return data.text ? (data.text.length > 30 ? `Text: ${data.text.substring(0, 30)}...` : `Text: ${data.text}`) : 'Empty Text';
    case 'email':
      return data.email.email ? `Email: ${data.email.email}` : 'Empty Email';
    case 'phone':
      return data.phone.phone ? `Phone: ${data.phone.phone}` : 'Empty Phone';
    case 'wifi':
      return data.wifi.ssid ? `Wi-Fi: ${data.wifi.ssid}` : 'Empty Wi-Fi';
    case 'sms':
      return data.sms.phone ? `SMS: ${data.sms.phone}` : 'Empty SMS';
    case 'vcard': {
      const name = [data.vcard.firstName, data.vcard.lastName].filter(Boolean).join(' ');
      return name ? `Contact: ${name}` : 'Empty Contact Card';
    }
    default:
      return 'QR Code';
  }
}
