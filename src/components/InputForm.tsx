import { useState } from 'react';
import type { QRData, WifiData, EmailData, PhoneData, SmsData, VCardData } from '../types';
import { Eye, EyeOff, AlertCircle, ExternalLink } from 'lucide-react';

interface InputFormProps {
  data: QRData;
  onChange: (data: QRData) => void;
  errors: Record<string, string>;
}

export const InputForm: React.FC<InputFormProps> = ({ data, onChange, errors }) => {
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  const updateField = <K extends keyof QRData>(key: K, value: QRData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const updateWifi = (partial: Partial<WifiData>) => {
    onChange({ ...data, wifi: { ...data.wifi, ...partial } });
  };

  const updateEmail = (partial: Partial<EmailData>) => {
    onChange({ ...data, email: { ...data.email, ...partial } });
  };

  const updatePhone = (partial: Partial<PhoneData>) => {
    onChange({ ...data, phone: { ...data.phone, ...partial } });
  };

  const updateSms = (partial: Partial<SmsData>) => {
    onChange({ ...data, sms: { ...data.sms, ...partial } });
  };

  const updateVCard = (partial: Partial<VCardData>) => {
    onChange({ ...data, vcard: { ...data.vcard, ...partial } });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white m-0">
            {data.type === 'url' && 'Website URL Details'}
            {data.type === 'text' && 'Plain Text Content'}
            {data.type === 'email' && 'Email Configuration'}
            {data.type === 'phone' && 'Phone Number Details'}
            {data.type === 'wifi' && 'Wi-Fi Network Credentials'}
            {data.type === 'sms' && 'SMS Message Details'}
            {data.type === 'vcard' && 'Contact Card Details (vCard)'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
            {data.type === 'url' && 'Enter the destination web address to direct scanners.'}
            {data.type === 'text' && 'Any plain text, notes, coupon code, or instructions.'}
            {data.type === 'email' && 'Scanning will open the default mail client with pre-filled content.'}
            {data.type === 'phone' && 'Scanning initiates a phone call directly.'}
            {data.type === 'wifi' && 'Allows phones to connect to Wi-Fi instantly without typing passwords.'}
            {data.type === 'sms' && 'Prefills an SMS draft with your recipient and message.'}
            {data.type === 'vcard' && 'Adds a digital business contact directly to address books.'}
          </p>
        </div>
      </div>

      {/* URL INPUT */}
      {data.type === 'url' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={data.url}
                onChange={(e) => updateField('url', e.target.value)}
                placeholder="https://gdgsrm.com or example.com"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                  errors.url
                    ? 'border-rose-400 focus:ring-rose-400/30'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
                }`}
              />
              {data.url && !errors.url && (
                <a
                  href={data.url.startsWith('http') ? data.url : `https://${data.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-3 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Test link in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {errors.url ? (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.url}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                Tip: If protocol is omitted, https:// is automatically prepended.
              </p>
            )}
          </div>
        </div>
      )}

      {/* PLAIN TEXT INPUT */}
      {data.type === 'text' && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Text Content <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {data.text.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={data.text}
              onChange={(e) => updateField('text', e.target.value)}
              placeholder="Enter text, instructions, secret token, or serial number..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                errors.text
                  ? 'border-rose-400 focus:ring-rose-400/30'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
              }`}
            />
            {errors.text && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.text}
              </p>
            )}
          </div>
        </div>
      )}

      {/* EMAIL INPUT */}
      {data.type === 'email' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Recipient Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={data.email.email}
              onChange={(e) => updateEmail({ email: e.target.value })}
              placeholder="technical@gdgsrm.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                errors.email
                  ? 'border-rose-400 focus:ring-rose-400/30'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject Line (Optional)
            </label>
            <input
              type="text"
              value={data.email.subject}
              onChange={(e) => updateEmail({ subject: e.target.value })}
              placeholder="Inquiry regarding GDG SRM Recruitments"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Message Body (Optional)
            </label>
            <textarea
              rows={3}
              value={data.email.body}
              onChange={(e) => updateEmail({ body: e.target.value })}
              placeholder="Hello GDG SRM team, I have completed the frontend recruitment task..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>
        </div>
      )}

      {/* PHONE INPUT */}
      {data.type === 'phone' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={data.phone.phone}
              onChange={(e) => updatePhone({ phone: e.target.value })}
              placeholder="+91 98765 43210"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                errors.phone
                  ? 'border-rose-400 focus:ring-rose-400/30'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
              }`}
            />
            {errors.phone ? (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.phone}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                Include country code for universal international dialing.
              </p>
            )}
          </div>
        </div>
      )}

      {/* WI-FI INPUT */}
      {data.type === 'wifi' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Network Name (SSID) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.wifi.ssid}
              onChange={(e) => updateWifi({ ssid: e.target.value })}
              placeholder="e.g. SRM_CAMPUS_WIFI"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                errors.ssid
                  ? 'border-rose-400 focus:ring-rose-400/30'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
              }`}
            />
            {errors.ssid && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.ssid}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Encryption Type
              </label>
              <select
                value={data.wifi.encryption}
                onChange={(e) => updateWifi({ encryption: e.target.value as 'WPA' | 'WEP' | 'nopass' })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <option value="WPA">WPA / WPA2 / WPA3 (Recommended)</option>
                <option value="WEP">WEP (Legacy)</option>
                <option value="nopass">None (Open Network)</option>
              </select>
            </div>

            {data.wifi.encryption !== 'nopass' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showWifiPassword ? 'text' : 'password'}
                    value={data.wifi.password}
                    onChange={(e) => updateWifi({ password: e.target.value })}
                    placeholder="Enter network password"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                      errors.password
                        ? 'border-rose-400 focus:ring-rose-400/30'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowWifiPassword(!showWifiPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showWifiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="hidden-wifi"
              checked={data.wifi.hidden}
              onChange={(e) => updateWifi({ hidden: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
            />
            <label htmlFor="hidden-wifi" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              Hidden Network (SSID is not broadcasted)
            </label>
          </div>
        </div>
      )}

      {/* SMS INPUT */}
      {data.type === 'sms' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Recipient Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={data.sms.phone}
              onChange={(e) => updateSms({ phone: e.target.value })}
              placeholder="+91 98765 43210"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all ${
                errors.phone
                  ? 'border-rose-400 focus:ring-rose-400/30'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/30 focus:border-blue-500'
              }`}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              SMS Message Body (Optional)
            </label>
            <textarea
              rows={3}
              value={data.sms.message}
              onChange={(e) => updateSms({ message: e.target.value })}
              placeholder="Hi, I am reaching out regarding..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>
        </div>
      )}

      {/* VCARD INPUT */}
      {data.type === 'vcard' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.vcard.firstName}
                onChange={(e) => updateVCard({ firstName: e.target.value })}
                placeholder="Alex"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={data.vcard.lastName}
                onChange={(e) => updateVCard({ lastName: e.target.value })}
                placeholder="Sharma"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={data.vcard.phone}
                onChange={(e) => updateVCard({ phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={data.vcard.email}
                onChange={(e) => updateVCard({ email: e.target.value })}
                placeholder="alex.sharma@gdgsrm.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Company / Organization
              </label>
              <input
                type="text"
                value={data.vcard.company}
                onChange={(e) => updateVCard({ company: e.target.value })}
                placeholder="GDG on Campus SRM"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Job Title
              </label>
              <input
                type="text"
                value={data.vcard.jobTitle}
                onChange={(e) => updateVCard({ jobTitle: e.target.value })}
                placeholder="Technical Lead"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Website URL
            </label>
            <input
              type="url"
              value={data.vcard.website}
              onChange={(e) => updateVCard({ website: e.target.value })}
              placeholder="https://gdgsrm.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          {errors.name && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.name}
            </p>
          )}
          {errors.contact && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.contact}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
