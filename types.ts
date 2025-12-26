
export enum ResearchStatus {
  IDLE = 'idle',
  PLANNING = 'planning',
  SEARCHING = 'searching',
  DRAFTING = 'drafting',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface ReasoningStep {
  title: string;
  description: string;
  type: 'plan' | 'search' | 'analyze' | 'synthesize';
  timestamp: string;
  tokensUsed?: number;
  durationMs?: number;
}

export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
  reasoning: string; // Why it was selected
  supportsClaim: string; // The specific claim it backs
  conflictsWith: string; // Details on contradictions
  credibility: 'High' | 'Medium' | 'Low';
  credibilitySignal: string; // Heuristic-based explanation
  type: 'Paper' | 'Blog' | 'News' | 'Report';
  year: number;
}

export interface ResearchCost {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  optimizationTip: string;
  stageBreakdown: {
    stage: string;
    cost: number;
  }[];
}

export interface ConfidenceMetrics {
  score: number; // 0-100
  explanation: string;
  factors: {
    label: string;
    impact: 'positive' | 'negative' | 'neutral';
    value: string;
  }[];
}

export interface EvidenceClaim {
  claim: string;
  status: 'Supported' | 'Contested' | 'Inconclusive';
  supportingSources: number;
  conflictingSources: number;
}

export interface ResearchAnalytics {
  sourceDistribution: { label: string; value: number }[];
  credibilityBreakdown: { label: string; value: number }[];
  recencyTrends: { year: number; count: number }[];
  agreementStats: { label: string; value: number; color: string }[];
  evidenceClaims: EvidenceClaim[];
}

export interface ResearchSession {
  id: string;
  userId: string;
  query: string;
  parentResearchId?: string;
  report: string;
  summary: string;
  status: ResearchStatus;
  reasoning: ReasoningStep[];
  timeline: ReasoningStep[];
  sources: ResearchSource[];
  cost: ResearchCost;
  confidence: ConfidenceMetrics;
  analytics: ResearchAnalytics;
  followUps: string[];
  traceId: string;
  documents: UploadedDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  summary?: string;
}

export interface ComparisonResult {
  addedFindings: string[];
  contradictions: string[];
  newSourcesCount: number;
  semanticSummary: string;
}
