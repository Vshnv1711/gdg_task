export type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'sms' | 'vcard' | 'upi' | 'location' | 'event';

export type DotType = 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
export type CornerSquareType = 'dot' | 'square' | 'extra-rounded';
export type CornerDotType = 'dot' | 'square';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type FrameStyle = 'none' | 'polaroid' | 'banner-top' | 'banner-bottom' | 'badge-pill' | 'minimal-tag';
export type MockupMode = 'canvas' | 'framed' | 'cafe-stand' | 'business-card' | 'event-badge' | 'phone';

export interface FrameConfig {
  style: FrameStyle;
  text: string;
  color: string;
  textColor: string;
}

export interface GradientConfig {
  enabled: boolean;
  type: 'linear' | 'radial';
  rotation: number;
  color1: string;
  color2: string;
}

export interface QRConfig {
  size: number;
  margin: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  fgColor: string;
  bgColor: string;
  gradient: GradientConfig;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerSquareColor: string;
  cornerDotType: CornerDotType;
  cornerDotColor: string;
  logoUrl?: string;
  logoSize: number; // 0.1 to 0.4
  logoMargin: number;
  hideBackgroundDots: boolean;
  frame: FrameConfig;
}

export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface EmailData {
  email: string;
  subject: string;
  body: string;
}

export interface PhoneData {
  phone: string;
}

export interface SmsData {
  phone: string;
  message: string;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  jobTitle: string;
  website: string;
  address: string;
}

export interface UpiData {
  pa: string; // VPA/UPI ID
  pn: string; // Payee Name
  am: string; // Amount (optional)
  tn: string; // Transaction Note
}

export interface LocationData {
  query: string;
  lat: string;
  lng: string;
}

export interface EventData {
  title: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  description: string;
}

export interface QRData {
  type: QRType;
  url: string;
  text: string;
  email: EmailData;
  phone: PhoneData;
  wifi: WifiData;
  sms: SmsData;
  vcard: VCardData;
  upi: UpiData;
  location: LocationData;
  event: EventData;
}

export interface QRPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<QRConfig>;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: QRType;
  title: string;
  payload: string;
  config: QRConfig;
  qrData: QRData;
  thumbnail?: string;
}

export interface ScannabilityReport {
  score: 'excellent' | 'good' | 'warning' | 'risky';
  contrastRatio: number;
  isInverted: boolean;
  warnings: string[];
  suggestions: string[];
  isDecodable?: boolean;
  decodedContent?: string;
}
