import { GoogleGenAI } from "@google/genai";
import { TenderData } from "./tenderService";

export interface ForeignPartnerInsights {
  financials: {
    exchangeRate: number;
    valueUSD: number;
    vatAmountUSD: number;
    aitAmountUSD: number;
    localAgencyFeeUSD: number;
    netRepatriableProfitUSD: number;
    sltThresholdUSD?: number;
  };
  jvCompatibility: {
    score: number;
    synergyAnalysis: string;
  };
  complianceAlerts: string[];
  strategicAdvice: string;
  tokensUsed?: number;
}

export async function generateForeignPartnerInsights(data: TenderData, lang: 'en' | 'bn'): Promise<ForeignPartnerInsights> {
  // 1. Financial Math (The Logic Layer)
  const exchangeRate = 118;
  const valueUSD = data.value / exchangeRate;
  
  // VAT: 15% for Services/Works, 7.5% for Goods
  const vatRate = data.nature === 'Goods' ? 0.075 : 0.15;
  const vatAmountUSD = valueUSD * vatRate;
  
  // AIT: 5%
  const aitAmountUSD = valueUSD * 0.05;
  
  // Local Agency Fee: 5%
  const localAgencyFeeUSD = valueUSD * 0.05;
  
  const netRepatriableProfitUSD = valueUSD - vatAmountUSD - aitAmountUSD - localAgencyFeeUSD;
  
  // SLT Warning for Works (10% below estimated value)
  const sltThresholdUSD = data.nature === 'Works' ? valueUSD * 0.9 : undefined;

  const financials = {
    exchangeRate,
    valueUSD,
    vatAmountUSD,
    aitAmountUSD,
    localAgencyFeeUSD,
    netRepatriableProfitUSD,
    sltThresholdUSD
  };

  // 2. AI Strategy & Compliance
  const prompt = `
    Act as a Senior Procurement Consultant for Foreign Investors in Bangladesh.
    Analyze this tender for a foreign partner looking to form a Joint Venture (JV) with a local company.
    
    Tender Details:
    - Title: ${data.title}
    - Nature: ${data.nature}
    - Estimated Value: ${data.value} BDT (~${valueUSD.toFixed(2)} USD)
    - Method: ${data.method}
    ${data.fullText ? `- Full Text: ${data.fullText}` : ''}

    Tasks:
    1. Calculate a JV Compatibility Score (0-100) reflecting how a local company's typical 15-year history complements a foreign firm's technical capacity for this specific type of tender.
    2. Write a brief Synergy Analysis explaining the score.
    3. List 2-3 specific Compliance Alerts based on BPPA 2023 / PPR 2025 rules affecting international bidders for this nature of procurement.
    4. Provide Strategic Advice for the foreign partner.
    
    IMPORTANT: All text fields MUST be in ${lang === 'bn' ? 'Bangla (Bengali)' : 'English'}.

    Return strictly in JSON format:
    {
      "jvCompatibility": {
        "score": number,
        "synergyAnalysis": "string"
      },
      "complianceAlerts": ["string", "string"],
      "strategicAdvice": "string"
    }
  `;

  try {
    const response = await fetch('/api/ai/foreign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Foreign Partner Analysis failed on server.");
    }
    
    const resData = await response.json();
    const result = JSON.parse(resData.text || "{}");

    return {
      financials,
      jvCompatibility: result.jvCompatibility || { score: 0, synergyAnalysis: "" },
      complianceAlerts: result.complianceAlerts || [],
      strategicAdvice: result.strategicAdvice || "",
      tokensUsed: resData.tokensUsed || 0
    };
  } catch (error: any) {
    console.error("Foreign Partner Analysis failed:", error);
    throw new Error(error.message || "Failed to generate foreign partner insights.");
  }
}
