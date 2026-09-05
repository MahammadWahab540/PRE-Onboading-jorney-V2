import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Bell,
  CalendarPlus,
  RefreshCw,
  PhoneCall,
  ArrowRight,
  Check,
} from 'lucide-react';
import type { EnrollmentState } from '../../types';

interface KycConfirmationPageProps {
  state: EnrollmentState;
  onDone: () => void;
  onReschedule: () => void;
  onContactSupport: () => void;
}

export const KycConfirmationPage: React.FC<KycConfirmationPageProps> = ({
  state,
  onDone,
  onReschedule,
  onContactSupport,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [calendarAdded, setCalendarAdded] = useState(false);

  const appointment = state.kyc.appointment;
  const dateStr = appointment?.scheduledDate || '05 September 2026';
  const timeStr = appointment?.scheduledTime || '6:00 PM';
  const coApplicant =
    appointment?.coApplicantRelation || state.coApplicant.relation || 'Father';

  const handleAddToCalendar = () => {
    // Generate and download a simple standard .ics file for the learner
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NxtWave//Learner Enrollment KYC//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:NxtWave KYC Verification Session
DESCRIPTION:Joint digital KYC session for NxtWave enrollment with learner and co-applicant (${coApplicant}).
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Reminder: NxtWave KYC Session in 30 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nxtwave-kyc-session.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCalendarAdded(true);
    setTimeout(() => setCalendarAdded(false), 4000);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 sm:py-12">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8 text-center"
      >
        {/* Large Success Indicator */}
        <motion.div
          initial={prefersReducedMotion ? { scale: 1 } : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
          className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-sm"
        >
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </motion.div>

        {/* Heading & Supporting */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A192F] tracking-tight mb-2">
          You’re all set
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8 max-w-sm mx-auto">
          Your KYC session is scheduled.
        </p>

        {/* Scheduled Details Card */}
        <div className="bg-[#F4F8FF] border border-[#D6E4FA] rounded-2xl p-5 mb-6 text-left space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EDFC]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0B63E5]" />
              Date
            </span>
            <span className="text-sm font-bold text-[#0A192F]">
              {dateStr}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[#E2EDFC]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0B63E5]" />
              Time
            </span>
            <span className="text-sm font-bold text-[#0A192F]">
              {timeStr}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[#E2EDFC]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0B63E5]" />
              Co-applicant
            </span>
            <span className="text-sm font-bold text-[#0A192F]">
              {coApplicant}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Scheduled</span>
            </span>
          </div>
        </div>

        {/* Reminder Notification Card */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100/90 text-xs text-slate-600 mb-6 flex items-center gap-2.5 text-left">
          <Bell className="w-4 h-4 text-[#0B63E5] shrink-0" />
          <p>
            We’ll remind you and your co-applicant on WhatsApp and SMS before your session starts.
          </p>
        </div>

        {/* Optional Secondary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
          <button
            id="add-to-calendar-btn"
            type="button"
            onClick={handleAddToCalendar}
            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-[#0B63E5]" />
            <span>{calendarAdded ? 'Saved!' : 'Add to Cal'}</span>
          </button>

          <button
            id="reschedule-btn"
            type="button"
            onClick={onReschedule}
            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reschedule</span>
          </button>

          <button
            id="contact-support-btn"
            type="button"
            onClick={onContactSupport}
            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Support</span>
          </button>
        </div>

        {/* Primary CTA: Done */}
        <button
          id="kyc-confirmation-done-btn"
          type="button"
          onClick={onDone}
          className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-[#0B63E5] hover:bg-[#0047BA] active:scale-[0.99] shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Done</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
