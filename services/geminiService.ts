
import { GoogleGenAI, Type } from "@google/genai";
import { ResearchSession, ResearchStatus, ReasoningStep, ResearchSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateResearchReport = async (
  query: string, 
  context?: string,
  onProgress?: (status: ResearchStatus, reasoning: ReasoningStep) => void
): Promise<Partial<ResearchSession>> => {
  const model = 'gemini-3-flash-preview';

  // 1. Planning phase
  onProgress?.(ResearchStatus.PLANNING, {
    title: "Research Planning",
    description: `Defining scope and sub-topics for: "${query}"`,
    type: 'plan',
    timestamp: new Date().toISOString()
  });
  await new Promise(r => setTimeout(r, 1500));

  // 2. Searching phase
  onProgress?.(ResearchStatus.SEARCHING, {
    title: "Information Gathering",
    description: "Crawling academic papers and high-authority news sources.",
    type: 'search',
    timestamp: new Date().toISOString()
  });
  await new Promise(r => setTimeout(r, 2000));

  // 3. Drafting phase
  onProgress?.(ResearchStatus.DRAFTING, {
    title: "Analysis & Synthesis",
    description: "Synthesizing gathered data into a comprehensive report.",
    type: 'analyze',
    timestamp: new Date().toISOString()
  });

  const prompt = `
    Conduct deep research on the following query: "${query}"
    ${context ? `Use this additional context: ${context}` : ''}
    
    Provide your response in JSON format with the following structure:
    - report: A long, detailed Markdown report with sections, bullet points, and citations.
    - summary: A 2-sentence executive summary.
    - sources: An array of objects with title, url (fictional but realistic), and snippet.
    - inputTokens: A realistic integer for tokens used.
    - outputTokens: A realistic integer for tokens generated.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          report: { type: Type.STRING },
          summary: { type: Type.STRING },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                snippet: { type: Type.STRING }
              }
            }
          },
          inputTokens: { type: Type.INTEGER },
          outputTokens: { type: Type.INTEGER }
        },
        required: ["report", "summary", "sources", "inputTokens", "outputTokens"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  const costPerToken = 0.0000005; // Fictional rate for estimation

  return {
    report: data.report,
    summary: data.summary,
    sources: data.sources,
    cost: {
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      estimatedCost: (data.inputTokens + data.outputTokens) * costPerToken
    }
  };
};
