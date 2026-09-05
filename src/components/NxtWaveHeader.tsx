import React from 'react';
import { ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';
import type { PortalRoute } from '../types';

interface HeaderProps {
  currentRoute: PortalRoute;
  learnerName?: string;
  onOpenSupport?: () => void;
}

export const NxtWaveHeader: React.FC<HeaderProps> = ({
  currentRoute,
  learnerName,
  onOpenSupport,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* NxtWave Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0047BA] via-[#0B63E5] to-[#2575FC] flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform -rotate-6"
              >
                <path
                  d="M4 14L10 6L14 12L20 4"
                  stroke="currentColor"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="4" r="2" fill="white" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center tracking-tight">
                <span className="text-xl font-black text-[#0A192F] tracking-tight font-sans">
                  Nxt
                </span>
                <span className="text-xl font-black text-[#0B63E5] tracking-tight font-sans">
                  Wave
                </span>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase -mt-1">
                Learner Enrollment
              </span>
            </div>
          </div>
        </div>

        {/* Right Info: Security & Support */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Official Portal</span>
          </div>

          {onOpenSupport && (
            <button
              id="header-support-btn"
              type="button"
              onClick={onOpenSupport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0B63E5] bg-blue-50/80 hover:bg-blue-100 border border-blue-200/70 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Counselor Support</span>
              <span className="sm:hidden">Help</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
