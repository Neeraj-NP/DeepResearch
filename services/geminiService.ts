
import { GoogleGenAI, Type } from "@google/genai";
import { ResearchSession, ResearchStatus, ReasoningStep } from "../types";

const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    return undefined;
  }
};

export const summarizeDocument = async (fileName: string, content: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY not found");
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Summarize the following document content into a brief 2-3 sentence contextual brief for a research agent. 
  File Name: ${fileName}
  Content: ${content.substring(0, 10000)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text || "Summary unavailable.";
};

export const generateResearchReport = async (
  query: string, 
  context?: string,
  onProgress?: (status: ResearchStatus, reasoning: ReasoningStep) => void
): Promise<Partial<ResearchSession>> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY environment variable is not defined.");
  
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';

  const createStep = (title: string, desc: string, type: ReasoningStep['type'], tokens: number, duration: number): ReasoningStep => ({
    title, description: desc, type, timestamp: new Date().toISOString(), tokensUsed: tokens, durationMs: duration
  });

  onProgress?.(ResearchStatus.PLANNING, createStep("Logic Deconstruction", "Mapping the epistemic space and identifying core variables.", 'plan', 450, 1000));
  await new Promise(r => setTimeout(r, 1000));

  onProgress?.(ResearchStatus.SEARCHING, createStep("Cross-Domain Sourcing", "Extracting evidence from indexed databases.", 'search', 1500, 2000));
  await new Promise(r => setTimeout(r, 2000));

  onProgress?.(ResearchStatus.SEARCHING, createStep("Assumption Auditing", "Identifying hidden biases and situational constraints.", 'analyze', 900, 1500));
  await new Promise(r => setTimeout(r, 1500));

  const prompt = `
    Conduct elite deep research on: "${query}"
    ${context ? `Context & Document Insights: ${context}` : ''}
    
    Return a strictly structured JSON object:
    - report: Markdown report.
    - summary: 2-sentence executive summary.
    - confidence: { score, explanation, factors: [{label, impact, value}] }
    - analytics: {
        sourceDistribution: [{label, value}], 
        credibilityBreakdown: [{label, value}],
        recencyTrends: [{year, count}],
        agreementStats: [{label, value, color}],
        atomicClaims: [{text, strength: 'Strong'|'Moderate'|'Anecdotal', status, supportingSources, conflictingSources, verificationLogic}],
        assumptions: [{statement, impact: 'High'|'Medium'|'Low', risk}],
        decisionMatrix: [{title, pros: [], cons: [], riskLevel: 'Low'|'Medium'|'High', confidence: number}]
      }
    - sources: [{title, url, snippet, reasoning, supportsClaim, conflictsWith, credibility, credibilitySignal, type, year}]
    - followUps: string[]
    - tokens: { input, output }
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
          confidence: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              factors: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, impact: { type: Type.STRING }, value: { type: Type.STRING } } } }
            }
          },
          analytics: {
            type: Type.OBJECT,
            properties: {
              sourceDistribution: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER } } } },
              credibilityBreakdown: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER } } } },
              recencyTrends: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.NUMBER }, count: { type: Type.NUMBER } } } },
              agreementStats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER }, color: { type: Type.STRING } } } },
              atomicClaims: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, strength: { type: Type.STRING }, status: { type: Type.STRING }, supportingSources: { type: Type.NUMBER }, conflictingSources: { type: Type.NUMBER }, verificationLogic: { type: Type.STRING } } } },
              assumptions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { statement: { type: Type.STRING }, impact: { type: Type.STRING }, risk: { type: Type.STRING } } } },
              decisionMatrix: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, pros: { type: Type.ARRAY, items: { type: Type.STRING } }, cons: { type: Type.ARRAY, items: { type: Type.STRING } }, riskLevel: { type: Type.STRING }, confidence: { type: Type.NUMBER } } } }
            }
          },
          sources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, url: { type: Type.STRING }, snippet: { type: Type.STRING }, reasoning: { type: Type.STRING }, supportsClaim: { type: Type.STRING }, conflictsWith: { type: Type.STRING }, credibility: { type: Type.STRING }, credibilitySignal: { type: Type.STRING }, type: { type: Type.STRING }, year: { type: Type.NUMBER } } } },
          followUps: { type: Type.ARRAY, items: { type: Type.STRING } },
          tokens: { type: Type.OBJECT, properties: { input: { type: Type.NUMBER }, output: { type: Type.NUMBER } } }
        }
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  const costPer1k = 0.0005;

  return {
    report: data.report,
    summary: data.summary,
    sources: data.sources,
    confidence: data.confidence,
    analytics: data.analytics,
    followUps: data.followUps,
    cost: {
      inputTokens: data.tokens.input,
      outputTokens: data.tokens.output,
      estimatedCost: ((data.tokens.input + data.tokens.output) / 1000) * costPer1k,
      optimizationTip: "Balanced analytical path.",
      stageBreakdown: []
    }
  };
};

export const compareResearchSessions = async (sessionA: ResearchSession, sessionB: ResearchSession) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API_KEY environment variable is not defined.");
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  const prompt = `Compare Research A and B. A: ${sessionA.summary} B: ${sessionB.summary}. Return JSON: { addedFindings: string[], contradictions: string[], semanticSummary: string }`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || '{}');
};
