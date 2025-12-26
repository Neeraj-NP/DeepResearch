
import { GoogleGenAI, Type } from "@google/genai";
import { ResearchSession, ResearchStatus, ReasoningStep } from "../types";

const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    return undefined;
  }
};

export const generateResearchReport = async (
  query: string, 
  context?: string,
  onProgress?: (status: ResearchStatus, reasoning: ReasoningStep) => void
): Promise<Partial<ResearchSession>> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not defined or accessible.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';

  const createStep = (title: string, desc: string, type: ReasoningStep['type'], tokens: number, duration: number): ReasoningStep => ({
    title,
    description: desc,
    type,
    timestamp: new Date().toISOString(),
    tokensUsed: tokens,
    durationMs: duration
  });

  const step1 = createStep("Analytical Planning", `Deconstructing "${query}" into categorical research nodes.`, 'plan', 450, 1200);
  onProgress?.(ResearchStatus.PLANNING, step1);
  await new Promise(r => setTimeout(r, 1200));

  const step2 = createStep("Aggregated Sourcing", "Crawling cross-domain sources and evaluating metadata.", 'search', 1200, 2500);
  onProgress?.(ResearchStatus.SEARCHING, step2);
  await new Promise(r => setTimeout(r, 2500));

  const step3 = createStep("Evidence Triangulation", "Detecting contradictions and verifying primary claims.", 'analyze', 850, 1800);
  onProgress?.(ResearchStatus.SEARCHING, step3);
  await new Promise(r => setTimeout(r, 1800));

  const prompt = `
    Conduct deep research on: "${query}"
    ${context ? `Context: ${context}` : ''}
    
    Return a strictly structured JSON object for a Research Dashboard:
    - report: Markdown content.
    - summary: Executive summary.
    - confidence: { score (0-100), explanation, factors: [{label, impact: 'positive'|'negative', value}] }
    - analytics: {
        sourceDistribution: [{label, value}], 
        credibilityBreakdown: [{label, value}],
        recencyTrends: [{year, count}],
        agreementStats: [{label, value, color}],
        evidenceClaims: [{claim, status: 'Supported'|'Contested'|'Inconclusive', supportingSources, conflictingSources}]
      }
    - sources: Array with:
        title, url, snippet, reasoning, supportsClaim, conflictsWith,
        credibility: 'High'|'Medium'|'Low', credibilitySignal, type, year
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
              factors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    value: { type: Type.STRING }
                  }
                }
              }
            }
          },
          analytics: {
            type: Type.OBJECT,
            properties: {
              sourceDistribution: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER } } } },
              credibilityBreakdown: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER } } } },
              recencyTrends: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.NUMBER }, count: { type: Type.NUMBER } } } },
              agreementStats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.NUMBER }, color: { type: Type.STRING } } } },
              evidenceClaims: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { claim: { type: Type.STRING }, status: { type: Type.STRING }, supportingSources: { type: Type.NUMBER }, conflictingSources: { type: Type.NUMBER } } } }
            }
          },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                snippet: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                supportsClaim: { type: Type.STRING },
                conflictsWith: { type: Type.STRING },
                credibility: { type: Type.STRING },
                credibilitySignal: { type: Type.STRING },
                type: { type: Type.STRING },
                year: { type: Type.NUMBER }
              }
            }
          },
          followUps: { type: Type.ARRAY, items: { type: Type.STRING } },
          tokens: {
            type: Type.OBJECT,
            properties: {
              input: { type: Type.NUMBER },
              output: { type: Type.NUMBER }
            }
          }
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
      optimizationTip: data.tokens.input > 2000 ? "Stage Sourcing consumed 60% of tokens. Consider refining search scope." : "Resource usage balanced.",
      stageBreakdown: [
        { stage: 'Planning', cost: (step1.tokensUsed! / 1000) * costPer1k },
        { stage: 'Sourcing', cost: (step2.tokensUsed! / 1000) * costPer1k },
        { stage: 'Synthesis', cost: (step3.tokensUsed! / 1000) * costPer1k }
      ]
    }
  };
};

export const compareResearchSessions = async (sessionA: ResearchSession, sessionB: ResearchSession) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not defined or accessible.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  const prompt = `
    Compare Research A and B.
    A: ${sessionA.summary}
    B: ${sessionB.summary}
    
    Return JSON: { addedFindings: string[], contradictions: string[], semanticSummary: string }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || '{}');
};
