import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import * as googleTTS from 'google-tts-api';

const app = express();
const PORT = 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.use(express.json());

// Simulated Salesforce in-memory database store
// Objects: Academy_Onboarding_PRE__c, Co_Applicant_PRE_Pipeline__c, NBFC_Onboarding__c
interface SalesforceJourney {
  Id: string;
  Name: string;
  Student_PRE__c: string;
  Student_Name__c: string;
  Student_Number__c: string;
  Student_WhatsApp_Number__c: string;
  PHONE_NUMBER__c: string;
  Email_PRE__c: string;
  Date_of_Birth__c: string;
  Program_PRE__c: string;
  Program_Registered_UID_PRE__c: string;
  Product_Price__c: number;
  Amount_Payable_PRE__c: number;
  Amount_to_be_Receive__c: number;
  Amount_Paid_Till_Now_To_Nxtwave_PRE__c: number;
  Payment_Plan_PRE__c: 'FULL_PAYMENT' | 'CREDIT_CARD' | 'NO_COST_EMI' | null;
  Payment_Status__c: 'NOT_STARTED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  Payment_Done_PRE__c: boolean;
  Current_Payment_Status__c: string;
  Current_Payment_Status_Date_Time__c: string | null;
  Payment_Date_Time__c: string | null;
  Receipt_Id__c: string | null;
  Applied_Loan_Amount__c: number;
  EMI_Tenure_PRE__c: string;
  Eligible_NBFCs_PRE__c: string;
  Choose_NBFC_PRE__c: string | null;
  Co_Applicant_Name__c: string | null;
  Co_Applicant_Phone_Number_PRE__c: string | null;
  Co_Applicant_Mail_ID_PRE__c: string | null;
  Relation_With_The_Co_Applicant_PRE__c: string | null;
  Co_Applicant_Employment_Type_PRE__c: string | null;
  Co_Applicant_Monthly_Income_PRE__c: number | null;
  Co_applicant_Occupation_PRE__c: string | null;
  Co_Applicant_Address_PRE__c: string | null;
  KYC_Call_Status_PRE__c: 'NOT_APPLIED' | 'SCHEDULED' | 'COMPLETED';
  KYC_Submission_Status_PRE__c: string;
  KYC_Submission_Date_and_Time__c: string | null;
  KYC_Slot_Id__c: string | null;
  KYC_Scheduled_Start__c: string | null;
  KYC_Scheduled_End__c: string | null;
  Authentication_Verified__c: boolean;
  Current_OTP__c: string;
  OTP_Expires_At__c: number;
}

const defaultJourney: SalesforceJourney = {
  Id: 'a0B5g00000GeniusRahul2026',
  Name: 'AOP-2026-0814',
  Student_PRE__c: '0035g00000xyz789',
  Student_Name__c: 'Rahul Kumar',
  Student_Number__c: '9876543210',
  Student_WhatsApp_Number__c: '9876543210',
  PHONE_NUMBER__c: '9876543210',
  Email_PRE__c: 'rahul.kumar@gmail.com',
  Date_of_Birth__c: '2004-05-18',
  Program_PRE__c: 'Genius',
  Program_Registered_UID_PRE__c: 'NW-GEN-2026-09',
  Product_Price__c: 100000,
  Amount_Payable_PRE__c: 100000,
  Amount_to_be_Receive__c: 100000,
  Amount_Paid_Till_Now_To_Nxtwave_PRE__c: 0,
  Payment_Plan_PRE__c: null,
  Payment_Status__c: 'NOT_STARTED',
  Payment_Done_PRE__c: false,
  Current_Payment_Status__c: 'NOT_STARTED',
  Current_Payment_Status_Date_Time__c: null,
  Payment_Date_Time__c: null,
  Receipt_Id__c: null,
  Applied_Loan_Amount__c: 100000,
  EMI_Tenure_PRE__c: '6 Months',
  Eligible_NBFCs_PRE__c: 'Propelld, Avanse',
  Choose_NBFC_PRE__c: null,
  Co_Applicant_Name__c: null,
  Co_Applicant_Phone_Number_PRE__c: null,
  Co_Applicant_Mail_ID_PRE__c: null,
  Relation_With_The_Co_Applicant_PRE__c: null,
  Co_Applicant_Employment_Type_PRE__c: null,
  Co_Applicant_Monthly_Income_PRE__c: null,
  Co_applicant_Occupation_PRE__c: null,
  Co_Applicant_Address_PRE__c: null,
  KYC_Call_Status_PRE__c: 'NOT_APPLIED',
  KYC_Submission_Status_PRE__c: 'NOT_STARTED',
  KYC_Submission_Date_and_Time__c: null,
  KYC_Slot_Id__c: null,
  KYC_Scheduled_Start__c: null,
  KYC_Scheduled_End__c: null,
  Authentication_Verified__c: false,
  Current_OTP__c: '123456',
  OTP_Expires_At__c: Date.now() + 10 * 60 * 1000,
};

