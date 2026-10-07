import type { ScannabilityReport, QRConfig } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Wrench } from 'lucide-react';

interface ScannabilityBadgeProps {
  report: ScannabilityReport;
  config: QRConfig;
  onUpdateConfig: (partial: Partial<QRConfig>) => void;
}

export const ScannabilityBadge: React.FC<ScannabilityBadgeProps> = ({
  report,
  config,
  onUpdateConfig,
}) => {
  const getScoreBadge = () => {
    switch (report.score) {
      case 'excellent':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
          label: 'Optimal Readability',
          subtext: 'High contrast ensures fast decode on all devices.',
        };
      case 'good':
        return {
          icon: CheckCircle2,
          color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
          label: 'Good Scannability',
          subtext: 'Passes standard mobile camera detection tests.',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
          label: 'Potential Scan Issues',
          subtext: 'May be slow to scan in dim light or glare.',
        };
      case 'risky':
        return {
          icon: XCircle,
          color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
          label: 'High Risk / Unreadable',
          subtext: 'Contrast or style may prevent scanning.',
        };
    }
  };

  const badge = getScoreBadge();
  const Icon = badge.icon;

  const fixContrast = () => {
    if (report.isInverted) {
      // Invert back
      onUpdateConfig({ fgColor: '#000000', bgColor: '#ffffff', gradient: { ...config.gradient, enabled: false } });
    } else {
      // Darken fg, lighten bg
      onUpdateConfig({ fgColor: '#0f172a', bgColor: '#ffffff' });
    }
  };

  const fixErrorCorrection = () => {
    onUpdateConfig({ errorCorrectionLevel: 'H' });
  };

  const fixMargin = () => {
    onUpdateConfig({ margin: 12 });
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all ${badge.color}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider m-0">{badge.label}</h4>
            <p className="text-[11px] opacity-90 m-0">{badge.subtext}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-mono font-bold">
            {report.contrastRatio}:1
          </div>
          <div className="text-[10px] opacity-80">Contrast Ratio</div>
        </div>
      </div>

      {/* Real-time verification badge */}
      {report.isDecodable !== undefined && (
        <div className="mt-2 pt-2 border-t border-current/10 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Scanner Verification:
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            report.isDecodable ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200' : 'bg-rose-500/20 text-rose-800 dark:text-rose-200'
          }`}>
            {report.isDecodable ? '✓ Verified Decodable' : '✗ Decode Failed'}
          </span>
        </div>
      )}

      {/* Warnings & Suggestions */}
      {report.warnings.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-current/10 space-y-1.5">
          {report.warnings.map((warn, i) => (
            <div key={i} className="text-xs flex items-start gap-1.5">
              <span className="shrink-0">•</span>
              <span>{warn}</span>
            </div>
          ))}

          {/* Quick 1-click Auto-Fix Buttons */}
          <div className="pt-2 flex flex-wrap gap-2">
            {(report.score === 'warning' || report.score === 'risky' || report.isInverted) && (
              <button
                type="button"
                onClick={fixContrast}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 shadow-xs border border-current/20 transition-colors cursor-pointer"
              >
                <Wrench className="w-3 h-3" />
                <span>Auto-Fix Contrast</span>
              </button>
            )}

            {config.logoUrl && (config.errorCorrectionLevel === 'L' || config.errorCorrectionLevel === 'M') && (
              <button
                type="button"
                onClick={fixErrorCorrection}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 shadow-xs border border-current/20 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Set High Error Correction (H)</span>
              </button>
            )}

            {config.margin < 5 && (
              <button
                type="button"
                onClick={fixMargin}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 shadow-xs border border-current/20 transition-colors cursor-pointer"
              >
                <Wrench className="w-3 h-3" />
                <span>Add Recommended Margin</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
