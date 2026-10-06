import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { EnrollmentState } from '../../types';
import { ProgramCurriculumVideoPlayer } from '../ProgramCurriculumVideoPlayer';

interface ProgramSummaryPageProps {
  state: EnrollmentState;
  onNext: () => void;
  onBack: () => void;
}

export const ProgramSummaryPage: React.FC<ProgramSummaryPageProps> = ({
  state,
  onNext,
  onBack,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [showCurriculumVideo, setShowCurriculumVideo] = useState(false);

  const program = state?.program || state?.canonicalJourney?.program || {};
  const programName = program.name || 'NxtWave Smart Program';
  const isIitOcn = programName.toLowerCase().includes('iit') || programName.toLowerCase().includes('ocn');

  // Base values (fallback safely to 0 to prevent NaN)
  const programFee = Number(program.baseFee) || 0;
  const scholarshipAmount = Number(program.scholarshipAmount) || 0;
  const amountAlreadyPaid = Number(program.seatReservationPaid) || 0;

  // Exact Calculation Rule:
  // Program Fee - Scholarships / Discounts = Net Program Fee
  // Net Program Fee - Amount Already Paid = Remaining Program Fee
  const feeAfterScholarship = Math.max(programFee - scholarshipAmount, 0);
  const remainingProgramFee = Math.max(feeAfterScholarship - amountAlreadyPaid, 0);

  // Currency Formatter
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isFullyPaid = programFee > 0 && remainingProgramFee === 0;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7"
      >
        {/* Eyebrow & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
            ENROLMENT SUMMARY
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Seat Reserved</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Review Your Program & Fee
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-sm">
          Confirm your enrolment details before choosing a payment option.
        </p>

        {/* Program Name */}
        <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-xl mb-6">
          <span className="text-xs font-semibold text-slate-500 block mb-1">PROGRAM</span>
          <span className="font-bold text-slate-800 text-sm sm:text-base">{programName}</span>
        </div>

        {/* FEE SUMMARY */}
        <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              FEE SUMMARY
            </span>
          </div>
          
          <div className="p-4 space-y-3 text-sm">
            {/* Base Program Fee */}
            <div className="flex justify-between items-start">
              <span className="text-slate-600 font-medium break-words pr-2">Program Fee</span>
              <span className="font-mono font-medium text-slate-900 shrink-0">{formatCurrency(programFee)}</span>
            </div>

            {/* Scholarship Applied */}
            {scholarshipAmount > 0 && (
              <div className="flex justify-between items-start text-emerald-700">
                <div className="flex flex-col pr-2">
                  <span className="font-medium break-words">Scholarship Applied</span>
                  <span className="text-[11px] opacity-80 break-words">Merit Scholarship</span>
                </div>
                <span className="font-mono font-medium shrink-0">−{formatCurrency(scholarshipAmount)}</span>
              </div>
            )}

            {/* Subtotal Divider */}
            <div className="pt-2 border-t border-slate-200/80" />

            {/* Your Program Fee */}
            <div className="flex justify-between items-start">
              <span className="text-slate-800 font-semibold break-words pr-2">Your Program Fee</span>
              <span className="font-mono font-semibold text-slate-900 shrink-0">{formatCurrency(feeAfterScholarship)}</span>
            </div>

            {/* Amount Already Paid */}
            {(amountAlreadyPaid > 0 || remainingProgramFee === 0) && (
              <div className="flex justify-between items-start text-emerald-700">
                <div className="flex flex-col pr-2">
                  <span className="font-medium break-words">Amount Already Paid</span>
                  {amountAlreadyPaid > 0 && (
                    <span className="text-[11px] opacity-80 break-words">Includes your seat reservation payment</span>
                  )}
                </div>
                <span className="font-mono font-medium shrink-0">
                  {amountAlreadyPaid > 0 ? `−${formatCurrency(amountAlreadyPaid)}` : formatCurrency(0)}
                </span>
              </div>
            )}

            {/* Final Total Divider */}
            <div className="pt-3 border-t-2 border-slate-300" />

            {/* Remaining Program Fee */}
            {isFullyPaid ? (
              <div className="flex flex-col items-center justify-center py-4 bg-emerald-50 rounded-lg text-emerald-800 text-center">
                <CheckCircle2 className="w-8 h-8 mb-2" />
                <span className="font-bold text-lg">Program Fee Fully Paid</span>
              </div>
            ) : (
              <div className="pt-1">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <span className="font-bold text-slate-900 text-base break-words">Remaining Program Fee</span>
                  <span className="font-mono font-bold text-3xl text-[#0B63E5] shrink-0">
                    {formatCurrency(remainingProgramFee)}
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="block font-medium text-slate-700 mb-0.5">
                    {isIitOcn 
                      ? "Financing charges, if applicable, will be shown separately after you select an EMI option." 
                      : "Payment and financing options will be shown on the next step."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PROGRAM OVERVIEW ACCORDION */}
        <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCurriculumVideo((prev) => !prev)}
            className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs sm:text-sm font-semibold text-[#0B63E5] transition-colors cursor-pointer"
          >
            <span>View Program Overview</span>
            {showCurriculumVideo ? (
              <ChevronUp className="w-4 h-4 shrink-0 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 shrink-0 ml-2" />
            )}
          </button>

          {showCurriculumVideo && (
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <ProgramCurriculumVideoPlayer />
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            id="program-back-btn"
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back</span>
          </button>

          <button
            id="program-continue-btn"
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0B63E5] text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isFullyPaid ? 'Continue' : 'Continue to Payment Options'}</span>
            {!isFullyPaid && <ArrowRight className="w-4 h-4 shrink-0" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
