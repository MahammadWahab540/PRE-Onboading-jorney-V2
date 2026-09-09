from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    text = file_path.read_text(encoding="utf-8")
    if new in text:
        return
    if old not in text:
        raise RuntimeError(f"Expected source block not found in {path}")
    file_path.write_text(text.replace(old, new, 1), encoding="utf-8")


# Raw Salesforce type: null is a legitimate unknown tenure value.
replace_once(
    "src/server/adapters/salesforce/types.ts",
    "  Total_Tenure_PRE__c?: number;",
    "  Total_Tenure_PRE__c?: number | null;",
)

# Query the real financing fields and stop normalizing unrelated totals into paid/seat-reservation fields.
replace_once(
    "src/server/adapters/salesforce/salesforceRestClient.ts",
    """    Product_Price__c, Amount_Payable_PRE__c, Total_Amount_PRE__c, Remaining_Amount_To_Be_Paid_PRE__c,\n    Payment_Plan_PRE__c, Current_Payment_Status__c, Down_Payment_Done_On_PRE__c, DP_Order_ID_PRE__c,\n    Applied_Loan_Amount__c, Total_Tenure_PRE__c, Eligible_NBFCs_PRE__c, Choose_NBFC_PRE__c,""",
    """    Product_Price__c, Total_Amount_to_be_Paid__c, Amount_Payable_PRE__c, Amount_to_be_Receive__c,\n    Amount_Paid_Till_Now_To_Nxtwave_PRE__c, Total_Amount_PRE__c, Remaining_Amount_To_Be_Paid_PRE__c,\n    Seat_Reservation_Amount_Paid__c,\n    Payment_Plan_PRE__c, Current_Payment_Status__c, Down_Payment_Done_On_PRE__c, DP_Order_ID_PRE__c,\n    Applied_Loan_Amount__c, Total_Tenure_PRE__c, EMI_Tenure_PRE__c, Eligible_NBFCs_PRE__c, Choose_NBFC_PRE__c,\n    Effective_Approved_Amount__c, NBFC_Application_ID_PRE__c,""",
)
replace_once(
    "src/server/adapters/salesforce/salesforceRestClient.ts",
    """      Amount_Paid_Till_Now_To_Nxtwave_PRE__c:\n        raw.Amount_Paid_Till_Now_To_Nxtwave_PRE__c ?? raw.Total_Amount_PRE__c ?? 0,\n      Seat_Reservation_Amount_Paid__c:\n        raw.Seat_Reservation_Amount_Paid__c ?? raw.Total_Amount_PRE__c ?? 18000,\n""",
    "",
)

# Canonical financing contract.
replace_once(
    "src/types/journey.ts",
    """export interface FinancingDetails {\n  applied: boolean;\n  appliedAmount: number;\n  nbfcName?: string;\n  lenderName?: string;\n  applicationId?: string;\n  status: NbfcStatus;\n  statusLabel: string;\n  approvedAmount?: number;\n  approvedTenure?: string;\n  emiAmountMonthly?: number;\n  emiTenure?: string;\n  disbursedAmount?: number;""",
    """export interface FinancingDetails {\n  applied: boolean;\n  appliedAmount?: number;\n  nbfcName?: string;\n  lenderName?: string;\n  applicationId?: string;\n  status: NbfcStatus;\n  statusLabel: string;\n\n  // Salesforce-driven learner financing amounts. Unknown values stay undefined/null.\n  productPrice?: number;\n  totalAmountPayable?: number;\n  amountPaid?: number;\n  remainingAmount?: number;\n  amountToReceive?: number;\n  totalTenureMonths?: number | null;\n  estimatedMonthlyAmount?: number | null;\n  preferredTenureMonths?: number | null;\n\n  // Existing NBFC lifecycle fields retained for downstream status/class-access flows.\n  approvedAmount?: number;\n  approvedTenure?: string;\n  emiAmountMonthly?: number;\n  emiTenure?: string;\n  disbursedAmount?: number;""",
)

