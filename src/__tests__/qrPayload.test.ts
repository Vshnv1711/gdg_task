import { describe, it, expect } from 'vitest';
import { buildQRPayload, validateQRData, escapeWifiString, getQRSummary } from '../utils/qrPayload';
import type { QRData } from '../types';

describe('QR Payload Utilities', () => {
  const baseData: QRData = {
    type: 'url',
    url: 'https://gdgsrm.com',
    text: 'Test message',
    email: { email: 'test@example.com', subject: 'Hello', body: 'World' },
    phone: { phone: '+1234567890' },
    wifi: { ssid: 'MyNetwork', password: 'secretPassword', encryption: 'WPA', hidden: false },
    sms: { phone: '+1234567890', message: 'Hello' },
    vcard: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      company: 'Acme Corp',
      jobTitle: 'Developer',
      website: 'https://example.com',
      address: '123 Main St',
    },
  };

  describe('buildQRPayload', () => {
    it('prepends https:// to URLs missing a protocol', () => {
      const payload = buildQRPayload({ ...baseData, type: 'url', url: 'gdgsrm.com' });
      expect(payload).toBe('https://gdgsrm.com');
    });

    it('preserves existing https:// and http:// protocols', () => {
      const payload1 = buildQRPayload({ ...baseData, type: 'url', url: 'https://gdgsrm.com' });
      expect(payload1).toBe('https://gdgsrm.com');

      const payload2 = buildQRPayload({ ...baseData, type: 'url', url: 'http://gdgsrm.com' });
      expect(payload2).toBe('http://gdgsrm.com');
    });

    it('formats plain text properly', () => {
      const payload = buildQRPayload({ ...baseData, type: 'text', text: 'Hello GDG SRM' });
      expect(payload).toBe('Hello GDG SRM');
    });

    it('formats mailto links with subject and body', () => {
      const payload = buildQRPayload({
        ...baseData,
        type: 'email',
        email: { email: 'team@gdgsrm.com', subject: 'Recruitment', body: 'Frontend Task' },
      });
      expect(payload).toBe('mailto:team@gdgsrm.com?subject=Recruitment&body=Frontend+Task');
    });

    it('formats telephone links properly', () => {
      const payload = buildQRPayload({ ...baseData, type: 'phone', phone: { phone: '+919876543210' } });
      expect(payload).toBe('tel:+919876543210');
    });

    it('formats Wi-Fi connection strings conforming to standard syntax', () => {
      const payload = buildQRPayload({
        ...baseData,
        type: 'wifi',
        wifi: { ssid: 'CampusNet', password: 'SecretKey123', encryption: 'WPA', hidden: false },
      });
      expect(payload).toBe('WIFI:T:WPA;S:CampusNet;P:SecretKey123;H:false;;');
    });

    it('handles open Wi-Fi networks (nopass)', () => {
      const payload = buildQRPayload({
        ...baseData,
        type: 'wifi',
        wifi: { ssid: 'OpenWifi', password: '', encryption: 'nopass', hidden: false },
      });
      expect(payload).toBe('WIFI:T:nopass;S:OpenWifi;H:false;;');
    });

    it('escapes special characters in Wi-Fi SSID and password', () => {
      expect(escapeWifiString('My;Wifi:Name"')).toBe('My\\;Wifi\\:Name\\"');
    });

    it('formats SMS strings correctly', () => {
      const payload = buildQRPayload({
        ...baseData,
        type: 'sms',
        sms: { phone: '+1234567890', message: 'Hello There' },
      });
      expect(payload).toBe('smsto:+1234567890:Hello There');
    });

    it('generates valid vCard 3.0 format', () => {
      const payload = buildQRPayload({ ...baseData, type: 'vcard' });
      expect(payload).toContain('BEGIN:VCARD');
      expect(payload).toContain('VERSION:3.0');
      expect(payload).toContain('FN:John Doe');
      expect(payload).toContain('TEL;TYPE=CELL:+1234567890');
      expect(payload).toContain('END:VCARD');
    });
  });

  describe('validateQRData', () => {
    it('validates URLs and catches invalid inputs', () => {
      const valid = validateQRData({ ...baseData, type: 'url', url: 'https://gdgsrm.com' });
      expect(valid.isValid).toBe(true);

      const empty = validateQRData({ ...baseData, type: 'url', url: '' });
      expect(empty.isValid).toBe(false);
      expect(empty.errors.url).toBeDefined();
    });

    it('validates email addresses', () => {
      const valid = validateQRData({
        ...baseData,
        type: 'email',
        email: { email: 'alex@example.com', subject: '', body: '' },
      });
      expect(valid.isValid).toBe(true);

      const invalid = validateQRData({
        ...baseData,
        type: 'email',
        email: { email: 'not-an-email', subject: '', body: '' },
      });
      expect(invalid.isValid).toBe(false);
      expect(invalid.errors.email).toBeDefined();
    });

    it('validates Wi-Fi password length for WPA encryption', () => {
      const valid = validateQRData({
        ...baseData,
        type: 'wifi',
        wifi: { ssid: 'HomeNet', password: 'eightchars', encryption: 'WPA', hidden: false },
      });
      expect(valid.isValid).toBe(true);

      const shortPass = validateQRData({
        ...baseData,
        type: 'wifi',
        wifi: { ssid: 'HomeNet', password: 'short', encryption: 'WPA', hidden: false },
      });
      expect(shortPass.isValid).toBe(false);
      expect(shortPass.errors.password).toBeDefined();
    });
  });

  describe('getQRSummary', () => {
    it('generates informative titles', () => {
      expect(getQRSummary({ ...baseData, type: 'url', url: 'https://gdgsrm.com' })).toBe('URL: https://gdgsrm.com');
      expect(getQRSummary({ ...baseData, type: 'wifi', wifi: { ...baseData.wifi, ssid: 'SRM_WIFI' } })).toBe('Wi-Fi: SRM_WIFI');
    });
  });
});
