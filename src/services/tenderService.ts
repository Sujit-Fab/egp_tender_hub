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
  fullText?: string;
  tokensUsed?: number;
}

export interface CompanyProfile {
  liquidAssets: number; // in Lakhs
  similarWorkExperience: number; // in Lakhs
  averageAnnualTurnover: number; // in Lakhs
  tenderCapacity: number; // in Lakhs
}

export interface TrackRecordMatch {
  requirement: string;
  met: boolean;
  userValue: string;
  requiredValue: string;
  reason: string;
}

export interface AnalysisResult {
  stdUsed: string;
  score: number;
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
    - Estimated Value: The total estimated cost in BDT. If not explicitly stated, look for "Tender Security" or "Proposal Security" amount and multiply by 40-50 (typical 2-2.5% security) to estimate, or look for budget allocations. Return as a plain number.
    - Procurement Method: Identify the method (OTM, LTM, OSTETM, RFQ, DPM, Framework, QCBS, FBS, LCS, or SSS).
    - Consultancy Details: If Nature is "Consultancy Services", determine:
      * consultantType: "Firm" or "Individual".
      * paymentType: "Lump-Sum" or "Time-Based".
    - Outsourcing: For Physical Services, determine if it involves "Hiring Service Personnel through Outsourcing Policy" (isOutsourcing: true) or other physical services like maintenance, cleaning, etc. (isOutsourcing: false).
    - Development Partner Funded: Set to true if the notice mentions funding from World Bank, ADB, JICA, or other international agencies.
    - Full Text: Provide a comprehensive extraction of all text content from the notice for further analysis.

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
      "fullText": "string"
    }
  `;

  try {
    let resData;

    // ✅ FIX: Send as base64 JSON instead of FormData to avoid multipart/busboy issues in Firebase
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
        body: JSON.stringify({
          fileData: base64,
          mimeType: mimeType,
          prompt: prompt
        })
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Extraction failed on server.");
      }
      resData = await response.json();
    }

    let text = resData.text.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
    }

    const result = JSON.parse(text);
    return {
      title: result.title || "",
      nature: result.nature || "Works",
      value: result.value || 0,
      method: result.method || "OTM",
      consultantType: result.consultantType,
      paymentType: result.paymentType,
      isOutsourcing: result.isOutsourcing || false,
      isDPFunded: result.isDPFunded || false,
      fullText: result.fullText || "",
      tokensUsed: resData.tokensUsed || 0
    };
  } catch (error: any) {
    console.error("Extraction failed:", error);
    throw new Error(error.message || "Failed to extract data from document.");
  }
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
    You are the Lead Procurement Analyst for eGPTenderHub. 
    Analyze the following Tender Data against BPPA/PPR 2025 regulations using the logic of ${std}.
    
    Knowledge Base for Consultancy Services (SRFP/SRFA):
    - e-PS1 (SRFP): Selection of Consulting Firm (International) - Time Based.
    - e-PS2 (SRFP): Selection of Consulting Firm (International) - Lump Sum.
    - e-PS3 (SRFA): Selection of Individual Consultant (National) - Lump Sum Contract based. Used when scope is clear and payment is milestone-based.
    - e-PS4 (SRFA): Selection of Individual Consultant (National) - Time-based Contract. Used when duration/quantity depends on variables.
    - e-PS5 (SRFP): Selection of Consulting Firm (National) - Simple Lump-Sum (Value up to 1 Crore).
    - e-PS6 (SRFP): Selection of Consulting Firm (National) - Simple Time-Based (Value up to 1 Crore).
    - e-PS7 (SRFP): Selection of Consulting Firm (National) - Complex Lump-Sum (Value > 1 Crore).
    - e-PS8 (SRFP): Selection of Consulting Firm (National) - Complex Time-Based (Value > 1 Crore).
    - e-PS9 (SRFP): Selection of Consulting Firm (National) - Design Contest.
    - e-PS10 (SRFP): Selection of NGOs / Community Based Organizations.
    - e-REOI: Request for Expression of Interest for Selection of Consulting Firm.
    
    Knowledge Base for Physical Services STDs:
    - e-PPS2: Used for Hiring Service Personnel through Outsourcing Policy (OTM/LTM). Remuneration is fixed by govt; tenderer quotes ONLY commission (min 5%). Performance Security is 10% of commission.
    - e-PPS3: Used for general Physical Services (ICT, Cleaning, Security, etc.) using OTM/LTM. Performance Security is 5% of contract price.
    - e-PPS6: Used for Direct Procurement Method (DPM) of physical services. Performance Security is 5% of contract price.
    
    Knowledge Base for Works STDs:
    - e-PW1 (SRFQ): Used for low-value simple works up to Tk. 1.2 million. No security required.
    - e-PW2A (OTM): Used for works up to BDT 5.0 Crore using Open Tendering Method.
    - e-PW2B (LTM): Used for works up to BDT 5.0 Crore using Limited Tendering Method (for enlisted contractors).
    - e-PW3 (OTM): Used for large works above BDT 5.0 Crore. Requires detailed technical and financial evaluation.
    - e-PW3A (OSTETM): One Stage Two Envelope Tendering Method. Technical and Financial offers are submitted together but opened separately.
    - e-PW3D (OTM): Used for works funded by Development Partners (World Bank, ADB, etc.) following their specific procurement framework.
    
    Tender Data:
    - Title: ${data.title}
    - Nature: ${data.nature}
    - Estimated Value: ${data.value} BDT
    - Procurement Method: ${data.method}
    ${data.fullText ? `- Full Tender Notice Text: ${data.fullText}` : ''}
    
    ${companyProfile ? `
    User's Company Profile (in Lakhs BDT):
    - Liquid Assets: ${companyProfile.liquidAssets} Lakhs
    - Similar Work Experience: ${companyProfile.similarWorkExperience} Lakhs
    - Average Annual Turnover: ${companyProfile.averageAnnualTurnover} Lakhs
    - Tender Capacity: ${companyProfile.tenderCapacity} Lakhs
    ` : ''}

    Tasks:
    1. Confirm the use of ${std}.
    2. Identify mandatory clauses (e.g., Clause 13.1 for Experience, 14.1 for Financial Capacity) that the tenderer must satisfy.
    3. Calculate an Eligibility Score (0-100) based on typical qualification criteria in these documents. If the user's company profile is provided and they miss major requirements, penalize this score heavily.
    4. Provide a "Winning Strategy" tip specific to this tender's nature and value. IMPORTANT: If the nature is 'Works', explicitly calculate the SLT (Significantly Low Tender) threshold (typically 10% below the estimated value) and include a warning in the Winning Strategy about the risks of bidding below this threshold (e.g., rejection or requirement for additional Performance Security).
    5. Generate a specific Standard Operating Procedure (SOP) for THIS tender notice:
       - How to Participate: Explain the exact process (e-GP or manual) as per the notice.
       - Eligibility Criteria: Extract specific requirements (years of experience, turnover amount, liquid assets) mentioned in the notice.
       - Essential Documents: List all documents explicitly required by this notice.
       - Step-by-Step Timeline: Extract specific dates from the notice (Publication date, Last selling date, Pre-tender meeting, Closing date/time, Opening date/time) and provide a chronological guideline.
    6. IMPORTANT: All text fields in the response (summary, winningStrategy, clauses, sop fields) MUST be in ${lang === 'bn' ? 'Bangla (Bengali)' : 'English'}.
    ${companyProfile ? `7. Cross-reference the extracted Eligibility Criteria against the EXACT values in the User's Company Profile provided above. Generate a 'companyMatch' array evaluating if the user meets each criteria. For each match, provide requirement, met (true/false), userValue (as string with units), requiredValue (as string with units), and reason.` : ''}
    
    Return the response in JSON format:
    {
      "stdUsed": "${std}",
      "score": number,
      "clauses": ["Clause X.X: Description", ...],
      "winningStrategy": "Tip string",
      "summary": "Brief analysis summary",
      "sop": {
        "howToParticipate": "string",
        "eligibilityCriteria": ["string", ...],
        "essentialDocuments": ["string", ...],
        "stepByStepTimeline": ["string", ...]
      }${companyProfile ? `,
      "companyMatch": [
        {
          "requirement": "string",
          "met": boolean,
          "userValue": "string",
          "requiredValue": "string",
          "reason": "string"
        }
      ]` : ''}
    }
  `;

  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Analysis failed on server.");
    }

    const resData = await response.json();
    let text = (resData.text || "{}").trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
    }
    const result = JSON.parse(text);

    return {
      stdUsed: result.stdUsed || std,
      score: result.score ?? 0,
      clauses: result.clauses || [],
      winningStrategy: result.winningStrategy || "No strategy provided.",
      summary: result.summary || "No summary provided.",
      sop: result.sop,
      companyMatch: result.companyMatch,
      tokensUsed: resData.tokensUsed || 0
    };
  } catch (error: any) {
    console.error("Analysis failed:", error);
    throw new Error(error.message || "Failed to analyze tender data. Please check your network and try again.");
  }
}
