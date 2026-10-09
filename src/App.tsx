import { useState, useEffect, useMemo } from 'react';
import type { QRConfig, QRData, HistoryItem, ScannabilityReport } from './types';
import { Header } from './components/Header';
import { TypeSelector } from './components/TypeSelector';
import { InputForm } from './components/InputForm';
import { StyleCustomizer } from './components/StyleCustomizer';
import { PresetsSelector } from './components/PresetsSelector';
import { QRPreview } from './components/QRPreview';
import { ScannabilityBadge } from './components/ScannabilityBadge';
import { RecentHistory } from './components/RecentHistory';
import { QRScannerModal } from './components/QRScannerModal';
import { buildQRPayload, validateQRData, getQRSummary } from './utils/qrPayload';
import { evaluateScannability } from './utils/contrast';
import { loadHistory, saveHistoryItem, deleteHistoryItem, clearHistory, getSavedTheme, setSavedTheme } from './utils/storage';
import { ScanLine, ShieldCheck } from 'lucide-react';

const DEFAULT_CONFIG: QRConfig = {
  size: 280,
  margin: 12,
  errorCorrectionLevel: 'M',
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  gradient: {
    enabled: true,
    type: 'linear',
    rotation: 45,
    color1: '#1a73e8',
    color2: '#0d9488',
  },
  dotType: 'rounded',
  cornerSquareType: 'extra-rounded',
  cornerSquareColor: '#1a73e8',
  cornerDotType: 'dot',
  cornerDotColor: '#0d9488',
  logoSize: 0.22,
  logoMargin: 6,
  hideBackgroundDots: true,
  frame: {
    style: 'none',
    text: 'SCAN ME',
    color: '#1a73e8',
    textColor: '#ffffff',
  },
};

