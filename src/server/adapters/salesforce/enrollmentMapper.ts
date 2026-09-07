import type {
  EnrollmentJourney,
  PaymentMethod,
  PaymentStatus,
  KycStatus,
} from '../../../types/journey';
import type { SalesforceOnboardingRecord } from './types';
import { mapNbfcStatus } from './nbfcStatusMapper';
import { resolveJourneyState } from '../../orchestrator/journeyOrchestrator';

export function maskPhone(phone?: string | null): string {
  if (!phone) return '+91 ••••••••••';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 5) return '+91 ••••••••••';
  const lastFour = clean.slice(-4);
  const firstTwo = clean.slice(0, 2);
  return `+91 ${firstTwo}•••••${lastFour}`;
}

export function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return '••••••@nxtwave.in';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0] || 'u'}•••@${domain}`;
  return `${local.slice(0, 2)}••••${local.slice(-1)}@${domain}`;
}

export function mapPaymentMethod(raw?: string | null): PaymentMethod | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes('no-cost') || lower.includes('emi')) return 'NO_COST_EMI';
  if (lower.includes('credit')) return 'CREDIT_CARD';
  if (lower.includes('full')) return 'FULL_PAYMENT';
  return 'FULL_PAYMENT';
}

export function mapPaymentStatus(
  statusRaw?: string | null,
  isPaid?: boolean,
  amountPaid = 0,
  amountPayable = 0
): PaymentStatus {
  if (isPaid || (amountPayable > 0 && amountPaid >= amountPayable)) return 'SUCCESS';
  if (!statusRaw) return 'NOT_STARTED';
  const lower = statusRaw.toLowerCase();
  if (lower.includes('success') || lower.includes('paid')) return 'SUCCESS';
  if (lower.includes('pending') || lower.includes('initiated')) return 'PENDING';
  if (lower.includes('failed')) return 'FAILED';
  if (lower.includes('expired')) return 'EXPIRED';
  return 'NOT_STARTED';
}

export function mapKycStatus(record: SalesforceOnboardingRecord): KycStatus {
  const subStatus = (record.KYC_Submission_Status__c || record.KYC_Submission_Status_PRE__c || '').toUpperCase();
  const callStatus = (record.KYC_Call_Status_PRE__c || '').toUpperCase();

  if (subStatus === 'VERIFIED' || callStatus === 'COMPLETED' || callStatus === 'VERIFIED') {
    return 'VERIFIED';
  }
  if (subStatus === 'ACTION_REQUIRED' || record.Documents_Requested_By_Reps__c) {
    return 'ACTION_REQUIRED';
  }
  if (subStatus === 'SUBMITTED' || callStatus === 'SCHEDULED' || record.KYC_Submission_Date_and_Time__c) {
    return 'SUBMITTED';
  }
  if (subStatus === 'IN_PROGRESS') {
    return 'IN_PROGRESS';
  }
  if (subStatus === 'FAILED' || callStatus === 'FAILED') {
    return 'FAILED';
  }
  return 'NOT_STARTED';
}

/**
 * Transforms an Enterprise Salesforce Onboarding Record into the Canonical EnrollmentJourney.
 */
export function mapSalesforceToJourney(
  record: SalesforceOnboardingRecord,
  sessionToken: string
): EnrollmentJourney {
  const rawStudentName = record.Student_Name__c;
  const learnerName =
    typeof rawStudentName === 'string'
      ? rawStudentName
      : typeof rawStudentName === 'object' && rawStudentName && (rawStudentName as any).name
      ? String((rawStudentName as any).name)
      : 'Learner';
  const firstName =
    typeof learnerName === 'string' && typeof learnerName.split === 'function'
      ? learnerName.split(' ')[0] || 'Learner'
      : 'Learner';

  const baseFee = record.Product_Price__c || 160000;
  const scholarshipAmount =
    record.Scholarship_Amount__c || record.Merit_Scholarship_Amount_PRE__c || 30000;
  const seatReservationPaid = record.Seat_Reservation_Amount_Paid__c || 18000;
  const amountPayable =
    record.Amount_Payable_PRE__c || Math.max(0, baseFee - scholarshipAmount - seatReservationPaid);

  const paymentMethod = mapPaymentMethod(record.Payment_Plan_PRE__c);
  const paymentStatus = mapPaymentStatus(
    record.Payment_Status__c || record.Current_Payment_Status__c,
    record.Payment_Done_PRE__c,
    record.Amount_Paid_Till_Now_To_Nxtwave_PRE__c,
    amountPayable
  );

  const kycStatus = mapKycStatus(record);

  // Parse requested documents if any
  let requestedDocuments: string[] = [];
  if (record.Documents_Requested_By_Reps__c) {
    requestedDocuments = record.Documents_Requested_By_Reps__c
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
  } else if (kycStatus === 'ACTION_REQUIRED') {
    requestedDocuments = ['Latest 3-Month Bank Statement (PDF)', 'Co-Applicant PAN Card Clear Photo'];
  }

  // Co-applicant mapping
  const hasCoApplicant = Boolean(
    record.Co_Applicant_Name__c && record.Co_Applicant_Phone_Number_PRE__c
  );
  const coApplicant = {
    completed: hasCoApplicant,
    relation: record.Relation_With_The_Co_Applicant_PRE__c || 'Father',
    name: record.Co_Applicant_Name__c || '',
    mobileMasked: maskPhone(record.Co_Applicant_Phone_Number_PRE__c),
    emailMasked: maskEmail(record.Co_Applicant_Mail_ID_PRE__c),
    age: record.Co_Applicant_Age_PRE__c || 48,
    employmentType: (record.Co_Applicant_Employment_Type_PRE__c as any) || 'Salaried',
    occupation: record.Co_Applicant_Occupation_PRE__c || 'Private Sector Employee',
    monthlyIncome: record.Co_Applicant_Monthly_Income_PRE__c || 55000,
    monthlyIncomeRange: record.Co_Applicant_Monthly_Income_Range_PRE__c || '₹50,000 - ₹75,000',
    cibilScoreRange: (record.CIBIL_Score_Range_PRE__c as any) || '750+',
    state: record.Co_Applicant_State_PRE__c || 'Telangana',
    address: record.Co_Applicant_Address_PRE__c || '',
    documentReadiness: {
      pan: true,
      aadhaarFront: true,
      aadhaarBack: true,
      bankStatement: true,
      incomeProof: true,
      employmentProof: true,
    },
  };

  // Financing / NBFC mapping
  let financing;
  if (paymentMethod === 'NO_COST_EMI' || record.Applied_Loan_Amount__c) {
    const mappedNbfc = mapNbfcStatus(record);
    const tenureMonths = 6;
    const emiMonthly = Math.round(amountPayable / tenureMonths);

    financing = {
      applied: true,
      appliedAmount: record.Applied_Loan_Amount__c || amountPayable,
      nbfcName: mappedNbfc.lenderName,
      applicationId: `NBFC-${record.Id.slice(-6).toUpperCase()}`,
      status: mappedNbfc.status,
      statusLabel: mappedNbfc.statusLabel,
      approvedAmount: record.Effective_Approved_Amount__c || amountPayable,
      approvedTenure: `${tenureMonths} Months`,
      emiAmountMonthly: emiMonthly,
      emiTenure: record.EMI_Tenure_PRE__c || `${tenureMonths} Months`,
      disbursedAmount: record.Disbursed_Amount_PRE__c,
      disbursedAt: record.Disbursed_Date_Time__c,
      rejectionReason: mappedNbfc.rejectionReason,
      rejectionResolutionAction: mappedNbfc.rejectionResolutionAction,
    };
  }

  // Class access
  const isClassUnlocked =
    record.LMS_Access_Status__c === 'Active' ||
    paymentStatus === 'SUCCESS' ||
    financing?.status === 'DISBURSED';

  const classAccess = {
    status: (isClassUnlocked ? 'ACTIVE' : 'LOCKED') as 'ACTIVE' | 'LOCKED',
    lmsUrl: process.env.LMS_ACCESS_URL || record.LMS_Access_URL__c || 'https://learning.nxtwave.in',
    programTitle: record.Program_PRE__c || 'NxtWave Genius',
    batchStartDate: record.Batch_Start_Date__c || '15 September 2026',
    unlockedAt: isClassUnlocked ? new Date().toISOString() : undefined,
    supportUrl: process.env.SUPPORT_PORTAL_URL || 'https://help.nxtwave.in',
  };

  // Build draft journey for orchestrator resolution
  const draftJourney: EnrollmentJourney = {
    journeyId: record.Id,
    token: sessionToken,
    authenticated: Boolean(record.Authentication_Verified__c),
    learner: {
      name: learnerName,
      firstName,
      mobileMasked: maskPhone(
        record.Student_WhatsApp_Number__c || record.Student_Number__c || record.PHONE_NUMBER__c
      ),
      emailMasked: maskEmail(record.Email_PRE__c),
      registrationId: record.Program_Registered_UID_PRE__c || record.Name,
    },
    program: {
      name: record.Program_PRE__c || 'Genius',
      code: 'GENIUS_PRE_2026',
      baseFee,
      scholarshipAmount,
      scholarshipType: 'Merit Scholarship',
      seatReservationPaid,
      amountPayable,
      totalProgramPrice: baseFee,
      currency: 'INR',
    },
    payment: {
      method: paymentMethod,
      status: paymentStatus,
      amountPaid: record.Amount_Paid_Till_Now_To_Nxtwave_PRE__c || 0,
      receiptId: record.Receipt_Id__c,
      paidAt: record.Payment_Date_Time__c,
    },
    coApplicant: hasCoApplicant ? coApplicant : undefined,
    kyc: {
      status: kycStatus,
      submittedAt: record.KYC_Submission_Date_and_Time__c,
      actionRequiredReason:
        record.ADDITIONAL_DETAILS_REQUIRED_PRE_PRE__c || record.Remarks_PRE__c,
      requestedDocuments,
    },
    financing,
    classAccess,
    journey: {
      currentStage: 'AUTHENTICATION',
      nextAction: 'VERIFY_MOBILE',
      progressPercent: 10,
      recommendedRoute: 'auth',
      lastUpdated: new Date().toISOString(),
    },
  };

  // Compute canonical journey stage & recommended route
  const resolution = resolveJourneyState(draftJourney);

  draftJourney.journey = {
    currentStage: resolution.currentStage,
    nextAction: resolution.nextAction,
    progressPercent: resolution.progressPercent,
    recommendedRoute: resolution.recommendedRoute,
    lastUpdated: new Date().toISOString(),
  };

  return draftJourney;
}
