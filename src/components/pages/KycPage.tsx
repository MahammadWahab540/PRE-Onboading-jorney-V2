import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ShieldCheck,
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FileCheck,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import type { EnrollmentState, EnrollmentJourney, KycStatus } from '../../types';
import { ActionRequiredCard } from '../ActionRequiredCard';

interface KycPageProps {
  state: EnrollmentState;
  token: string;
  onUpdateJourney: (journey: EnrollmentJourney) => void;
  onContinue: () => void;
  onBack: () => void;
  onSwitchToDirectPay?: () => void;
  onSwitchCoApplicant?: () => void;
}

export const KycPage: React.FC<KycPageProps> = ({
  state,
  token,
  onUpdateJourney,
  onContinue,
  onBack,
  onSwitchToDirectPay,
  onSwitchCoApplicant,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const kyc = state.kyc || state.canonicalJourney?.kyc;
  const currentStatus: KycStatus = kyc?.status || 'NOT_STARTED';

  const [isProcessing, setIsProcessing] = useState(false);
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [aadhaarLast4, setAadhaarLast4] = useState('8831');
  const [bankFileSelected, setBankFileSelected] = useState(true);

  // Submit KYC Documents
  const handleAction = async (actionType: 'SUBMIT' | 'RETRY_DOCUMENTS' | 'COMPLETE') => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/enrollment/${token}/kyc/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType }),
      });
      const data = await res.json();
      if (res.ok && data.journey) {
        onUpdateJourney(data.journey);
      }
    } catch (err) {
      console.error('Failed KYC action:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8"
      >
        {/* Top Tag & Title */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#0B63E5] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Digital KYC Verification
          </span>
          <span className="text-xs text-slate-500 font-medium">
            RBI Standard Verification
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A192F] tracking-tight mb-2">
          Verify Documents &amp; Identity
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Fast, asynchronous verification through DigiLocker and bank statement upload. No video scheduling required.
        </p>

        {/* -------------------------------------------------------------
            CASE 3: ACTION_REQUIRED (Document Re-upload / Blurry Photo)
            ------------------------------------------------------------- */}
        {currentStatus === 'ACTION_REQUIRED' && (
          <ActionRequiredCard
            title="Document Re-Upload Required"
            description={
              kyc?.rejectionReason ||
              kyc?.documentsRequested ||
              'Uploaded document was blurry or incomplete. Please provide an official 3-month bank statement PDF.'
            }
            actionLabel="Re-Upload Official PDF"
            requestedDocuments={['Latest 3-Month Bank Statement PDF', 'Clear PAN Card Photo']}
            isLoading={isProcessing}
            onAction={() => handleAction('RETRY_DOCUMENTS')}
          />
        )}

        {/* -------------------------------------------------------------
            CASE 6: FAILED
            ------------------------------------------------------------- */}
        {currentStatus === 'FAILED' && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-rose-900">KYC Verification Unsuccessful</h3>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  {kyc?.rejectionReason ||
                    'Document records could not be verified against the official bureau registry. You can nominate an alternate earning co-applicant or complete enrollment via direct fee payment.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {onSwitchCoApplicant && (
                <button
                  type="button"
                  onClick={onSwitchCoApplicant}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Change Co-Applicant
                </button>
              )}
              {onSwitchToDirectPay && (
                <button
                  type="button"
                  onClick={onSwitchToDirectPay}
                  className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Switch to Direct Payment
                </button>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            CASE 5: VERIFIED
            ------------------------------------------------------------- */}
        {currentStatus === 'VERIFIED' && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 mb-6 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-200/60 px-2 py-0.5 rounded-md border border-emerald-300">
                  KYC Verified
                </span>
                <h3 className="text-base font-bold text-emerald-950 mt-1">
                  Identity &amp; Documents Approved
                </h3>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Your co-applicant and identity documents have been authenticated. You can now proceed to NBFC review and auto-debit setup.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            CASE 4: SUBMITTED (Under Review)
            ------------------------------------------------------------- */}
        {currentStatus === 'SUBMITTED' && (
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 mb-6 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-200/60 px-2 py-0.5 rounded-md border border-blue-300">
                  Documents Under Review
                </span>
                <h3 className="text-base font-bold text-[#0A192F] mt-1">
                  Verification In Progress
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Our verification desk and NBFC partner are validating the submitted documents. Typical turnaround is 2 to 4 hours. You will receive an SMS confirmation.
                </p>

                {/* Simulated Quick Action for Demo Testing */}
                <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Demo Simulator:</span>
                  <button
                    type="button"
                    onClick={() => handleAction('COMPLETE')}
                    disabled={isProcessing}
                    className="text-xs font-bold text-[#0B63E5] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Simulate Approval</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            CASE 1 & 2: NOT_STARTED / IN_PROGRESS (Interactive Document Form)
            ------------------------------------------------------------- */}
        {(currentStatus === 'NOT_STARTED' || currentStatus === 'IN_PROGRESS') && (
          <div className="space-y-4 text-left mb-6">
            {/* PAN Card Input */}
            <div className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0B63E5]" />
                  <span>Co-Applicant PAN Card</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready
                </span>
              </div>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs font-semibold bg-white uppercase focus:border-[#0B63E5] outline-none"
              />
            </div>

            {/* Aadhaar / DigiLocker */}
            <div className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0B63E5]" />
                  <span>Aadhaar Verification (DigiLocker)</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-1">
                Authenticated via Aadhaar OTP (Ending in •••• {aadhaarLast4})
              </p>
            </div>

            {/* Bank Statement Upload */}
            <div className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#0B63E5]" />
                  <span>Latest 3-Month Bank Statement</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  PDF Attached
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Official e-Statement uploaded: <span className="font-mono font-medium">HDFC_Bank_3M_Stmt.pdf</span>
              </p>
            </div>

            {/* Submit CTA */}
            <button
              id="submit-kyc-documents-btn"
              type="button"
              onClick={() => handleAction('SUBMIT')}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0B63E5] hover:bg-blue-600 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Documents...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Submit KYC Documents for Review</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Action Navigation Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-100">
          <button
            id="kyc-back-btn"
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStatus === 'VERIFIED' ? (
            <button
              id="kyc-continue-to-nbfc-btn"
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B63E5] text-white text-xs sm:text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Financing Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-xs text-slate-400 font-medium text-center sm:text-right">
              {currentStatus === 'SUBMITTED'
                ? 'Review takes 2-4 hrs • SMS updates enabled'
                : 'Complete document checklist to continue'}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
