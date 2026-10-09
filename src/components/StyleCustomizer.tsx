import React, { useRef, useState } from 'react';
import type { QRConfig, DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel, FrameStyle } from '../types';
import { Palette, Shapes, Sliders, Image as ImageIcon, ShieldAlert, Sparkles, Upload, X, Pipette, Tag } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface StyleCustomizerProps {
  config: QRConfig;
  onChange: (config: QRConfig) => void;
}

const DOT_OPTIONS: { id: DotType; label: string; preview: string }[] = [
  { id: 'square', label: 'Square', preview: '■' },
  { id: 'rounded', label: 'Rounded', preview: '▢' },
  { id: 'dots', label: 'Dots', preview: '●' },
  { id: 'classy', label: 'Classy', preview: '◆' },
  { id: 'classy-rounded', label: 'Classy Round', preview: '❖' },
  { id: 'extra-rounded', label: 'Extra Soft', preview: '⏺' },
];

const CORNER_SQUARE_OPTIONS: { id: CornerSquareType; label: string }[] = [
  { id: 'square', label: 'Classic Square' },
  { id: 'extra-rounded', label: 'Rounded Frame' },
  { id: 'dot', label: 'Circle Frame' },
];

const CORNER_DOT_OPTIONS: { id: CornerDotType; label: string }[] = [
  { id: 'square', label: 'Square Dot' },
  { id: 'dot', label: 'Circular Dot' },
];

const FRAME_OPTIONS: { id: FrameStyle; label: string; desc: string }[] = [
  { id: 'none', label: 'No Frame', desc: 'Standard edge-to-edge QR matrix' },
  { id: 'banner-top', label: 'Top Header Banner', desc: 'Sleek call-to-action bar above the code' },
  { id: 'banner-bottom', label: 'Bottom Ribbon', desc: 'High-visibility marketing banner underneath' },
  { id: 'badge-pill', label: 'Floating Badge Pill', desc: 'Modern floating pill with CTA' },
  { id: 'polaroid', label: 'Polaroid Style', desc: 'Classic thick bottom card with handwritten look' },
  { id: 'minimal-tag', label: 'Minimalist Dot Tag', desc: 'Subtle clean tag line' },
];

const QUICK_COLORS = ['#000000', '#1e293b', '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#dc2626'];
const QUICK_BG_COLORS = ['#ffffff', '#f8fafc', '#f1f5f9', '#fefce8', '#f0fdf4', '#eff6ff', '#090d16', '#18181b'];

// Popular preset SVG logos
const PRESET_LOGOS = [
  {
    name: 'Google',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
  },
  {
    name: 'GitHub',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
  },
  {
    name: 'Wi-Fi',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/WiFi_Logo.svg',
  },
  {
    name: 'Globe',
    url: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/globe.svg',
  },
  {
    name: 'Instagram',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
  },
  {
    name: 'LinkedIn',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
  },
  {
    name: 'WhatsApp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
  },
];