const journeyStore = new Map<string, SalesforceJourney>();

function getOrCreateJourney(token: string): SalesforceJourney {
  if (!journeyStore.has(token)) {
    // Clone default journey
    journeyStore.set(token, {
      ...defaultJourney,
      Id: `a0B_${token.slice(0, 8)}`,
      Current_OTP__c: '123456',
      OTP_Expires_At__c: Date.now() + 10 * 60 * 1000,
    });
  }
  return journeyStore.get(token)!;
}

// Seed the default token
journeyStore.set('nw_rahul_genius_2026', { ...defaultJourney });

function maskMobile(phone: string): string {
  if (!phone || phone.length < 5) return '98•••••210';
  const prefix = phone.slice(0, 2);
  const suffix = phone.slice(-3);
  return `${prefix}•••••${suffix}`;
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'ra•••••r@gmail.com';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user.slice(0, 2)}•••••${user.slice(-1)}@${domain}`;
}

// -------------------------------------------------------------
// ENROLLMENT API ROUTES
// Strictly sanitized: NEVER return internal Salesforce IDs, access tokens,
// unmasked PAN/Aadhaar/CIBIL, or internal PRE remarks.
// -------------------------------------------------------------

// Initial bootstrap / verification check
app.get('/api/enrollment/:token', (req, res) => {
  const { token } = req.params;
  const journey = getOrCreateJourney(token);

  if (!journey.Authentication_Verified__c) {
    return res.json({
      valid: true,
      learner: {
        mobileMasked: maskMobile(journey.Student_Number__c),
      },
      authentication: {
        verified: false,
      },
    });
  }

  // Once authenticated, return sanitized student & program profile
  return res.json({
    valid: true,
    learner: {
      name: journey.Student_Name__c,
      mobileMasked: maskMobile(journey.Student_Number__c),
      emailMasked: maskEmail(journey.Email_PRE__c),
    },
    program: {
      name: journey.Program_PRE__c,
      price: journey.Product_Price__c,
      amountPayable: journey.Amount_Payable_PRE__c,
    },
    journey: {
      status: 'READY_FOR_ENROLLMENT',
    },
    authentication: {
      verified: true,
    },
  });
});

// Audio narration streaming endpoint
app.get('/api/video-narration/:lang/:sceneId', (req, res) => {
  const { lang, sceneId } = req.params;
  const safeLang = lang === 'te' ? 'te' : 'en';
  const safeId = parseInt(sceneId, 10) || 1;
  const filePath = path.join(process.cwd(), 'public', 'audio', `scene_${safeLang}_${safeId}.wav`);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(filePath).pipe(res);
  }

  return res.status(404).json({ error: 'Audio narration file not found' });
});

// Send OTP
app.post('/api/enrollment/:token/otp/send', (req, res) => {
  const { token } = req.params;
  const journey = getOrCreateJourney(token);

  // Set fresh OTP
  const generatedOtp = '123456';
  journey.Current_OTP__c = generatedOtp;
  journey.OTP_Expires_At__c = Date.now() + 5 * 60 * 1000;

  return res.json({
    success: true,
    message: `Verification code sent to +91 ${maskMobile(journey.Student_Number__c)}`,
    expiresIn: 300,
    hintOtp: '123456',
  });
});

// Verify OTP
app.post('/api/enrollment/:token/otp/verify', (req, res) => {
  const { token } = req.params;
  const { otp } = req.body;
  const journey = getOrCreateJourney(token);

  if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid 6-digit verification code.',
    });
  }

  if (Date.now() > journey.OTP_Expires_At__c) {
    return res.status(400).json({
      success: false,
      error: 'This code has expired. Request a new one.',
    });
  }

  // We accept '123456' as standard test OTP or exact match
  if (otp.trim() === journey.Current_OTP__c || otp.trim() === '123456') {
    journey.Authentication_Verified__c = true;
    return res.json({
      success: true,
      token,
      verified: true,
      learner: {
        name: journey.Student_Name__c,
      },
    });
  }

  return res.status(400).json({
    success: false,
    error: 'That code doesn’t look right. Please try again.',
  });
});

// Payment options & state
app.get('/api/enrollment/:token/payment', (req, res) => {
  const { token } = req.params;
  const journey = getOrCreateJourney(token);

  return res.json({
    amountPayable: journey.Amount_Payable_PRE__c,
    amountPaid: journey.Amount_Paid_Till_Now_To_Nxtwave_PRE__c,
    selectedMethod: journey.Payment_Plan_PRE__c,
    availableMethods: ['FULL_PAYMENT', 'CREDIT_CARD', 'NO_COST_EMI'],
  });
});

// Select payment method
app.post('/api/enrollment/:token/payment-method', (req, res) => {
  const { token } = req.params;
  const { paymentMethod } = req.body;
  const journey = getOrCreateJourney(token);

  if (!['FULL_PAYMENT', 'CREDIT_CARD', 'NO_COST_EMI'].includes(paymentMethod)) {
    return res.status(400).json({
      error: 'Invalid payment method selected.',
    });
  }

  journey.Payment_Plan_PRE__c = paymentMethod;
  journey.Current_Payment_Status__c = 'METHOD_SELECTED';
  journey.Current_Payment_Status_Date_Time__c = new Date().toISOString();

  return res.json({
    success: true,
    selectedMethod: journey.Payment_Plan_PRE__c,
  });
});

// Payment Link creation/retrieval
app.post('/api/enrollment/:token/payment-link', (req, res) => {
  const { token } = req.params;
  const journey = getOrCreateJourney(token);
  const method = journey.Payment_Plan_PRE__c || 'FULL_PAYMENT';

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  return res.json({
    payment: {
      method,
      amount: journey.Amount_Payable_PRE__c,
      paymentUrl: `https://pay.nxtwave.co.in/checkout/${token}`,
      expiresAt,
      status: journey.Payment_Status__c === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
    },
  });
});

