import { describe, it, expect, beforeEach } from 'vitest';
import { loadHistory, saveHistoryItem, deleteHistoryItem, clearHistory, getSavedTheme, setSavedTheme } from '../utils/storage';
import type { QRConfig, QRData } from '../types';

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const sampleConfig: QRConfig = {
    size: 280,
    margin: 12,
    errorCorrectionLevel: 'M',
    fgColor: '#000000',
    bgColor: '#ffffff',
    gradient: { enabled: false, type: 'linear', rotation: 0, color1: '#000', color2: '#000' },
    dotType: 'square',
    cornerSquareType: 'square',
    cornerSquareColor: '',
    cornerDotType: 'square',
    cornerDotColor: '',
    logoSize: 0.2,
    logoMargin: 6,
    hideBackgroundDots: true,
    frame: { style: 'none', text: 'SCAN ME', color: '#000', textColor: '#fff' },
  };

  const sampleData: QRData = {
    type: 'url',
    url: 'https://gdgsrm.com',
    text: '',
    email: { email: '', subject: '', body: '' },
    phone: { phone: '' },
    wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
    sms: { phone: '', message: '' },
    vcard: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      company: '',
      jobTitle: '',
      website: '',
      address: '',
    },
    upi: {
      pa: 'merchant@okhdfcbank',
      pn: 'GDG SRM',
      am: '100',
      tn: 'Payment',
    },
    location: {
      query: 'SRM IST',
      lat: '',
      lng: '',
    },
    event: {
      title: 'Dev Summit',
      location: 'Campus',
      startDateTime: '2026-10-15T10:00',
      endDateTime: '2026-10-15T18:00',
      description: 'Event',
    },
  };

  it('starts with an empty history list', () => {
    expect(loadHistory()).toEqual([]);
  });

  it('saves an item and retrieves it', () => {
    saveHistoryItem('GDG Website', 'https://gdgsrm.com', sampleData, sampleConfig);
    const history = loadHistory();
    expect(history.length).toBe(1);
    expect(history[0].title).toBe('GDG Website');
    expect(history[0].payload).toBe('https://gdgsrm.com');
  });

  it('deletes an item by id', () => {
    saveHistoryItem('Item 1', 'https://one.com', sampleData, sampleConfig);
    const history = loadHistory();
    const id = history[0].id;

    const remaining = deleteHistoryItem(id);
    expect(remaining.length).toBe(0);
    expect(loadHistory().length).toBe(0);
  });

  it('clears all history', () => {
    saveHistoryItem('Item 1', 'https://one.com', sampleData, sampleConfig);
    saveHistoryItem('Item 2', 'https://two.com', sampleData, sampleConfig);
    expect(loadHistory().length).toBe(2);

    clearHistory();
    expect(loadHistory().length).toBe(0);
  });

  it('saves and restores theme preferences', () => {
    expect(getSavedTheme()).toBe('system');
    setSavedTheme('dark');
    expect(getSavedTheme()).toBe('dark');
    setSavedTheme('light');
    expect(getSavedTheme()).toBe('light');
  });
});
