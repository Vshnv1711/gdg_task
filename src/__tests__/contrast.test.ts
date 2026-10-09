import { describe, it, expect } from 'vitest';
import { hexToRgb, getRelativeLuminance, getContrastRatio, evaluateScannability } from '../utils/contrast';
import type { QRConfig } from '../types';

describe('Contrast and Scannability Evaluation', () => {
  it('correctly converts 3-character and 6-character hex strings to RGB', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('calculates relative luminance according to WCAG 2.1 specs', () => {
    expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 4);
    expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 4);
  });

  it('calculates contrast ratio correctly', () => {
    // Pure Black on Pure White should achieve the theoretical maximum 21:1
    const maxRatio = getContrastRatio('#000000', '#ffffff');
    expect(maxRatio).toBeCloseTo(21, 1);

    // Same colors should achieve 1:1
    const minRatio = getContrastRatio('#ffffff', '#ffffff');
    expect(minRatio).toBeCloseTo(1, 1);
  });

  it('detects inverted colors and low contrast', () => {
    const config: QRConfig = {
      size: 280,
      margin: 12,
      errorCorrectionLevel: 'M',
      fgColor: '#ffffff', // white on black (inverted)
      bgColor: '#000000',
      gradient: { enabled: false, type: 'linear', rotation: 0, color1: '#fff', color2: '#fff' },
      dotType: 'rounded',
      cornerSquareType: 'extra-rounded',
      cornerSquareColor: '',
      cornerDotType: 'dot',
      cornerDotColor: '',
      logoSize: 0.2,
      logoMargin: 6,
      hideBackgroundDots: true,
      frame: { style: 'none', text: 'SCAN ME', color: '#000', textColor: '#fff' },
    };

    const report = evaluateScannability(config, 50);
    expect(report.isInverted).toBe(true);
    expect(report.warnings.some((w) => w.includes('Inverted'))).toBe(true);
  });

  it('warns when logo is used with low error correction level', () => {
    const config: QRConfig = {
      size: 280,
      margin: 12,
      errorCorrectionLevel: 'L', // Low error correction
      fgColor: '#000000',
      bgColor: '#ffffff',
      gradient: { enabled: false, type: 'linear', rotation: 0, color1: '#000', color2: '#000' },
      dotType: 'square',
      cornerSquareType: 'square',
      cornerSquareColor: '',
      cornerDotType: 'square',
      cornerDotColor: '',
      logoUrl: 'data:image/svg+xml,...',
      logoSize: 0.25,
      logoMargin: 6,
      hideBackgroundDots: true,
      frame: { style: 'none', text: 'SCAN ME', color: '#000', textColor: '#fff' },
    };

    const report = evaluateScannability(config, 50);
    expect(report.warnings.some((w) => w.includes('Logo is present with low error correction'))).toBe(true);
    expect(report.suggestions.some((s) => s.includes('Set Error Correction level to "Q"'))).toBe(true);
  });
});