// Payment status polling
app.get('/api/enrollment/:token/status', (req, res) => {
  const { token } = req.params;
  const journey = getOrCreateJourney(token);

  return res.json({
    status: journey.Payment_Status__c,
    amountPaid: journey.Amount_Paid_Till_Now_To_Nxtwave_PRE__c,
    receiptId: journey.Receipt_Id__c || 'NW-PAY-128781',
    paidAt: journey.Payment_Date_Time__c || new Date().toISOString(),
  });
});

// Payment simulation
app.post('/api/enrollment/:token/pay/simulate', (req, res) => {
  const { token } = req.params;
  const journey = getOrCreateJourney(token);

  journey.Payment_Status__c = 'SUCCESS';
  journey.Payment_Done_PRE__c = true;
  journey.Amount_Paid_Till_Now_To_Nxtwave_PRE__c = journey.Amount_Payable_PRE__c;
  journey.Amount_to_be_Receive__c = 0;
  journey.Current_Payment_Status__c = 'PAYMENT_COMPLETED';
  journey.Payment_Date_Time__c = new Date().toISOString();
  journey.Receipt_Id__c = `NW-PAY-${Math.floor(100000 + Math.random() * 900000)}`;

  return res.json({
    payment: {
      status: 'SUCCESS',
      amountPaid: journey.Amount_Paid_Till_Now_To_Nxtwave_PRE__c,
      receiptId: journey.Receipt_Id__c,
      paidAt: journey.Payment_Date_Time__c,
    },
  });
});

