import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type {
  PortalRoute,
  EnrollmentState,
  PaymentMethodType,
  KycSlot,
} from './types';
import { NxtWaveHeader } from './components/NxtWaveHeader';
import { ProgressIndicator } from './components/ProgressIndicator';
import { AuthPage } from './components/pages/AuthPage';
import { CongratulationsPage } from './components/pages/CongratulationsPage';
import { ProgramSummaryPage } from './components/pages/ProgramSummaryPage';
import { PaymentMethodPage } from './components/pages/PaymentMethodPage';
import { PaymentLinkPage } from './components/pages/PaymentLinkPage';
import { PaymentSuccessPage } from './components/pages/PaymentSuccessPage';
import { WhyNoCostEmiPage } from './components/pages/WhyNoCostEmiPage';
import { CoApplicantPage } from './components/pages/CoApplicantPage';
import { KycSlotPage } from './components/pages/KycSlotPage';
import { KycReadinessPage } from './components/pages/KycReadinessPage';
import { KycConfirmationPage } from './components/pages/KycConfirmationPage';
import { SupportModal } from './components/SupportModal';
import { VoiceAgent } from './components/VoiceAgent';

const DEFAULT_TOKEN = 'nw_rahul_genius_2026';

const initialEnrollmentState: EnrollmentState = {
  journeyId: '',
  token: DEFAULT_TOKEN,
  learner: {
    name: '',
    mobileMasked: '98•••••210',
    emailMasked: 'ra•••••r@gmail.com',
  },
  program: {
    name: 'Genius',
    price: 100000,
    amountPayable: 100000,
  },
  payment: {
    selectedMethod: null,
    status: 'NOT_STARTED',
    amountPaid: 0,
  },
  emi: {
    selected: false,
    amount: 100000,
    tenure: '6 Months',
  },
  coApplicant: {
    exists: false,
    name: '',
    relation: '',
    mobileMasked: '',
  },
  kyc: {
    status: 'NOT_STARTED',
    appointment: null,
  },
  isAuthenticated: false,
};

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const [state, setState] = useState<EnrollmentState>(initialEnrollmentState);
  const [currentRoute, setCurrentRoute] = useState<PortalRoute>('auth');
  const [token, setToken] = useState<string>(DEFAULT_TOKEN);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Parse path & token from current URL
  const parsePath = useCallback(() => {
    const pathname = window.location.pathname;
    const parts = pathname.split('/').filter(Boolean);

    let extractedToken = DEFAULT_TOKEN;
    let extractedRoute: PortalRoute = 'auth';

    if (parts[0] === 'enrollment' && parts[1]) {
      extractedToken = parts[1];
      if (parts[2]) {
        const candidate = parts[2] as PortalRoute;
        const validRoutes: PortalRoute[] = [
          'auth',
          'congratulations',
          'program',
          'payment',
          'pay',
          'payment-success',
          'emi',
          'co-applicant',
          'kyc-slot',
          'kyc-readiness',
          'kyc-confirmation',
        ];
        if (validRoutes.includes(candidate)) {
          extractedRoute = candidate;
        }
      }
    }

    return { token: extractedToken, route: extractedRoute };
  }, []);

  // Update browser URL without refreshing
  const navigateTo = useCallback(
    (newRoute: PortalRoute) => {
      setCurrentRoute(newRoute);
      const newPath = `/enrollment/${token}/${newRoute}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [token]
  );

  // Initial Bootstrap: query /api/enrollment/:token
  useEffect(() => {
    const { token: parsedToken, route: parsedRoute } = parsePath();
    setToken(parsedToken);

    const bootstrap = async () => {
      try {
        const res = await fetch(`/api/enrollment/${parsedToken}`);
        const data = await res.json();

        if (data.valid) {
          const isAuthed = Boolean(data.authentication?.verified);

          setState((prev) => ({
            ...prev,
            token: parsedToken,
            isAuthenticated: isAuthed,
            learner: {
              ...prev.learner,
              ...(data.learner || {}),
            },
            program: {
              ...prev.program,
              ...(data.program || {}),
            },
          }));

          // Route security check: cannot access subsequent pages without auth
          if (!isAuthed) {
            setCurrentRoute('auth');
            if (window.location.pathname !== `/enrollment/${parsedToken}/auth`) {
              window.history.replaceState(
                null,
                '',
                `/enrollment/${parsedToken}/auth`
              );
            }
          } else {
            // Authenticated: respect parsedRoute if not 'auth'
            if (parsedRoute === 'auth') {
              setCurrentRoute('congratulations');
              window.history.replaceState(
                null,
                '',
                `/enrollment/${parsedToken}/congratulations`
              );
            } else {
              setCurrentRoute(parsedRoute);
            }
          }
        }
      } catch (err) {
        console.error('Failed to bootstrap enrollment journey:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    bootstrap();
  }, [parsePath]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const { route: poppedRoute } = parsePath();
      if (!state.isAuthenticated && poppedRoute !== 'auth') {
        setCurrentRoute('auth');
      } else {
        setCurrentRoute(poppedRoute);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parsePath, state.isAuthenticated]);

  // -------------------------------------------------------------------
  // Route Navigation Handlers
  // -------------------------------------------------------------------
  const handleAuthSuccess = (learnerName: string) => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      learner: {
        ...prev.learner,
        name: learnerName,
      },
    }));
    navigateTo('congratulations');
  };

  const handleSelectPaymentMethod = (method: PaymentMethodType) => {
    setState((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        selectedMethod: method,
      },
      emi: {
        ...prev.emi,
        selected: method === 'NO_COST_EMI',
      },
    }));

    if (method === 'NO_COST_EMI') {
      navigateTo('emi');
    } else {
      navigateTo('pay');
    }
  };

  const handlePaymentSuccess = (
    receiptId: string,
    amount: number,
    paidAt: string
  ) => {
    setState((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        status: 'SUCCESS',
        amountPaid: amount,
        receiptId,
        paidAt,
      },
    }));
    navigateTo('payment-success');
  };

  const handleCoApplicantSaved = (coApplicantData: {
    relation: string;
    name: string;
    mobile: string;
  }) => {
    setState((prev) => ({
      ...prev,
      coApplicant: {
        exists: true,
        name: coApplicantData.name,
        relation: coApplicantData.relation,
        mobileMasked: `${coApplicantData.mobile.slice(0, 2)}•••••${coApplicantData.mobile.slice(-3)}`,
      },
    }));
    navigateTo('kyc-slot');
  };

  const handleKycSlotBooked = (slot: KycSlot) => {
    setState((prev) => ({
      ...prev,
      kyc: {
        status: 'SCHEDULED',
        appointment: {
          slotId: slot.id,
          dateLabel: slot.dateLabel,
          scheduledDate: slot.date,
          scheduledTime: slot.displayTime,
          scheduledStart: `${slot.date}T${slot.startTime}:00+05:30`,
          scheduledEnd: `${slot.date}T${slot.endTime}:00+05:30`,
          coApplicantName: prev.coApplicant.name || 'Co-Applicant',
          coApplicantRelation: prev.coApplicant.relation || 'Parent',
        },
      },
    }));
    navigateTo('kyc-readiness');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-[#0B63E5] animate-pulse mb-4">
          <div className="w-6 h-6 rounded-full border-3 border-[#0B63E5] border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[#0A192F]">
          Loading enrollment journey...
        </p>
        <span className="text-xs text-slate-400 mt-1">
          Securing encrypted connection
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* NxtWave Portal Header */}
      <NxtWaveHeader
        currentRoute={currentRoute}
        learnerName={state.learner.name}
        onOpenSupport={() => setIsSupportOpen(true)}
      />

      {/* Progress Indicator (only visible after initial auth or to show current stage) */}
      <ProgressIndicator
        currentRoute={currentRoute}
        paymentMethod={state.payment.selectedMethod}
      />

      {/* Main Page Canvas with Smooth 250-400ms Transitions */}
      <main className="flex-1 flex flex-col justify-center py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {currentRoute === 'auth' && (
            <motion.div
              key="auth"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AuthPage
                state={state}
                token={token}
                onSuccess={handleAuthSuccess}
              />
            </motion.div>
          )}

          {currentRoute === 'congratulations' && (
            <motion.div
              key="congratulations"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CongratulationsPage
                state={state}
                onNext={() => navigateTo('program')}
              />
            </motion.div>
          )}

          {currentRoute === 'program' && (
            <motion.div
              key="program"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProgramSummaryPage
                state={state}
                onNext={() => navigateTo('payment')}
                onBack={() => navigateTo('congratulations')}
              />
            </motion.div>
          )}

          {currentRoute === 'payment' && (
            <motion.div
              key="payment"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentMethodPage
                state={state}
                token={token}
                onSelectMethod={handleSelectPaymentMethod}
                onBack={() => navigateTo('program')}
              />
            </motion.div>
          )}

          {currentRoute === 'pay' && (
            <motion.div
              key="pay"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentLinkPage
                state={state}
                token={token}
                onPaymentSuccess={handlePaymentSuccess}
                onBack={() => navigateTo('payment')}
              />
            </motion.div>
          )}

          {currentRoute === 'payment-success' && (
            <motion.div
              key="payment-success"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentSuccessPage
                state={state}
                onDone={() => navigateTo('program')}
              />
            </motion.div>
          )}

          {currentRoute === 'emi' && (
            <motion.div
              key="emi"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WhyNoCostEmiPage
                state={state}
                onContinue={() => navigateTo('co-applicant')}
                onBack={() => navigateTo('payment')}
              />
            </motion.div>
          )}

          {currentRoute === 'co-applicant' && (
            <motion.div
              key="co-applicant"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CoApplicantPage
                state={state}
                token={token}
                onSuccess={handleCoApplicantSaved}
                onBack={() => navigateTo('emi')}
              />
            </motion.div>
          )}

          {currentRoute === 'kyc-slot' && (
            <motion.div
              key="kyc-slot"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <KycSlotPage
                state={state}
                token={token}
                onSlotBooked={handleKycSlotBooked}
                onBack={() => navigateTo('co-applicant')}
              />
            </motion.div>
          )}

          {currentRoute === 'kyc-readiness' && (
            <motion.div
              key="kyc-readiness"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <KycReadinessPage
                state={state}
                onReady={() => navigateTo('kyc-confirmation')}
                onReschedule={() => navigateTo('kyc-slot')}
              />
            </motion.div>
          )}

          {currentRoute === 'kyc-confirmation' && (
            <motion.div
              key="kyc-confirmation"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <KycConfirmationPage
                state={state}
                onDone={() => navigateTo('program')}
                onReschedule={() => navigateTo('kyc-slot')}
                onContactSupport={() => setIsSupportOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* AI Voice Agent Guide for Every Step */}
      <VoiceAgent currentRoute={currentRoute} state={state} />

      {/* Counselor Support Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        learnerName={state.learner.name}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} NxtWave Disruptive Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Privacy Protected</span>
            <span>•</span>
            <span>256-bit SSL Secure</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsSupportOpen(true)}
              className="hover:text-[#0B63E5] underline hover:no-underline"
            >
              Support Helpline
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
