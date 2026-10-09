import { useState, type FC } from 'react';
import type { QRConfig } from '../types';
import { Download, Copy, Check, X, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCodeStyling from 'qr-code-styling';
import { playSuccessChime, playTactileClick } from '../utils/sound';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeInstance: QRCodeStyling | null;
  payload: string;
  config: QRConfig;
  defaultName: string;
}

export const ExportModal: FC<ExportModalProps> = ({
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
      particleCount: 70,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#2563eb', '#7c3aed', '#059669', '#f59e0b', '#ec4899'],
    });
  };

  const handleDownload = async () => {
    if (!qrCodeInstance) return;
    setIsExporting(true);
    playTactileClick();

    try {
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

      playSuccessChime();
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
      playTactileClick();
      const blob = await qrCodeInstance.getRawData('png');
      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        playSuccessChime();
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

  const handlePrint = () => {
    playTactileClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
              Export High-Res QR Code
            </h3>
            <p className="text-xs text-slate-500 m-0">Vector SVG, Ultra 4K PNG, or Print Sheet</p>
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
                onClick={() => {
                  playTactileClick();
                  setFormat(fmt);
                }}
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
                { val: 2000, label: 'Ultra 4x', desc: '2000×2000' },
              ].map((res) => (
                <button
                  key={res.val}
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setScale(res.val);
                  }}
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <span className="text-xs font-mono text-slate-500">.{format}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : `Download .${format.toUpperCase()}`}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              title="Copy image to clipboard"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="Print flyer or sticker sheet directly"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
