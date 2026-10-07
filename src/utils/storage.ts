import type { HistoryItem, QRConfig, QRData } from '../types';

const STORAGE_KEY = 'gdg_qr_designer_history_v1';
const THEME_KEY = 'gdg_qr_designer_theme_v1';
const MAX_HISTORY = 20;

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load history from localStorage', err);
    return [];
  }
}

export function saveHistoryItem(
  title: string,
  payload: string,
  qrData: QRData,
  config: QRConfig,
  thumbnail?: string
): HistoryItem[] {
  try {
    const existing = loadHistory();
    // Filter out identical payload + title if recently saved to keep history fresh and non-redundant
    const filtered = existing.filter((item) => item.payload !== payload || item.title !== title);

    const newItem: HistoryItem = {
      id: `qr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      type: qrData.type,
      title,
      payload,
      config,
      qrData,
      thumbnail,
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save history item to localStorage', err);
    return loadHistory();
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const existing = loadHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history item', err);
    return loadHistory();
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history', err);
  }
}

export function getSavedTheme(): 'light' | 'dark' | 'system' {
  try {
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system') || 'system';
  } catch {
    return 'system';
  }
}

export function setSavedTheme(theme: 'light' | 'dark' | 'system'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error('Failed to save theme', err);
  }
}
