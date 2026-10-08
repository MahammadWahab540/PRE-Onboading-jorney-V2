import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react';
import type { EnrollmentState } from '../../types';
import { ProgramCurriculumVideoPlayer } from '../ProgramCurriculumVideoPlayer';

interface ProgramSummaryPageProps {
  state: EnrollmentState;
  onUpdateProgramData?: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const tenureConfig = [
  { tenure: 3, jodoGrade: "IITKGPOCN_-_3_EMI", totalFee: 120000, discount: 20000, pendingAmount: 82000, userPaid: 18000, emi: 27333.33 },
  { tenure: 6, jodoGrade: "IITKGPOCN_-_6_EMI", totalFee: 120000, discount: 20000, pendingAmount: 82000, userPaid: 18000, emi: 13666.67 },
  { tenure: 9, jodoGrade: "IITKGPOCN_-_9_EMI", totalFee: 120000, discount: 10160, pendingAmount: 91840, userPaid: 18000, emi: 10204.44 },
  { tenure: 12, jodoGrade: "IITKGPOCN_-_12_EMI", totalFee: 120000, discount: 8520, pendingAmount: 93480, userPaid: 18000, emi: 7790 },
  { tenure: 18, jodoGrade: "IITKGPOCN_-_18_EMI", totalFee: 120000, discount: 2780, pendingAmount: 99220, userPaid: 18000, emi: 5512.22 }
];

export const ProgramSummaryPage: React.FC<ProgramSummaryPageProps> = ({
  state,
  onUpdateProgramData,
  onNext,
  onBack,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [showCurriculumVideo, setShowCurriculumVideo] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const program = state?.program || state?.canonicalJourney?.program || {};
  const sfRecord = (state as any)?.rawRecord || (state as any)?.canonicalJourney?.rawRecord;
  const programName =
    sfRecord?.Program_PRE__c ||
    (state as any)?.Program_PRE__c ||
    program.name ||
    'NxtWave Program';
  const isIitOcn = programName.toLowerCase().includes('iit') || programName.toLowerCase().includes('ocn');

  // Initialize selected tenure from state or default to 3
  const [selectedTenure, setSelectedTenure] = useState<number>(() => {
    if (program.selectedTenure) return program.selectedTenure;
    return 3;
  });

  // Calculate generic non-IIT program values safely
  const standardProgramFee = Number(program.baseFee) || 0;
  const standardScholarshipAmount = Number(program.scholarshipAmount) || 0;
  const standardAmountAlreadyPaid = Number(program.seatReservationPaid) || 0;

  const standardFeeAfterScholarship = Math.max(standardProgramFee - standardScholarshipAmount, 0);
  const standardRemainingProgramFee = Math.max(standardFeeAfterScholarship - standardAmountAlreadyPaid, 0);

  // Derive the active fee values based on the product type and selected tenure
  let totalFee = standardProgramFee;
  let discount = standardScholarshipAmount;
  let userPaid = standardAmountAlreadyPaid;
  let pendingAmount = standardRemainingProgramFee;
  let emi = 0;
  let jodoGrade = '';

  const activeTenureOption = tenureConfig.find(t => t.tenure === selectedTenure);

  if (isIitOcn && activeTenureOption) {
    totalFee = activeTenureOption.totalFee;
    discount = activeTenureOption.discount;
    userPaid = activeTenureOption.userPaid;
    pendingAmount = activeTenureOption.pendingAmount;
    emi = activeTenureOption.emi;
    jodoGrade = activeTenureOption.jodoGrade;
  } else if (!isIitOcn) {
    // For non-IIT programs, check if Salesforce provided an authoritative remaining amount
    const sfRemainingRaw =
      program.remainingAmountPayable ??
      sfRecord?.Remaining_Amount_To_Be_Paid_PRE__c ??
      (state as any)?.Remaining_Amount_To_Be_Paid_PRE__c;
    if (sfRemainingRaw !== undefined && sfRemainingRaw !== null && !isNaN(Number(sfRemainingRaw))) {
      pendingAmount = Number(sfRemainingRaw);
    }
  }

  const yourProgramFee = Math.max(totalFee - discount, 0);

  // Financed amount (e.g. approved loan amount) if pending amount is less than remaining program fee
  const loanFinancedAmount =
    !isIitOcn && pendingAmount < standardRemainingProgramFee
      ? standardRemainingProgramFee - pendingAmount
      : 0;

  // Data Validation
  const expectedPending = totalFee - discount - userPaid;
  const isValidData = totalFee >= 0 && discount >= 0 && userPaid >= 0 && pendingAmount >= 0;
  const isDataLoaded = totalFee > 0 || userPaid > 0;

  useEffect(() => {
    if (isIitOcn && activeTenureOption && pendingAmount !== expectedPending) {
      console.warn(`Fee data mismatch: expected pending ${expectedPending}, but got ${pendingAmount}`);
    }
  }, [isIitOcn, activeTenureOption, pendingAmount, expectedPending]);

  const handleNext = () => {
    if (onUpdateProgramData) {
      if (isIitOcn) {
        onUpdateProgramData({
          baseFee: totalFee,
          scholarshipAmount: discount,
          seatReservationPaid: userPaid,
          amountPayable: pendingAmount,
          remainingAmountPayable: pendingAmount,
          selectedTenure: selectedTenure,
          jodoGrade: jodoGrade,
          emiAmount: emi,
        });
      } else {
        onUpdateProgramData({
          baseFee: standardProgramFee,
          scholarshipAmount: standardScholarshipAmount,
          seatReservationPaid: standardAmountAlreadyPaid,
          amountPayable: pendingAmount,
          remainingAmountPayable: pendingAmount,
        });
      }
    }
    onNext();
  };

  const handleRetry = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Formatters
  const formatINR = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(value);
  };

  if (!isDataLoaded) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 backdrop-blur-sm p-8 text-center"
        >
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-extrabold tracking-tight text-slate-800 mb-2">Unable to load fee details</h2>
          <p className="text-sm text-slate-500 mb-6">
            We couldn't retrieve your latest program fee information. Please retry.
          </p>
          <button
            onClick={handleRetry}
            disabled={isRefreshing}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl inline-flex items-center gap-2"
          >
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Retrying...' : 'Retry'}
          </button>
        </motion.div>
      </div>
    );
  }

  const isFullyPaid = totalFee > 0 && pendingAmount === 0;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ENROLMENT SUMMARY CARD */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 backdrop-blur-sm p-5 sm:p-7 mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 text-balance mb-2">
            Review your program and fee
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 text-pretty">
            Confirm your details and choose a repayment plan before you continue.
          </p>

          {/* Program Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl mb-6 shadow-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5 uppercase tracking-wider">PROGRAM</span>
              <span className="font-extrabold tracking-tight text-slate-900 text-base">{programName}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold w-fit shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Seat Reserved</span>
            </div>
          </div>

          {/* FEE SUMMARY */}
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 py-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                FEE SUMMARY
              </span>
            </div>
            
            <div className="p-4 sm:p-5 space-y-3.5 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-slate-600 font-medium">Program Fee</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">{formatINR(totalFee)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-start text-emerald-700">
                  <div className="flex flex-col">
                    <span className="font-medium">Discount Applied</span>
                  </div>
                  <span className="font-mono tabular-nums font-medium">{"\u2212"} {formatINR(discount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100" />

              <div className="flex justify-between items-start">
                <span className="text-slate-800 font-semibold">Your Program Fee</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">{formatINR(yourProgramFee)}</span>
              </div>

              {(userPaid > 0 || isFullyPaid) && (
                <div className="flex justify-between items-start text-emerald-700">
                  <div className="flex flex-col">
                    <span className="font-medium">Amount Already Paid</span>
                  </div>
                  <span className="font-mono tabular-nums font-medium">
                    {userPaid > 0 ? `\u2212 ${formatINR(userPaid)}` : formatINR(0)}
                  </span>
                </div>
              )}

              {loanFinancedAmount > 0 && (
                <div className="flex justify-between items-start text-emerald-700">
                  <div className="flex flex-col">
                    <span className="font-medium">Loan Financed</span>
                    <span className="text-xs text-slate-400">Pre-approved NBFC Loan</span>
                  </div>
                  <span className="font-mono tabular-nums font-medium">
                    {`\u2212 ${formatINR(loanFinancedAmount)}`}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t-[3px] border-slate-100" />

              {isFullyPaid ? (
                <div className="flex flex-col items-center justify-center py-4 bg-emerald-50 rounded-xl text-emerald-800 text-center border border-emerald-200/60 shadow-xs">
                  <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-600" />
                  <span className="font-bold text-lg">Program Fee Fully Paid</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-1">
                  <span className="font-extrabold tracking-tight text-slate-900 text-base">Pending Amount</span>
                  <span className="font-mono tabular-nums font-extrabold tracking-tight text-2xl text-[#0B63E5]">
                    {formatINR(pendingAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TENURE & EMI SECTION (IIT OCN ONLY) */}
        {isIitOcn && !isFullyPaid && (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 backdrop-blur-sm p-5 sm:p-7 mb-6">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              CHOOSE EMI TENURE
            </h2>
            
            {/* Horizontal Scrollable Segmented Control */}
            <div className="flex overflow-x-auto pb-4 -mx-5 px-5 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap gap-2 hide-scrollbar">
              {tenureConfig.map((opt) => {
                const isSelected = selectedTenure === opt.tenure;
                return (
                  <button
                    key={opt.tenure}
                    onClick={() => setSelectedTenure(opt.tenure)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all whitespace-nowrap active:scale-[0.98] cursor-pointer ${
                      isSelected 
                        ? 'border-[#0B63E5] bg-blue-50/90 text-[#0B63E5] shadow-xs ring-2 ring-blue-500/10' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums">{opt.tenure} Months</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0B63E5]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-100">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Estimated EMI
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="font-mono tabular-nums font-extrabold tracking-tight text-2xl text-slate-900">{formatINR(emi, 2)}</span>
                <span className="text-slate-500 font-medium">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {selectedTenure} monthly instalments
              </p>
              <div className="mt-4 text-[11px] leading-relaxed text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                Final EMI, interest and applicable charges may vary based on the financing provider's approval.
              </div>
            </div>
          </div>
        )}

        {/* NON-IIT OCN DISCLAIMER */}
        {!isIitOcn && !isFullyPaid && (
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 mb-6 text-sm text-slate-600 text-center font-medium shadow-xs">
            Payment and financing options will be shown on the next step.
          </div>
        )}

        {/* PROGRAM OVERVIEW ACCORDION */}
        <div className="mb-6 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowCurriculumVideo((prev) => !prev)}
            className="w-full px-4 py-3.5 bg-white hover:bg-slate-50 flex items-center justify-between text-sm font-semibold text-[#0B63E5] transition-colors cursor-pointer"
          >
            <span>View Program Overview</span>
            {showCurriculumVideo ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showCurriculumVideo && (
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <ProgramCurriculumVideoPlayer />
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!isValidData}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-white text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              isValidData 
                ? 'bg-gradient-to-b from-[#0B63E5] to-[#0047BA] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),_0_2px_6px_rgba(11,99,229,0.25)] hover:from-blue-600 hover:to-blue-700 border border-blue-700 cursor-pointer' 
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <span>
              {isFullyPaid 
                ? 'Continue' 
                : isIitOcn 
                  ? `Continue with ${selectedTenure}-Month EMI` 
                  : 'Continue to Payment Options'}
            </span>
            {!isFullyPaid && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