replace_once(
    "src/types.ts",
    """  EnrollmentJourney,\n} from './types/journey';""",
    """  EnrollmentJourney,\n  FinancingDetails,\n} from './types/journey';""",
)
replace_once(
    "src/types.ts",
    """export interface EmiState {\n  selected: boolean;\n  amount: number;\n  tenure: string | null;\n}""",
    """export interface EmiState {\n  selected: boolean;\n  amount: number;\n  tenure: string | null;\n  preferredTenureMonths?: number | null;\n}""",
)
replace_once(
    "src/types.ts",
    "  financing?: any;",
    "  financing?: FinancingDetails;",
)

# Do not invent a lender when Salesforce has not assigned one.
replace_once(
    "src/server/adapters/salesforce/nbfcStatusMapper.ts",
    "  const lender = record.Choose_NBFC_PRE__c || 'Northern Arc';",
    "  const lender = (record.Disbursed_NBFC_Name__c || record.Choose_NBFC_PRE__c || '').trim();",
)

# Correct fee semantics and derive tenure/monthly amount only from Salesforce truth.
replace_once(
    "src/server/adapters/salesforce/enrollmentMapper.ts",
    """  const baseFee = record.Product_Price__c || 180000;\n  const scholarshipAmount =\n    record.Scholarship_Amount__c || record.Merit_Scholarship_Amount_PRE__c || record.Payment_Plan_Discount__c || 0;\n  const seatReservationPaid = record.Seat_Reservation_Amount_Paid__c || record.Total_Amount_PRE__c || 0;\n  const amountPayable =\n    record.Amount_Payable_PRE__c || record.Remaining_Amount_To_Be_Paid_PRE__c || Math.max(0, baseFee - scholarshipAmount - seatReservationPaid);""",
    """  const toNonNegativeAmount = (value?: number | null): number | undefined =>\n    typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;\n\n  const sourceProductPrice = toNonNegativeAmount(record.Product_Price__c);\n  const sourceTotalAmountPayable =\n    toNonNegativeAmount(record.Total_Amount_to_be_Paid__c) ??\n    toNonNegativeAmount(record.Amount_Payable_PRE__c);\n  const sourceAmountPaid = toNonNegativeAmount(record.Amount_Paid_Till_Now_To_Nxtwave_PRE__c);\n  const sourceRemainingAmount = toNonNegativeAmount(record.Remaining_Amount_To_Be_Paid_PRE__c);\n\n  const productPrice = sourceProductPrice ?? 0;\n  const totalAmountPayable = sourceTotalAmountPayable ?? 0;\n  const amountPaid = sourceAmountPaid ?? 0;\n  const calculatedRemainingAmount =\n    sourceTotalAmountPayable !== undefined\n      ? Math.max(0, totalAmountPayable - amountPaid)\n      : undefined;\n  const remainingAmount = sourceRemainingAmount ?? calculatedRemainingAmount;\n  const amountToReceive =\n    toNonNegativeAmount(record.Amount_to_be_Receive__c) ?? sourceTotalAmountPayable;\n  const totalTenureMonths =\n    typeof record.Total_Tenure_PRE__c === 'number' &&\n    Number.isFinite(record.Total_Tenure_PRE__c) &&\n    record.Total_Tenure_PRE__c > 0\n      ? Math.round(record.Total_Tenure_PRE__c)\n      : null;\n  const estimatedMonthlyAmount =\n    totalTenureMonths && remainingAmount !== undefined && remainingAmount > 0\n      ? Math.round(remainingAmount / totalTenureMonths)\n      : null;\n\n  if (\n    process.env.NODE_ENV !== 'production' &&\n    sourceRemainingAmount !== undefined &&\n    calculatedRemainingAmount !== undefined &&\n    Math.abs(sourceRemainingAmount - calculatedRemainingAmount) > 1\n  ) {\n    console.warn('[EnrollmentFinance] Salesforce remaining amount differs from calculated remaining amount; using Salesforce value.', {\n      recordId: record.Id,\n      salesforceRemainingAmount: sourceRemainingAmount,\n      calculatedRemainingAmount,\n    });\n  }\n\n  const baseFee = productPrice;\n  const scholarshipAmount =\n    record.Scholarship_Amount__c || record.Merit_Scholarship_Amount_PRE__c || record.Payment_Plan_Discount__c || 0;\n  const seatReservationPaid = toNonNegativeAmount(record.Seat_Reservation_Amount_Paid__c) ?? 0;\n  const amountPayable = totalAmountPayable;""",
)
replace_once(
    "src/server/adapters/salesforce/enrollmentMapper.ts",
    """    record.Amount_Paid_Till_Now_To_Nxtwave_PRE__c,\n    amountPayable""",
    """    amountPaid,\n    amountPayable""",
)
replace_once(
    "src/server/adapters/salesforce/enrollmentMapper.ts",
    """  // Financing / NBFC mapping\n  let financing;\n  if (paymentMethod === 'NO_COST_EMI' || record.Applied_Loan_Amount__c) {\n    const mappedNbfc = mapNbfcStatus(record);\n    const tenureMonths = 6;\n    const emiMonthly = Math.round(amountPayable / tenureMonths);\n\n    financing = {\n      applied: true,\n      appliedAmount: record.Applied_Loan_Amount__c || amountPayable,\n      nbfcName: mappedNbfc.lenderName,\n      applicationId: `NBFC-${record.Id.slice(-6).toUpperCase()}`,\n      status: mappedNbfc.status,\n      statusLabel: mappedNbfc.statusLabel,\n      approvedAmount: record.Effective_Approved_Amount__c || amountPayable,\n      approvedTenure: `${tenureMonths} Months`,\n      emiAmountMonthly: emiMonthly,\n      emiTenure: record.EMI_Tenure_PRE__c || `${tenureMonths} Months`,\n      disbursedAmount: record.Disbursed_Amount_PRE__c,\n      disbursedAt: record.Disbursed_Date_Time__c,\n      rejectionReason: mappedNbfc.rejectionReason,\n      rejectionResolutionAction: mappedNbfc.rejectionResolutionAction,\n    };\n  }""",
    """  // Financing / NBFC mapping. Salesforce remains authoritative for amounts and confirmed tenure.\n  let financing;\n  if (paymentMethod === 'NO_COST_EMI' || record.Applied_Loan_Amount__c) {\n    const mappedNbfc = mapNbfcStatus(record);\n    const appliedAmount = toNonNegativeAmount(record.Applied_Loan_Amount__c);\n    const approvedAmount = toNonNegativeAmount(record.Effective_Approved_Amount__c);\n    const confirmedTenureLabel = totalTenureMonths ? `${totalTenureMonths} Months` : undefined;\n    const approvedOrLater = [\n      'APPROVED',\n      'EMI_SETUP_PENDING',\n      'EMI_SETUP_COMPLETED',\n      'DISBURSEMENT_PENDING',\n      'DISBURSED',\n    ].includes(mappedNbfc.status);\n\n    financing = {\n      applied: true,\n      appliedAmount,\n      nbfcName: mappedNbfc.lenderName || undefined,\n      lenderName: mappedNbfc.lenderName || undefined,\n      applicationId: record.NBFC_Application_ID_PRE__c || undefined,\n      status: mappedNbfc.status,\n      statusLabel: mappedNbfc.statusLabel,\n      productPrice: sourceProductPrice,\n      totalAmountPayable: sourceTotalAmountPayable,\n      amountPaid,\n      remainingAmount,\n      amountToReceive,\n      totalTenureMonths,\n      estimatedMonthlyAmount,\n      preferredTenureMonths: null,\n      approvedAmount,\n      approvedTenure: approvedOrLater ? confirmedTenureLabel : undefined,\n      emiAmountMonthly: estimatedMonthlyAmount ?? undefined,\n      emiTenure: confirmedTenureLabel,\n      disbursedAmount: record.Disbursed_Amount_PRE__c,\n      disbursedAt: record.Disbursed_Date_Time__c,\n      rejectionReason: mappedNbfc.rejectionReason,\n      rejectionResolutionAction: mappedNbfc.rejectionResolutionAction,\n    };\n  }""",
)
replace_once(
    "src/server/adapters/salesforce/enrollmentMapper.ts",
    "      amountPaid: record.Amount_Paid_Till_Now_To_Nxtwave_PRE__c || 0,",
    "      amountPaid,",
)

