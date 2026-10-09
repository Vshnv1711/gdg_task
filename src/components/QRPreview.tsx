import { useEffect, useRef, useState, type FC } from 'react';
import type { QRConfig, QRData, MockupMode } from '../types';
import QRCodeStyling from 'qr-code-styling';
import jsQR from 'jsqr';
import { Download, Copy, Bookmark, Check, ZoomIn, ZoomOut, Scan, Sparkles, Smartphone, CreditCard, Ticket, Coffee, Tag, Maximize2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExportModal } from './ExportModal';
import { QRFrameWrapper } from './QRFrameWrapper';
import { playLaserScanSound, playSuccessChime, playTactileClick } from '../utils/sound';

interface QRPreviewProps {
  payload: string;
  config: QRConfig;
  qrData: QRData;
  onUpdateScannability: (isDecodable: boolean, decodedContent?: string) => void;
  onSaveToHistory: (thumbnail?: string) => void;
  itemTitle: string;
}

export const QRPreview: FC<QRPreviewProps> = ({
  payload,
  config,
  qrData,
  onUpdateScannability,
  onSaveToHistory,
  itemTitle,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayScale, setDisplayScale] = useState(1);
  const [mockupMode, setMockupMode] = useState<MockupMode>('canvas');
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<string | null>(null);

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
        console.warn('Scan test skipped:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [config, payload]);

  const handleCopyImage = async () => {
    if (!qrCodeInstance.current) return;
    try {
      playTactileClick();
      const blob = await qrCodeInstance.current.getRawData('png');
      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert('Clipboard image copy is not supported in this browser environment.');
      }
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleSave = async () => {
    playTactileClick();
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
    playSuccessChime();
    setTimeout(() => setSaved(false), 2000);
  };

  const triggerLaserScanSimulation = () => {
    playLaserScanSound();
    setIsSimulatingScan(true);
    setSimulatedResult(null);

    setTimeout(() => {
      try {
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const decoded = jsQR(imageData.data, imageData.width, imageData.height);
            if (decoded) {
              playSuccessChime();
              setSimulatedResult(decoded.data);
            } else {
              setSimulatedResult('Decode failed: contrast too low or modules covered.');
            }
          }
        }
      } catch {
        setSimulatedResult(payload);
      }
      setIsSimulatingScan(false);
    }, 1200);
  };

  // Determine dynamic ambient aura glow color
  const auraColor1 = config.gradient.enabled ? config.gradient.color1 : config.fgColor;
  const auraColor2 = config.gradient.enabled ? config.gradient.color2 : config.fgColor;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm sticky top-20 transition-colors relative overflow-hidden">
      {/* Dynamic Ambient Aura Glow in background */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${auraColor1} 0%, ${auraColor2} 100%)`,
        }}
      />

      {/* Header with Title and Zoom */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 relative z-10">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white m-0 flex items-center gap-1.5">
            <span>Live Interactive Preview</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Synchronized rendering & context mockups</p>
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

      {/* Mockup Mode Segmented Selector */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Preview Mode & Real-World Mockup
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-100/80 dark:bg-slate-950/60 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          {[
            { id: 'canvas', label: 'Bare QR', icon: Maximize2 },
            { id: 'framed', label: 'CTA Frame', icon: Tag },
            { id: 'cafe-stand', label: 'Cafe Stand', icon: Coffee },
            { id: 'business-card', label: 'Biz Card', icon: CreditCard },
            { id: 'event-badge', label: 'Badge', icon: Ticket },
            { id: 'phone', label: 'Mobile', icon: Smartphone },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = mockupMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  playTactileClick();
                  setMockupMode(mode.id as MockupMode);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 mb-0.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* QR Canvas / Mockup Container */}
      <div className="w-full flex items-center justify-center p-6 sm:p-8 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative min-h-[340px] z-10">
        <div
          style={{
            transform: `scale(${displayScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease',
          }}
          className="flex items-center justify-center relative"
        >
          {/* Laser Sweep Line Overlay when simulating scan */}
          {isSimulatingScan && (
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_16px_#06b6d4] animate-bounce" />
            </div>
          )}

          {/* Real-World Mockup or Framed Wrapper */}
          <QRFrameWrapper
            mockupMode={mockupMode}
            config={config}
            qrData={qrData}
            cardRef={cardRef}
          >
            <div ref={qrRef} className="flex items-center justify-center" />
          </QRFrameWrapper>
        </div>
      </div>

      {/* Laser Scan Simulator Banner */}
      {simulatedResult && (
        <div className="mt-3 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between gap-2 z-10 relative">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-mono truncate">{simulatedResult}</span>
          </div>
          <button
            type="button"
            onClick={() => setSimulatedResult(null)}
            className="text-[10px] text-blue-600 hover:underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="mt-5 space-y-2.5 relative z-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setIsExportOpen(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:shadow-blue-500/35"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res</span>
          </button>

          <button
            type="button"
            onClick={triggerLaserScanSimulation}
            disabled={isSimulatingScan}
            title="Simulate smartphone laser scanner decode"
            className="px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Scan className={`w-4 h-4 ${isSimulatingScan ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyImage}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied PNG!' : 'Copy Image'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
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
