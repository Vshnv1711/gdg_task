import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import type { QRConfig } from '../types';
import QRCodeStyling from 'qr-code-styling';
import jsQR from 'jsqr';
import { Download, Copy, Bookmark, Check, ZoomIn, ZoomOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExportModal } from './ExportModal';

interface QRPreviewProps {
  payload: string;
  config: QRConfig;
  onUpdateScannability: (isDecodable: boolean, decodedContent?: string) => void;
  onSaveToHistory: (thumbnail?: string) => void;
  itemTitle: string;
}

export const QRPreview: FC<QRPreviewProps> = ({
  payload,
  config,
  onUpdateScannability,
  onSaveToHistory,
  itemTitle,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayScale, setDisplayScale] = useState(1);

  // Initialize qrCodeInstance once
  useEffect(() => {
    const qr = new QRCodeStyling({
      width: config.size,
      height: config.size,
      data: payload || 'https://gdgsrm.com',
      margin: config.margin,
      image: config.logoUrl,
      dotsOptions: {
        type: config.dotType,
        color: config.gradient.enabled ? undefined : config.fgColor,
        gradient: config.gradient.enabled
          ? {
              type: config.gradient.type,
              rotation: (config.gradient.rotation * Math.PI) / 180,
              colorStops: [
                { offset: 0, color: config.gradient.color1 },
                { offset: 1, color: config.gradient.color2 },
              ],
            }
          : undefined,
      },
      backgroundOptions: {
        color: config.bgColor,
      },
      cornersSquareOptions: {
        type: config.cornerSquareType,
        color: config.cornerSquareColor || (config.gradient.enabled ? config.gradient.color1 : config.fgColor),
      },
      cornersDotOptions: {
        type: config.cornerDotType,
        color: config.cornerDotColor || (config.gradient.enabled ? config.gradient.color2 : config.fgColor),
      },
      imageOptions: {
        hideBackgroundDots: config.hideBackgroundDots,
        imageSize: config.logoSize,
        margin: config.logoMargin,
        crossOrigin: 'anonymous',
      },
      qrOptions: {
        errorCorrectionLevel: config.errorCorrectionLevel,
      },
    });

    qrCodeInstance.current = qr;

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qr.append(qrRef.current);
    }
  }, []);

  // Update QR Code on config or payload change
  useEffect(() => {
    if (!qrCodeInstance.current) return;

    qrCodeInstance.current.update({
      width: config.size,
      height: config.size,
      data: payload || ' ',
      margin: config.margin,
      image: config.logoUrl,
      dotsOptions: {
        type: config.dotType,
        color: config.gradient.enabled ? undefined : config.fgColor,
        gradient: config.gradient.enabled
          ? {
              type: config.gradient.type,
              rotation: (config.gradient.rotation * Math.PI) / 180,
              colorStops: [
                { offset: 0, color: config.gradient.color1 },
                { offset: 1, color: config.gradient.color2 },
              ],
            }
          : undefined,
      },
      backgroundOptions: {
        color: config.bgColor,
      },
      cornersSquareOptions: {
        type: config.cornerSquareType,
        color: config.cornerSquareColor || (config.gradient.enabled ? config.gradient.color1 : config.fgColor),
      },
      cornersDotOptions: {
        type: config.cornerDotType,
        color: config.cornerDotColor || (config.gradient.enabled ? config.gradient.color2 : config.fgColor),
      },
      imageOptions: {
        hideBackgroundDots: config.hideBackgroundDots,
        imageSize: config.logoSize,
        margin: config.logoMargin,
        crossOrigin: 'anonymous',
      },
      qrOptions: {
        errorCorrectionLevel: config.errorCorrectionLevel,
      },
    });

    // Test scan using jsQR on the rendered canvas
    const timer = setTimeout(() => {
      try {
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas && payload) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const decoded = jsQR(imageData.data, imageData.width, imageData.height);
            if (decoded) {
              onUpdateScannability(true, decoded.data);
            } else {
              onUpdateScannability(false);
            }
          }
        }
      } catch (err) {
        // In case of tainted canvas due to remote logo without CORS
        console.warn('Scan test skipped:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [config, payload]);

  const handleCopyImage = async () => {
    if (!qrCodeInstance.current) return;
    try {
      const blob = await qrCodeInstance.current.getRawData('png');
      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert('Clipboard image copy is not supported in this browser environment.');
      }
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleSave = async () => {
    let thumb: string | undefined;
    try {
      const canvas = qrRef.current?.querySelector('canvas');
      if (canvas) {
        thumb = canvas.toDataURL('image/png', 0.5);
      }
    } catch {
      // ignore
    }
    onSaveToHistory(thumb);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs sticky top-20 transition-colors">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white m-0 flex items-center gap-1.5">
            <span>Live QR Preview</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Real-time synchronized canvas</p>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDisplayScale((s) => Math.max(0.7, s - 0.1))}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDisplayScale(1)}
            className="text-[11px] font-mono px-1.5 py-0.5 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
            title="Reset zoom"
          >
            {Math.round(displayScale * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setDisplayScale((s) => Math.min(1.4, s + 0.1))}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QR Canvas Container */}
      <div className="w-full flex items-center justify-center p-6 bg-slate-100/60 dark:bg-slate-950/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative min-h-[320px]">
        <div
          style={{
            transform: `scale(${displayScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease',
          }}
          className="shadow-xl rounded-2xl overflow-hidden flex items-center justify-center"
        >
          <div ref={qrRef} className="flex items-center justify-center" />
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          onClick={() => setIsExportOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download QR Code</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyImage}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied PNG!' : 'Copy Image'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved to History!' : 'Save to History'}</span>
          </button>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        qrCodeInstance={qrCodeInstance.current}
        payload={payload}
        config={config}
        defaultName={itemTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}
      />
    </div>
  );
};