const DEFAULT_QR_DATA: QRData = {
  type: 'url',
  url: 'https://gdgsrm.com',
  text: 'Hello from Google Developer Groups on Campus SRM!',
  email: {
    email: 'technical@gdgsrm.com',
    subject: 'GDG SRM Recruitment Inquiry',
    body: 'Hi GDG SRM team, I am interested in the Technical Domain recruitment tasks.',
  },
  phone: {
    phone: '+919876543210',
  },
  wifi: {
    ssid: 'GDG_SRM_CAMPUS',
    password: 'WelcomeToGDG2026',
    encryption: 'WPA',
    hidden: false,
  },
  sms: {
    phone: '+919876543210',
    message: 'Hello from GDG SRM recruitment!',
  },
  vcard: {
    firstName: 'Alex',
    lastName: 'Sharma',
    phone: '+91 98765 43210',
    email: 'alex.sharma@gdgsrm.com',
    company: 'GDG on Campus SRM',
    jobTitle: 'Technical Lead',
    website: 'https://gdgsrm.com',
    address: 'SRM Institute of Science and Technology, Kattankulathur',
  },
  upi: {
    pa: 'gdgsrm@okhdfcbank',
    pn: 'GDG on Campus SRM',
    am: '199',
    tn: 'Tech Recruitment Registration',
  },
  location: {
    query: 'SRM Institute of Science and Technology, Kattankulathur, Chennai',
    lat: '12.8230',
    lng: '80.0454',
  },
  event: {
    title: 'GDG SRM Developer Summit 2026',
    location: 'TP Ganesan Auditorium, SRM IST',
    startDateTime: '2026-10-15T10:00',
    endDateTime: '2026-10-15T17:00',
    description: 'Annual flagship technical festival & hands-on workshops.',
  },
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = getSavedTheme();
    if (saved === 'dark') return 'dark';
    if (saved === 'light') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [qrData, setQrData] = useState<QRData>(DEFAULT_QR_DATA);
  const [config, setConfig] = useState<QRConfig>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [decoderResult, setDecoderResult] = useState<{ isDecodable?: boolean; decodedContent?: string }>({});
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Sync theme to HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setSavedTheme(theme);
  }, [theme]);

  // Global keyboard shortcuts (Ctrl+K to open Scanner)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsScannerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Build current payload string and validate
  const payload = useMemo(() => buildQRPayload(qrData), [qrData]);
  const validation = useMemo(() => validateQRData(qrData), [qrData]);
  const itemTitle = useMemo(() => getQRSummary(qrData), [qrData]);

  // Compute scannability
  const baseScannability = useMemo(() => evaluateScannability(config, payload.length), [config, payload]);
  const fullScannability: ScannabilityReport = useMemo(
    () => ({
      ...baseScannability,
      isDecodable: decoderResult.isDecodable,
      decodedContent: decoderResult.decodedContent,
    }),
    [baseScannability, decoderResult]
  );

  const handleUpdateConfig = (partial: Partial<QRConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleApplyPreset = (presetConfig: Partial<QRConfig>) => {
    setConfig((prev) => ({ ...prev, ...presetConfig }));
  };

  const handleSaveToHistory = (thumbnail?: string) => {
    const updated = saveHistoryItem(itemTitle, payload, qrData, config, thumbnail);
    setHistory(updated);
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setQrData(item.qrData);
    setConfig(item.config);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your saved QR code history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all customization settings and content to defaults?')) {
      setQrData(DEFAULT_QR_DATA);
      setConfig(DEFAULT_CONFIG);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onReset={handleReset}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner introduction for GDG Campus recruitment task */}
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 border border-blue-200/60 dark:border-blue-900/40 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
                GDG on Campus SRM
              </span>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                Technical Domain • Task 1
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-1.5 mb-0.5 tracking-tight">
              QR Code Generator & Designer Studio Pro
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 m-0 max-w-2xl">
              Real-world marketing mockups (cafe stand, tech card, event badge), dual-tone gradients, WCAG contrast analyzer, camera scanner HUD, and zero backend required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:border-blue-500 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <ScanLine className="w-3.5 h-3.5 text-blue-600" />
              <span>Camera HUD</span>
              <span className="text-[10px] font-mono opacity-60 ml-0.5">Ctrl+K</span>
            </button>
            <span className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% In-Browser</span>
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Controls & Input Form (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Type Selection */}
            <section>
              <TypeSelector
                selectedType={qrData.type}
                onSelectType={(t) => setQrData({ ...qrData, type: t })}
              />
            </section>

            {/* Step 2: Content Form */}
            <section>
              <InputForm
                data={qrData}
                onChange={setQrData}
                errors={validation.errors}
              />
            </section>

            {/* Step 3: Presets Gallery */}
            <section>
              <PresetsSelector
                onApplyPreset={handleApplyPreset}
              />
            </section>

            {/* Step 4: Visual Customizer */}
            <section>
              <StyleCustomizer
                config={config}
                onChange={setConfig}
              />
            </section>

            {/* Step 5: Recent History */}
            <section>
              <RecentHistory
                items={history}
                onRestore={handleRestoreHistory}
                onDelete={handleDeleteHistory}
                onClear={handleClearHistory}
              />
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky Preview & Reliability Diagnostics (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <QRPreview
              payload={payload}
              config={config}
              qrData={qrData}
              onUpdateScannability={(isDecodable, decodedContent) =>
                setDecoderResult({ isDecodable, decodedContent })
              }
              onSaveToHistory={handleSaveToHistory}
              itemTitle={itemTitle}
            />

            <ScannabilityBadge
              report={fullScannability}
              config={config}
              onUpdateConfig={handleUpdateConfig}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Crafted for</span>
            <strong className="text-slate-700 dark:text-slate-300">Google Developer Groups on Campus SRM</strong>
            <span>• Technical Domain Recruitments</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="mailto:technical@gdgsrm.com"
              className="hover:text-blue-600 transition-colors"
            >
              technical@gdgsrm.com
            </a>
            <span>•</span>
            <span>Client-side Web Application</span>
          </div>
        </div>
      </footer>

      {/* Scanner & Camera HUD Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
}
