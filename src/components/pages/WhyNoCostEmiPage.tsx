import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  UserCheck,
  FileCheck2,
  FileSpreadsheet,
  Info,
  Layers,
  Video,
  CheckCircle2,
  Percent,
  Clock,
  Unlock,
  Building2,
  ShieldCheck,
  CreditCard,
  Banknote,
  Briefcase,
} from 'lucide-react';
import type { EnrollmentState } from '../../types';
import { CoApplicantVideoPlayer } from '../CoApplicantVideoPlayer';

interface WhyNoCostEmiPageProps {
  state: EnrollmentState;
  onContinue: () => void;
  onBack: () => void;
}

export const WhyNoCostEmiPage: React.FC<WhyNoCostEmiPageProps> = ({
  state,
  onContinue,
  onBack,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [animationStep, setAnimationStep] = useState<'initial' | 'split'>('initial');

  const amount = state.program.amountPayable || 100000;
  const formattedFee = `₹${amount.toLocaleString('en-IN')}`;
  const monthlyApprox = `₹${Math.round(amount / 6).toLocaleString('en-IN')}`;

  const months = [
    { label: 'Month 1', amount: monthlyApprox },
    { label: 'Month 2', amount: monthlyApprox },
    { label: 'Month 3', amount: monthlyApprox },
    { label: 'Month 4', amount: monthlyApprox },
    { label: 'Month 5', amount: monthlyApprox },
    { label: 'Month 6', amount: monthlyApprox },
  ];

  const steps = [
    {
      num: 1,
      icon: UserCheck,
      title: 'Choose your co-applicant',
      desc: 'Usually a parent or earning family member supporting your application.',
    },
    {
      num: 2,
      icon: FileCheck2,
      title: 'Complete KYC',
      desc: 'Quick digital verification at a convenient time for both of you.',
    },
    {
      num: 3,
      icon: FileSpreadsheet,
      title: 'Review final lender terms',
      desc: 'Review approved tenure and repayment schedule before confirmation.',
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
        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-bold text-[#0B63E5] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            Educational Guide • విద్యా రుణం & EMI
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A192F] tracking-tight mt-2.5 mb-2">
            Pay over time instead of paying the full fee today
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            For eligible families, No-Cost EMI helps spread the program fee into manageable monthly instalments. Watch the video guide and explore the payment mechanisms below.
          </p>
        </div>

        {/* EMBEDDED VIDEO EXPLAINER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-[#0B63E5]" />
              <span>Video Guide • ఎడ్యుకేషన్ లోన్ & కో-అప్లికెంట్ ప్రాసెస్</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              54 seconds • With Telugu & English Subtitles
            </span>
          </div>

          <CoApplicantVideoPlayer />

          {/* Video Takeaways */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-1.5 mt-3">
            <span className="font-bold text-[#0A192F] block text-[11px] uppercase tracking-wider">
              Key Rules from the Explainer:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Co-applicant must be an earning family member (e.g. parent, working sibling)</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Steady salary or business deposits with regular bank records</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Active PAN card ready for digital verification</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Clean repayment history ensures instant approval without hindrance</span>
              </div>
            </div>
          </div>
        </div>

        {/* FINANCING YOUR FUTURE: UNDERSTANDING NXTWAVE EMI & PAYMENT PLANS */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0A192F] to-[#0B2545] rounded-2xl p-5 sm:p-6 mb-8 text-white shadow-md border border-slate-700/80">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
              Payment Blueprint
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mb-1">
            Financing Your Future: Understanding NxtWave EMI & Payment Plans
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-5">
            Transparent financing models designed with RBI-regulated NBFC partners to support learners and parents.
          </p>

          {/* Flexible Payment Models */}
          <div className="space-y-3 mb-6">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
              Flexible Payment Models:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center mb-2">
                  <Banknote className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Prepaid</h4>
                <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                  Discounted upfront payments with immediate receipt and instant seat confirmation.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Postpaid</h4>
                <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                  Pay after placement: Low upfront fees, pay remaining after securing a tech job.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Regulated Loan Plans</h4>
                <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                  Partnered with RBI-approved NBFCs (Varthana, Jodo) for structured monthly instalments.
                </p>
              </div>
            </div>

            {/* Immediate Content Unlocking Card */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center gap-2.5 text-xs text-blue-100">
              <Unlock className="w-5 h-5 text-blue-300 shrink-0" />
              <div>
                <span className="font-bold text-white block text-[11px]">
                  Immediate Content Unlocking:
                </span>
                <span className="text-[11px] text-blue-200">
                  Course access is granted instantly once the e-NACH (auto-debit) setup is verified.
                </span>
              </div>
            </div>
          </div>

          {/* Why Choose EMI or Installments? 3 Pillar Badges */}
          <div className="space-y-2 mb-6">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
              Why Choose EMI or Installments?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 text-emerald-300 mb-1">
                  <Percent className="w-4 h-4" />
                  <span className="text-xs font-bold">0% Interest-Free</span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Many plans offer zero-interest options to keep the total program cost manageable.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 text-cyan-300 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold">Extended Tenures</span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Spread your investment over 6 to 36 months to ensure low monthly family burdens.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 text-amber-300 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold">Minimal Upfront</span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Start your career program with as little as a small booking amount.
                </p>
              </div>
            </div>
          </div>

          {/* Plan Type Comparison Table */}
          <div>
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block mb-2">
              Plan Type Comparison: NxtWave Payment Mechanisms
            </span>
            <div className="overflow-x-auto rounded-xl border border-white/15 bg-black/30">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-white/15 bg-white/5 text-slate-300 font-semibold">
                    <th className="p-2.5">Plan Type</th>
                    <th className="p-2.5">Core Requirement</th>
                    <th className="p-2.5">Access Timing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  <tr>
                    <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                      Full Payment
                    </td>
                    <td className="p-2.5 text-slate-300">Entire Fee Upfront</td>
                    <td className="p-2.5 text-emerald-300 font-medium">After Payment</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      Loan Plan
                    </td>
                    <td className="p-2.5 text-slate-300">KYC + e-NACH Setup</td>
                    <td className="p-2.5 text-emerald-300 font-medium">After Verification</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      Periodic
                    </td>
                    <td className="p-2.5 text-slate-300">6-Month Installments</td>
                    <td className="p-2.5 text-emerald-300 font-medium">After 1st Installment</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MANDATORY MOTION GRAPHIC: Fee Splits into Monthly Cards across horizontal timeline */}
        <div className="bg-[#F4F8FF] border border-[#D6E4FA] rounded-2xl p-5 mb-8 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#0B63E5]" />
              Interactive EMI Breakdown
            </span>
            <button
              type="button"
              onClick={() =>
                setAnimationStep((prev) =>
                  prev === 'initial' ? 'split' : 'initial'
                )
              }
              className="text-[11px] font-semibold text-[#0B63E5] hover:underline"
            >
              {animationStep === 'initial' ? 'View Split Animation' : 'Replay'}
            </button>
          </div>

          <div className="min-h-[160px] flex flex-col justify-center items-center relative py-2">
            {/* Start State: One Large Card */}
            {animationStep === 'initial' ? (
              <motion.div
                key="initial-card"
                initial={prefersReducedMotion ? { opacity: 1 } : { scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-xs bg-white rounded-2xl p-5 border-2 border-blue-200 shadow-sm text-center"
              >
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Program Fee
                </span>
                <div className="text-2xl font-black text-[#0A192F] tracking-tight mt-1 mb-3">
                  {formattedFee}
                </div>
                <button
                  type="button"
                  onClick={() => setAnimationStep('split')}
                  className="w-full py-2 px-3 rounded-xl bg-blue-50 text-[#0B63E5] text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>See How It Divides</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              /* Split State: Cards moving across horizontal timeline */
              <motion.div
                key="split-timeline"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full"
              >
                <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                  {months.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 0, x: -15, scale: 0.85 }
                      }
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{
                        duration: 0.35,
                        delay: idx * 0.1,
                        ease: 'easeOut',
                      }}
                      className="shrink-0 w-24 bg-white rounded-xl p-3 border border-blue-200 shadow-sm text-center"
                    >
                      <span className="text-[10px] font-bold text-[#0B63E5] block">
                        {m.label}
                      </span>
                      <div className="text-xs font-black text-[#0A192F] mt-1">
                        ~{m.amount}
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        Instalment
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <p className="text-xs text-slate-600 text-center font-medium mt-1">
            "Your program fee is spread across monthly instalments based on the final approved plan."
          </p>
        </div>

        {/* 3 Revealed Steps */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            What happens next in this flow:
          </h2>
          <div className="space-y-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#0B63E5] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {s.num}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0A192F]">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="mb-8 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            Final eligibility, tenure and lender conditions are confirmed after the lender’s assessment.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="continue-with-emi-btn"
            type="button"
            onClick={onContinue}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-[#0B63E5] hover:bg-[#0047BA] active:scale-[0.99] shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue with No-Cost EMI</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="choose-another-payment-btn"
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#0A192F] hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Choose Another Method</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
