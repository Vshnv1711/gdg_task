import type { FC } from 'react';
import type { QRConfig } from '../types';
import { PRESETS } from '../utils/presets';
import { Sparkles } from 'lucide-react';

interface PresetsSelectorProps {
  onApplyPreset: (presetConfig: Partial<QRConfig>) => void;
}

export const PresetsSelector: FC<PresetsSelectorProps> = ({ onApplyPreset }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white m-0">Designer Presets</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              Curated themes. Select one, then fine-tune any property in the customizer.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {PRESETS.map((preset) => {
          const cfg = preset.config;
          const isGradient = cfg.gradient?.enabled;
          const bg = cfg.bgColor || '#ffffff';
          const fg1 = isGradient ? cfg.gradient?.color1 : cfg.fgColor || '#000000';
          const fg2 = isGradient ? cfg.gradient?.color2 : fg1;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.config)}
              className="group relative flex flex-col items-start p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/80 transition-all text-left cursor-pointer"
            >
              {/* Mini visual swatch pill */}
              <div
                className="w-full h-8 rounded-lg mb-2 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 shadow-inner"
                style={{ backgroundColor: bg }}
              >
                <div
                  className="w-12 h-3.5 rounded-full shadow-xs"
                  style={{
                    background: isGradient
                      ? `linear-gradient(90deg, ${fg1}, ${fg2})`
                      : fg1,
                  }}
                />
              </div>

              <div className="w-full">
                <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block truncate">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 block">
                  {preset.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
