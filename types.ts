
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
}

export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
  reasoning: string;
  credibility: 'High' | 'Medium' | 'Low';
}

export interface ResearchCost {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  optimizationTip: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  summary?: string;
}

export interface ConfidenceMetrics {
  score: number;
  explanation: string;
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
  followUps: string[];
  traceId: string;
  documents: UploadedDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonResult {
  addedFindings: string[];
  contradictions: string[];
  newSourcesCount: number;
  semanticSummary: string;
}
