import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface TenderData {
  title: string;
  nature: 'Goods' | 'Works' | 'Physical Services' | 'Consultancy Services';
  value: number; // in BDT
  method: 'OTM' | 'LTM' | 'RFQ' | 'DPM' | 'Framework' | 'OSTETM' | 'QCBS' | 'FBS' | 'LCS' | 'SSS';
  isDPFunded?: boolean;
  isOutsourcing?: boolean; // For Physical Services
  consultantType?: 'Firm' | 'Individual'; // For Consultancy
  paymentType?: 'Lump-Sum' | 'Time-Based'; // For Consultancy
  // Document metadata for the report header (AI-extracted, format-agnostic).
  // null means the field is genuinely absent from the document — the renderer
  // must display "Not stated in document" for null, never a placeholder or a guess.
  tenderId?: string | null;
  referenceNo?: string | null;
  procuringEntity?: string | null;
  closingDateTime?: string | null;
  tenderSecurity?: TenderSecurity | null;
  jointVenture?: JointVenture | null;
  fullText?: string;
  tokensUsed?: number;
}

export interface TenderSecurity {
  bdt: number | null;
  foreign: { currency: string; amount: number } | null;
  verbatim: string | null; // always kept for audit, even when bdt/foreign parsed cleanly
}

export interface JointVenture {
  clausePresent: boolean; // false when the document has NO Joint Venture clause at all (e.g. most Goods TDS)
  allowed: boolean | null; // only meaningful when clausePresent is true
  clauseRef: string | null; // e.g. "ITT 17.1"
}

export interface KeyPersonnelRow {
  position: string;
  qualification: string;
  totalExperience: number | '';
  similarExperience: number | '';
}

export interface EquipmentRow {
  type: string;
  quantity: number | '';
  availability: 'Owned' | 'Hired' | 'Leased' | '';
}

export interface LicenseStatus {
  hasLicense: boolean | '';
  validityDate?: string;
  category?: string;
}

export interface CompanyProfile {
  liquidAssets: number; // in raw BDT (Taka)
  similarWorkExperience: number; // in raw BDT (Taka)
  averageAnnualTurnover: number; // in raw BDT (Taka)
  tenderCapacity: number; // in raw BDT (Taka)
  generalExperienceYears?: number | '';
  similarContractsCount5Years?: number | '';
  keyPersonnel?: KeyPersonnelRow[];
  equipment?: EquipmentRow[];
  tradeLicense?: LicenseStatus;
  electricalLicense?: LicenseStatus;
  fireLicense?: LicenseStatus;
  bercLicense?: LicenseStatus;
  dlsLicense?: LicenseStatus;
  tinLicense?: LicenseStatus;
  vatLicense?: LicenseStatus;
  supplyCapacity?: number | '';
  manufacturerAuthorization?: {
    hasAuth: boolean | '';
    items?: string;
  };
  // Sarkar saab improvement 1 — Net Available Capacity
  existingCommitmentsValue?: number;       // BDT value of works currently in hand (the "B" term)
  committedLiquidAssets?: number;          // BDT liquid assets already tied to ongoing work
  committedManpower?: string;              // free-text: e.g. "2 PMs and 4 Engineers on Project X"
  committedEquipment?: string;             // free-text: e.g. "2 Mixers deployed on Site Y"
  isJV?: boolean;
  foreignCurrency?: string;
  foreignExchangeRate?: number;
  foreignLiquidAssetsOriginal?: number;
  foreignSimilarWorkExperienceOriginal?: number;
  foreignAverageAnnualTurnoverOriginal?: number;
  foreignTenderCapacityOriginal?: number;
  foreignLiquidAssetsBDT?: number;
  foreignSimilarWorkExperienceBDT?: number;
  foreignAverageAnnualTurnoverBDT?: number;
  foreignTenderCapacityBDT?: number;
}

export type CriterionStatus =
  | 'PASS'
  | 'FAIL'
  | 'MISMATCH'
  | 'DATA_NEEDED'
  | 'EXCLUDED'
  | 'NOT_APPLICABLE';

export type RequirementKind = 'numeric' | 'categorical' | 'boolean';

export interface Criterion {
  name: string;
  clauseRef: string;
  mandatory: boolean;
  kind: RequirementKind;
  weight?: number; // default 1
  valuePresent: boolean;
  satisfied?: boolean | null;
  requiredValue?: number | null;
  haveValue?: number | null;
  unitsComparable?: boolean;
  userValueStr?: string;
  requiredValueStr?: string;
  note?: string;
  severity?: 'CRITICAL' | 'IMPORTANT' | 'MINOR';
  howToClose?: string;
}

export interface TrackRecordMatch {
  requirement: string;
  met: boolean | 'data-needed' | 'EXCLUDED' | 'MISMATCH' | string;
  userValue: string;
  requiredValue: string;
  reason: string;
  severity?: 'CRITICAL' | 'IMPORTANT' | 'MINOR';
  howToClose?: string;
}

export interface AnalysisResult {
  stdUsed: string;
  score: number;
  eligibilityLabel?: 'High Probability' | 'Action Needed' | 'Not Eligible (knock-out)' | string;
  clauses: string[];
  winningStrategy: string;
  summary: string;
  sop?: {
    howToParticipate: string;
    eligibilityCriteria: string[];
    essentialDocuments: string[];
    stepByStepTimeline: string[];
  };
  companyMatch?: TrackRecordMatch[];
  tokensUsed?: number;
  tenderSubject?: string;
  estimatedValue?: number | null;
  isFrameworkAgreement?: boolean;
}