// EMI Data
app.get('/api/enrollment/:token/emi', (req, res) => {
  const { token } = req.params;
  const journey = getOrCreateJourney(token);

  return res.json({
    emi: {
      amount: journey.Amount_Payable_PRE__c,
      available: true,
    },
  });
});

// Co-Applicant API
app.get('/api/enrollment/:token/co-applicant', (req, res) => {
  const { token } = req.params;
  const journey = getOrCreateJourney(token);

  return res.json({
    exists: Boolean(journey.Co_Applicant_Name__c),
    relation: journey.Relation_With_The_Co_Applicant_PRE__c,
    name: journey.Co_Applicant_Name__c,
    mobile: journey.Co_Applicant_Phone_Number_PRE__c
      ? maskMobile(journey.Co_Applicant_Phone_Number_PRE__c)
      : null,
  });
});

app.post('/api/enrollment/:token/co-applicant', (req, res) => {
  const { token } = req.params;
  const { relation, name, mobile, otherRelation } = req.body;
  const journey = getOrCreateJourney(token);

  if (!relation || !name || !mobile) {
    return res.status(400).json({
      error: 'Please provide relation, name, and mobile number.',
    });
  }

  // Indian mobile validation (10 digits starting with 6-9)
  const cleanPhone = mobile.replace(/[^0-9]/g, '');
  if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
    return res.status(400).json({
      error: 'Please enter a valid 10-digit Indian mobile number.',
    });
  }

  journey.Relation_With_The_Co_Applicant_PRE__c =
    relation === 'OTHER' && otherRelation ? otherRelation : relation;
  journey.Co_Applicant_Name__c = name.trim();
  journey.Co_Applicant_Phone_Number_PRE__c = cleanPhone;

  return res.json({
    success: true,
    coApplicant: {
      relation: journey.Relation_With_The_Co_Applicant_PRE__c,
      name: journey.Co_Applicant_Name__c,
      mobileMasked: maskMobile(cleanPhone),
    },
  });
});

// KYC Slots API
const availableSlots = [
  {
    id: 'slot_001',
    dateLabel: 'Today',
    date: '2026-09-04',
    startTime: '19:30',
    displayTime: '7:30 PM',
    endTime: '20:00',
    available: true,
  },
  {
    id: 'slot_002',
    dateLabel: 'Tomorrow',
    date: '2026-09-05',
    startTime: '11:00',
    displayTime: '11:00 AM',
    endTime: '11:30',
    available: true,
  },
  {
    id: 'slot_003',
    dateLabel: 'Tomorrow',
    date: '2026-09-05',
    startTime: '18:00',
    displayTime: '6:00 PM',
    endTime: '18:30',
    available: true,
  },
  {
    id: 'slot_004',
    dateLabel: 'Saturday',
    date: '2026-09-06',
    startTime: '16:00',
    displayTime: '4:00 PM',
    endTime: '16:30',
    available: true,
  },
];

app.get('/api/enrollment/:token/kyc/slots', (req, res) => {
  return res.json({
    slots: availableSlots,
  });
});

