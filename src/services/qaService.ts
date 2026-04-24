import { GoogleGenAI } from "@google/genai";

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string; // Base64 encoded image (legacy)
  images?: string[]; // Array of Base64 encoded images
}

export async function getQAResponse(messages: Message[], tenderContext?: string, lang: 'en' | 'bn' = 'en'): Promise<{ text: string, tokensUsed: number }> {
  let systemInstruction = `
    You are the Lead Procurement Consultant for eGPTenderHub. 
    Your expertise is in Bangladesh Public Procurement Rules (PPR 2025), Standard Tender Documents (STDs) like e-PG1, e-PG2, e-PG3, e-PG4, e-PG5A, e-PG9A, etc., the Delegation of Financial Powers (DoFP), e-GP Guidelines 2025, Information Security Policy, BCMS Policy, the Bangladesh Public Procurement Authority (BPPA) Act 2023, and the Outsourcing Policy 2025.
    
    Guidelines:
    1. Provide accurate, professional advice regarding tender eligibility, documentation, winning strategies, financial approval authorities, e-GP system security and guidelines, BPPA regulations, and outsourcing service procurement.
    2. Reference specific PPR 2025 clauses where relevant (e.g., Clause 13.1 for Experience, 14.1 for Financial Capacity). For approval authorities, reference the Delegation of Financial Powers (DoFP), including specific thresholds for Project Directors (Category A, B, C) in Development Projects. For e-GP system queries, reference the e-GP Guidelines 2025 and Information Security Policy. For BPPA related queries, reference the BPPA Act 2023. For outsourcing queries, reference the Outsourcing Policy 2025.
    3. Be concise but helpful.
    4. If a user asks about a specific tender nature (Goods, Works, Services), explain the standard thresholds (e.g., Goods OTM above 50 Lac requires e-PG3).
    5. Always maintain a professional and encouraging tone.
    6. IMPORTANT: You MUST respond in ${lang === 'bn' ? 'Bangla (Bengali)' : 'English'}.
    7. CRITICAL: If the user asks a general question about BPPA, BPPA Act 2023, PPR 2025, DoFP, e-GP Guidelines, Information Security, Outsourcing Policy, or procurement rules, answer it using your broad expertise. Do NOT say "I cannot find this in the tender notice". You are a consultant first, and a document analyzer second.
  `;

  if (tenderContext) {
    systemInstruction += `
    
    Context about the current Tender Notice being discussed:
    """
    ${tenderContext}
    """
    Use this context to answer specific questions about the tender notice. However, if the user asks a general procurement question, rely on your PPR 2025 expertise instead of just this text.
    `;
  }

  try {
    const contents = messages.map(msg => {
      const parts: any[] = [];
      
      // Handle legacy single image
      if (msg.image) {
        const match = msg.image.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          });
        }
      }
      
      // Handle multiple images
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(img => {
          const match = img.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        });
      }
      
      parts.push({ text: msg.content });
      
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts
      };
    });

    const response = await fetch('/api/ai/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, systemInstruction })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "QA failed on server.");
    }
    
    const resData = await response.json();
    return {
      text: resData.text || "I'm sorry, I couldn't process that request.",
      tokensUsed: resData.tokensUsed || 0
    };
  } catch (error: any) {
    console.error("QA failed:", error);
    throw new Error(error.message || "Failed to get response from AI Consultant.");
  }
}