# App state: remove invented defaults, preserve all financing fields, and keep learner tenure preference client-side.
replace_once(
    "src/App.tsx",
    """  emi: {\n    selected: false,\n    amount: 0,\n    tenure: '6 Months',\n  },""",
    """  emi: {\n    selected: false,\n    amount: 0,\n    tenure: null,\n    preferredTenureMonths: null,\n  },""",
)
replace_once(
    "src/App.tsx",
    """  financing: {\n    applicationId: '',\n    lenderName: '',\n    status: 'NOT_STARTED',\n    appliedAmount: 0,\n    approvedAmount: 0,\n  },""",
    "  financing: undefined,",
)
replace_once(
    "src/App.tsx",
    """      program: {\n        ...prev.program,\n        name: journey.program?.name ?? prev.program?.name ?? 'NxtWave Program',\n        price: journey.program?.amountPayable ?? prev.program?.price ?? 112000,\n        amountPayable: journey.program?.amountPayable ?? prev.program?.amountPayable ?? 112000,\n      },""",
    """      program: {\n        ...prev.program,\n        name: journey.program?.name ?? prev.program?.name ?? 'NxtWave Program',\n        price:\n          journey.financing?.productPrice ??\n          journey.program?.totalProgramPrice ??\n          journey.program?.baseFee ??\n          prev.program?.price ??\n          0,\n        amountPayable:\n          journey.financing?.totalAmountPayable ??\n          journey.program?.amountPayable ??\n          prev.program?.amountPayable ??\n          0,\n        baseFee: journey.program?.baseFee ?? prev.program?.baseFee,\n        scholarshipAmount: journey.program?.scholarshipAmount ?? prev.program?.scholarshipAmount,\n        seatReservationPaid: journey.program?.seatReservationPaid ?? prev.program?.seatReservationPaid,\n      },""",
)
replace_once(
    "src/App.tsx",
    """        selectedMethod:\n          journey.financing && journey.financing.status !== 'NOT_STARTED'\n            ? 'NO_COST_EMI'\n            : prev.payment?.selectedMethod ?? 'FULL_PAYMENT',\n      },""",
    """        selectedMethod: journey.payment?.method ?? prev.payment?.selectedMethod ?? null,\n      },\n      emi: {\n        ...prev.emi,\n        amount: journey.financing?.remainingAmount ?? prev.emi.amount,\n        tenure: journey.financing?.totalTenureMonths\n          ? `${journey.financing.totalTenureMonths} Months`\n          : null,\n      },""",
)
replace_once(
    "src/App.tsx",
    """      financing: {\n        applicationId: journey.financing?.applicationId || 'N/A',\n        lenderName: journey.financing?.lenderName || journey.financing?.nbfcName || 'Northern Arc',\n        status: journey.financing?.status || 'NOT_STARTED',\n        appliedAmount: journey.financing?.appliedAmount || 0,\n        approvedAmount: journey.financing?.approvedAmount || 0,\n        rejectionReason: journey.financing?.rejectionReason,\n      },""",
    """      financing: journey.financing\n        ? {\n            ...journey.financing,\n            preferredTenureMonths:\n              journey.financing.preferredTenureMonths ??\n              prev.financing?.preferredTenureMonths ??\n              prev.emi.preferredTenureMonths ??\n              null,\n          }\n        : prev.financing,""",
)
replace_once(
    "src/App.tsx",
    """  const handlePaymentSuccess = (\n    receiptId: string,""",
    """  // TODO(BUSINESS): Confirm a Salesforce field that explicitly stores learner-requested tenure.\n  // Until then this remains client-side only and must never be written to Total_Tenure_PRE__c.\n  const handlePreferredTenureChange = (months: number) => {\n    setState((prev) => ({\n      ...prev,\n      emi: {\n        ...prev.emi,\n        preferredTenureMonths: months,\n      },\n      financing: prev.financing\n        ? { ...prev.financing, preferredTenureMonths: months }\n        : prev.financing,\n    }));\n  };\n\n  const handlePaymentSuccess = (\n    receiptId: string,""",
)
replace_once(
    "src/App.tsx",
    """              <WhyNoCostEmiPage\n                state={state}\n                onContinue={() => navigateTo('co-applicant')}\n                onBack={() => navigateTo('payment')}\n              />""",
    """              <WhyNoCostEmiPage\n                state={state}\n                onPreferredTenureChange={handlePreferredTenureChange}\n                onContinue={() => navigateTo('co-applicant')}\n                onBack={() => navigateTo('payment')}\n              />""",
)

