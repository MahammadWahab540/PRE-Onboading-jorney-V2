import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Compass,
  Code2,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Video,
  CheckCircle2,
  Sparkles,
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
  const programName = state.program.name || 'Genius';
  const feeAmount = state.program.amountPayable || 100000;
  const formattedFee = `₹${feeAmount.toLocaleString('en-IN')}`;

  const benefits = [
    {
      icon: Compass,
      title: 'Structured Learning',
      description: 'Guided learning journey with clear milestones.',
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      icon: Code2,
      title: 'Hands-on Projects',
      description: 'Build practical skills through project-based learning.',
      colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      icon: Briefcase,
      title: 'Career Support',
      description: 'Career preparation support throughout the journey.',
      colorClass: 'text-sky-600 bg-sky-50 border-sky-100',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8"
      >
        {/* Header section */}
        <div className="mb-6">
          <span className="text-xs font-bold text-[#0B63E5] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            Selected Curriculum
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A192F] tracking-tight mt-2.5 mb-1.5">
            Your selected program
          </h1>
          <p className="text-lg font-semibold text-[#0B63E5]">
            NxtWave {programName}
          </p>
        </div>

        {/* EMBEDDED CURRICULUM VIDEO EXPLAINER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-[#0B63E5]" />
              <span>Program Explainer Video • ఎందుకు NxtWave కాలేజీ కంటే భిన్నమైనది?</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              1 min 11 sec
            </span>
          </div>

          <ProgramCurriculumVideoPlayer />

          {/* Key Highlights from the Video */}
          <div className="p-4 rounded-xl bg-[#F0F6FF] border border-[#D0E2FF] text-xs text-slate-700 space-y-2 mt-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0A192F] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0B63E5]" />
                <span>Key Highlights From This Video:</span>
              </span>
              <span className="text-[10px] text-blue-700 font-semibold bg-blue-100/70 px-2 py-0.5 rounded-full">
                Genius Advantage
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Reverse-Engineered</strong> by Amazon & top tech leads</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Real-World Apps</strong>: Build live projects like Zomato clone</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Non-Tech Friendly</strong>: Zero coding background needed</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Govt. NSDC Certified</strong>: India's 1st Industry-Ready credential</span>
              </div>
              <div className="flex items-start gap-1.5 sm:col-span-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Unlimited Interview Access</strong>: 3,000+ hiring companies until placed</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Benefit Cards */}
        <div className="space-y-3.5 mb-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3.5"
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${b.colorClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A192F] mb-0.5">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Program Fee Card (Learner sees fee before payment selection) */}
        <div className="bg-[#F4F8FF] border border-[#D6E4FA] rounded-2xl p-5 mb-8 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Program Fee
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight mt-0.5">
              {formattedFee}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              All inclusive • Full access to curriculum & mentor support
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-full">
              Flexible Plans Available
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="choose-payment-method-btn"
            type="button"
            onClick={onNext}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-[#0B63E5] hover:bg-[#0047BA] active:scale-[0.99] shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Choose Payment Method</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="back-to-congratulations-btn"
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#0A192F] hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
