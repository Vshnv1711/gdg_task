import React, { useState } from 'react';
import type { MockupMode, QRData, QRConfig } from '../types';
import { Wifi, Sparkles, Building, Mail, Phone } from 'lucide-react';

interface QRFrameWrapperProps {
  children: React.ReactNode;
  mockupMode: MockupMode;
  config: QRConfig;
  qrData: QRData;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export const QRFrameWrapper: React.FC<QRFrameWrapperProps> = ({
  children,
  mockupMode,
  config,
  qrData,
  cardRef,
}) => {
  const { frame } = config;

  // 3D Tilt Effect on mouse move
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mockupMode === 'canvas') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / (rect.height / 2)) * 8,
      y: (x / (rect.width / 2)) * 8,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // 1. Bare Canvas
  if (mockupMode === 'canvas' || (mockupMode === 'framed' && frame.style === 'none')) {
    return <div ref={cardRef}>{children}</div>;
  }

  // 2. Decorative Frame (Polaroid, Banners, Badges)
  if (mockupMode === 'framed') {
    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        }}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl transition-all"
      >
        {/* Banner Top */}
        {frame.style === 'banner-top' && (
          <div
            className="w-full text-center py-2 px-4 rounded-xl mb-3 font-bold text-xs uppercase tracking-wider shadow-xs"
            style={{ backgroundColor: frame.color, color: frame.textColor }}
          >
            {frame.text || 'SCAN ME'}
          </div>
        )}

        {/* Badge Pill Top */}
        {frame.style === 'badge-pill' && (
          <div
            className="text-center py-1 px-4 rounded-full mb-3 font-bold text-[11px] uppercase tracking-wider shadow-sm"
            style={{ backgroundColor: frame.color, color: frame.textColor }}
          >
            {frame.text || 'SCAN ME'}
          </div>
        )}

        {/* QR Code */}
        <div className="rounded-xl overflow-hidden flex items-center justify-center p-1 bg-white">
          {children}
        </div>

        {/* Banner Bottom */}
        {frame.style === 'banner-bottom' && (
          <div
            className="w-full text-center py-2 px-4 rounded-xl mt-3 font-bold text-xs uppercase tracking-wider shadow-xs"
            style={{ backgroundColor: frame.color, color: frame.textColor }}
          >
            {frame.text || 'SCAN ME'}
          </div>
        )}

        {/* Polaroid Style */}
        {frame.style === 'polaroid' && (
          <div className="mt-3 text-center pb-1">
            <span
              className="font-bold text-sm tracking-wide"
              style={{ color: frame.textColor || frame.color }}
            >
              {frame.text || 'SCAN ME'}
            </span>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium tracking-tight">
              Point camera to open
            </div>
          </div>
        )}

        {/* Minimal Tag */}
        {frame.style === 'minimal-tag' && (
          <div className="mt-2.5 flex items-center gap-1.5 opacity-80">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: frame.color }} />
            <span
              className="text-[11px] font-semibold tracking-wider uppercase"
              style={{ color: frame.color }}
            >
              {frame.text || 'SCAN ME'}
            </span>
          </div>
        )}
      </div>
    );
  }

  // 3. Cafe / Restaurant Acrylic Stand Mockup
  if (mockupMode === 'cafe-stand') {
    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        }}
        className="flex flex-col items-center max-w-[340px] w-full"
      >
        {/* Transparent acrylic stand border */}
        <div className="w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 border-2 border-white/60 dark:border-slate-700/60 shadow-2xl relative flex flex-col items-center text-center">
          {/* Acrylic top highlight */}
          <div className="w-12 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mb-3" />

          {/* Stand Header */}
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
            <Wifi className="w-4 h-4" />
            <span>{qrData.type === 'wifi' ? 'Fast Campus Wi-Fi' : 'Scan For Menu & Connect'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            {qrData.type === 'wifi'
              ? `Network: ${qrData.wifi.ssid || 'Campus_WiFi'}`
              : 'Point your camera to scan instantly'}
          </p>

          {/* QR Code Container */}
          <div className="p-2 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center">
            {children}
          </div>

          <div className="mt-3.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 w-full flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <span>Powered by GDG SRM</span>
            <span>•</span>
            <span>Zero App Install</span>
          </div>
        </div>

        {/* 3D Wooden Base Block */}
        <div className="w-[88%] h-4 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 rounded-b-xl shadow-lg border-t border-amber-700/40 relative">
          <div className="absolute inset-x-4 top-0.5 h-1 bg-amber-950/60 rounded-full" />
        </div>
      </div>
    );
  }

  // 4. Modern Tech Business Card Mockup
  if (mockupMode === 'business-card') {
    const name = [qrData.vcard.firstName, qrData.vcard.lastName].filter(Boolean).join(' ') || 'Alex Sharma';
    const role = qrData.vcard.jobTitle || 'Lead Software Engineer';
    const org = qrData.vcard.company || 'Google Developer Groups SRM';

    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        }}
        className="w-full max-w-[400px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white p-5 shadow-2xl border border-slate-750 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
      >
        {/* Holographic foil accent line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-400" />

        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-mono text-blue-400 mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>{org}</span>
            </div>
            <h3 className="text-base font-bold tracking-tight text-white m-0">{name}</h3>
            <p className="text-xs text-slate-400 m-0">{role}</p>
          </div>

          <div className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono tracking-widest text-slate-300 border border-white/10">
            NFC / QR
          </div>
        </div>

        {/* Card Body with QR & Contact Snippets */}
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <Building className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[150px]">{org}</span>
            </div>
            {qrData.vcard.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[150px]">{qrData.vcard.email}</span>
              </div>
            )}
            {qrData.vcard.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{qrData.vcard.phone}</span>
              </div>
            )}
          </div>

          {/* Mini QR Box */}
          <div className="p-1 rounded-xl bg-white shadow-inner flex items-center justify-center shrink-0">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // 5. GDG Conference Event Badge Mockup
  if (mockupMode === 'event-badge') {
    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        }}
        className="w-full max-w-[320px] rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative flex flex-col items-center"
      >
        {/* Lanyard Top Punch Hole */}
        <div className="w-full py-2 bg-slate-100 dark:bg-slate-800 flex justify-center border-b border-slate-200 dark:border-slate-700">
          <div className="w-8 h-2 rounded-full bg-slate-300 dark:bg-slate-600 shadow-inner" />
        </div>

        {/* Badge Header Banner */}
        <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-4 text-center text-white">
          <div className="text-[10px] font-mono tracking-widest uppercase opacity-90">
            GDG ON CAMPUS SRM
          </div>
          <h3 className="text-base font-black tracking-tight mt-0.5 mb-0">DEV SUMMIT 2026</h3>
          <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
            TECHNICAL RECRUITMENT PASS
          </div>
        </div>

        {/* Badge Body */}
        <div className="p-4 flex flex-col items-center text-center w-full">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-lg mb-2 shadow-sm">
            {qrData.vcard.firstName ? qrData.vcard.firstName[0].toUpperCase() : 'V'}
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">
            {[qrData.vcard.firstName, qrData.vcard.lastName].filter(Boolean).join(' ') || 'Candidate / Attendee'}
          </h4>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            SRM Institute of Science and Technology
          </span>

          {/* QR Code */}
          <div className="mt-3 p-1.5 rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center">
            {children}
          </div>

          <div className="mt-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            #GDG-SRM-2026-PASS
          </div>
        </div>
      </div>
    );
  }

  // 6. Smartphone Lock Screen Mockup
  if (mockupMode === 'phone') {
    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        }}
        className="w-full max-w-[320px] rounded-[36px] bg-slate-900 text-white p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col items-center overflow-hidden"
      >
        {/* Dynamic Island / Speaker */}
        <div className="w-20 h-4 bg-black rounded-full mb-4 mt-1" />

        {/* Lock Screen Time */}
        <div className="text-center mb-4">
          <div className="text-4xl font-extralight tracking-tight">19:42</div>
          <div className="text-xs text-slate-400 font-medium">Wednesday, October 7</div>
        </div>

        {/* Phone Widget Card */}
        <div className="w-full bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 shadow-lg flex flex-col items-center text-center">
          <div className="text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Scan Widget</span>
          </div>
          <div className="p-1 rounded-xl bg-white shadow-md flex items-center justify-center">
            {children}
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            Tap or scan from lock screen
          </div>
        </div>

        {/* Phone Home Bar */}
        <div className="w-28 h-1 bg-white/40 rounded-full mt-4 mb-1" />
      </div>
    );
  }

  return <div>{children}</div>;
};