app.post('/api/enrollment/:token/kyc/book', (req, res) => {
  const { token } = req.params;
  const { slotId } = req.body;
  const journey = getOrCreateJourney(token);

  const slot = availableSlots.find((s) => s.id === slotId) || availableSlots[2];

  journey.KYC_Slot_Id__c = slot.id;
  journey.KYC_Call_Status_PRE__c = 'SCHEDULED';
  journey.KYC_Scheduled_Start__c = `${slot.date}T${slot.startTime}:00+05:30`;
  journey.KYC_Scheduled_End__c = `${slot.date}T${slot.endTime}:00+05:30`;
  journey.KYC_Submission_Date_and_Time__c = new Date().toISOString();

  return res.json({
    success: true,
    kyc: {
      status: 'SCHEDULED',
      slotId: slot.id,
      dateLabel: slot.dateLabel,
      scheduledDate: slot.date,
      scheduledTime: slot.displayTime,
      scheduledStart: journey.KYC_Scheduled_Start__c,
      scheduledEnd: journey.KYC_Scheduled_End__c,
      coApplicant: {
        relation: journey.Relation_With_The_Co_Applicant_PRE__c || 'Father',
        name: journey.Co_Applicant_Name__c || 'Parent/Guardian',
      },
    },
  });
});

app.get('/api/enrollment/:token/kyc/confirmation', (req, res) => {
  const { token } = req.params;
  const journey = getOrCreateJourney(token);

  const slot =
    availableSlots.find((s) => s.id === journey.KYC_Slot_Id__c) ||
    availableSlots[2];

  return res.json({
    kyc: {
      status: journey.KYC_Call_Status_PRE__c === 'SCHEDULED' ? 'SCHEDULED' : 'PENDING',
      scheduledDate: '05 September 2026',
      scheduledTime: slot.displayTime,
      scheduledStart:
        journey.KYC_Scheduled_Start__c || '2026-09-05T18:00:00+05:30',
      scheduledEnd:
        journey.KYC_Scheduled_End__c || '2026-09-05T18:30:00+05:30',
      coApplicant: {
        relation: journey.Relation_With_The_Co_Applicant_PRE__c || 'Father',
        name: journey.Co_Applicant_Name__c || 'Ramesh Kumar',
      },
    },
  });
});

// -------------------------------------------------------------
// VOICE AGENT GUIDANCE API (GEMINI-POWERED)
// -------------------------------------------------------------
const STEP_SCRIPTS: Record<
  string,
  {
    title: string;
    speech: string;
    keyPoints: string[];
    faqSuggestions: string[];
  }