export async function extractTenderData(fileBase64: string, mimeType: string, fileObj?: File): Promise<Partial<TenderData>> {
  const prompt = `
    You are a professional procurement data extractor. Analyze the provided tender notice document and extract the following details with high precision:

    - Title: The full name of the tender/package. Look for "Name of Work", "Package Description", or "Identification of Lot".
    - Nature: Determine if it's "Goods", "Works", "Physical Services", or "Consultancy Services". 
      * Works: Construction, repair, renovation of buildings, roads, etc.
      * Goods: Supply of equipment, furniture, medicine, etc.
      * Physical Services: Maintenance services, security, cleaning, etc.
      * Consultancy Services: Intellectual and professional services, feasibility studies, design, supervision, etc.
    - Estimated Value: The total official estimated cost in BDT. If (and only if) the tender explicitly states an official estimated cost (e.g., "official estimated cost", "estimated value"), return it as a plain number. If the document does not explicitly state an official estimated cost, return null. Never estimate it or invent it based on tender security or any other proxy.
    - Procurement Method: Identify the method (OTM, LTM, OSTETM, RFQ, DPM, Framework, QCBS, FBS, LCS, or SSS).
    - Consultancy Details: If Nature is "Consultancy Services", determine:
      * consultantType: "Firm" or "Individual".
      * paymentType: "Lump-Sum" or "Time-Based".
    - Outsourcing: For Physical Services, determine if it involves "Hiring Service Personnel through Outsourcing Policy" (isOutsourcing: true) or other physical services like maintenance, cleaning, etc. (isOutsourcing: false).
    - Development Partner Funded: Set to true if the notice mentions funding from World Bank, ADB, JICA, or other international agencies.
    - Tender ID: The tender/proposal ID number (look for "Tender/Proposal ID", "Tender ID"). null if not present.
    - Reference No: The invitation/memo reference number (look for "Invitation Reference No.", "Tender Ref", "Memo No", "স্মারক নম্বর"). Copy the ENTIRE reference string exactly, including any trailing parenthetical suffix and, if the document prints a date alongside the reference (e.g. "Dt: 7/9/26"), include that too as part of the same string (e.g. "37.07.0000.014.20.101.24.2660(3)" or "CMSD/GR-2613/ICT/2026-27/ProcD-4/17, Dt: 7/9/26" must be copied in full — do NOT truncate it, and do NOT borrow digits from an unrelated, separate "Date:" field elsewhere in the header). null if not present.
    - Procuring Entity: The procuring entity / office name (look for "Procuring Entity", "Executive Engineer ...", "নির্বাহী প্রকৌশলী ..."). Return ONLY the entity name — NEVER include the "Procuring Entity" label or its colon in the value, however that label is punctuated (e.g. "Procuring Entity:", "Procuring Entity :", "PE:"). null if not present.
    - Closing Date/Time: The tender closing (submission deadline) date and time exactly as stated (e.g. "14-Jun-2026 14:00"). The header often lists several adjacent date/time fields back-to-back on one line, e.g.
        "Date: 01.01.2026  Closing Date and Time: 25-Jun-2026 15:00  Opening Date and Time: 25-Jun-2026 15:00"
      Treat "Date", "and", "Time" here as part of the FIELD LABEL, never as part of the value — extract
      only the actual date-time string that follows the "Closing Date and Time:" label's colon. Do NOT
      confuse it with the plain "Date:" field (that's the notice/invitation date, a different field) or
      with "Opening Date and Time:" (a different field). Your extracted value must be an actual date/time
      string — if what you are about to return is a bare word like "and", "Date", or "Time" rather than a
      date/time, that is wrong; re-read the label and re-extract the real value after its colon. null if
      the document truly has no closing date/time.
    - Tender Security: Return an OBJECT (never a bare string), built like this:
        { "bdt": number|null, "foreign": {"currency": string, "amount": number}|null, "verbatim": string|null }
      * "verbatim": copy the tender security sentence/phrase exactly as printed (e.g. "BDT 6,52,108 (or USD 5,301)" or "As per e-Tender Notice"). null only if the document has no tender security field at all.
      * "bdt": the security amount converted to a PLAIN INTEGER of BDT (Taka). South Asian digit grouping uses the last 3 digits, then groups of 2 — convert it: "BDT 6,52,108" -> 652108, "Tk. BDT 1,95,63,000" -> 19563000, "25 Lac" -> 2500000, "1.5 Crore" -> 15000000. null if no BDT amount is stated (e.g. the field only says "As per e-Tender Notice", or is entirely foreign-currency).
      * "foreign": if the document ALSO states a foreign-currency equivalent (e.g. "or USD 5,301"), capture it as {"currency": "USD", "amount": 5301}. null if no foreign-currency equivalent is stated.
      * This must be the actual monetary amount — NEVER a bare clause/article number (e.g. do not return 63 or 32 as "bdt" just because a clause such as "ITT Clause 63" or "ITT Clause 30.1" is nearby; that is a clause reference, not the security amount).
      * If the tender security field is entirely absent from the document, return {"bdt": null, "foreign": null, "verbatim": null}.
    - Joint Venture: Search the ENTIRE document (not just the header) for a Joint Venture / JV eligibility clause — this is commonly ITT 17 for Works, ITT 16 for Physical Services; many Goods tenders have NO such clause at all. Return an OBJECT:
        { "clausePresent": boolean, "allowed": boolean|null, "clauseRef": string|null }
      * "clausePresent": true only if the document contains an actual clause discussing whether Joint Ventures may bid. false if there is no such clause anywhere in the document — this is common and correct for many Goods tenders; do NOT default to true and do NOT invent a determination when there is no clause.
      * "clauseRef": the clause number/label (e.g. "ITT 17.1"), only when clausePresent is true; otherwise null.
      * "allowed": when clausePresent is true, true if the clause permits JV bidding, false if it states JVs are not allowed/not permitted. null only if clausePresent is true but the clause's own text does not clearly state either way — never guess.
      * When clausePresent is false, "allowed" and "clauseRef" MUST both be null.
    IMPORTANT for all fields above: copy/derive values EXACTLY from the document; if a field is genuinely not present, return null (or the null-object shape shown above) — NEVER guess, invent, or fall back to a plausible-looking example value. Never let one field's label text or a neighboring field's digits leak into another field's value.
    - Full Text: Reproduce the COMPLETE text of the document VERBATIM — every clause, number, date and threshold exactly as written. Do NOT summarize, paraphrase, shorten or omit anything (especially qualification/financial clause values such as experience years, turnover, similar-contract values, liquid assets, supply capacity). This raw text drives the clause-by-clause analysis, so completeness and exactness are critical.

    Return the response strictly in JSON format:
    {
      "title": "string",
      "nature": "Goods" | "Works" | "Physical Services" | "Consultancy Services",
      "value": number,
      "method": "OTM" | "LTM" | "OSTETM" | "RFQ" | "DPM" | "Framework" | "QCBS" | "FBS" | "LCS" | "SSS",
      "consultantType": "Firm" | "Individual",
      "paymentType": "Lump-Sum" | "Time-Based",
      "isOutsourcing": boolean,
      "isDPFunded": boolean,
      "tenderId": "string" | null,
      "referenceNo": "string" | null,
      "procuringEntity": "string" | null,
      "closingDateTime": "string" | null,
      "tenderSecurity": { "bdt": number|null, "foreign": {"currency": "string", "amount": number}|null, "verbatim": "string"|null },
      "jointVenture": { "clausePresent": boolean, "allowed": boolean|null, "clauseRef": "string"|null },
      "fullText": "string"
    }
  `;

  try {
    let resData;
    
    // PDF: send as base64 JSON (matches the /api/ai/extract-file endpoint; avoids multipart issues)
    if (fileObj && mimeType === 'application/pdf') {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // extract base64 part only
        };
        reader.onerror = reject;
        reader.readAsDataURL(fileObj);
      });

      const res = await fetch('/api/ai/extract-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: base64, mimeType: mimeType, prompt: prompt })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }
      resData = await res.json();
    } else {
      // Fallback to Base64 flow for images or when File object is missing
      const contents = [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: fileBase64, mimeType } }
          ]
        }
      ];
      
      const response = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      const resText = await response.text();

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = JSON.parse(resText);
        } catch (_) {}
        throw new Error(errorData.error || resText || `HTTP error ${response.status}`);
      }

      try {
        resData = JSON.parse(resText);
      } catch (jsonErr) {
        console.error("Response is not JSON. Response body starts with:", resText.substring(0, 300));
        throw new Error(`Server returned non-JSON response (status ${response.status}): ${resText.substring(0, 100)}...`);
      }
    }
    
    let text = resData.text.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
    }

    const result = JSON.parse(text);

    // Verbatim text comes from the SAME base64 extract-file call: the server runs pdf-parse on the buffer and
    // returns `rawText`. This avoids a separate multipart upload (unreliable on Cloud Functions) and preserves
    // ALL clause numbers (experience years, turnover, liquid assets, contract values, supply capacity, etc.).
    // Gemini's JSON "fullText" truncates/paraphrases long docs, so we prefer the verbatim rawText when present.
    const rawText = (resData && resData.rawText) ? String(resData.rawText).trim() : "";
    const verbatimText = rawText.length > 200 ? rawText : ""; // scanned/image PDFs yield little -> fall back to model text

    // Header fields: pass through Gemini's null when genuinely absent. Never substitute
    // a placeholder/example value here — the renderer is responsible for displaying
    // "Not stated in document" for null, and must never receive an invented fallback.
    const tenderSecurity: TenderSecurity | null = result.tenderSecurity
      ? {
          bdt: typeof result.tenderSecurity.bdt === 'number' ? result.tenderSecurity.bdt : null,
          foreign: result.tenderSecurity.foreign && typeof result.tenderSecurity.foreign.amount === 'number'
            ? { currency: result.tenderSecurity.foreign.currency || '', amount: result.tenderSecurity.foreign.amount }
            : null,
          verbatim: result.tenderSecurity.verbatim || null,
        }
      : null;

    const jointVenture: JointVenture | null = result.jointVenture
      ? {
          clausePresent: result.jointVenture.clausePresent === true,
          allowed: result.jointVenture.clausePresent === true
            ? (typeof result.jointVenture.allowed === 'boolean' ? result.jointVenture.allowed : null)
            : null,
          clauseRef: result.jointVenture.clausePresent === true ? (result.jointVenture.clauseRef || null) : null,
        }
      : null;

    return {
      title: result.title || "",
      nature: result.nature || "Works",
      value: result.value ?? 0,
      method: result.method || "OTM",
      consultantType: result.consultantType,
      paymentType: result.paymentType,
      isOutsourcing: result.isOutsourcing || false,
      isDPFunded: result.isDPFunded || false,
      tenderId: result.tenderId || null,
      referenceNo: result.referenceNo || null,
      procuringEntity: result.procuringEntity || null,
      closingDateTime: result.closingDateTime || null,
      tenderSecurity,
      jointVenture,
      fullText: verbatimText || result.fullText || "",
      tokensUsed: resData.tokensUsed || 0
    };
  } catch (error: any) {
    console.error("Extraction failed:", error);
    throw new Error(error.message || "Failed to extract data from document.");
  }
}

