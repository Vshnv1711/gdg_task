import { useState } from 'react';
import type { QRConfig } from '../types';
import { Download, Copy, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCodeStyling from 'qr-code-styling';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeInstance: QRCodeStyling | null;
  payload: string;
  config: QRConfig;
  defaultName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  qrCodeInstance,
  payload,
  config,
  defaultName,
}) => {
  const [format, setFormat] = useState<'png' | 'svg' | 'jpeg' | 'webp'>('png');
  const [scale, setScale] = useState<number>(1000); // default high resolution (1000px)
  const [fileName, setFileName] = useState(defaultName || 'qrcode');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#2563eb', '#7c3aed', '#059669', '#f59e0b'],
    });
  };

  const handleDownload = async () => {
    if (!qrCodeInstance) return;
    setIsExporting(true);

    try {
      // Build a dedicated export instance with the user's selected resolution
      const exportInstance = new QRCodeStyling({
        width: scale,
        height: scale,
        data: payload || ' ',
        margin: Math.round((config.margin * scale) / config.size),
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

      await exportInstance.download({
        name: fileName.trim() || 'qr-code',
        extension: format,
      });

      triggerConfetti();
      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Download error:', err);
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!qrCodeInstance) return;
    try {
      const blob = await qrCodeInstance.getRawData('png');
      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        triggerConfetti();
        setTimeout(() => setCopied(false), 2500);
      } else {
        alert('Direct image copy to clipboard is not supported in this browser.');
      }
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
      alert('Unable to copy image to clipboard.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
              Download QR Code
            </h3>
            <p className="text-xs text-slate-500 m-0">Choose file format and print resolution</p>
          </div>
        </div>

        {/* Format Selection */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            File Format
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['png', 'svg', 'jpeg', 'webp'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer ${
                  format === fmt
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Selection (for raster formats) */}
        {format !== 'svg' && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Export Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 500, label: 'Standard', desc: '500×500' },
                { val: 1000, label: 'HD 2x', desc: '1000×1000' },
                { val: 2000, label: 'Print 4x', desc: '2000×2000' },
              ].map((res) => (
                <button
                  key={res.val}
                  type="button"
                  onClick={() => setScale(res.val)}
                  className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    scale === res.val
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{res.label}</div>
                  <div className="text-[10px] opacity-70">{res.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* File Name */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            File Name
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="my-qr-code"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <span className="text-xs font-mono text-slate-500">.{format}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : `Download .${format.toUpperCase()}`}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyToClipboard}
            title="Copy high-res image to clipboard"
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