> = {
  auth: {
    title: 'Verification Step',
    speech:
      'Welcome to NxtWave! Let’s verify your identity. Please check your registered mobile number for a 6-digit verification code and enter it on screen.',
    keyPoints: [
      'Enter the 6-digit OTP sent to your phone',
      'If you haven’t received it, click Resend OTP after 30 seconds',
      'For testing, you can use code 123456',
    ],
    faqSuggestions: [
      'Why do I need OTP verification?',
      'What if I didn’t receive the SMS?',
      'Can I change my registered phone number?',
    ],
  },
  congratulations: {
    title: 'Welcome & Next Steps',
    speech:
      'Congratulations on taking this exciting step towards your tech career! Your NxtWave Genius enrollment journey is ready. Let’s review your program details.',
    keyPoints: [
      'Your admission seat is reserved',
      'Review your program highlights and fee breakdown',
      'No immediate payment required on this screen',
    ],
    faqSuggestions: [
      'What is included in the Genius program?',
      'When does the upcoming cohort start?',
      'Can I talk to my counsellor first?',
    ],
  },
  program: {
    title: 'Program Summary',
    speech:
      'Here is your NxtWave Genius program overview. You get structured industry-aligned curriculum, hands-on portfolio projects, and dedicated career placement coaching. When you are ready, click Choose Payment Method.',
    keyPoints: [
      'Total program fee is ₹1,00,000 all inclusive',
      'Lifetime access to learning community & placement portal',
      'Proceed when you are ready to review payment options',
    ],
    faqSuggestions: [
      'Are there any hidden costs or taxes?',
      'What if I need career placement support?',
      'Can I get an official fee receipt?',
    ],
  },
  payment: {
    title: 'Payment Method Selection',
    speech:
      'Choose the payment method that fits your family best. You can pay the complete fee upfront, use a credit card, or choose an affordable No-Cost EMI plan with zero extra interest.',
    keyPoints: [
      'Full Payment: instant receipt & immediate confirmation',
      'Credit Card: standard card checkout with your bank',
      'No-Cost EMI: spread over monthly instalments via partner NBFCs',
    ],
    faqSuggestions: [
      'How does No-Cost EMI work?',
      'Which option gives the quickest confirmation?',
      'Can I change payment method later?',
    ],
  },
  pay: {
    title: 'Checkout & Payment Link',
    speech:
      'You are ready to complete your payment of ₹1,00,000. You can click Pay Securely now, copy this payment link to share with your family, or have it sent to your phone.',
    keyPoints: [
      'Safe 256-bit encrypted payment gateway',
      'Share link with parent or sponsor if needed',
      'Instant confirmation upon successful payment',
    ],
    faqSuggestions: [
      'Can my father pay using UPI on his phone?',
      'How do I copy the payment link?',
      'What happens if the transaction fails?',
    ],
  },
  'payment-success': {
    title: 'Payment Confirmed',
    speech:
      'Wonderful news! Your enrollment payment has been received successfully and your receipt is ready. Welcome to the NxtWave learning community! Our team will reach out with your orientation schedule.',
    keyPoints: [
      'Official fee receipt generated',
      'Your seat is permanently confirmed',
      'Check your WhatsApp and email for student portal login credentials',
    ],
    faqSuggestions: [
      'How do I download my fee receipt?',
      'When do I get my student dashboard login?',
      'Who is my mentor for orientation?',
    ],
  },
  emi: {
    title: 'Why No-Cost EMI',
    speech:
      'With No-Cost EMI, your program fee of ₹1,00,000 is spread across 6 monthly instalments of approximately ₹16,667, with no extra interest charges. Here is how your fee splits across monthly payments.',
    keyPoints: [
      'Spreads program cost with zero interest penalties',
      'Flexible tenures provided by accredited RBI-regulated NBFCs',
      'Final terms and approvals are verified during KYC',
    ],
    faqSuggestions: [
      'Is there really zero interest charged?',
      'What are the minimum eligibility criteria?',
      'Can I prepay the EMI early without penalties?',
    ],
  },
  'co-applicant': {
    title: 'Co-Applicant Selection',
    speech:
      'A co-applicant is an earning family member, like a parent or working sibling, who supports your EMI financing application. Please enter their relationship, full name, and mobile number to continue.',
    keyPoints: [
      'Typically Father, Mother, or employed sibling',
      'Must have a steady income or employment',
      'Only their contact details are needed right now',
    ],
    faqSuggestions: [
      'Can a retired parent be my co-applicant?',
      'What if my brother lives in another city?',
      'Will my co-applicant get an SMS verification?',
    ],
  },
  'kyc-slot': {
    title: 'KYC Slot Booking',
    speech:
      'Choose a date and time that works best for both you and your co-applicant. The digital KYC session takes only 30 minutes, and both of you will join a video call for quick verification.',
    keyPoints: [
      'Joint video call with learner and co-applicant',
      'Takes approximately 20 to 30 minutes',
      'Select a slot when both of you are available together',
    ],
    faqSuggestions: [
      'Can I reschedule if an emergency comes up?',
      'Does my co-applicant need to be in the same room?',
      'How will we join the video call?',
    ],
  },
  'kyc-readiness': {
    title: 'KYC Readiness & Checklist',
    speech:
      'Let’s make sure you are ready for a smooth KYC session. Please keep original PAN cards, Aadhaar phone ready for OTP, and basic address proof handy before your call begins.',
    keyPoints: [
      'Original PAN card of co-applicant and learner',
      'Aadhaar-linked mobile phone active for OTP',
      'Good internet connection and well-lit quiet room',
    ],
    faqSuggestions: [
      'What if Aadhaar mobile number is not updated?',
      'Are physical documents required or soft copies?',
      'What questions will the KYC officer ask?',
    ],
  },
  'kyc-confirmation': {
    title: 'Appointment Confirmed',
    speech:
      'You are all set! Your KYC verification session has been booked. We will send you calendar notifications and WhatsApp reminders before your scheduled time.',
    keyPoints: [
      'Download the calendar invite to your phone',
      'Reminders sent 30 minutes before the call',
      'Contact our counselor helpline anytime for support',
    ],
    faqSuggestions: [
      'How do I add this appointment to Google Calendar?',
      'Can I change my slot later?',
      'Who can I call if I have questions?',
    ],
  },
};

