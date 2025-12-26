
import { ResearchSession, ResearchStatus, UploadedDocument, ResearchAnalytics } from "../types";
import { generateResearchReport, compareResearchSessions } from "./geminiService";

const STORAGE_KEY = 'deep_research_history_v2';

const emptyAnalytics: ResearchAnalytics = {
  sourceDistribution: [],
  credibilityBreakdown: [],
  recencyTrends: [],
  agreementStats: [],
  evidenceClaims: []
};

const sanitizeSession = (s: any): ResearchSession => {
  return {
    ...s,
    status: s.status || ResearchStatus.IDLE,
    reasoning: s.reasoning || [],
    timeline: s.timeline || [],
    sources: s.sources || [],
    followUps: s.followUps || [],
    documents: s.documents || [],
    confidence: s.confidence || { score: 0, explanation: 'No analytical data available', factors: [] },
    analytics: s.analytics || { ...emptyAnalytics },
    cost: s.cost || { inputTokens: 0, outputTokens: 0, estimatedCost: 0, optimizationTip: '', stageBreakdown: [] },
    traceId: s.traceId || `trace_legacy_${Math.random().toString(36).substr(2, 5)}`
  };
};

const getHistory = (): ResearchSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed.map(sanitizeSession) : [];
  } catch (e) {
    console.error("Failed to load history:", e);
    return [];
  }
};

const saveHistory = (history: ResearchSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const apiService = {
  getHistory: async (): Promise<ResearchSession[]> => {
    return getHistory().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getResearchDetails: async (id: string): Promise<ResearchSession | undefined> => {
    return getHistory().find(r => r.id === id);
  },

  compare: async (idA: string, idB: string) => {
    const history = getHistory();
    const a = history.find(h => h.id === idA);
    const b = history.find(h => h.id === idB);
    if (!a || !b) return null;
    return await compareResearchSessions(a, b);
  },

  startResearch: async (
    query: string, 
    parentResearchId?: string, 
    onUpdate?: (session: ResearchSession) => void
  ): Promise<ResearchSession> => {
    const history = getHistory();
    const parent = parentResearchId ? history.find(h => h.id === parentResearchId) : null;
    
    const newSession: ResearchSession = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'user_123',
      query,
      parentResearchId,
      report: '',
      summary: '',
      status: ResearchStatus.PLANNING,
      reasoning: [],
      timeline: [],
      sources: [],
      cost: { inputTokens: 0, outputTokens: 0, estimatedCost: 0, optimizationTip: '', stageBreakdown: [] },
      confidence: { score: 0, explanation: '', factors: [] },
      analytics: { ...emptyAnalytics },
      followUps: [],
      traceId: `trace_${Math.random().toString(36).substr(2, 9)}`,
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    history.push(newSession);
    saveHistory(history);
    onUpdate?.(newSession);

    try {
      const context = parent ? `Based on previous findings: ${parent.summary}` : '';
      const result = await generateResearchReport(query, context, (status, reasoning) => {
        const currentHistory = getHistory();
        const sessionIndex = currentHistory.findIndex(h => h.id === newSession.id);
        if (sessionIndex !== -1) {
          currentHistory[sessionIndex].status = status;
          currentHistory[sessionIndex].timeline.push(reasoning);
          currentHistory[sessionIndex].reasoning.push(reasoning);
          currentHistory[sessionIndex].updatedAt = new Date().toISOString();
          saveHistory(currentHistory);
          onUpdate?.(currentHistory[sessionIndex]);
        }
      });

      const finalHistory = getHistory();
      const finalIndex = finalHistory.findIndex(h => h.id === newSession.id);
      if (finalIndex !== -1) {
        finalHistory[finalIndex] = {
          ...finalHistory[finalIndex],
          ...result,
          status: ResearchStatus.COMPLETED,
          updatedAt: new Date().toISOString()
        } as ResearchSession;
        saveHistory(finalHistory);
        onUpdate?.(finalHistory[finalIndex]);
        return finalHistory[finalIndex];
      }
    } catch (error) {
      console.error(error);
      const finalHistory = getHistory();
      const finalIndex = finalHistory.findIndex(h => h.id === newSession.id);
      if (finalIndex !== -1) {
        finalHistory[finalIndex].status = ResearchStatus.FAILED;
        saveHistory(finalHistory);
        onUpdate?.(finalHistory[finalIndex]);
      }
    }

    return newSession;
  },

  uploadFile: async (researchId: string, file: File): Promise<UploadedDocument> => {
    const doc: UploadedDocument = {
      id: Math.random().toString(36).substr(2, 5),
      name: file.name,
      size: file.size,
      type: file.type,
      summary: `Uploaded context from ${file.name}`
    };
    
    const history = getHistory();
    const session = history.find(h => h.id === researchId);
    if (session) {
      session.documents.push(doc);
      saveHistory(history);
    }
    return doc;
  }
};