export const StyleCustomizer: React.FC<StyleCustomizerProps> = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'shapes' | 'frame' | 'layout' | 'logo' | 'security'>('colors');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateConfig = (partial: Partial<QRConfig>) => {
    onChange({ ...config, ...partial });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Please choose an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const newLevel = config.errorCorrectionLevel === 'L' || config.errorCorrectionLevel === 'M' ? 'Q' : config.errorCorrectionLevel;
          updateConfig({ logoUrl: reader.result, errorCorrectionLevel: newLevel });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetLogo = (url: string) => {
    playTactileClick();
    const newLevel = config.errorCorrectionLevel === 'L' || config.errorCorrectionLevel === 'M' ? 'Q' : config.errorCorrectionLevel;
    updateConfig({ logoUrl: url, errorCorrectionLevel: newLevel });
  };

  const removeLogo = () => {
    playTactileClick();
    updateConfig({ logoUrl: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pickScreenColor = async (onColor: (color: string) => void) => {
    if (typeof window !== 'undefined' && (window as any).EyeDropper) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const res = await eyeDropper.open();
        if (res.sRGBHex) {
          playTactileClick();
          onColor(res.sRGBHex);
        }
      } catch {
        // user cancelled
      }
    }
  };

  const hasEyeDropper = typeof window !== 'undefined' && !!(window as any).EyeDropper;

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden transition-colors">
      {/* Tab navigation */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 overflow-x-auto scrollbar-none bg-slate-50/60 dark:bg-slate-950/40 p-1 gap-1">
        {[
          { id: 'colors', label: 'Colors & Gradient', icon: Palette },
          { id: 'shapes', label: 'Patterns & Eyes', icon: Shapes },
          { id: 'frame', label: 'Frames & CTA', icon: Tag },
          { id: 'layout', label: 'Size & Margin', icon: Sliders },
          { id: 'logo', label: 'Center Logo', icon: ImageIcon, badge: !!config.logoUrl },
          { id: 'security', label: 'Error Resilience', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playTactileClick();
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-6">
        {/* COLORS & GRADIENT TAB */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            {/* Gradient toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Enable Dual-Tone Gradient Matrix
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                  Blend colors seamlessly across the QR dots and corner eyes
                </p>
              </div>
              <input
                type="checkbox"
                id="gradient-toggle"
                checked={config.gradient.enabled}
                onChange={(e) => {
                  playTactileClick();
                  updateConfig({
                    gradient: { ...config.gradient, enabled: e.target.checked },
                  });
                }}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
            </div>

            {/* Gradient Controls or Solid Color */}
            {config.gradient.enabled ? (
              <div className="space-y-4 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Color 1 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Gradient Start Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.gradient.color1}
                        onChange={(e) =>
                          updateConfig({
                            gradient: { ...config.gradient, color1: e.target.value },
                          })
                        }
                        className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                      />
                      <input
                        type="text"
                        value={config.gradient.color1}
                        onChange={(e) =>
                          updateConfig({
                            gradient: { ...config.gradient, color1: e.target.value },
                          })
                        }
                        className="w-24 px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono uppercase bg-white dark:bg-slate-800"
                      />
                      {hasEyeDropper && (
                        <button
                          type="button"
                          onClick={() => pickScreenColor((c) => updateConfig({ gradient: { ...config.gradient, color1: c } }))}
                          title="Pick color from any screen pixel"
                          className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600"
                        >
                          <Pipette className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Color 2 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Gradient End Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.gradient.color2}
                        onChange={(e) =>
                          updateConfig({
                            gradient: { ...config.gradient, color2: e.target.value },
                          })
                        }
                        className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                      />
                      <input
                        type="text"
                        value={config.gradient.color2}
                        onChange={(e) =>
                          updateConfig({
                            gradient: { ...config.gradient, color2: e.target.value },
                          })
                        }
                        className="w-24 px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono uppercase bg-white dark:bg-slate-800"
                      />
                      {hasEyeDropper && (
                        <button
                          type="button"
                          onClick={() => pickScreenColor((c) => updateConfig({ gradient: { ...config.gradient, color2: c } }))}
                          title="Pick color from screen"
                          className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600"
                        >
                          <Pipette className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gradient angle */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Gradient Angle: {config.gradient.rotation}°
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">0° - 360°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={config.gradient.rotation}
                    onChange={(e) =>
                      updateConfig({
                        gradient: { ...config.gradient, rotation: Number(e.target.value) },
                      })
                    }
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <input
                    type="color"
                    value={config.fgColor}
                    onChange={(e) => updateConfig({ fgColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={config.fgColor}
                    onChange={(e) => updateConfig({ fgColor: e.target.value })}
                    className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800"
                  />
                  {hasEyeDropper && (
                    <button
                      type="button"
                      onClick={() => pickScreenColor((c) => updateConfig({ fgColor: c }))}
                      title="Pick color from screen"
                      className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <Pipette className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {/* Quick swatches */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        playTactileClick();
                        updateConfig({ fgColor: c });
                      }}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-lg border transition-transform hover:scale-110 cursor-pointer ${
                        config.fgColor.toLowerCase() === c.toLowerCase()
                          ? 'ring-2 ring-blue-500 ring-offset-2 border-transparent'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Background Color */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Background Canvas Color
              </label>
              <div className="flex items-center gap-2.5 mb-2.5">
                <input
                  type="color"
                  value={config.bgColor}
                  onChange={(e) => updateConfig({ bgColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  value={config.bgColor}
                  onChange={(e) => updateConfig({ bgColor: e.target.value })}
                  className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800"
                />
                {hasEyeDropper && (
                  <button
                    type="button"
                    onClick={() => pickScreenColor((c) => updateConfig({ bgColor: c }))}
                    title="Pick color from screen"
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <Pipette className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Quick BG swatches */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_BG_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      updateConfig({ bgColor: c });
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-lg border transition-transform hover:scale-110 cursor-pointer ${
                      config.bgColor.toLowerCase() === c.toLowerCase()
                        ? 'ring-2 ring-blue-500 ring-offset-2 border-transparent'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SHAPES & PATTERNS TAB */}
        {activeTab === 'shapes' && (
          <div className="space-y-5">
            {/* Body Dot Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                QR Data Dot Pattern
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DOT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      updateConfig({ dotType: opt.id });
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      config.dotType === opt.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base text-blue-600 dark:text-blue-400">{opt.preview}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Square Frame */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Corner Eye Frame Shape
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CORNER_SQUARE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      updateConfig({ cornerSquareType: opt.id });
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                      config.cornerSquareType === opt.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Dot */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Corner Eye Inner Dot Shape
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CORNER_DOT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      updateConfig({ cornerDotType: opt.id });
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                      config.cornerDotType === opt.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Colors */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Eye Accent Colors (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] text-slate-500 mb-1">Outer Eye Frame</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.cornerSquareColor || config.fgColor}
                      onChange={(e) => updateConfig({ cornerSquareColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => updateConfig({ cornerSquareColor: '' })}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                    >
                      Match FG
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-500 mb-1">Inner Eye Center</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.cornerDotColor || config.fgColor}
                      onChange={(e) => updateConfig({ cornerDotColor: e.target.value })}
                      className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => updateConfig({ cornerDotColor: '' })}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                    >
                      Match FG
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FRAMES & CTA TAB */}
        {activeTab === 'frame' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Marketing Frame Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FRAME_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      updateConfig({ frame: { ...config.frame, style: opt.id } });
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      config.frame.style === opt.id
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs mb-0.5">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {config.frame.style !== 'none' && (
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Frame Call-To-Action (CTA) Text
                  </label>
                  <input
                    type="text"
                    value={config.frame.text}
                    onChange={(e) => updateConfig({ frame: { ...config.frame, text: e.target.value } })}
                    placeholder="SCAN ME"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Frame Banner Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.frame.color}
                        onChange={(e) => updateConfig({ frame: { ...config.frame, color: e.target.value } })}
                        className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                      />
                      <input
                        type="text"
                        value={config.frame.color}
                        onChange={(e) => updateConfig({ frame: { ...config.frame, color: e.target.value } })}
                        className="w-24 px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono uppercase bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Frame Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.frame.textColor}
                        onChange={(e) => updateConfig({ frame: { ...config.frame, textColor: e.target.value } })}
                        className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                      />
                      <input
                        type="text"
                        value={config.frame.textColor}
                        onChange={(e) => updateConfig({ frame: { ...config.frame, textColor: e.target.value } })}
                        className="w-24 px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono uppercase bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LAYOUT & SIZE TAB */}
        {activeTab === 'layout' && (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Preview Size: {config.size}px
                </span>
                <span className="text-slate-400 text-[11px]">200px - 600px</span>
              </div>
              <input
                type="range"
                min="200"
                max="600"
                step="10"
                value={config.size}
                onChange={(e) => updateConfig({ size: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Quiet Zone Margin: {config.margin}px
                </span>
                <span className="text-slate-400 text-[11px]">0px - 40px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={config.margin}
                onChange={(e) => updateConfig({ margin: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* LOGO & CENTER TAB */}
        {activeTab === 'logo' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Upload Custom Logo / Icon
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload-input"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Choose Image File...</span>
                </button>

                {config.logoUrl && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Preset logos */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Or Pick a Preset Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_LOGOS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectPresetLogo(item.url)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer shadow-2xs"
                  >
                    <img src={item.url} alt={item.name} className="w-4 h-4 object-contain" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {config.logoUrl && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Logo Size: {Math.round(config.logoSize * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.35"
                    step="0.02"
                    value={config.logoSize}
                    onChange={(e) => updateConfig({ logoSize: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Logo Clear Margin: {config.logoMargin}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="2"
                    value={config.logoMargin}
                    onChange={(e) => updateConfig({ logoMargin: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="hide-bg-dots"
                    checked={config.hideBackgroundDots}
                    onChange={(e) => updateConfig({ hideBackgroundDots: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="hide-bg-dots" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    Clear matrix dots underneath logo
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECURITY & ERROR CORRECTION TAB */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Error Correction Level
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { level: 'L', label: 'Low (~7%)', desc: 'Minimal data redundancy, cleanest visual code' },
                { level: 'M', label: 'Medium (~15%)', desc: 'Standard balance for general use' },
                { level: 'Q', label: 'Quartile (~25%)', desc: 'Recommended when adding logos or decals' },
                { level: 'H', label: 'High (~30%)', desc: 'Maximum durability against tears or heavy logos' },
              ].map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    updateConfig({ errorCorrectionLevel: item.level as ErrorCorrectionLevel });
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    config.errorCorrectionLevel === item.level
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs mb-0.5 text-blue-600 dark:text-blue-400">
                    Level {item.level} - {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
