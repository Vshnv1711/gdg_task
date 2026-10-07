import type { QRConfig, ScannabilityReport } from '../types';

/**
 * Converts a hex color string (#fff or #ffffff) to RGB components [0..255]
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length < 6) {
    return { r: 0, g: 0, b: 0 };
  }
  const num = parseInt(clean.substring(0, 6), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates WCAG 2.1 relative luminance for an RGB color.
 * Returns a number in the range [0, 1].
 */
export function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates WCAG 2.1 contrast ratio between two hex colors.
 * Returns a value between 1 and 21.
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(color1));
  const lum2 = getRelativeLuminance(hexToRgb(color2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Evaluates the scannability of a QR code based on its styling and content payload.
 */
export function evaluateScannability(config: QRConfig, payloadLength: number): ScannabilityReport {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Determine effective foreground color (if gradient is enabled, check the worst contrast between colors)
  let effectiveFgColor = config.fgColor;
  let ratio = getContrastRatio(config.fgColor, config.bgColor);

  if (config.gradient.enabled) {
    const ratio1 = getContrastRatio(config.gradient.color1, config.bgColor);
    const ratio2 = getContrastRatio(config.gradient.color2, config.bgColor);
    ratio = Math.min(ratio1, ratio2);
    effectiveFgColor = ratio1 < ratio2 ? config.gradient.color1 : config.gradient.color2;
  }

  const fgLum = getRelativeLuminance(hexToRgb(effectiveFgColor));
  const bgLum = getRelativeLuminance(hexToRgb(config.bgColor));
  const isInverted = fgLum > bgLum;

  if (isInverted) {
    warnings.push('Inverted colors: Foreground is brighter than background. Many physical barcode scanners only scan dark-on-light codes.');
    suggestions.push('Consider using a darker foreground and lighter background for maximum hardware scanner compatibility.');
  }

  // Contrast check
  let score: ScannabilityReport['score'] = 'excellent';
  if (ratio < 2.5) {
    score = 'risky';
    warnings.push(`Critically low contrast (${ratio.toFixed(2)}:1). Cameras will struggle to distinguish modules.`);
    suggestions.push('Increase the contrast between foreground and background (minimum recommended: 4.5:1).');
  } else if (ratio < 4.5) {
    score = 'warning';
    warnings.push(`Low contrast (${ratio.toFixed(2)}:1). May fail in dim lighting or on glare-heavy phone screens.`);
    suggestions.push('Select a darker foreground or lighter background to achieve at least 4.5:1 contrast.');
  } else if (ratio < 7) {
    score = 'good';
  }

  // Logo & error correction check
  if (config.logoUrl) {
    if (config.errorCorrectionLevel === 'L' || config.errorCorrectionLevel === 'M') {
      if (score === 'excellent') score = 'warning';
      warnings.push(`Logo is present with low error correction (${config.errorCorrectionLevel}). Logo obscures modules.`);
      suggestions.push('Set Error Correction level to "Q" (25%) or "H" (30%) to guarantee scannability with a logo.');
    }
  }

  // Payload density check
  if (payloadLength > 250 && config.size < 260) {
    warnings.push('High data density for small display size. Modules may appear cramped.');
    suggestions.push('Increase QR size to 320px+ or shorten the payload for faster camera detection.');
  }

  // Margin check
  if (config.margin < 5) {
    warnings.push('Very small quiet zone (margin < 5px). Standard readers require margin to detect borders.');
    suggestions.push('Keep margin at 10px or higher for optimal framing.');
  }

  return {
    score,
    contrastRatio: Number(ratio.toFixed(2)),
    isInverted,
    warnings,
    suggestions,
  };
}
