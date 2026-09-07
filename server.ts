import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import * as googleTTS from 'google-tts-api';

import { salesforceClient } from './src/server/adapters/salesforce/client';
import {
  mapSalesforceToJourney,
  maskPhone,
  maskEmail,
} from './src/server/adapters/salesforce/enrollmentMapper';
import { otpStore } from './src/server/adapters/auth/otpStore';
import { paymentProvider } from './src/server/adapters/payment/paymentProvider';
import type { PaymentMethod } from './src/types/journey';

const app = express();
const PORT = 3000;

// Lazy initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

app.use(express.json());

// -------------------------------------------------------------
// V3 CANONICAL JOURNEY ENDPOINT
// -------------------------------------------------------------
app.get('/api/enrollment/:token/journey', async (req, res) => {
  const { token } = req.params;
  try {
    const record = await salesforceClient.getRecordByToken(token);
    if (!record) {
      return res.status(404).json({ error: 'Enrollment session not found' });
    }
    const journey = mapSalesforceToJourney(record, token);
    return res.json({ success: true, journey });
  } catch (err: any) {
    console.error('Error fetching canonical journey:', err);
    return res.status(500).json({ error: 'Failed to load enrollment journey' });
  }
});

// -------------------------------------------------------------
// V3 TWO-STAGE AUTHENTICATION API
// -------------------------------------------------------------
app.post('/api/auth/send-otp', async (req, res) => {
  const { mobile, token } = req.body;

  if (!mobile || typeof mobile !== 'string') {
    return res.status(400).json({ error: 'Please enter a mobile number' });
  }

  const cleanPhone = mobile.replace(/\D/g, '');
  if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
    return res.status(400).json({
      error: 'Please enter a valid 10-digit Indian mobile number starting with 6-9',
    });
  }

  try {
    // 1. Locate learner in Salesforce
    const foundRecord = await salesforceClient.findRecordByMobile(cleanPhone);
    const sessionToken = token || foundRecord?.Token__c || 'nw_rahul_genius_2026';

    // 2. Generate / Resend OTP via dedicated OTP store
    const { cooldownSeconds } = otpStore.createOrResendOtp(sessionToken, cleanPhone);

    return res.json({
      success: true,
      token: sessionToken,
      maskedMobile: maskPhone(cleanPhone),
      cooldownSeconds,
      demoAllowed: process.env.ALLOW_DEMO_OTP !== 'false',
    });
  } catch (err: any) {
    return res.status(429).json({ error: err.message || 'Failed to send OTP' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { token, otp } = req.body;

  if (!token || !otp) {
    return res.status(400).json({ error: 'Token and verification code are required' });
  }

  const verification = otpStore.verifyOtp(token, otp);
  if (!verification.success) {
    return res.status(400).json({
      success: false,
      error: verification.error || 'Invalid verification code',
      code: verification.code,
    });
  }

  try {
    // Update Salesforce record authentication state
    const updatedRecord = await salesforceClient.updateRecord(token, {
      Authentication_Verified__c: true,
    });
    const journey = mapSalesforceToJourney(updatedRecord, token);

    return res.json({
      success: true,
      journey,
      recommendedRoute: journey.journey.recommendedRoute,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update authentication state' });
  }
});

// -------------------------------------------------------------
// PAYMENT SELECTION & DIRECT CHECKOUT APIS
// -------------------------------------------------------------
app.post('/api/enrollment/:token/payment-method', async (req, res) => {
  const { token } = req.params;
  const { method } = req.body;

  const validMethods: PaymentMethod[] = ['FULL_PAYMENT', 'CREDIT_CARD', 'NO_COST_EMI'];
  if (!validMethods.includes(method)) {
    return res.status(400).json({ error: 'Invalid payment method selected' });
  }

  try {
    let planString = 'Full Payment';
    if (method === 'CREDIT_CARD') planString = 'Credit Card';
    if (method === 'NO_COST_EMI') planString = 'No-Cost EMI';

    const updated = await salesforceClient.updateRecord(token, {
      Payment_Plan_PRE__c: planString,
    });
    const journey = mapSalesforceToJourney(updated, token);

    return res.json({ success: true, journey });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save payment method' });
  }
});

app.post('/api/enrollment/:token/payment-link', async (req, res) => {
  const { token } = req.params;
  const { amount } = req.body;

  try {
    const record = await salesforceClient.getRecordByToken(token);
    const learnerName = record?.Student_Name__c || 'Learner';
    const amountPayable = amount || record?.Amount_Payable_PRE__c || 112000;

    const order = await paymentProvider.createOrder(token, amountPayable, learnerName);
    return res.json({ success: true, ...order });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate payment link' });
  }
});

app.post('/api/enrollment/:token/pay/simulate', async (req, res) => {
  const { token } = req.params;

  try {
    const record = await salesforceClient.getRecordByToken(token);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    const receiptId = `RCP-PRE-${Date.now().toString().slice(-6)}`;
    const updated = await salesforceClient.updateRecord(token, {
      Payment_Status__c: 'Success',
      Payment_Done_PRE__c: true,
      Amount_Paid_Till_Now_To_Nxtwave_PRE__c: record.Amount_Payable_PRE__c,
      Receipt_Id__c: receiptId,
      Payment_Date_Time__c: new Date().toISOString(),
      LMS_Access_Status__c: 'Active',
    });

    const journey = mapSalesforceToJourney(updated, token);
    return res.json({ success: true, receiptId, journey });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to simulate payment' });
  }
});

// -------------------------------------------------------------
// CO-APPLICANT API
// -------------------------------------------------------------
app.post('/api/enrollment/:token/co-applicant', async (req, res) => {
  const { token } = req.params;
  const {
    relation,
    name,
    mobile,
    age,
    employmentType,
    monthlyIncomeRange,
    cibilScoreRange,
    state,
    address,
  } = req.body;

  if (!relation || !name || !mobile) {
    return res.status(400).json({
      error: 'Relation, full name, and mobile number are required',
    });
  }

  const cleanPhone = mobile.replace(/\D/g, '');
  if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
    return res.status(400).json({
      error: 'Please enter a valid 10-digit Indian mobile number',
    });
  }

  try {
    const updated = await salesforceClient.updateRecord(token, {
      Relation_With_The_Co_Applicant_PRE__c: relation,
      Co_Applicant_Name__c: name.trim(),
      Co_Applicant_Phone_Number_PRE__c: cleanPhone,
      Co_Applicant_Age_PRE__c: age ? Number(age) : 48,
      Co_Applicant_Employment_Type_PRE__c: employmentType || 'Salaried',
      Co_Applicant_Monthly_Income_Range_PRE__c:
        monthlyIncomeRange || '₹50,000 - ₹75,000',
      CIBIL_Score_Range_PRE__c: cibilScoreRange || '750+',
      Co_Applicant_State_PRE__c: state || 'Telangana',
      Co_Applicant_Address_PRE__c: address || '',
    });

    const journey = mapSalesforceToJourney(updated, token);
    return res.json({ success: true, journey });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save co-applicant details' });
  }
});

// -------------------------------------------------------------
// STATE-DRIVEN KYC APIS (NO SLOTS)
// -------------------------------------------------------------
app.post('/api/enrollment/:token/kyc/action', async (req, res) => {
  const { token } = req.params;
  const { action } = req.body;

  try {
    let updates: any = {};
    if (action === 'SUBMIT') {
      updates = {
        KYC_Submission_Status__c: 'SUBMITTED',
        KYC_Submission_Date_and_Time__c: new Date().toISOString(),
        ADDITIONAL_DETAILS_REQUIRED_PRE_PRE__c: null,
      };
    } else if (action === 'COMPLETE' || action === 'VERIFY') {
      updates = {
        KYC_Submission_Status__c: 'VERIFIED',
        KYC_Call_Status_PRE__c: 'COMPLETED',
      };
    } else if (action === 'RETRY_DOCUMENTS') {
      updates = {
        KYC_Submission_Status__c: 'SUBMITTED',
        KYC_Submission_Date_and_Time__c: new Date().toISOString(),
        ADDITIONAL_DETAILS_REQUIRED_PRE_PRE__c: null,
      };
    }

    const updated = await salesforceClient.updateRecord(token, updates);
    const journey = mapSalesforceToJourney(updated, token);
    return res.json({ success: true, journey });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process KYC update' });
  }
});

// -------------------------------------------------------------
// NBFC FINANCING STATUS & ACTIONS
// -------------------------------------------------------------
app.get('/api/enrollment/:token/nbfc-status', async (req, res) => {
  const { token } = req.params;
  try {
    const record = await salesforceClient.getRecordByToken(token);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    const journey = mapSalesforceToJourney(record, token);
    return res.json({
      success: true,
      financing: journey.financing,
      journey: journey.journey,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load NBFC status' });
  }
});

app.post('/api/enrollment/:token/nbfc/action', async (req, res) => {
  const { token } = req.params;
  const { action } = req.body;

  try {
    let updates: any = {};
    const record = await salesforceClient.getRecordByToken(token);
    const amount = record?.Amount_Payable_PRE__c || 112000;

    if (action === 'SETUP_EMI') {
      updates = {
        Northern_Arc_Overall_Stages__c: 'EMI Setup Done',
        Fibe_Overall_Stages__c: 'APPROVED',
      };
    } else if (action === 'DISBURSE_SIMULATE') {
      updates = {
        Northern_Arc_Overall_Stages__c: 'Loan Disbursed',
        Disbursed_Amount_PRE__c: amount,
        Disbursed_Date_Time__c: new Date().toISOString(),
        LMS_Access_Status__c: 'Active',
      };
    } else if (action === 'CHANGE_CO_APPLICANT') {
      updates = {
        Co_Applicant_Name__c: null,
        Co_Applicant_Phone_Number_PRE__c: null,
        Northern_Arc_Overall_Stages__c: 'Application Form Filled',
        KYC_Submission_Status__c: 'NOT_STARTED',
      };
    } else if (action === 'RETRY_DOCUMENTS') {
      updates = {
        Northern_Arc_Overall_Stages__c: 'Review In Progress',
        Fibe_Overall_Stages__c: 'UNDERWRITING',
      };
    }

    const updated = await salesforceClient.updateRecord(token, updates);
    const journey = mapSalesforceToJourney(updated, token);
    return res.json({ success: true, journey });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update NBFC action' });
  }
});

// -------------------------------------------------------------
// SUPPORT TICKETING API
// -------------------------------------------------------------
app.post('/api/enrollment/:token/support-ticket', (req, res) => {
  const { token } = req.params;
  const { category, description, learnerName, contactNumber } = req.body;

  const ticketId = `TKT-NW-${Date.now().toString().slice(-6)}`;
  console.log(
    `[Support Ticket Created] ${ticketId} for token=${token} (Category: ${category}) - "${description}"`
  );

  return res.json({
    success: true,
    ticketId,
    message:
      'Your request has been escalated to your dedicated admissions counselor. You will receive a callback within 30 minutes.',
  });
});

// -------------------------------------------------------------
// RESET SESSION / DEMO FIXTURE
// -------------------------------------------------------------
app.post('/api/enrollment/:token/reset', async (req, res) => {
  const { token } = req.params;
  await salesforceClient.resetToken(token);
  const record = await salesforceClient.getRecordByToken(token);
  const journey = mapSalesforceToJourney(record!, token);
  return res.json({
    success: true,
    message: 'Enrollment session reset to initial state.',
    journey,
  });
});

// -------------------------------------------------------------
// BACKWARD-COMPATIBILITY ENDPOINTS (V2 -> V3 BRIDGE)
// -------------------------------------------------------------
app.get('/api/enrollment/:token', async (req, res) => {
  const { token } = req.params;
  const record = await salesforceClient.getRecordByToken(token);
  if (!record) return res.status(404).json({ valid: false, error: 'Not found' });
  const journey = mapSalesforceToJourney(record, token);

  return res.json({
    valid: true,
    token,
    authentication: { verified: journey.authenticated },
    learner: {
      name: journey.learner.name,
      mobileMasked: journey.learner.mobileMasked,
      emailMasked: journey.learner.emailMasked,
    },
    program: {
      name: journey.program.name,
      price: journey.program.baseFee,
      amountPayable: journey.program.amountPayable,
    },
    payment: {
      status: journey.payment.status,
      selectedMethod: journey.payment.method,
      amountPaid: journey.payment.amountPaid,
    },
    coApplicant: journey.coApplicant,
    kyc: journey.kyc,
    journey: journey.journey,
    canonicalJourney: journey,
  });
});

app.post('/api/enrollment/:token/otp/send', async (req, res) => {
  const { token } = req.params;
  const record = await salesforceClient.getRecordByToken(token);
  const phone = record?.Student_WhatsApp_Number__c || '9876543210';
  try {
    const { cooldownSeconds } = otpStore.createOrResendOtp(token, phone);
    return res.json({
      success: true,
      maskedMobile: maskPhone(phone),
      cooldownSeconds,
    });
  } catch (err: any) {
    return res.status(429).json({ error: err.message });
  }
});

app.post('/api/enrollment/:token/otp/verify', async (req, res) => {
  const { token } = req.params;
  const { otp } = req.body;
  const verification = otpStore.verifyOtp(token, otp);
  if (!verification.success) {
    return res.status(400).json({ error: verification.error });
  }
  const updated = await salesforceClient.updateRecord(token, {
    Authentication_Verified__c: true,
  });
  const journey = mapSalesforceToJourney(updated, token);
  return res.json({ success: true, learner: journey.learner, journey });
});

app.get('/api/enrollment/:token/payment', async (req, res) => {
  const { token } = req.params;
  const record = await salesforceClient.getRecordByToken(token);
  const journey = mapSalesforceToJourney(record!, token);
  return res.json({ payment: journey.payment });
});

app.get('/api/enrollment/:token/emi', async (req, res) => {
  const { token } = req.params;
  const record = await salesforceClient.getRecordByToken(token);
  const journey = mapSalesforceToJourney(record!, token);
  return res.json({
    emi: {
      amount: journey.program.amountPayable,
      available: true,
    },
  });
});

app.get('/api/enrollment/:token/co-applicant', async (req, res) => {
  const { token } = req.params;
  const record = await salesforceClient.getRecordByToken(token);
  const journey = mapSalesforceToJourney(record!, token);
  return res.json({
    exists: Boolean(journey.coApplicant?.name),
    relation: journey.coApplicant?.relation,
    name: journey.coApplicant?.name,
    mobile: journey.coApplicant?.mobileMasked,
  });
});

// Deprecated KYC slot stubs (safe fallback)
app.get('/api/enrollment/:token/kyc/slots', (_req, res) => {
  return res.json({ slots: [] });
});
app.post('/api/enrollment/:token/kyc/book', (_req, res) => {
  return res.json({ success: true, status: 'SUBMITTED' });
});
app.get('/api/enrollment/:token/kyc/confirmation', async (req, res) => {
  const { token } = req.params;
  const record = await salesforceClient.getRecordByToken(token);
  const journey = mapSalesforceToJourney(record!, token);
  return res.json({ kyc: journey.kyc });
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
      'Welcome to NxtWave! Let’s verify your registered mobile number to access your official enrollment portal.',
    keyPoints: [
      'Enter your 10-digit registered Indian mobile number',
      'Verify with the 6-digit code sent to your phone',
      'For test sessions, you can use code 123456',
    ],
    faqSuggestions: [
      'Why do I need mobile verification?',
      'What if I didn’t receive the SMS code?',
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
      'Can I talk to my counselor first?',
    ],
  },
  program: {
    title: 'Program Fee & Scholarship Breakdown',
    speech:
      'Here is your transparent fee breakdown for NxtWave Genius. Review your merit scholarship, deduction of your seat reservation fee, and net amount payable.',
    keyPoints: [
      'Total Program Price: ₹1,60,000',
      'Merit Scholarship: -₹30,000',
      'Seat Reservation Paid: -₹18,000',
      'Net Amount Payable: ₹1,12,000 all inclusive',
    ],
    faqSuggestions: [
      'Are there any hidden charges or taxes?',
      'Can I get an official tax invoice?',
      'How does No-Cost EMI compare to full payment?',
    ],
  },
  payment: {
    title: 'Payment Method Selection',
    speech:
      'Choose the payment option that suits your family best. You can pay the complete fee upfront, use a credit card, or choose an affordable No-Cost EMI plan with zero extra interest.',
    keyPoints: [
      'Full Payment: instant receipt & immediate LMS activation',
      'Credit Card: standard instant checkout',
      'No-Cost EMI: spread over 6 monthly installments with zero interest',
    ],
    faqSuggestions: [
      'How does No-Cost EMI work?',
      'Which option gives the quickest class access?',
      'Can I change payment method later?',
    ],
  },
  pay: {
    title: 'Checkout & Payment Link',
    speech:
      'You are ready to complete your payment of ₹1,12,000. You can click Pay Securely now or scan the UPI QR code.',
    keyPoints: [
      'Safe 256-bit encrypted payment gateway',
      'Scan UPI QR code on Google Pay, PhonePe, or Paytm',
      'Instant receipt upon transaction completion',
    ],
    faqSuggestions: [
      'Can my parent pay using UPI from another device?',
      'How do I copy the payment link?',
      'What happens if the transaction fails?',
    ],
  },
  'payment-success': {
    title: 'Payment Confirmed',
    speech:
      'Wonderful news! Your enrollment payment has been received successfully and your receipt is ready. Welcome to NxtWave!',
    keyPoints: [
      'Official fee receipt generated',
      'Admission seat permanently confirmed',
      'Your class access portal is ready',
    ],
    faqSuggestions: [
      'How do I download my fee receipt?',
      'When do classes begin?',
      'How do I access the learning portal?',
    ],
  },
  emi: {
    title: 'Why No-Cost EMI',
    speech:
      'With No-Cost EMI, your program fee of ₹1,12,000 is spread across 6 monthly instalments of approximately ₹18,667, with zero interest charges.',
    keyPoints: [
      'Spreads program cost with zero interest penalties',
      'Flexible tenures provided by RBI-regulated partner NBFCs',
      'Approval is subject to lender credit verification',
    ],
    faqSuggestions: [
      'Is there really zero interest charged?',
      'What are the eligibility requirements?',
      'Can I prepay the EMI early without penalties?',
    ],
  },
  'co-applicant': {
    title: 'Co-Applicant Selection',
    speech:
      'A co-applicant is an earning family member, like a parent or working sibling, who supports your EMI financing application. Please provide their details to continue.',
    keyPoints: [
      'Typically Father, Mother, or employed sibling',
      'Must have regular income or employment',
      'Only basic contact and income details needed right now',
    ],
    faqSuggestions: [
      'Can a retired parent be my co-applicant?',
      'What if my co-applicant lives in another city?',
      'Will my co-applicant get an SMS verification?',
    ],
  },
  kyc: {
    title: 'Digital KYC Verification',
    speech:
      'Let’s verify your identity and documents digitally. Have your PAN and Aadhaar details handy for a seamless verification.',
    keyPoints: [
      'Digital document check: PAN card & Aadhaar',
      'Upload clear, unblurred photos or PDFs',
      'Instant verification update once submitted',
    ],
    faqSuggestions: [
      'What if my Aadhaar is not linked to mobile?',
      'What documents are acceptable as income proof?',
      'How long does KYC verification take?',
    ],
  },
  'nbfc-status': {
    title: 'Financing Status & Timeline',
    speech:
      'Here is the live status of your education financing application with our partner NBFC. You can track review progress, complete auto-debit setup, and resolve any questions.',
    keyPoints: [
      'Live timeline tracking from review to disbursement',
      'Set up your auto-debit once approved',
      'Direct counselor assistance available if help is needed',
    ],
    faqSuggestions: [
      'How long does lender review take?',
      'What if my co-applicant’s credit score is low?',
      'How do I complete the EMI auto-debit mandate?',
    ],
  },
  'class-access': {
    title: 'Welcome to NxtWave Learning',
    speech:
      'Congratulations! Your enrollment is 100% complete and your learning journey begins now. Access your student portal and orientation materials.',
    keyPoints: [
      'Official student LMS credentials unlocked',
      'Join your cohort community and orientation session',
      '24/7 student support and mentoring available',
    ],
    faqSuggestions: [
      'How do I log in to the learning portal?',
      'When is the orientation call scheduled?',
      'Who is my dedicated student success mentor?',
    ],
  },
};

app.get('/api/voice-guide/step-script/:step', (req, res) => {
  const { step } = req.params;
  const script = STEP_SCRIPTS[step] || STEP_SCRIPTS.auth;
  return res.json({ success: true, step, ...script });
});

app.post('/api/voice-guide/ask', async (req, res) => {
  const { step, question, learnerName } = req.body;
  const currentStep = step || 'auth';
  const script = STEP_SCRIPTS[currentStep] || STEP_SCRIPTS.auth;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.json({
      success: true,
      answer: script.speech,
      source: 'script',
      step: currentStep,
    });
  }

  if (process.env.GEMINI_API_KEY) {
    const prompt = `Learner name: ${learnerName || 'Learner'}
Current Portal Step: ${currentStep} (${script.title})
Context: ${script.speech}
Key points for this step: ${script.keyPoints.join('; ')}
User's Question: "${question}"

Please provide a reassuring, concise (2 to 3 sentences max) answer directly addressing their question as the NxtWave Voice Guide.`;

    const candidateModels = [
      'gemini-flash-latest',
      'gemini-3.6-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
    ];

    for (const modelName of candidateModels) {
      try {
        const response = await getAi().models.generateContent({
          model: modelName,
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
            source: modelName,
            step: currentStep,
          });
        }
      } catch (err: any) {
        console.warn(`Gemini API notice: model ${modelName} returned status, trying next fallback...`);
      }
    }
  }

  // Fallback intelligent answers
  const qLower = question.toLowerCase();
  let fallbackAnswer = script.speech;

  if (qLower.includes('emi') || qLower.includes('interest')) {
    fallbackAnswer =
      'Our No-Cost EMI spreads your ₹1,12,000 fee into 6 convenient monthly payments without extra interest charges. The final plan is reviewed and activated after your quick digital KYC.';
  } else if (qLower.includes('co-applicant') || qLower.includes('parent') || qLower.includes('father')) {
    fallbackAnswer =
      'A co-applicant is an earning parent or guardian who supports your financing application. Both salaried and self-employed parents can serve as your co-applicant.';
  } else if (qLower.includes('document') || qLower.includes('pan') || qLower.includes('aadhaar')) {
    fallbackAnswer =
      'For your digital KYC, keep your PAN card, Aadhaar details, and basic address proof ready. Having them on hand makes verification quick and effortless.';
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

// -------------------------------------------------------------
// AUDIO & TTS ASSET ENDPOINTS
// -------------------------------------------------------------
app.get('/api/video-narration/:lang/:sceneId', (req, res) => {
  const { lang, sceneId } = req.params;
  const targetLang = lang === 'en' ? 'en' : 'te';
  const targetScene = Math.min(Math.max(parseInt(sceneId, 10) || 1, 1), 5);
  const audioFilePath = path.join(
    process.cwd(),
    'public',
    'audio',
    `scene_${targetLang}_${targetScene}.wav`
  );

  if (fs.existsSync(audioFilePath)) {
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(audioFilePath).pipe(res);
  }

  const fallbackPath = path.join(process.cwd(), 'public', 'audio', `scene_te_${targetScene}.wav`);
  if (fs.existsSync(fallbackPath)) {
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return fs.createReadStream(fallbackPath).pipe(res);
  }

  return res.status(404).json({ error: 'Audio narration not found' });
});

app.get('/api/program-video-narration/:lang/:sceneId', (req, res) => {
  const { lang, sceneId } = req.params;
  const targetLang = lang === 'te' ? 'te' : 'en';
  const targetScene = Math.min(Math.max(parseInt(sceneId, 10) || 1, 1), 7);

  const mp3Path = path.join(
    process.cwd(),
    'public',
    'audio',
    'program_scenes',
    `scene_${targetLang}_${targetScene}.mp3`
  );
  const wavPath = path.join(
    process.cwd(),
    'public',
    'audio',
    'program_scenes',
    `scene_${targetLang}_${targetScene}.wav`
  );

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

  return res.status(404).json({ error: 'Program audio narration not found' });
});

app.post('/api/tts/gemini', async (req, res) => {
  const { text, voiceName = 'Kore', lang = 'en' } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text prompt required' });
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await getAi().models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          success: true,
          source: 'gemini-3.1-flash-tts-preview',
          voice: voiceName || 'Kore (Female)',
          mimeType: 'audio/wav',
          audioBase64: base64Audio,
        });
      }
    } catch (err: any) {
      console.warn('Gemini TTS api notice:', err?.message || err);
    }
  }

  try {
    const targetLang = lang === 'te' ? 'te' : 'en';
    const chunks = await googleTTS.getAllAudioBase64(text, {
      lang: targetLang,
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000,
    });
    const combinedBuf = Buffer.concat(chunks.map((c: any) => Buffer.from(c.base64, 'base64')));
    return res.json({
      success: true,
      source: 'female-tts-engine',
      voice: 'Google Studio Female',
      mimeType: 'audio/mpeg',
      audioBase64: combinedBuf.toString('base64'),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'TTS generation failed', details: err?.message });
  }
});

app.get('/api/download/screenshots-pdf', (_req, res) => {
  const pdfPath = path.join(process.cwd(), 'public', 'NxtWave_Enrollment_Portal_Screenshots.pdf');
  res.download(pdfPath, 'NxtWave_Enrollment_Portal_Screenshots.pdf');
});

// Explicit static audio serving
app.use(
  '/audio',
  express.static(path.join(process.cwd(), 'public', 'audio'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.wav')) {
        res.setHeader('Content-Type', 'audio/wav');
      } else if (filePath.endsWith('.mp3')) {
        res.setHeader('Content-Type', 'audio/mpeg');
      }
    },
  })
);
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
    console.log(`NxtWave PRE V3 Enrollment Server running on port ${PORT}`);
  });
}

startServer();
