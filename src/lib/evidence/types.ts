export type EvidenceStrength = 'high' | 'moderate' | 'low' | 'unclear';

export interface EvidenceCitation {
  sourceId: string;
  sourceTitle: string;
  authors?: string | null;
  publicationYear?: number | null;
  sourceType?: string | null;
  doi?: string | null;
  url?: string | null;
  pageNumber?: number | null;
  citationText?: string | null;
}

export interface EvidenceResult {
  chunkId: string;
  sourceId: string;
  topicId: string;
  content: string;
  pageNumber?: number | null;
  sectionTitle?: string | null;
  score: number;
  claimId?: string | null;
  claim?: string | null;
  claimSummary?: string | null;
  evidenceStrength: EvidenceStrength;
  citation: EvidenceCitation;
}

export interface EvidenceTopicPayload {
  topic: {
    id: string;
    slug: string;
    name: string;
    description: string;
    whyRelevant: string;
    category: string;
    defaultActions: string[];
  };
  results: EvidenceResult[];
  sources: EvidenceCitation[];
  claims: Array<{
    id: string;
    claim: string;
    summary: string;
    evidenceStrength: EvidenceStrength;
    limitations: string[];
    actionSuggestions: string[];
  }>;
}
