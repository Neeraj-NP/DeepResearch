
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
}

export interface ResearchCost {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  summary?: string;
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
  sources: ResearchSource[];
  cost: ResearchCost;
  traceId: string;
  documents: UploadedDocument[];
  createdAt: string;
  updatedAt: string;
}
