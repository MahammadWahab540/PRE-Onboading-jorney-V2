import React, { useState, useRef, useEffect } from 'react';
import { Shield, Lock, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { EnrollmentState } from '../../types';

interface AuthPageProps {
  state: EnrollmentState;
  token: string;
  onSuccess: (learnerName: string) => void;
  onApiError?: (msg: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ state, token, onSuccess }) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // Handle single character
    const char = cleanValue.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    setErrorMessage(null);

    // Auto-advance to next input
    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    setErrorMessage(null);

    // Focus last filled or next input
    const nextFocusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const isOtpComplete = otp.every((digit) => digit.length === 1);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isOtpComplete || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const enteredOtp = otp.join('');
      const res = await fetch(`/api/enrollment/${token}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: enteredOtp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error || 'That code doesn’t look right. Please try again.'
        );
        setIsLoading(false);
        return;
      }

      onSuccess(data.learner?.name || 'Rahul Kumar');
    } catch {
      setErrorMessage(
        'Unable to connect to verification server. Please try again.'
      );
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/enrollment/${token}/otp/send`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setResendSuccess(true);
        setResendCountdown(30);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setTimeout(() => setResendSuccess(false), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to resend OTP. Please retry.');
      }
    } catch {
      setErrorMessage('Network error while resending OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8">
        {/* Verification Icon Badge */}
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0B63E5] mb-5 mx-auto">
          <Shield className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#0A192F] tracking-tight mb-2">
            Let’s verify it’s you
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            We’ve sent a verification code to your registered mobile number
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-semibold text-slate-800">
            <span>+91 {state.learner.mobileMasked || '98•••••210'}</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/90 flex items-start gap-2.5 text-rose-800 text-xs font-medium"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Resend Success Message */}
        {resendSuccess && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>A new 6-digit code has been sent to your mobile.</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerify}>
          <div className="flex justify-between gap-2 sm:gap-2.5 mb-6">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                autoComplete="one-time-code"
                aria-label={`Digit ${idx + 1} of 6`}
                className={`w-11 sm:w-12 h-14 sm:h-14 text-center text-xl font-bold rounded-xl border transition-all duration-200 outline-none ${
                  digit
                    ? 'border-[#0B63E5] bg-blue-50/30 text-[#0A192F] shadow-sm'
                    : 'border-slate-300 bg-white text-slate-900 focus:border-[#0B63E5] focus:ring-3 focus:ring-blue-100'
                }`}
              />
            ))}
          </div>

          {/* Quick Helper for Test Experience */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
            <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Code: 123456
            </span>

            {resendCountdown > 0 ? (
              <span className="text-slate-400 font-medium">
                Resend in {resendCountdown}s
              </span>
            ) : (
              <button
                id="resend-otp-button"
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="font-semibold text-[#0B63E5] hover:text-[#0047BA] hover:underline flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Resend OTP
              </button>
            )}
          </div>

          {/* Primary CTA */}
          <button
            id="verify-continue-btn"
            type="submit"
            disabled={!isOtpComplete || isLoading}
            className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isOtpComplete && !isLoading
                ? 'bg-[#0B63E5] hover:bg-[#0047BA] active:scale-[0.99] cursor-pointer shadow-blue-500/25'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>
        </form>

        {/* Security Message */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Your enrollment and payment information is protected.</span>
        </div>
      </div>
    </div>
  );
};
