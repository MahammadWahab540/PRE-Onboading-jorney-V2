export type PaymentMethodType = 'FULL_PAYMENT' | 'CREDIT_CARD' | 'NO_COST_EMI';
export type PaymentStatusType = 'NOT_STARTED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
export type KycStatusType = 'NOT_STARTED' | 'SCHEDULED' | 'COMPLETED';

export interface LearnerInfo {
  name?: string;
  mobileMasked: string;
  emailMasked?: string;
}

export interface ProgramInfo {
  name: string;
  price: number;
  amountPayable: number;
}

export interface PaymentState {
  selectedMethod: PaymentMethodType | null;
  status: PaymentStatusType;
  amountPaid: number;
  receiptId?: string;
  paidAt?: string;
}

export interface EmiState {
  selected: boolean;
  amount: number;
  tenure: string | null;
}

export interface CoApplicantState {
  exists: boolean;
  name: string;
  relation: string;
  mobileMasked: string;
}

export interface KycSlot {
  id: string;
  dateLabel: string;
  date: string;
  startTime: string;
  displayTime: string;
  endTime: string;
  available: boolean;
}

export interface KycAppointment {
  slotId?: string;
  dateLabel?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  coApplicantName?: string;
  coApplicantRelation?: string;
}

export interface KycState {
  status: KycStatusType;
  appointment: KycAppointment | null;
}

export interface EnrollmentState {
  journeyId: string;
  token: string;
  learner: LearnerInfo;
  program: ProgramInfo;
  payment: PaymentState;
  emi: EmiState;
  coApplicant: CoApplicantState;
  kyc: KycState;
  isAuthenticated: boolean;
}

export type PortalRoute =
  | 'auth'
  | 'congratulations'
  | 'program'
  | 'payment'
  | 'pay'
  | 'payment-success'
  | 'emi'
  | 'co-applicant'
  | 'kyc-slot'
  | 'kyc-readiness'
  | 'kyc-confirmation';