// Return step guidance info
app.get('/api/voice-guide/step-script/:step', (req, res) => {
  const { step } = req.params;
  const script = STEP_SCRIPTS[step] || STEP_SCRIPTS.auth;
  return res.json({ success: true, step, ...script });
});

// Voice counselor AI question & answer
app.post('/api/voice-guide/ask', async (req, res) => {
  const { step, question, learnerName, programName } = req.body;
  const currentStep = step || 'auth';
  const script = STEP_SCRIPTS[currentStep] || STEP_SCRIPTS.auth;

  // If no question was asked, return the step's primary speech guidance
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.json({
      success: true,
      answer: script.speech,
      source: 'script',
      step: currentStep,
    });
  }

  // If GEMINI_API_KEY is available, use Gemini model gemini-3.8-flash
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Learner name: ${learnerName || 'Learner'}
Current Portal Step: ${currentStep} (${script.title})
Context: ${script.speech}
Key points for this step: ${script.keyPoints.join('; ')}
User's Question: "${question}"

Please provide a reassuring, concise (2 to 3 sentences max) answer directly addressing their question as the NxtWave Voice Guide.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are Arya, the official voice guide for the NxtWave Learner Enrollment Portal. You speak warmly, clearly, and concisely to students and their parents. Answers must be 2-3 sentences max, suitable for natural audio text-to-speech. Never mention Salesforce internals or technical database fields. Help them feel confident and supported.',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim();
      if (text) {
        return res.json({
          success: true,
          answer: text,
          source: 'gemini',
          step: currentStep,
        });
      }
    } catch (err) {
      console.warn('Gemini API call error in voice-guide, falling back to rule-based guide:', err);
    }
  }

  // Fallback intelligent answer when offline or if Gemini key is not configured
  const qLower = question.toLowerCase();
  let fallbackAnswer = script.speech;

  if (qLower.includes('emi') || qLower.includes('interest')) {
    fallbackAnswer =
      'Our No-Cost EMI spreads your ₹1,00,000 fee into 6 convenient monthly payments without extra interest charges. The final plan is reviewed and activated after your quick KYC call.';
  } else if (qLower.includes('co-applicant') || qLower.includes('parent') || qLower.includes('father') || qLower.includes('mother')) {
    fallbackAnswer =
      'A co-applicant is an earning parent or guardian who supports your financing application. Both salaried and self-employed parents can serve as your co-applicant.';
  } else if (qLower.includes('document') || qLower.includes('pan') || qLower.includes('aadhaar')) {
    fallbackAnswer =
      'For your KYC call, keep your PAN card, Aadhaar details, and basic address proof ready. Having them on hand makes the 30-minute verification quick and effortless.';
  } else if (qLower.includes('reschedule') || qLower.includes('change time') || qLower.includes('slot')) {
    fallbackAnswer =
      'Yes, you can easily reschedule your KYC slot anytime before the call by clicking the Reschedule button in the portal or contacting your counselor.';
  } else if (qLower.includes('receipt') || qLower.includes('invoice') || qLower.includes('tax')) {
    fallbackAnswer =
      'Once payment is complete, you can download your official fee receipt with complete tax breakdown directly from this portal.';
  } else {
    fallbackAnswer = `Here is what to know for ${script.title}: ${script.keyPoints[0]}. If you need further help, our counselor team is also available on helpline.`;
  }

  return res.json({
    success: true,
    answer: fallbackAnswer,
    source: 'rule_fallback',
    step: currentStep,
  });
});

// Reset endpoint (for testing/demo restart)
app.post('/api/enrollment/:token/reset', (req, res) => {
  const { token } = req.params;
  journeyStore.set(token, {
    ...defaultJourney,
    Current_OTP__c: '123456',
    OTP_Expires_At__c: Date.now() + 10 * 60 * 1000,
  });
  return res.json({ success: true, message: 'Enrollment session reset.' });
});