export const SCORE_CAP_HARD_FAIL = 35;   // any FAIL/MISMATCH on a mandatory gate
export const SCORE_CAP_DATA_NEEDED = 70; // any DATA_NEEDED on a mandatory gate

export function classifyCriterion(c: Criterion): CriterionStatus {
  // If weight is 0 or excluded, or name/clause corresponds to something excluded under category rules
  if (c.weight === 0) {
    return 'EXCLUDED';
  }

  // No value in the profile -> DATA_NEEDED if mandatory, else NOT_APPLICABLE.
  if (!c.valuePresent) {
    return c.mandatory ? 'DATA_NEEDED' : 'NOT_APPLICABLE';
  }

  // A value IS present from here on.

  // Numeric value present check:
  if (c.kind === 'numeric') {
    // Numeric units/goods that don't match (e.g. "250,000 units" vs "300 pc") -> MISMATCH.
    if (c.unitsComparable === false) {
      return 'MISMATCH';
    }
    
    if (c.requiredValue != null && c.haveValue != null) {
      if (c.haveValue < c.requiredValue) {
        return 'FAIL';
      }
    }
  }

  // A present value whose compliance the AI left UNCONFIRMED (satisfied is neither true nor false)
  // must NOT be assumed compliant. This guards non-numeric checks — licences, certificates and
  // documents (e.g. a VAT/Trade licence that is present but whose required validity/currency is
  // unknown). Honesty policy: never assume compliance. Mandatory -> DATA_NEEDED, optional -> N/A.
  // Numeric criteria are excluded here because the numeric comparison above is authoritative.
  if (c.kind !== 'numeric' && c.satisfied !== true && c.satisfied !== false) {
    return c.mandatory ? 'DATA_NEEDED' : 'NOT_APPLICABLE';
  }

  // Value present but for the WRONG product/category -> MISMATCH.
  // Note: if c.satisfied is explicitly false and it is related to experience or capacity or categorical matching, it is MISMATCH.
  if (c.satisfied === false) {
    const isCategoryCheck = 
      c.kind === 'categorical' || 
      c.name.toLowerCase().includes('experience') || 
      c.name.toLowerCase().includes('contract') || 
      c.name.toLowerCase().includes('capacity') ||
      c.clauseRef?.toLowerCase().includes('13.1b') ||
      c.clauseRef?.toLowerCase().includes('13.1c');

    if (isCategoryCheck) {
      return 'MISMATCH';
    }
    return 'FAIL';
  }

  return 'PASS';
}

export interface EligibilityResult {
  score: number;
  eligibilityLabel: 'High Probability' | 'Action Needed' | 'Not Eligible (knock-out)';
  isEligible: boolean;
  criteria: Array<Criterion & { status: CriterionStatus }>;
}

// A criterion's tier, falling back to the legacy "mandatory" flag for any criterion
// the model didn't (or couldn't) assign a severity to.
function tierOf(c: Criterion): 'CRITICAL' | 'IMPORTANT' | 'MINOR' {
  return c.severity || (c.mandatory ? 'CRITICAL' : 'IMPORTANT');
}

export function computeEligibility(criteria: Criterion[]): EligibilityResult {
  const resolved = criteria.map(c => ({
    ...c,
    status: classifyCriterion(c)
  }));

  const scorable = resolved.filter(c => c.status !== 'EXCLUDED' && c.status !== 'NOT_APPLICABLE');

  const criticalItems = scorable.filter(c => tierOf(c) === 'CRITICAL');
  const importantItems = scorable.filter(c => tierOf(c) === 'IMPORTANT');

  const criticalFails = criticalItems.filter(c => c.status === 'FAIL' || c.status === 'MISMATCH');
  const criticalDataNeeded = criticalItems.filter(c => c.status === 'DATA_NEEDED');
  const importantFails = importantItems.filter(c => c.status === 'FAIL' || c.status === 'MISMATCH');
  const importantDataNeeded = importantItems.filter(c => c.status === 'DATA_NEEDED');

  // Weighted score: IMPORTANT (compensable capacity gaps) counts for more than MINOR
  // (nice-to-have quality items), so a bidder's technical score reflects real bidding risk.
  const tierWeight = (c: Criterion) => {
    const base = c.weight ?? 1;
    return tierOf(c) === 'MINOR' ? base : base * 2;
  };

  const totalW = scorable.reduce((sum, c) => sum + tierWeight(c), 0);
  const passW = scorable
    .filter(c => c.status === 'PASS')
    .reduce((sum, c) => sum + tierWeight(c), 0);

  let score = totalW > 0 ? Math.round((passW / totalW) * 100) : 0;

  let label: 'High Probability' | 'Action Needed' | 'Not Eligible (knock-out)' = 'High Probability';

  // Any CRITICAL (knock-out) failure overrides everything else and caps the score low.
  if (criticalFails.length > 0) {
    score = Math.min(score, SCORE_CAP_HARD_FAIL);
    label = 'Not Eligible (knock-out)';
  } else if (criticalDataNeeded.length > 0) {
    score = Math.min(score, SCORE_CAP_DATA_NEEDED);
    label = 'Action Needed';
  } else if (importantFails.length > 0 || importantDataNeeded.length > 0) {
    label = 'Action Needed';
  }

  return {
    score,
    eligibilityLabel: label,
    isEligible: criticalFails.length === 0 && criticalDataNeeded.length === 0,
    criteria: resolved
  };
}

