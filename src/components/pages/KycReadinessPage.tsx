import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileCheck,
  CreditCard,
  MapPin,
  Briefcase,
  Building2,
  ArrowRight,
  RefreshCw,
  Info,
  CalendarCheck,
} from 'lucide-react';
import type { EnrollmentState } from '../../types';

interface KycReadinessPageProps {
  state: EnrollmentState;
  onReady: () => void;
  onReschedule: () => void;
}

export const KycReadinessPage: React.FC<KycReadinessPageProps> = ({
  state,
  onReady,
  onReschedule,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [animationCompleted, setAnimationCompleted] = useState(false);

  const appointment = state.kyc.appointment;
  const timeLabel = appointment?.scheduledTime || '6:00 PM';
  const dateLabel = appointment?.dateLabel || 'Tomorrow';
  const coApplicantRelation =
    appointment?.coApplicantRelation || state.coApplicant.relation || 'Father';

  const docTiles = [
    {
      id: 1,
      title: 'PAN Details',
      subtitle: 'Learner & Co-applicant',
      icon: CreditCard,
    },
    {
      id: 2,
      title: 'Aadhaar + Mobile',
      subtitle: 'Active for OTP',
      icon: FileCheck,
    },
    {
      id: 3,
      title: 'Current Address',
      subtitle: 'Proof of residence',
      icon: MapPin,
    },
    {
      id: 4,
      title: 'Income / Employment',
      subtitle: 'Co-applicant details',
      icon: Briefcase,
    },
    {
      id: 5,
      title: 'Bank Information',
      subtitle: 'Only if requested',
      icon: Building2,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationCompleted(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8"
      >
        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-bold text-[#0B63E5] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            Preparation Guide
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A192F] tracking-tight mt-2.5 mb-2">
            Prepare once, complete KYC smoothly
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Ensure an effortless verification by keeping these key documents ready.
          </p>
        </div>

        {/* Booked Appointment Card */}
        <div className="bg-[#F4F8FF] border border-[#D6E4FA] rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Booked Appointment
            </span>
            <div className="text-lg font-bold text-[#0A192F] mt-0.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0B63E5]" />
              <span>{dateLabel}</span>
              <span className="text-slate-300">•</span>
              <Clock className="w-4 h-4 text-[#0B63E5]" />
              <span>{timeLabel}</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Co-Applicant
            </span>
            <div className="text-sm font-bold text-[#0B63E5] mt-0.5">
              {coApplicantRelation}
            </div>
          </div>
        </div>

        {/* MANDATORY MOTION GRAPHIC:
            PAN tile -> Aadhaar tile -> Address -> Employment -> Bank,
            Each tile receives a checkmark -> progress line toward calendar card: KYC READY (pulse once) */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 mb-8 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-700">
              Readiness Verification Sequence
            </span>
            <span className="text-[11px] font-semibold text-[#0B63E5]">
              {animationCompleted ? 'Verification Ready' : 'Verifying Checklist...'}
            </span>
          </div>

          <div className="space-y-2.5 mb-4">
            {docTiles.map((tile, idx) => {
              const Icon = tile.icon;
              return (
                <motion.div
                  key={tile.id}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 0, x: -12 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: idx * 0.25,
                    ease: 'easeOut',
                  }}
                  className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B63E5] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0A192F]">
                        {tile.title}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {tile.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Animated checkmark */}
                  <motion.div
                    initial={prefersReducedMotion ? { scale: 1 } : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: idx * 0.25 + 0.2,
                      type: 'spring',
                    }}
                    className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Line toward Calendar Card: KYC READY */}
          <div className="pt-2 flex flex-col items-center">
            <motion.div
              initial={prefersReducedMotion ? { scale: 1 } : { scale: 0.95, opacity: 0 }}
              animate={
                animationCompleted
                  ? { scale: [1, 1.04, 1], opacity: 1 }
                  : { opacity: 1 }
              }
              transition={{ duration: 0.5 }}
              className={`w-full py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                animationCompleted
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                  : 'border-blue-300 bg-blue-50 text-blue-800'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>KYC READY FOR APPOINTMENT</span>
            </motion.div>
          </div>
        </div>

        {/* Detailed checklist points */}
        <div className="mb-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Checklist for your session
          </h3>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <strong className="text-[#0A192F] font-semibold">PAN details:</strong>{' '}
              Learner / co-applicant as applicable.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <strong className="text-[#0A192F] font-semibold">Aadhaar + linked mobile:</strong>{' '}
              If Aadhaar OTP verification is required.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <strong className="text-[#0A192F] font-semibold">Current address:</strong>{' '}
              Keep address details ready.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <strong className="text-[#0A192F] font-semibold">Employment / income details:</strong>{' '}
              As requested by the lender.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <strong className="text-[#0A192F] font-semibold">Bank / supporting information:</strong>{' '}
              Only if requested by the lender.
            </div>
          </div>
        </div>

        {/* Non-mandatory note */}
        <div className="mb-8 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>
            Exact document requirements may vary depending on the lender and application.
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="ready-for-kyc-btn"
            type="button"
            onClick={onReady}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-[#0B63E5] hover:bg-[#0047BA] active:scale-[0.99] shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>I’m Ready for KYC</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="reschedule-kyc-btn"
            type="button"
            onClick={onReschedule}
            className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#0A192F] hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reschedule</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