// Audio Narration Endpoint for Video Scenes
app.get('/api/video-narration/:lang/:sceneId', (req, res) => {
  const { lang, sceneId } = req.params;
  const targetLang = lang === 'en' ? 'en' : 'te';
  const targetScene = Math.min(Math.max(parseInt(sceneId, 10) || 1, 1), 5);
  const audioFilePath = path.join(process.cwd(), 'public', 'audio', `scene_${targetLang}_${targetScene}.wav`);

  if (fs.existsSync(audioFilePath)) {
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(audioFilePath).pipe(res);
  }

  // If specific lang doesn't exist, try alternative
  const fallbackPath = path.join(process.cwd(), 'public', 'audio', `scene_te_${targetScene}.wav`);
  if (fs.existsSync(fallbackPath)) {
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(fallbackPath).pipe(res);
  }

  return res.status(404).json({ error: 'Audio narration not found' });
});

// Program curriculum video explainer narration endpoint
app.get('/api/program-video-narration/:lang/:sceneId', (req, res) => {
  const { lang, sceneId } = req.params;
  const targetLang = lang === 'te' ? 'te' : 'en';
  const targetScene = Math.min(Math.max(parseInt(sceneId, 10) || 1, 1), 7);
  
  // Try MP3 first, then WAV
  const mp3Path = path.join(process.cwd(), 'public', 'audio', 'program_scenes', `scene_${targetLang}_${targetScene}.mp3`);
  const wavPath = path.join(process.cwd(), 'public', 'audio', 'program_scenes', `scene_${targetLang}_${targetScene}.wav`);

  if (fs.existsSync(mp3Path)) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(mp3Path).pipe(res);
  }
  if (fs.existsSync(wavPath)) {
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(wavPath).pipe(res);
  }

  // Fallback to English if Telugu not found or vice versa
  const altLang = targetLang === 'en' ? 'te' : 'en';
  const altMp3 = path.join(process.cwd(), 'public', 'audio', 'program_scenes', `scene_${altLang}_${targetScene}.mp3`);
  if (fs.existsSync(altMp3)) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(altMp3).pipe(res);
  }

  return res.status(404).json({ error: 'Program audio narration not found' });
});

// Gemini TTS endpoint with female voice (Kore)
app.post('/api/tts/gemini', async (req, res) => {
  const { text, voiceName = 'Kore', lang = 'en' } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text prompt required' });
  }

  // 1. Attempt Gemini TTS (gemini-3.1-flash-tts-preview) with female voice
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' } // 'Kore' is female
            }
          }
        }
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          success: true,
          source: 'gemini-3.1-flash-tts-preview',
          voice: voiceName || 'Kore (Female)',
          mimeType: 'audio/wav',
          audioBase64: base64Audio
        });
      }
    } catch (err: any) {
      console.warn('Gemini TTS api notice:', err?.message || err);
    }
  }

  // 2. High-fidelity female voice fallback
  try {
    const targetLang = lang === 'te' ? 'te' : 'en';
    const chunks = await googleTTS.getAllAudioBase64(text, {
      lang: targetLang,
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000
    });
    const combinedBuf = Buffer.concat(chunks.map((c: any) => Buffer.from(c.base64, 'base64')));
    return res.json({
      success: true,
      source: 'female-tts-engine',
      voice: 'Google Studio Female',
      mimeType: 'audio/mpeg',
      audioBase64: combinedBuf.toString('base64')
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'TTS generation failed', details: err?.message });
  }
});

// Explicit static audio serving
app.use('/audio', express.static(path.join(process.cwd(), 'public', 'audio'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.wav')) {
      res.setHeader('Content-Type', 'audio/wav');
    } else if (filePath.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    }
  }
}));
app.use(express.static(path.join(process.cwd(), 'public')));

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NxtWave Enrollment Server running on port ${PORT}`);
  });
}

startServer();
