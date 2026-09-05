import React from 'react';
import { Check } from 'lucide-react';
import type { PortalRoute } from '../types';

interface ProgressIndicatorProps {
  currentRoute: PortalRoute;
  paymentMethod?: string | null;
}

interface StepItem {
  id: number;
  label: string;
  sublabel: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentRoute,
  paymentMethod,
}) => {
  const steps: StepItem[] = [
    { id: 1, label: 'Verification', sublabel: 'Identity Check' },
    { id: 2, label: 'Program', sublabel: 'Curriculum & Fee' },
    {
      id: 3,
      label: paymentMethod === 'NO_COST_EMI' ? 'Financing' : 'Payment',
      sublabel:
        paymentMethod === 'NO_COST_EMI' ? 'EMI & Co-Applicant' : 'Choose Mode',
    },
    {
      id: 4,
      label: paymentMethod === 'NO_COST_EMI' ? 'KYC & Confirmation' : 'Enrolled',
      sublabel:
        paymentMethod === 'NO_COST_EMI' ? 'Slot & Readiness' : 'Receipt Issued',
    },
  ];

  const getActiveStepIndex = (): number => {
    switch (currentRoute) {
      case 'auth':
        return 1;
      case 'congratulations':
      case 'program':
        return 2;
      case 'payment':
      case 'pay':
      case 'emi':
      case 'co-applicant':
        return 3;
      case 'payment-success':
      case 'kyc-slot':
      case 'kyc-readiness':
      case 'kyc-confirmation':
        return 4;
      default:
        return 1;
    }
  };

  const activeStep = getActiveStepIndex();

  return (
    <nav
      aria-label="Enrollment Progress"
      className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-100 py-3 px-4"
    >
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute left-6 right-6 top-3.5 -translate-y-1/2 h-[2px] bg-slate-200 z-0" />
          
          {/* Filled Progress Line */}
          <div
            className="absolute left-6 top-3.5 -translate-y-1/2 h-[2px] bg-[#0B63E5] z-0 transition-all duration-500 ease-out"
            style={{
              width: `${((activeStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />

          {steps.map((step) => {
            const isCompleted = step.id < activeStep;
            const isCurrent = step.id === activeStep;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center group"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#0B63E5] text-white ring-4 ring-blue-50'
                      : isCurrent
                      ? 'bg-white border-2 border-[#0B63E5] text-[#0B63E5] ring-4 ring-blue-100 shadow-sm'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-semibold text-center hidden sm:block whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-[#0A192F] font-bold'
                      : isCompleted
                      ? 'text-[#0B63E5]'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile active indicator text */}
        <div className="sm:hidden mt-2 text-center text-xs text-slate-500 font-medium">
          Step {activeStep} of 4: <span className="text-[#0A192F] font-semibold">{steps[activeStep - 1].label}</span>
        </div>
      </div>
    </nav>
  );
};
