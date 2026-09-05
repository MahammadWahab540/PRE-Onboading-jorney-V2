import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  GraduationCap,
  Users,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowDown,
  ArrowUp,
  Video,
  ShieldCheck,
} from 'lucide-react';
import type { EnrollmentState } from '../../types';
import { CoApplicantVideoPlayer } from '../CoApplicantVideoPlayer';

interface CoApplicantPageProps {
  state: EnrollmentState;
  token: string;
  onSuccess: (data: { relation: string; name: string; mobile: string }) => void;
  onBack: () => void;
}

export const CoApplicantPage: React.FC<CoApplicantPageProps> = ({
  state,
  token,
  onSuccess,
  onBack,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [relation, setRelation] = useState<string>(
    state.coApplicant.relation || 'Father'
  );
  const [otherRelation, setOtherRelation] = useState<string>('');
  const [name, setName] = useState<string>(state.coApplicant.name || '');
  const [mobile, setMobile] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const relationshipOptions = [
    { id: 'Father', label: 'Father' },
    { id: 'Mother', label: 'Mother' },
    { id: 'Brother (Employed)', label: 'Brother (Employed)' },
    { id: 'Sister (Employed)', label: 'Sister (Employed)' },
    { id: 'Other', label: 'Other' },
  ];

  const validatePhone = (phone: string): boolean => {
    const clean = phone.replace(/\D/g, '');
    return clean.length === 10 && /^[6-9]\d{9}$/.test(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!relation) {
      newErrors.relation = 'Please select a relation.';
    }
    if (relation === 'Other' && !otherRelation.trim()) {
      newErrors.otherRelation = 'Please specify the relationship.';
    }
    if (!name.trim()) {
      newErrors.name = 'Please enter co-applicant’s full name.';
    }
    if (!validatePhone(mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit Indian mobile number.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const finalRelation = relation === 'Other' ? otherRelation.trim() : relation;

    try {
      const res = await fetch(`/api/enrollment/${token}/co-applicant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relation: finalRelation,
          name: name.trim(),
          mobile: mobile.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error || 'Failed to save co-applicant details.' });
        setIsSubmitting(false);
        return;
      }

      onSuccess({
        relation: finalRelation,
        name: name.trim(),
        mobile: mobile.trim(),
      });
    } catch {
      // In case of offline/transient issue, proceed with local valid state
      onSuccess({
        relation: finalRelation,
        name: name.trim(),
        mobile: mobile.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Financing Support
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A192F] tracking-tight mt-2.5 mb-2">
            Who can be your co-applicant?
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Understand who supports your financing before entering contact details. Watch the official video guide below for eligibility rules.
          </p>
        </div>

        {/* EMBEDDED VIDEO EXPLAINER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-[#0B63E5]" />
              <span>Video Guide • కో-అప్లికెంట్ ఎంపిక & రూల్స్</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              54 seconds
            </span>
          </div>

          <CoApplicantVideoPlayer />

          {/* Quick Takeaways from the Video */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-1.5 mt-3">
            <span className="font-bold text-[#0A192F] block text-[11px] uppercase tracking-wider">
              Key Rules from this Video:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Must be an earning family member (e.g. Father, Mother, Brother)</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Active bank account with regular salary/income transactions</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Valid PAN card ready for KYC verification</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero loan defaults ensures guaranteed approval</span>
              </div>
            </div>
          </div>
        </div>

        {/* MANDATORY MOTION GRAPHIC:
            Student card ↓ EMI Application ↑ Parent / Guardian card
            Transforming right-hand person into Co-Applicant */}
        <div className="bg-[#F4F8FF] border border-[#D6E4FA] rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-semibold">
            <span>How Co-Application Works</span>
            <span className="text-[#0B63E5]">Standard NBFC Practice</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center py-2">
            {/* Student Card */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-xs"
            >
              <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B63E5] flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#0A192F] block">
                Learner / Student
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {state.learner.name || 'Rahul Kumar'}
              </span>
            </motion.div>

            {/* Central Connection / EMI Application */}
            <div className="flex sm:flex-col items-center justify-center gap-1 text-center py-1">
              <div className="hidden sm:flex items-center justify-center text-blue-500">
                <ArrowDown className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#0B63E5] text-white text-[11px] font-bold shadow-xs">
                EMI Application
              </div>
              <div className="hidden sm:flex items-center justify-center text-blue-500">
                <ArrowUp className="w-3.5 h-3.5 animate-pulse" />
              </div>
            </div>

            {/* Parent / Guardian Card transforming to Co-Applicant */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-white p-3.5 rounded-xl border-2 border-[#0B63E5] text-center shadow-xs relative"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#0A192F] block">
                Co-Applicant
              </span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                Earning Member
              </span>
            </motion.div>
          </div>

          <p className="text-xs text-slate-600 text-center font-medium mt-3 leading-relaxed">
            "A co-applicant is usually a parent, guardian or eligible earning family member who supports the EMI application."
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Relation Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Relationship with Learner
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {relationshipOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setRelation(opt.id);
                    setErrors((prev) => ({ ...prev, relation: '' }));
                  }}
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                    relation === opt.id
                      ? 'border-[#0B63E5] bg-[#F4F8FF] text-[#0A192F] font-bold ring-1 ring-[#0B63E5]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {relation === opt.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B63E5]" />
                  )}
                </button>
              ))}
            </div>
            {errors.relation && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.relation}</p>
            )}
          </div>

          {/* If Other, specify */}
          {relation === 'Other' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Please specify relationship
              </label>
              <input
                id="other-relation-input"
                type="text"
                value={otherRelation}
                onChange={(e) => setOtherRelation(e.target.value)}
                placeholder="e.g. Uncle, Legal Guardian"
                className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-[#0B63E5] focus:ring-2 focus:ring-blue-100 outline-none"
              />
              {errors.otherRelation && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.otherRelation}</p>
              )}
            </div>
          )}

          {/* Co-Applicant Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Co-applicant Full Name
            </label>
            <input
              id="co-applicant-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Ramesh Kumar"
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-[#0B63E5] focus:ring-2 focus:ring-blue-100 outline-none"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Co-applicant Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                +91
              </span>
              <input
                id="co-applicant-mobile-input"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, ''));
                  setErrors((prev) => ({ ...prev, mobile: '' }));
                }}
                placeholder="9876543210"
                className="w-full p-3 pl-12 rounded-xl border border-slate-300 text-sm focus:border-[#0B63E5] focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            {errors.mobile ? (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.mobile}</p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                We will only send verification and KYC updates to this number.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
            <button
              id="continue-to-kyc-slot-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-[#0B63E5] hover:bg-[#0047BA] active:scale-[0.99] shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to KYC Slot</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="back-to-emi-btn"
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#0A192F] hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
