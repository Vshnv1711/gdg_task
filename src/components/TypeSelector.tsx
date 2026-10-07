import React from 'react';
import type { QRType } from '../types';
import { Globe, AlignLeft, Mail, Phone, Wifi, MessageSquare, Contact } from 'lucide-react';

interface TypeSelectorProps {
  selectedType: QRType;
  onSelectType: (type: QRType) => void;
}

interface TypeItem {
  type: QRType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TYPES: TypeItem[] = [
  { type: 'url', label: 'Website URL', icon: Globe, description: 'Link to any website' },
  { type: 'text', label: 'Plain Text', icon: AlignLeft, description: 'Freeform text note' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Pre-filled mail composer' },
  { type: 'phone', label: 'Phone', icon: Phone, description: 'Direct dial number' },
  { type: 'wifi', label: 'Wi-Fi Network', icon: Wifi, description: 'One-tap network login' },
  { type: 'sms', label: 'SMS Message', icon: MessageSquare, description: 'Pre-typed text message' },
  { type: 'vcard', label: 'Contact (vCard)', icon: Contact, description: 'Complete contact card' },
];

export const TypeSelector: React.FC<TypeSelectorProps> = ({ selectedType, onSelectType }) => {
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        Select Content Type
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {TYPES.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedType === item.type;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelectType(item.type)}
              title={item.description}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-sm ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div
                className={`p-2 rounded-lg mb-1.5 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
