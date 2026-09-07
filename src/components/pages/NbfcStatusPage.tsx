import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  DollarSign,
  HelpCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  FileCheck,
} from 'lucide-react';
import type { EnrollmentState, EnrollmentJourney } from '../../types';
import { ActionRequiredCard } from '../ActionRequiredCard';

interface NbfcStatusPageProps {
  state: EnrollmentState;
  token: string;
  onUpdateJourney: (journey: EnrollmentJourney) => void;
  onComplete: () => void;
  onBack: () => void;
  onSwitchCoApplicant: () => void;
  onSwitchToDirectPay: () => void;
}

export const NbfcStatusPage: React.FC<NbfcStatusPageProps> = ({
  state,
  token,
  onUpdateJourney,
  onComplete,
  onBack,
  onSwitchCoApplicant,
  onSwitchToDirectPay,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const financing = state.financing || state.canonicalJourney?.financing;

  const lenderName = financing?.lenderName || 'Northern Arc';
  const status = financing?.status || 'UNDER_REVIEW';
  const appliedAmount = financing?.appliedAmount || 112000;
  const approvedAmount = financing?.approvedAmount || appliedAmount;
  const emiPerMonth = Math.round(approvedAmount / 6);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('Financing Application Assistance');
  const [ticketDescription, setTicketDescription] = useState(
    'Need help with auto-debit setup and document status.'
  );
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState<string | null>(null);

  // Trigger NBFC Actions
  const handleNbfcAction = async (
    actionType: 'SETUP_EMI' | 'DISBURSE_SIMULATE' | 'CHANGE_CO_APPLICANT' | 'RETRY_DOCUMENTS'
  ) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/enrollment/${token}/nbfc/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType }),
      });
      const data = await res.json();
      if (res.ok && data.journey) {
        onUpdateJourney(data.journey);
      }
    } catch (err) {
      console.error('Failed NBFC action:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Support Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/enrollment/${token}/support-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: ticketCategory,
          description: ticketDescription,
          learnerName: state.learner?.name || 'Learner',
          contactNumber: state.learner?.mobileMasked || '',
        }),
      });
      const data = await res.json();
      setTicketSuccessMsg(data.message || 'Ticket created successfully.');
      setTimeout(() => {
        setShowSupportModal(false);
        setTicketSuccessMsg(null);
      }, 3500);
    } catch {
      setTicketSuccessMsg('Ticket logged. Our counselor team will call you shortly.');
      setTimeout(() => {
        setShowSupportModal(false);
        setTicketSuccessMsg(null);
      }, 3500);
    } finally {
      setIsProcessing(false);
    }
  };

  // Timeline Steps
  const timelineSteps = [
    {
      id: 'app_submitted',
      label: 'Application Submitted',
      date: 'Instant',
      isCompleted: true,
      isCurrent: false,
    },
    {
      id: 'kyc_verified',
      label: 'KYC & Identity Verified',
      date: 'Completed',
      isCompleted: true,
      isCurrent: false,
    },
    {
      id: 'underwriting',
      label: 'Lender Credit Review',
      date: status === 'REJECTED' ? 'Rejected' : 'Completed',
      isCompleted: status === 'APPROVED' || status === 'EMI_SETUP_PENDING' || status === 'DISBURSED',
      isCurrent: status === 'UNDER_REVIEW',
      isError: status === 'REJECTED',
    },
    {
      id: 'approval',
      label: 'Sanction & Loan Approval',
      date: status === 'APPROVED' || status === 'EMI_SETUP_PENDING' || status === 'DISBURSED' ? 'Sanctioned' : 'Pending',
      isCompleted: status === 'APPROVED' || status === 'EMI_SETUP_PENDING' || status === 'DISBURSED',
      isCurrent: status === 'APPROVED',
    },
    {
      id: 'auto_debit',
      label: 'Auto-Debit (e-NACH Mandate)',
      date: status === 'DISBURSED' ? 'Configured' : status === 'EMI_SETUP_PENDING' ? 'Action Needed' : 'Upcoming',
      isCompleted: status === 'DISBURSED',
      isCurrent: status === 'EMI_SETUP_PENDING',
    },
    {
      id: 'disbursal',
      label: 'Loan Disbursal to NxtWave',
      date: status === 'DISBURSED' ? 'Disbursed' : 'Awaiting mandate',
      isCompleted: status === 'DISBURSED',
      isCurrent: status === 'DISBURSED',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-[#0B63E5] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Education Financing Dashboard
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Lender: {lenderName}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A192F] tracking-tight mb-2">
          Financing Application Status
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Track the live underwriting, approval, and auto-debit setup for your educational facility.
        </p>

        {/* LENDER METADATA & FINANCIAL SUMMARY */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-left">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Application Ref
            </span>
            <span className="text-xs font-mono font-bold text-slate-800">
              {financing?.applicationId || 'APP-NA-2026-902'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Facility Amount
            </span>
            <span className="text-xs font-mono font-bold text-slate-800">
              ₹{appliedAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Monthly EMI (6 Mo)
            </span>
            <span className="text-xs font-mono font-bold text-[#0B63E5]">
              ₹{emiPerMonth.toLocaleString('en-IN')}/mo
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Interest Cost
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
              0% (No-Cost)
            </span>
          </div>
        </div>

        {/* -------------------------------------------------------------
            STAGE CALLOUT BANNERS
            ------------------------------------------------------------- */}

        {/* 1. REJECTED STATE */}
        {status === 'REJECTED' && (
          <div className="mb-6">
            <ActionRequiredCard
              title="Lender Credit Review Not Approved"
              description={
                financing?.rejectionReason ||
                'Co-applicant credit bureau score is below the minimum threshold required by this partner lender.'
              }
              actionLabel="Nominate Alternate Co-Applicant"
              onAction={onSwitchCoApplicant}
            />

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={onSwitchToDirectPay}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Switch to Direct Fee Payment
              </button>
              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-50 text-[#0B63E5] font-semibold hover:bg-blue-100 cursor-pointer"
              >
                Talk to Admissions Counselor
              </button>
            </div>
          </div>
        )}

        {/* 2. APPROVED / EMI SETUP PENDING */}
        {(status === 'APPROVED' || status === 'EMI_SETUP_PENDING') && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-200/60 px-2 py-0.5 rounded-md border border-emerald-300">
                  Loan Approved
                </span>
                <h3 className="text-base font-bold text-emerald-950 mt-1">
                  Complete Auto-Debit (e-NACH Mandate)
                </h3>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Your education financing of ₹{appliedAmount.toLocaleString('en-IN')} is approved. Set up auto-debit using Net Banking or Debit Card to trigger immediate disbursement.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleNbfcAction('SETUP_EMI')}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Configuring Mandate...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Authorize e-NACH Mandate</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNbfcAction('DISBURSE_SIMULATE')}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100/60 cursor-pointer"
              >
                Simulate Disbursal &amp; Unlock Classes
              </button>
            </div>
          </div>
        )}

        {/* 3. UNDER REVIEW */}
        {status === 'UNDER_REVIEW' && (
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 mb-6 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-200/60 px-2 py-0.5 rounded-md border border-blue-300">
                  Underwriting In Progress
                </span>
                <h3 className="text-base font-bold text-[#0A192F] mt-1">
                  Application Under Review by {lenderName}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  The credit underwriting desk is evaluating income records and credit score. Updates will be reflected automatically.
                </p>

                {/* Simulator for demo validation */}
                <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Test Simulator:</span>
                  <button
                    type="button"
                    onClick={() => handleNbfcAction('SETUP_EMI')}
                    disabled={isProcessing}
                    className="text-xs font-bold text-[#0B63E5] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Simulate Approval Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. DISBURSED */}
        {status === 'DISBURSED' && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 mb-6 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-200/60 px-2 py-0.5 rounded-md border border-emerald-300">
                  Loan Disbursed
                </span>
                <h3 className="text-base font-bold text-emerald-950 mt-1">
                  Enrollment Fully Funded
                </h3>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  ₹{appliedAmount.toLocaleString('en-IN')} disbursed directly to NxtWave Disruptive Technologies. Your learner access is ready to activate.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VERTICAL TIMELINE */}
        <div className="border border-slate-200 rounded-xl p-5 mb-8 text-left bg-white">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Application Progress Timeline
          </h3>
          <div className="space-y-4">
            {timelineSteps.map((step, idx) => (
              <div key={step.id} className="flex items-start gap-3 relative">
                {/* Connecting vertical bar */}
                {idx < timelineSteps.length - 1 && (
                  <div
                    className={`absolute left-[13px] top-6 bottom-0 w-0.5 ${
                      step.isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Step indicator dot */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    step.isError
                      ? 'bg-rose-100 text-rose-600 border border-rose-300'
                      : step.isCompleted
                      ? 'bg-emerald-500 text-white'
                      : step.isCurrent
                      ? 'bg-[#0B63E5] text-white animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {step.isError ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : step.isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        step.isError
                          ? 'text-rose-700'
                          : step.isCompleted || step.isCurrent
                          ? 'text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {step.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {status === 'DISBURSED' ? (
            <button
              id="nbfc-continue-to-class-btn"
              type="button"
              onClick={onComplete}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B63E5] text-white text-xs sm:text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Access Class Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-blue-200 text-xs font-semibold text-[#0B63E5] hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Need Help? Contact Counselor</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* SUPPORT TICKETING MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 text-left">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Admissions Counselor Support Request
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit a support ticket to get immediate assistance on NBFC documentation or fee options.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Inquiry Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-[#0B63E5]"
                >
                  <option value="Financing Application Assistance">Financing Assistance</option>
                  <option value="Alternate Co-Applicant Nomination">Alternate Co-Applicant</option>
                  <option value="Switch to Direct Payment">Switch to Direct Payment</option>
                  <option value="Auto-Debit eNACH Help">Auto-Debit eNACH Help</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Message / Details
                </label>
                <textarea
                  rows={3}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-[#0B63E5]"
                />
              </div>

              {ticketSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                  {ticketSuccessMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-[#0B63E5] hover:bg-blue-600 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Logging...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