export async function analyzeTender(data: TenderData, lang: 'en' | 'bn' = 'en', providedStds?: any[], companyProfile?: CompanyProfile | null): Promise<AnalysisResult> {
  // Use provided STDs
  let uploadedStds: any[] = providedStds || [];

  // Find the most relevant STD based on uploaded docs
  let std = "";
  const matchingStd = uploadedStds.find(s => 
    s.category === data.nature && 
    s.method === data.method && 
    data.value >= s.valueMin && 
    data.value <= s.valueMax
  );

  if (matchingStd) {
    std = matchingStd.title;
  } else {
    // Fallback logic if no matching uploaded STD is found
    if (data.nature === 'Goods') {
      if (data.method === 'RFQ' || data.value <= 1200000) std = "e-PG1 (SRFQ)";
      else if (data.method === 'DPM') std = "e-PG9 (DPM)";
      else if (data.method === 'Framework') std = "e-PG3A (Framework)";
      else if (data.value <= 5000000) std = "e-PG2 (OTM/LTM)";
      else std = "e-PG3 (OTM)";
    } else if (data.nature === 'Works') {
      if (data.isDPFunded) std = "e-PW3D (OTM - Development Partner)";
      else if (data.method === 'RFQ' || data.value <= 1200000) std = "e-PW1 (SRFQ)";
      else if (data.method === 'LTM' && data.value <= 50000000) std = "e-PW2B (LTM)";
      else if (data.method === 'OTM' && data.value <= 50000000) std = "e-PW2A (OTM)";
      else if (data.method === 'OTM' && data.value > 50000000) std = "e-PW3 (OTM)";
      else if (data.method === 'OSTETM') std = "e-PW3A (OSTETM)";
      else std = "e-PW2 (Standard Tender Document for Works)";
    } else if (data.nature === 'Consultancy Services') {
      if (data.consultantType === 'Individual') {
        std = data.paymentType === 'Time-Based' ? "e-PS4 (Individual - Time Based)" : "e-PS3 (Individual - Lump Sum)";
      } else {
        if (data.value > 10000000) {
          std = data.paymentType === 'Time-Based' ? "e-PS8 (Firm - Complex Time Based)" : "e-PS7 (Firm - Complex Lump Sum)";
        } else {
          std = data.paymentType === 'Time-Based' ? "e-PS6 (Firm - Simple Time Based)" : "e-PS5 (Firm - Simple Lump Sum)";
        }
      }
    } else {
      if (data.method === 'DPM') std = "e-PPS6 (Direct Procurement)";
      else if (data.isOutsourcing) std = "e-PPS2 (Outsourcing)";
      else std = "e-PPS3 (Physical Services)";
    }
  }

  const prompt = `
    You are an expert eligibility analyst for Bangladesh public procurement (e-GP), working strictly under PPR 2025 and the Standard Tender Documents (STDs).
    You analyse ONE tender against ONE company profile and return a structured eligibility assessment as JSON only.

    Your output must be accurate enough that a bidder can rely on it to decide whether to bid. A wrong "you qualify" is a serious failure. When unsure, mark data as needed — never assume compliance.

    ========================================================================
    RULE 1 — ANCHOR TO THE ACTUAL TENDER SUBJECT (highest priority)
    ========================================================================
    - FIRST, extract the tender's exact Brief / Name / subject and the specific item, work, or service
      being procured. Store it as "tenderSubject" in the JSON.
    - Every statement you make afterwards — licences, manufacturer authorisation, strategy, summary —
      MUST be consistent with "tenderSubject".
    - NEVER introduce a product, category, licence, or requirement that does not appear in THIS tender.
      Do not carry over examples or assumptions from any other tender or domain.
    - If you cannot determine the subject from the document, set "tenderSubject" to "UNDETERMINED" and
      add a warning. Do not guess a product.

    ========================================================================
    RULE 2 — STATED VALUES ALWAYS BEAT FORMULAS
    ========================================================================
    For every qualification threshold (experience years, similar-contract value, number of contracts,
    supply/production capacity, liquid assets, etc.):
      1. Search the tender (ITT clauses and the Tender Data Sheet) for an EXPLICITLY STATED value tied
         to that clause.
      2. If a stated value exists, USE THAT EXACT NUMBER — copy it verbatim from the text. NEVER substitute a
         "typical", "standard" or default value (e.g. do NOT output 5 years when the text says 3 years, or
         7,50,000 when the text says 25,00,000). Set the source to "stated", record the clause reference, and
         quote the exact snippet of text it came from in the comparison reason.
      3. ONLY if no value is stated anywhere, compute the documented fallback formula, set the source to
         "derived", and record which formula you used.
      4. A formula must NEVER override a stated value. If you output a derived value while a stated value
         exists in the text, that is an error.

    ========================================================================
    RULE 3 — PARSE BANGLADESHI NUMBER FORMATS CORRECTLY
    ========================================================================
    Amounts may be written in South Asian conventions. Convert every amount to a plain integer of BDT
    (Taka) before comparing. Apply these conversions:
      - "Lakh" or "Lac" = 100,000        (e.g., "25 Lac" = 2,500,000)
      - "Crore"          = 10,000,000     (e.g., "1.5 Crore" = 15,000,000)
      - "Thousand"       = 1,000
      - South Asian digit grouping uses the last 3 digits, then groups of 2:
            25,00,000   = 2,500,000
            35,00,000   = 3,500,000
            1,00,00,000 = 10,000,000 (= 1 Crore)
            1,50,00,000 = 15,000,000
      - "Tk", "Tk.", "Taka", "৳", "BDT" all denote BDT. Strip them and any ".00" decimals.
      - An amount may be given in BOTH words and numerals, e.g.
            "Tk. Twenty Five Lac (Tk. 25,00,000.00)"  -> 2,500,000
        Parse both, confirm they match. If they disagree, prefer the written-out words and add a warning to the JSON response.
    - All monetary comparisons are done in integer BDT. The company profile is already in BDT.

    ========================================================================
    RULE 4 — DO NOT FABRICATE AN ESTIMATED VALUE
    ========================================================================
    - Set the "estimatedValue" property ONLY if the tender explicitly states an official estimated cost. Otherwise
      set it to null.
    - Never invent an estimated value, and never reuse a qualification threshold (e.g., the similar-
      contract requirement) as if it were the estimated value.
    - Never derive a percentage-based fallback (e.g., 75% / 80% of estimate) when "estimatedValue" is
      null. If a financial threshold is not stated AND there is no estimated value, mark it as "data-needed".
    - If the tender is a Framework Agreement, set "isFrameworkAgreement" = true and note that pricing is
      per-unit / rate-based for call-off orders, not a single lump sum.

    ========================================================================
    RULE 5 — EVALUATE THE COMPLETE CRITERIA SET (do not drop any)
    ========================================================================
    - Extract and evaluate EVERY qualification criterion present in the tender. For a Goods (e-PG3A)
      tender this typically includes:
          ITT 13.1(a) general experience (years)
          ITT 13.1(b) similar-contract experience (value, number of contracts, period)
          ITT 14.1(b) financial resources / liquid assets
    - Extract all required documents and licences from the tender's document list (e.g., ITT 20.1(k),
      28.1). Derive mandatory licences ONLY from this list and the stated subject — not from assumptions
      about the product category.
    - You must explicitly search for, extract, and evaluate as separate, dedicated individual criteria cards:
      * "Sample Submission (ITT Clause 20.1j)" if a physical sample submission is required by the tender's TDS/ITT text before closing.
      * "DLS Category-1 License" if a DLS Category-1 license/registration is specified as mandatory for poultry, animal feed, or livestock ingredients.
      Keep them as separate, individual criteria cards in "criteria" and map them as "DATA_NEEDED" if not verified/unset in the profile.
    - NEVER merge two or more distinct required documents/certificates into a single criterion card,
      even when they share a clause reference or a common issuing authority. Each named document in
      the tender's document list gets exactly one criterion card, evaluated independently, with its own
      "satisfied" value. In particular, under ITT 23.1(f)/23.1(j) taxation and compliance documents:
      the "TIN Certificate" and the "Income Tax Return Acknowledgement Slip" are TWO separate mandatory
      documents — always create two separate criterion cards for them, never one combined card. A
      card's "satisfied" must never be set to true because a sibling requirement folded into the same
      card happens to be met; an unconfirmed or missing document must surface as its own DATA_NEEDED
      or FAIL card, never be absorbed silently into a passing neighbor.
    - The anti-merge rule above applies to DISTINCT required documents/certificates only. It does NOT
      apply to a single requirement that has more than one condition joined by "AND" within the SAME
      clause — e.g. ITT 13.1(b) similar-contract experience is typically phrased as "at least N contract(s),
      EACH with a value of at least Tk. X" — the contract count and the per-contract value are two
      conditions of ONE requirement, not two separate documents. Keep such a requirement as ONE
      composite criterion card, and mark it NOT MET as a whole if ANY of its joined conditions fails
      (e.g. the bidder has enough contracts by count but no single contract meets the minimum value —
      the card is still NOT MET, never split into a passing "count" card and a failing "value" card).

    ========================================================================
    RULE 6 — CATEGORY-AWARE & DOMAIN/CATEGORY MATCH EVALUATION
    ========================================================================
    - GOODS: do NOT evaluate Key Personnel or Equipment as pass/fail; mark them with weight 0 / status EXCLUDED or as non-applicable.
    - WORKS and PHYSICAL SERVICES: DO evaluate personnel and equipment.
    - Identify the correct STD (e.g., e-PG3A for Goods OTM/Framework) and report it as "stdUsed". A
      pre-computed guess (derived only from estimated value and procurement method) is supplied to you
      as a fallback default for "stdUsed" — but the tender's OWN text is the authority whenever it
      disagrees. Search the "Tender Notice Text" for any explicit citation of its own standard document
      or form series (e.g. a form number referenced in the document list such as "e-PW2A-5", "e-PW2A-8",
      "e-PW2B-...", "e-PW3-...", "e-PW1-...", or a direct statement like "as per e-PW2A"). If the tender
      text cites a specific STD/form series ANYWHERE, that citation OVERRIDES the value-derived fallback
      default — report the STD the document itself actually uses, not the value-threshold guess, and do
      not let mismatched value-derived STDs leak into individual clause references.

    - DOMAIN/CATEGORY MATCH RULE FOR EXPERIENCE & CAPACITY:
      * For specific/similar experience under ITT 13.1(b): the bidder's past contracts MUST be in the SAME goods category/domain that the tender names (e.g., "Animal Feed" or "Poultry Feed").
      * If the bidder's experience is NOT in the tendered goods category (e.g., they are an IT company with IT contracts / IT products while the tender is for "Animal Feed" or "Poultry Feed"), you MUST evaluate this as a DOMAIN MISMATCH. Set "satisfied" = false and "unitsComparable" = false (hard fail, leading to MISMATCH). Do NOT mark it PASS just because the contract value or count is high.
      * Apply the same matching rule to any supply/production-capacity criterion if the tender specifies one.
      * State explicitly in the criterion "note" / text which goods category is required and what the bidder actually has (e.g., "Mismatch: Bidder's experience is in IT contracts/products, not the required Animal Feed category").

    ========================================================================
    RULE 7 — DATA-NEEDED VS MISMATCH OR FAIL
    ========================================================================
    - If a required field is genuinely blank / missing / "Unknown / Unset" in the company profile (e.g. BERC, Fire, DLS when unset in the profile), set "valuePresent" to false. Do NOT mark it as MISMATCH.
    - Only present-but-wrong cases (like an IT Manufacturer's Authorization on an LPG tender, or IT contracts on an Animal Feed tender) become MISMATCH. Set "valuePresent" = true but "satisfied" = false.
    - Describe the mismatch or missing field explicitly, naming both what they have and what is required.
    - LICENCE / DOCUMENT VALIDITY — NEVER ASSUME: For any licence, certificate or document criterion
      (Trade Licence, TIN, VAT/BIN, Electrical, Fire, BERC, DLS, enlistment / blue book, audit reports, etc.):
        * Set "satisfied" = true ONLY when the profile positively confirms the item is present AND — where the
          tender requires a specific validity period, "up to date" status, or a given FY — its validity is
          confirmed to cover that period.
        * If the item is present but its required validity / currency is "N/A", blank, or otherwise NOT confirmed
          by the profile, set "satisfied" = null (present but unconfirmed). NEVER assume it is current and NEVER
          write phrases like "assumed up-to-date". In the note, state plainly that validity could not be confirmed
          from the profile and must be verified by the bidder.
        * Set "satisfied" = false only when the item is present but clearly wrong, expired, or insufficient.
        * For every non-numeric criterion, "satisfied" MUST be exactly true, false, or null — never omit it.

    ========================================================================
    RULE 8 — DO NOT COMPUTE SCORE OR BADGES (APP COMPUTES THEM)
    ========================================================================
    - Do NOT compute the final eligibility score or the badge yourself — the application code computes those now from the per-criterion fields.

    ========================================================================
    RULE 9 — SELF-CHECK BEFORE YOU RETURN
    ========================================================================
    Before returning JSON, verify all of the following:
      (a) Every product/licence you mention is consistent with "tenderSubject"; nothing foreign appears.
      (b) Under EVERY criterion, the "Snippet:" MUST be copied VERBATIM (character-for-character) from the provided "Tender Notice Text" — it is evidence, never a paraphrase. NEVER invent, paraphrase, or place an assumed/derived number inside a Snippet. If the provided text contains NO line matching this criterion (i.e. the value is derived, not stated), you MUST write exactly: Snippet: "Not stated in the provided document — requirement derived from standard PPR 2025 guidelines." and that criterion's source MUST be "derived". A fabricated or paraphrased quote is a critical error.
      (c) No criterion that does not appear in the tender is included in the "criteria" list.
      (d) All monetary values are integer BDT (no Lac/Crore words, no commas, no ৳).
      (e) "estimatedValue" is null unless explicitly stated in the document.
      (f) Absolutely NO internal prompt rule numbers (like "Rule 6" or "Rule 8") are mentioned in user-facing text.

    ========================================================================
    RULE 10 — HIDE INTERNAL RULE REFERENCES
    ========================================================================
    - DO NOT mention internal rule designations (e.g., "Rule 1", "Rule 6", "Rule 8") anywhere in user-facing data (e.g., in "note", "winningStrategy" or "summary").
    - When excluding or evaluating categories, state the rationale naturally using standard procurement language. E.g., write: "Key Personnel evaluation is not required for Goods tenders under standard e-PG3A guidelines" instead of referencing internal rules or algorithms.

    ========================================================================
    RULE 11 — NET AVAILABLE CAPACITY (Sarkar principle 1 — most important)
    ========================================================================
    - For Liquid Assets: ALWAYS use the NET AVAILABLE figure (gross minus committed) when comparing
      against the tender requirement. Show both in the note: e.g. "Gross ৳X, ৳Y committed to ongoing
      work, Net Available ৳Z vs Required ৳R." Never silently use the gross figure.
    - For Tender Capacity: the "B" term in the formula (A×N×1.25−B) must be populated from the
      bidder's "Existing Commitments Value" field. If the bidder entered a B value, use it. If they
      left it at 0, note "B term not entered — assumed zero; bidder should confirm."
    - For Personnel & Equipment: if the bidder entered committed manpower or equipment, flag in the
      note how much is already deployed and comment on whether enough is free for the new contract.
      Never assume all resources are available when the bidder has disclosed commitments.

    ========================================================================
    RULE 12 — ToR-DRIVEN TECHNICAL + PRE-BID REMINDER (Sarkar principle 2)
    ========================================================================
    - Evaluate technical requirements strictly from THIS tender's ToR/specifications/ITT clauses.
      Do not apply a fixed generic checklist.
    - Formula-derived thresholds (AACT, Liquid Assets, Tender Capacity) are ESTIMATES when not
      explicitly stated. Label them as "indicative — confirm against the tender document."
    - In the "summary" field, always add this sentence at the end: "Note: Confirm any unclear or
      assumed requirement at the pre-bid meeting; the procuring entity's clarification overrides
      any formula-derived figure."

    ========================================================================
    RULE 13 — GOODS TECHNICAL DIMENSION (Sarkar principle 3)
    ========================================================================
    - For Goods tenders, technical capacity is NOT irrelevant. In addition to supply capacity,
      manufacturer authorization and product licences, also evaluate whether the bidder can:
      (a) select/source goods to the correct specification, (b) import if required, and
      (c) access testing/QA facilities when the tender requires testing or inspection.
    - If the bidder has provided QA/testing capability information, evaluate it. If not provided,
      mark as DATA_NEEDED with a note explaining which Goods-specific competencies are needed.

    ========================================================================
    RULE 14 — ONLY INCLUDE CLAUSES PRESENT IN THIS TENDER (NO INVENTED CARDS)
    ========================================================================
    - NEVER create a criterion card or include an item in the "criteria" list for a clause that does not actually appear in this analysed TDS/ITT document.
    - If a clause does not appear in the analysed tender's document (e.g., this tender has NO ITT Clause 13.1c supply/production capacity clause), you MUST NOT create a 13.1(c) card, and never mark a non-existent criterion as PASS.
    - Only evaluate criteria explicitly mentioned in the tender text (e.g. general experience ITT 13.1a, similar experience ITT 13.1b, liquid assets ITT 14.1b, Trade License, TIN, VAT, Sample Submission ITT 20.1j, and DLS Category-1 License if mentioned).

    ========================================================================
    RULE 15 — SEVERITY TIERING & GAP-CLOSING ADVISORY (Mr. Sarkar's 3-tier model)
    ========================================================================
    - Classify EVERY criterion in the "criteria" list into exactly one severity tier. Decide the tier from
      what THIS tender's own TDS/ITT text requires for its own procurement category (Works, Goods, Physical
      Services, or Consultancy Services) — use the category/clause map below and the tender text itself,
      never a fixed generic list; the same criterion name can be CRITICAL in one tender and IMPORTANT in
      another depending on how that tender's own TDS/ITT actually states it.
      * "CRITICAL" (knock-out): explicitly-mandated minimums the bidder must already hold to be eligible
        at all — e.g. a valid Trade Licence, TIN, VAT/BIN, tender security, any statutory licence the
        tender states as mandatory for this subject (Electrical/Fire/BERC/DLS as applicable), a required
        sample submission, and a financial threshold the tender states as a hard pass/fail floor that
        cannot realistically be bridged by a credit line before contract signing.
      * Personnel and equipment shortfalls are ALWAYS "IMPORTANT" (compensable via hire/lease), even if
        the tender's own boilerplate text states non-fulfillment leads to "non-responsiveness" — that
        boilerplate reflects the PE's formal evaluation process, not whether the gap is realistically
        closeable before contract signing. Never classify a personnel or equipment shortfall as CRITICAL.
      * GRANULARITY: Personnel and equipment must NEVER be reported as one single combined "Personnel
        Capacity" / "Equipment Capacity" block. Create ONE separate criterion card PER required position
        (e.g. "Key Personnel: Project Manager", "Key Personnel: Site Engineer (Civil)", "Key Personnel:
        Site Engineer (Electrical)", "Key Personnel: Manager (B Com)", etc.) and PER required equipment
        type (e.g. "Equipment: Vibrator Machine", "Equipment: Pump Motor", "Equipment: Compaction
        Machine", etc.), each with its own "satisfied" value and its own role/type-specific "howToClose"
        advisory (e.g. name which electrification/civil/financial work the missing role or machine is
        needed for). This lets the bidder decide, position by position and machine by machine, which
        gaps to hire/lease and which require the bidder's own permanent staff/owned equipment — do not
        collapse this decision into one generic block advisory.
      * "IMPORTANT" (compensable): capacity gaps the bidder can realistically arrange before contract
        signing — a liquid-asset shortfall (bridgeable with a bank credit line/loan), a personnel
        shortfall (can be hired), or an equipment shortfall (can be leased/hired). These do NOT
        disqualify the bidder; they lower the technical score.
      * "MINOR": lower-weight, nice-to-have quality items that are not pass/fail.
    - The application treats ANY unmet "CRITICAL" criterion as an automatic knock-out (score capped low,
      verdict "Not Eligible (knock-out)") regardless of every other criterion — so reserve "CRITICAL" for
      genuine knock-out minimums only, never for a compensable capacity gap.
    - For every "IMPORTANT" criterion the bidder does NOT currently meet, write a professional,
      action-oriented "howToClose" recommendation with its caveat:
      * Liquid-asset shortfall -> recommend arranging a bank credit line / loan to cover the shortfall,
        and note that there is a practical limit to how much a firm can realistically borrow.
      * Personnel shortfall -> recommend hiring the missing qualified staff before contract signing, note
        that hired staff cost more and carry a quality risk, and state plainly if this category/work
        needs the bidder's OWN permanent staff rather than hired staff.
      * Equipment shortfall -> recommend leasing/hiring the missing equipment, and note that hired
        equipment costs more than owned equipment.
      * Any other compensable gap -> give similarly brief, caveated, professional advice.
      Leave "howToClose" empty for criteria that are already met, and for CRITICAL or MINOR criteria.

    ## CATEGORY DEFINITION & CLAUSE MAP:
    First, detect the procurement category from: Works, Goods, Physical Services, or Consultancy Services. Apply the correct core map for clause evaluation:
    - WORKS (STD: e-PW2A/e-PW2B/e-PW3 OTM/LTM, e-PW1 RFQ):
      * General / Similar Experience refers to ITT 13.
      * Financial Capacity (AACT, Liquid Assets, Tender Capacity) refers to ITT 14 (turnover ITT 14.1a, liquid assets ITT 14.1b, Tender Capacity ITT 14.1c).
      * Personnel Capacity refers to ITT 15.
      * Equipment Capacity refers to ITT 16.
      * JV rules refer to ITT 17.
    - GOODS (STD: e-PG3A Framework, e-PG2 LTM, e-PG3 OTM):
      * Experience refers to ITT 13 (13.1a general experience, 13.1b similar supply, 13.1c supply/production capacity).
      * Financial Capacity refers to ITT 14.1(b) (liquid assets only; usually AACT and Tender Capacity are NOT required for Goods).
      * Technical/Other capacity includes Manufacturer/Distributor Authorization, product-specific licenses (e.g. Fire, BERC for LPG, DLS for feed/livestock), and sample submission. NO personnel or equipment capacity check is typically needed.
    - PHYSICAL SERVICES (STD: e-PPS3):
      * Experience refers to ITT 12.
      * Financial Capacity (Turnover, Liquid Assets) refers to ITT 13. (13.1a turnover, 13.1b liquid assets).
      * Personnel Capacity refers to ITT 14.
      * Equipment/Tools Capacity refers to ITT 15.
      * JV rules refer to ITT 16.
      * License requirement: often requires Technical Manpower/Tools list, and electrical supervisory license (ABC).
    - CONSULTANCY (EOI, e-PS forms RFP/SRFP/SRFA):
      * Two-stage, quality-weighted selection (QCBS/QBS).
      * Evaluate the consultancy firm's experience, similar assignments executed, key expert CVs, and methodology. This is NOT a simple pass/fail check.

    - JOINT VENTURE SUMMATION & CURRENCY CONVERSION:
      * Always convert each partner's figures to BDT first, then apply summation. Never sum mixed currencies directly.
      * For a JV, the combined capacity is validated as follows:
        - The lead partner (Local Partner) must meet at least 40% of the minimum required financial criteria (liquid assets, turnover, tender capacity) of the tender.
        - The other partners (Foreign Partner) must meet at least 25% of those criteria.
        - The combined sum of both partners' BDT-converted figures must equal or exceed 100% of the requirement.
        - Calculate and explain whether the local partner meets 40%, the foreign partner meets 25%, and if the total combined meets 100%. Highlight this explicitly in the "note" field for each financial metric (e.g., "Liquid Assets (Combined): Lead (local) provides ৳X (meets 40% min of ৳Y), Partner (foreign) provides ৳A (meets 25% min of ৳Y), Combined total ৳(X+A) meets 100% of requirement ৳Z").
        - The lead partner must hold the similar contract experience requirement (e.g., similar work experience), or combined as specified.

    - LOCAL-COMPLIANCE ATTRIBUTION:
      * Bangladesh-specific licenses (Trade License, TIN, VAT/BIN, Electrical Supervisory License) are normally held by the LOCAL partner, not the foreign company.
      * In Joint Venture (JV) Mode, do NOT flag the foreign company for missing these Bangladesh-specific licenses.
      * Attribute them to the local partner and only flag a gap if the local partner also lacks them or is expired.
      * For "Trade License", "TIN License", and "VAT License", if the local partner has them, evaluate them as met (set "valuePresent" = true, "satisfied" = true).

    - JOINT VENTURE (JV) PARTICIPATION IS OPTIONAL, NOT MANDATORY:
      * A tender clause stating "Joint Ventures are allowed" grants bidders the OPTION to bid as a JV —
        it never requires them to. Bidding alone when JV is merely "allowed" is fully compliant and must
        never be treated as a shortfall.
      * If the bidder's profile is NOT in JV mode (single contractor), set "weight" = 0 and "valuePresent"
        appropriately so the criterion resolves to EXCLUDED / not applicable — never "NOT MET" / FAIL —
        for the "Joint Venture Allowed/Permitted" criterion itself. Do not give it a red/failing status or
        let it read as a gap the bidder needs to close.
      * Only evaluate JV-specific sub-requirements (lead/foreign partner shares, JV agreement document,
        etc.) as pass/fail criteria when the bidder's profile indicates "Joint Venture (JV) Active: YES".

    ## INPUTS:
    - Tender Title: ${data.title}
    - Nature: ${data.nature}
    - Estimated Value: ${data.value ? data.value + ' BDT' : 'Not explicitly stated in the document / Framework (null)'}
    - Procurement Method: ${data.method}
    ${data.fullText ? `- Tender Notice Text: ${data.fullText}` : ''}
    
    ${companyProfile ? `
    User's Company Profile Context:
    - Joint Venture (JV) Active: ${companyProfile.isJV ? 'YES' : 'NO'}
    ${companyProfile.isJV ? `
    - LOCAL LEAD PARTNER (BDT Taka):
      * Liquid Assets: ${companyProfile.liquidAssets ?? 0} BDT
      * Similar Work Experience: ${companyProfile.similarWorkExperience ?? 0} BDT
      * Average Annual Turnover (AACT): ${companyProfile.averageAnnualTurnover ?? 0} BDT
      * Tender Capacity: ${companyProfile.tenderCapacity ?? 0} BDT
    - FOREIGN ASSOCIATE PARTNER:
      * Base Currency: ${companyProfile.foreignCurrency || 'USD'}
      * Exchange Rate: 1 ${companyProfile.foreignCurrency || 'USD'} = ${companyProfile.foreignExchangeRate || 118} BDT (Taka)
      * Original Liquid Assets: ${companyProfile.foreignLiquidAssetsOriginal ?? 0} ${companyProfile.foreignCurrency || 'USD'}
      * Equivalent Liquid Assets in BDT: ${companyProfile.foreignLiquidAssetsBDT ?? 0} BDT
      * Original Similar Work Experience: ${companyProfile.foreignSimilarWorkExperienceOriginal ?? 0} ${companyProfile.foreignCurrency || 'USD'}
      * Equivalent Similar Experience in BDT: ${companyProfile.foreignSimilarWorkExperienceBDT ?? 0} BDT
      * Original Average Annual Turnover: ${companyProfile.foreignAverageAnnualTurnoverOriginal ?? 0} ${companyProfile.foreignCurrency || 'USD'}
      * Equivalent Average Annual Turnover in BDT: ${companyProfile.foreignAverageAnnualTurnoverBDT ?? 0} BDT
      * Original Tender Capacity: ${companyProfile.foreignTenderCapacityOriginal ?? 0} ${companyProfile.foreignCurrency || 'USD'}
      * Equivalent Tender Capacity in BDT: ${companyProfile.foreignTenderCapacityBDT ?? 0} BDT
    ` : `
    - SINGLE CONTRACTOR PROFILE (BDT Taka):
      * Gross Liquid Assets: ${companyProfile.liquidAssets ?? 0} BDT
      * Liquid Assets Committed to Ongoing Work: ${companyProfile.committedLiquidAssets ?? 0} BDT
      * NET AVAILABLE Liquid Assets (use this for comparison): ${(companyProfile.liquidAssets ?? 0) - (companyProfile.committedLiquidAssets ?? 0)} BDT
      * Similar Work Experience: ${companyProfile.similarWorkExperience ?? 0} BDT
      * Average Annual Turnover (AACT): ${companyProfile.averageAnnualTurnover ?? 0} BDT
      * Gross Tender Capacity entered by bidder: ${companyProfile.tenderCapacity ?? 0} BDT
      * Existing Commitments Value ("B" term for Tender Capacity formula): ${companyProfile.existingCommitmentsValue ?? 0} BDT
      * Manpower Already Committed to Ongoing Work: ${companyProfile.committedManpower || 'Not specified'}
      * Equipment Already Committed to Ongoing Work: ${companyProfile.committedEquipment || 'Not specified'}
    `}
      * General Experience: ${companyProfile.generalExperienceYears !== undefined && companyProfile.generalExperienceYears !== '' ? companyProfile.generalExperienceYears : 'Unknown'} years
      * Number of Similar Contracts (last 5 years): ${companyProfile.similarContractsCount5Years !== undefined && companyProfile.similarContractsCount5Years !== '' ? companyProfile.similarContractsCount5Years : 'Unknown'} contracts
      * Key Personnel: ${companyProfile.keyPersonnel && companyProfile.keyPersonnel.length > 0 ? JSON.stringify(companyProfile.keyPersonnel) : 'None provided'}
      * Equipment: ${companyProfile.equipment && companyProfile.equipment.length > 0 ? JSON.stringify(companyProfile.equipment) : 'None provided'}
      * Licenses & Certifications (Note: attribute completely to the Local Lead Partner in JV mode):
        - Trade License: Has = ${companyProfile.tradeLicense?.hasLicense === true ? 'Yes' : companyProfile.tradeLicense?.hasLicense === false ? 'No' : 'Unknown / Unset'}, Validity = ${companyProfile.tradeLicense?.validityDate || 'N/A'}
        - Electrical Supervisory License: Has = ${companyProfile.electricalLicense?.hasLicense === true ? 'Yes' : companyProfile.electricalLicense?.hasLicense === false ? 'No' : 'Unknown / Unset'}, Category = ${companyProfile.electricalLicense?.category || 'N/A'}, Validity = ${companyProfile.electricalLicense?.validityDate || 'N/A'}
        - Fire License: Has = ${companyProfile.fireLicense?.hasLicense === true ? 'Yes' : companyProfile.fireLicense?.hasLicense === false ? 'No' : 'Unknown / Unset'}, Validity = ${companyProfile.fireLicense?.validityDate || 'N/A'}
        - BERC License: Has = ${companyProfile.bercLicense?.hasLicense === true ? 'Yes' : companyProfile.bercLicense?.hasLicense === false ? 'No' : 'Unknown / Unset'}, Validity = ${companyProfile.bercLicense?.validityDate || 'N/A'}
        - DLS License: Has = ${companyProfile.dlsLicense?.hasLicense === true ? 'Yes' : companyProfile.dlsLicense?.hasLicense === false ? 'No' : 'Unknown / Unset'}, Validity = ${companyProfile.dlsLicense?.validityDate || 'N/A'}
        - TIN: Has = ${companyProfile.tinLicense?.hasLicense === true ? 'Yes' : companyProfile.tinLicense?.hasLicense === false ? 'No' : 'Unknown / Unset'}, Validity = ${companyProfile.tinLicense?.validityDate || 'N/A'}
        - VAT/BIN: Has = ${companyProfile.vatLicense?.hasLicense === true ? 'Yes' : companyProfile.vatLicense?.hasLicense === false ? 'No' : 'Unknown / Unset'}, Validity = ${companyProfile.vatLicense?.validityDate || 'N/A'}
      * Goods-specific:
        - Supply/Production Capacity: ${companyProfile.supplyCapacity !== undefined && companyProfile.supplyCapacity !== '' ? companyProfile.supplyCapacity : 'Unknown'} units/year
        - Manufacturer/Distributor Authorization: Has = ${companyProfile.manufacturerAuthorization?.hasAuth === true ? 'Yes' : companyProfile.manufacturerAuthorization?.hasAuth === false ? 'No' : 'Unknown / Unset'}, Items = "${companyProfile.manufacturerAuthorization?.items || 'N/A'}"
    ` : ''}

    ## OUTPUT TEXT LANGUAGE:
    All dynamic values in the response string (summary, winningStrategy, clauses, notes, etc.) MUST be in ${lang === 'bn' ? 'Bangla (Bengali)' : 'English'}. Keep all rules, numbers, and specific clause references exact.

    Return ONLY the JSON object defined by the schema. No markdown, no commentary, no code fences.
    {
      "tenderSubject": "exact Brief / Name / subject extracted as string",
      "estimatedValue": number | null,
      "isFrameworkAgreement": boolean,
      "stdUsed": "${std}", // this is only a value-derived FALLBACK DEFAULT; override it with the STD/form series the tender's own text actually cites, if any (see the STD-identification rule above)
      "clauses": ["Clause ITT X.Y: Description...", ...], // Category-specific clauses mapped correctly.
      "winningStrategy": "Strategic pricing recommendation, SLT warning (if Works, warn if bidder goes below the 10% SLT threshold calculated of BDT), or licensing needs.",
      "summary": "Detailed eligibility analysis summary reflecting PPR 2025 and STD consistent with tenderSubject.",
      "sop": {
        "howToParticipate": "SOP instruction on participating per eprocure.gov.bd guidelines or physical mode.",
        "eligibilityCriteria": ["Extracted requirements...", ...],
        "essentialDocuments": ["SOP list of mandatory docs...", ...],
        "stepByStepTimeline": ["Specific timeline/dates from notice...", ...]
      },
      "criteria": [
        {
          "name": "Criterion name (e.g., General Experience, Similar Supply Contract, Supply/Production Capacity, Liquid Assets, Manufacturer's Authorization, Trade License, Fire License, BERC License, TIN Certificate, VAT Certificate, Key Personnel, Equipment)",
          "clauseRef": "Exact clause reference from ITT/TDS or general guideline",
          "mandatory": boolean,
          "kind": "numeric" | "categorical" | "boolean",
          "weight": number, // 0 if completely excluded/non-applicable under category rules, 1 otherwise
          "valuePresent": boolean, // is there any value in the profile for this item? Set to false if missing/unset in the profile
          "satisfied": boolean | null, // does the present value actually meet the requirement? If the value is present but for the WRONG product/category (such as IT authorization on an LPG tender), set satisfied=false - do NOT mark it as missing data! For a licence/document that is present but whose required validity/currency cannot be confirmed from the profile, set satisfied=null (present but unconfirmed) — never assume it is up-to-date.
          "requiredValue": number | null, // stated numeric requirement threshold (plain integer value, e.g. BDT, years, count), or null
          "haveValue": number | null, // bidder's numeric profile value, or null
          "unitsComparable": boolean | null, // false when units/goods don't line up, e.g. "units" vs "pc" or different product domains, otherwise true/null
          "userValueStr": "string representation of bidder value, e.g. 'Authorized for IT and Networking' or '25 Lac BDT'",
          "requiredValueStr": "string representation of required value, e.g. 'Authorization for LPG Gas Cylinders' or '1 Crore BDT'",
          "note": "A reason note detailing the check naturally, without referencing internal prompt rule numbers.",
          "severity": "CRITICAL" | "IMPORTANT" | "MINOR",
          "howToClose": "Gap-closing advisory for an unmet IMPORTANT criterion, with its caveat. Empty string if met, or if CRITICAL/MINOR."
        }
      ]
    }
  `;

  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const resText = await response.text();

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = JSON.parse(resText);
      } catch (_) {}
      throw new Error(errorData.error || "Analysis failed on server.");
    }
    
    const resData = JSON.parse(resText);
    let text = (resData.text || "{}").trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
    }
    const result = JSON.parse(text);

    // Compute the score, eligibilityLabel, isEligible, and resolved criteria details in TypeScript code!
    const verdict = computeEligibility(result.criteria || []);

    const companyMatch = verdict.criteria.map(c => {
      let metVal: boolean | 'data-needed' | 'EXCLUDED' | 'MISMATCH' | string;
      if (c.status === 'PASS') {
        metVal = true;
      } else if (c.status === 'DATA_NEEDED') {
        metVal = 'data-needed';
      } else if (c.status === 'EXCLUDED') {
        metVal = 'EXCLUDED';
      } else if (c.status === 'MISMATCH') {
        metVal = false;
      } else if (c.status === 'FAIL') {
        metVal = false;
      } else {
        metVal = false;
      }

      return {
        requirement: c.name + (c.clauseRef ? ` (${c.clauseRef})` : ''),
        met: metVal,
        userValue: c.userValueStr || (c.haveValue !== undefined && c.haveValue !== null ? c.haveValue.toLocaleString() : (lang === 'bn' ? 'তথ্য অনুপস্থিত' : 'Data Missing')),
        requiredValue: c.requiredValueStr || (c.requiredValue !== undefined && c.requiredValue !== null ? c.requiredValue.toLocaleString() : (lang === 'bn' ? 'প্রয়োজন' : 'Required')),
        reason: c.note || "",
        severity: c.severity || (c.mandatory ? 'CRITICAL' : 'IMPORTANT'),
        howToClose: c.howToClose || ""
      };
    });

    // Sort order: CRITICAL-fails, CRITICAL-passes, IMPORTANT-fixable (with advisory), IMPORTANT-passes, MINOR.
    const sortRank = (item: TrackRecordMatch) => {
      const isUnmet = item.met === false || item.met === 'data-needed';
      const severity = item.severity || 'IMPORTANT';
      if (severity === 'CRITICAL') return isUnmet ? 0 : 1;
      if (severity === 'IMPORTANT') return isUnmet ? 2 : 3;
      return 4; // MINOR
    };
    companyMatch.sort((a, b) => sortRank(a) - sortRank(b));

    return {
      stdUsed: result.stdUsed || std,
      score: verdict.score,
      eligibilityLabel: verdict.eligibilityLabel,
      clauses: result.clauses || [],
      winningStrategy: result.winningStrategy || "No strategy provided.",
      summary: result.summary || "No summary provided.",
      sop: result.sop,
      companyMatch: companyMatch,
      tenderSubject: result.tenderSubject,
      estimatedValue: result.estimatedValue,
      isFrameworkAgreement: result.isFrameworkAgreement,
      tokensUsed: resData.tokensUsed || 0
    };
  } catch (error: any) {
    console.error("Analysis failed:", error);
    throw new Error(error.message || "Failed to analyze tender data. Please check your network and try again.");
  }
}