# EMI page: keep the player/language controls, replace static financing copy with learner-specific Salesforce data.
replace_once(
    "src/components/pages/WhyNoCostEmiPage.tsx",
    """interface WhyNoCostEmiPageProps {\n  state: EnrollmentState;\n  onContinue: () => void;\n  onBack: () => void;\n}""",
    """interface WhyNoCostEmiPageProps {\n  state: EnrollmentState;\n  onPreferredTenureChange: (months: number) => void;\n  onContinue: () => void;\n  onBack: () => void;\n}""",
)
replace_once(
    "src/components/pages/WhyNoCostEmiPage.tsx",
    """function formatTime(seconds: number): string {""",
    """const TENURE_OPTIONS = [\n  { months: 12 },\n  {\n    months: 18,\n    recommended: true,\n    estimatedSavings: { min: 5000, max: 10000 },\n  },\n  { months: 24 },\n] as const;\n\nfunction formatCurrency(value?: number | null): string | null {\n  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;\n  return `₹${Math.round(value).toLocaleString('en-IN')}`;\n}\n\nfunction formatTime(seconds: number): string {""",
)
replace_once(
    "src/components/pages/WhyNoCostEmiPage.tsx",
    """export const WhyNoCostEmiPage: React.FC<WhyNoCostEmiPageProps> = ({\n  state,\n  onContinue,\n  onBack,\n}) => {""",
    """export const WhyNoCostEmiPage: React.FC<WhyNoCostEmiPageProps> = ({\n  state,\n  onPreferredTenureChange,\n  onContinue,\n  onBack,\n}) => {""",
)
replace_once(
    "src/components/pages/WhyNoCostEmiPage.tsx",
    """  const videoSource =\n    language === 'te'\n      ? '/videos/nxtwave_emi_explainer_te.mp4'\n      : '/videos/nxtwave_emi_explainer.mp4';\n\n  return (""",
    """  const videoSource =\n    language === 'te'\n      ? '/videos/nxtwave_emi_explainer_te.mp4'\n      : '/videos/nxtwave_emi_explainer.mp4';\n\n  const financing = state.financing || state.canonicalJourney?.financing;\n  const productPrice =\n    financing?.productPrice ?? (state.program.price > 0 ? state.program.price : undefined);\n  const totalAmountPayable =\n    financing?.totalAmountPayable ??\n    (state.program.amountPayable > 0 ? state.program.amountPayable : undefined);\n  const amountPaid = financing?.amountPaid ?? state.payment.amountPaid ?? 0;\n  const remainingAmount =\n    typeof financing?.remainingAmount === 'number' &&\n    Number.isFinite(financing.remainingAmount) &&\n    financing.remainingAmount >= 0\n      ? financing.remainingAmount\n      : undefined;\n  const totalTenureMonths =\n    typeof financing?.totalTenureMonths === 'number' &&\n    Number.isFinite(financing.totalTenureMonths) &&\n    financing.totalTenureMonths > 0\n      ? Math.round(financing.totalTenureMonths)\n      : null;\n  const estimatedMonthlyAmount =\n    totalTenureMonths && remainingAmount !== undefined && remainingAmount > 0\n      ? financing?.estimatedMonthlyAmount ?? Math.round(remainingAmount / totalTenureMonths)\n      : null;\n  const preferredTenureMonths =\n    financing?.preferredTenureMonths ?? state.emi.preferredTenureMonths ?? null;\n  const nbfcHasConfirmedApproval = [\n    'APPROVED',\n    'EMI_SETUP_PENDING',\n    'EMI_SETUP_COMPLETED',\n    'DISBURSEMENT_PENDING',\n    'DISBURSED',\n  ].includes(financing?.status || '');\n  const illustrativeTenureOptions =\n    remainingAmount !== undefined && remainingAmount > 0 && !totalTenureMonths\n      ? TENURE_OPTIONS.map((option) => ({\n          ...option,\n          estimatedMonthlyAmount: Math.round(remainingAmount / option.months),\n        }))\n      : [];\n\n  return (""",
)
replace_once(
    "src/components/pages/WhyNoCostEmiPage.tsx",
    """        {/* TRANSPARENT FINANCING & REGULATORY COMPLIANCE DISCLOSURE */}\n        <div className=\"w-full mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-left text-xs space-y-2\">\n          <div className=\"flex items-center gap-2 font-bold text-slate-800\">\n            <span className=\"w-2 h-2 rounded-full bg-blue-500\" />\n            <span>Key Financing Facts & Eligibility</span>\n          </div>\n          <ul className=\"space-y-1.5 text-slate-600 pl-4 list-disc\">\n            <li>\n              <strong>Zero Extra Interest:</strong> You only pay the net course fee of ₹1,12,000 divided into 6 equal monthly installments (~₹18,667/mo).\n            </li>\n            <li>\n              <strong>Independent NBFC Evaluation:</strong> Applications are evaluated by RBI-registered partner NBFCs (Northern Arc, Fibe) based on credit bureau score and banking records.\n            </li>\n            <li>\n              <strong>Credit Profile Dependent:</strong> Final approval and disbursement are subject to NBFC underwriting criteria and document verification.\n            </li>\n          </ul>\n        </div>""",
    """        {/* SALESFORCE-DRIVEN LEARNER FINANCING DETAILS */}\n        <div className=\"w-full mt-6 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5 text-left\">\n          <div className=\"mb-4\">\n            <p className=\"text-xs font-bold uppercase tracking-wider text-[#0B63E5]\">Your financing details</p>\n            <p className=\"text-xs text-slate-500 mt-1\">Amounts below reflect the latest financing information available for your enrollment.</p>\n          </div>\n\n          <div className=\"grid grid-cols-1 sm:grid-cols-3 gap-3\">\n            {[\n              ['Original Program Fee', productPrice],\n              ['Total Amount Payable', totalAmountPayable],\n              ['Amount Paid So Far', amountPaid],\n            ].map(([label, value]) => (\n              <div key={String(label)} className=\"rounded-xl bg-white border border-slate-200 p-3\">\n                <span className=\"text-[11px] font-semibold text-slate-500 block\">{label}</span>\n                <span className=\"text-base font-bold text-[#0A192F] mt-1 block\">\n                  {formatCurrency(value as number | undefined) || 'Being updated'}\n                </span>\n              </div>\n            ))}\n          </div>\n\n          <div className=\"mt-3 rounded-xl bg-white border-2 border-blue-200 p-4\">\n            <span className=\"text-xs font-semibold text-slate-600 block\">Remaining Amount</span>\n            {remainingAmount === undefined ? (\n              <p className=\"text-sm font-semibold text-slate-700 mt-1\">Financing amount is being updated.</p>\n            ) : remainingAmount === 0 ? (\n              <p className=\"text-lg font-bold text-[#0A192F] mt-1\">No outstanding amount</p>\n            ) : (\n              <p className=\"text-2xl sm:text-3xl font-bold text-[#0B63E5] mt-1\">{formatCurrency(remainingAmount)}</p>\n            )}\n          </div>\n\n          {remainingAmount !== undefined && remainingAmount > 0 && totalTenureMonths && (\n            <div className=\"mt-4 rounded-xl bg-white border border-slate-200 p-4\">\n              <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-4\">\n                <div>\n                  <span className=\"text-[11px] font-semibold text-slate-500 block\">\n                    {nbfcHasConfirmedApproval ? 'Confirmed Repayment Tenure' : 'Repayment Tenure'}\n                  </span>\n                  <span className=\"text-xl font-bold text-[#0A192F] mt-1 block\">{totalTenureMonths} months</span>\n                </div>\n                <div>\n                  <span className=\"text-[11px] font-semibold text-slate-500 block\">Estimated Monthly Amount</span>\n                  <span className=\"text-xl font-bold text-[#0A192F] mt-1 block\">\n                    {estimatedMonthlyAmount ? `~${formatCurrency(estimatedMonthlyAmount)}/month` : 'Being updated'}\n                  </span>\n                </div>\n              </div>\n              <p className=\"text-xs text-slate-500 mt-3\">\n                Repayment terms are based on the financing information currently available for this application.\n              </p>\n            </div>\n          )}\n\n          {illustrativeTenureOptions.length > 0 && (\n            <div className=\"mt-4\">\n              <div className=\"mb-3\">\n                <h2 className=\"text-sm font-bold text-[#0A192F]\">Choose your preferred tenure</h2>\n                <p className=\"text-xs text-slate-500 mt-1\">Illustrative monthly amounts are calculated from your remaining amount.</p>\n              </div>\n              <div className=\"grid grid-cols-1 sm:grid-cols-3 gap-3\">\n                {illustrativeTenureOptions.map((option) => {\n                  const isSelected = preferredTenureMonths === option.months;\n                  return (\n                    <button\n                      key={option.months}\n                      type=\"button\"\n                      onClick={() => onPreferredTenureChange(option.months)}\n                      className={`relative rounded-xl border p-3 text-left transition-all cursor-pointer ${\n                        isSelected\n                          ? 'border-[#0B63E5] bg-blue-50 ring-1 ring-[#0B63E5]'\n                          : 'border-slate-200 bg-white hover:border-blue-200'\n                      }`}\n                    >\n                      {'recommended' in option && option.recommended && (\n                        <span className=\"inline-flex mb-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200\">\n                          Recommended\n                        </span>\n                      )}\n                      <span className=\"block text-sm font-bold text-[#0A192F]\">{option.months} months</span>\n                      <span className=\"block text-xs font-semibold text-slate-600 mt-1\">\n                        ~{formatCurrency(option.estimatedMonthlyAmount)}/month\n                      </span>\n                      {'estimatedSavings' in option && option.estimatedSavings && (\n                        <span className=\"block text-[11px] font-semibold text-emerald-700 mt-2\">\n                          Estimated savings {formatCurrency(option.estimatedSavings.min)}–{formatCurrency(option.estimatedSavings.max)}\n                        </span>\n                      )}\n                    </button>\n                  );\n                })}\n              </div>\n              <div className=\"mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5\">\n                <p className=\"text-[11px] leading-relaxed text-amber-900\">\n                  Your selected tenure is a preference. Final tenure, monthly repayment amount, applicable savings and financing approval will be confirmed by the financing partner.\n                </p>\n              </div>\n            </div>\n          )}\n        </div>\n\n        <div className=\"w-full mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-left text-xs space-y-2\">\n          <div className=\"flex items-center gap-2 font-bold text-slate-800\">\n            <span className=\"w-2 h-2 rounded-full bg-blue-500\" />\n            <span>Key Financing Facts & Eligibility</span>\n          </div>\n          <ul className=\"space-y-1.5 text-slate-600 pl-4 list-disc\">\n            <li><strong>Independent Evaluation:</strong> Your application is evaluated by an RBI-registered financing partner based on its underwriting criteria.</li>\n            <li><strong>Final Terms:</strong> Tenure, repayment amount, approval and disbursement are subject to verification by the financing partner.</li>\n            <li><strong>Co-Applicant:</strong> A suitable earning co-applicant may be required as part of the financing assessment.</li>\n          </ul>\n        </div>""",
)

# Minimal pre-existing repository type fix so the required lint command can run cleanly.
replace_once(
    "functions/api/[[path]].ts",
    """interface Env {\n  BACKEND_API_URL?: string;\n  SUPABASE_URL?: string;\n  SUPABASE_SECRET_KEY?: string;\n  SUPABASE_SERVICE_ROLE_KEY?: string;\n}\n\nexport const onRequest: PagesFunction<Env>""",
    """interface Env {\n  BACKEND_API_URL?: string;\n  SUPABASE_URL?: string;\n  SUPABASE_SECRET_KEY?: string;\n  SUPABASE_SERVICE_ROLE_KEY?: string;\n}\n\ninterface PagesFunctionContext<TEnv> {\n  request: Request;\n  env: TEnv;\n}\n\ntype PagesFunction<TEnv> = (context: PagesFunctionContext<TEnv>) => Response | Promise<Response>;\n\nexport const onRequest: PagesFunction<Env>""",
)

print("Salesforce financing patch applied successfully")
