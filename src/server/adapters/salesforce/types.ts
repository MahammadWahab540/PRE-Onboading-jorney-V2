/**
 * Raw Salesforce CRM Object Types for Academy_Onboarding_PRE__c
 * Matches enterprise Salesforce schema definitions.
 */

export interface SalesforceOnboardingRecord {
  Id: string;
  Name: string;
  Token__c?: string;
  Student_PRE__c?: string;
  Student_Name__c: string;
  Student_Number__c?: string;
  Student_WhatsApp_Number__c?: string;
  PHONE_NUMBER__c?: string;
  Email_PRE__c?: string;
  Date_of_Birth__c?: string;

  // Program & Pricing
  Program_PRE__c: string;
  Program_Registered_UID_PRE__c?: string;
  Product_Price__c: number;
  Scholarship_Amount__c?: number;
  Merit_Scholarship_Amount_PRE__c?: number;
  Seat_Reservation_Amount_Paid__c?: number;
  Amount_Payable_PRE__c: number;
  Amount_to_be_Receive__c?: number;
  Amount_Paid_Till_Now_To_Nxtwave_PRE__c: number;

  // Direct Payment
  Payment_Plan_PRE__c?: 'Full Payment' | 'Credit Card' | 'No-Cost EMI' | 'EMI' | string;
  Payment_Status__c?: 'Success' | 'Paid' | 'Pending' | 'Failed' | string;
  Payment_Done_PRE__c?: boolean;
  Current_Payment_Status__c?: string;
  Current_Payment_Status_Date_Time__c?: string;
  Payment_Date_Time__c?: string;
  Receipt_Id__c?: string;

  // Financing / NBFC
  Applied_Loan_Amount__c?: number;
  EMI_Tenure_PRE__c?: string;
  Eligible_NBFCs_PRE__c?: string;
  Choose_NBFC_PRE__c?: 'Northern Arc' | 'Fibe' | 'Finz' | 'Gyandhan' | 'Jodo' | string;
  Effective_Approved_Amount__c?: number;
  Disbursed_Amount_PRE__c?: number;
  Disbursed_Date_Time__c?: string;

  // Co-Applicant
  Co_Applicant_Name__c?: string;
  Co_Applicant_Phone_Number_PRE__c?: string;
  Co_Applicant_Mail_ID_PRE__c?: string;
  Relation_With_The_Co_Applicant_PRE__c?: string;
  Co_Applicant_Age_PRE__c?: number;
  Co_Applicant_Employment_Type_PRE__c?: string;
  Co_Applicant_Occupation_PRE__c?: string;
  Co_Applicant_Monthly_Income_PRE__c?: number;
  Co_Applicant_Monthly_Income_Range_PRE__c?: string;
  CIBIL_Score_Range_PRE__c?: string;
  Co_Applicant_State_PRE__c?: string;
  Co_Applicant_Address_PRE__c?: string;

  // KYC
  KYC_Call_Status_PRE__c?: string;
  KYC_Submission_Status_PRE__c?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'VERIFIED' | 'FAILED' | string;
  KYC_Submission_Status__c?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'VERIFIED' | 'FAILED' | string;
  KYC_Submission_Date_and_Time__c?: string;
  Documents_Requested_By_Reps__c?: string;
  ADDITIONAL_DETAILS_REQUIRED_PRE_PRE__c?: string;
  Remarks_PRE__c?: string;

  // Lender-specific fields
  Northern_Arc_Overall_Stages__c?: string;
  Northern_Arc_Remarks__c?: string;
  Northern_Arc_Rejected_Reasons__c?: string;
  Fibe_Overall_Loan_Status__c?: string;
  Fibe_Overall_Stages__c?: string;
  Finz_Overall_Stages__c?: string;
  Gyandhan_Overall_Stages__c?: string;
  JODO_NBFC_Status__c?: string;

  // Class & LMS Access
  LMS_Access_Status__c?: 'Active' | 'Pending' | 'Locked' | string;
  LMS_Access_URL__c?: string;
  Batch_Start_Date__c?: string;

  // Authentication flag in session
  Authentication_Verified__c?: boolean;
}
