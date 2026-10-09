import type { FC } from 'react';
import type { QRType } from '../types';
import { Globe, AlignLeft, Mail, Phone, Wifi, MessageSquare, Contact, CreditCard, MapPin, Calendar } from 'lucide-react';
import { playTactileClick } from '../utils/sound';

interface TypeSelectorProps {
  selectedType: QRType;
  onSelectType: (type: QRType) => void;
}

interface TypeItem {
  type: QRType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const TYPES: TypeItem[] = [
  { type: 'url', label: 'Website URL', icon: Globe, description: 'Direct scanners to any website' },
  { type: 'text', label: 'Plain Text', icon: AlignLeft, description: 'Freeform text, secret notes, or tokens' },
  { type: 'email', label: 'Email Draft', icon: Mail, description: 'Pre-filled recipient, subject, and body' },
  { type: 'phone', label: 'Phone Call', icon: Phone, description: 'Direct dial telephone number' },
  { type: 'wifi', label: 'Wi-Fi Login', icon: Wifi, description: 'Instant one-tap network connection' },
  { type: 'upi', label: 'UPI Payment', icon: CreditCard, description: 'Google Pay, PhonePe, Paytm QR', badge: 'India' },
  { type: 'vcard', label: 'vCard Contact', icon: Contact, description: 'Complete digital business card' },
  { type: 'location', label: 'Google Maps', icon: MapPin, description: 'GPS coordinates or location pin' },
  { type: 'event', label: 'Event / Cal', icon: Calendar, description: 'Calendar invite (Google/Apple Cal)' },
  { type: 'sms', label: 'SMS Draft', icon: MessageSquare, description: 'Pre-typed SMS message' },
];

export const TypeSelector: FC<TypeSelectorProps> = ({ selectedType, onSelectType }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Step 1: Choose Payload Format
        </label>
        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
          {TYPES.length} formats supported
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {TYPES.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedType === item.type;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => {
                playTactileClick();
                onSelectType(item.type);
              }}
              title={item.description}
              className={`group relative flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm ring-2 ring-blue-500/20'
                  : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold leading-tight truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                  {item.type}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
