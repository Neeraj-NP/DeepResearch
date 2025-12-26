
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
  reasoning: string;
  supportsClaim: string;
  conflictsWith: string;
  credibility: 'High' | 'Medium' | 'Low';
  credibilitySignal: string;
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
  score: number;
  explanation: string;
  factors: {
    label: string;
    impact: 'positive' | 'negative' | 'neutral';
    value: string;
  }[];
}

export interface AtomicClaim {
  text: string;
  strength: 'Strong' | 'Moderate' | 'Anecdotal' | 'Theoretical';
  status: 'Supported' | 'Contested' | 'Inconclusive';
  supportingSources: number;
  conflictingSources: number;
  verificationLogic: string;
}

export interface ResearchAssumption {
  statement: string;
  impact: 'High' | 'Medium' | 'Low';
  risk: string;
}

export interface DecisionOption {
  title: string;
  pros: string[];
  cons: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
}

export interface ResearchAnalytics {
  sourceDistribution: { label: string; value: number }[];
  credibilityBreakdown: { label: string; value: number }[];
  recencyTrends: { year: number; count: number }[];
  agreementStats: { label: string; value: number; color: string }[];
  atomicClaims: AtomicClaim[];
  assumptions: ResearchAssumption[];
  decisionMatrix: DecisionOption[];
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
