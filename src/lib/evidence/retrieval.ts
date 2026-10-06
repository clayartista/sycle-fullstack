import { createSupabaseServerClient } from '@/lib/supabase/server';
import { embedText, embeddingsConfigured } from './embeddings';
import type { EvidenceResult, EvidenceTopicPayload } from './types';
import { logEvent } from '@/lib/observability';

type Row = {
  chunk_id: string; source_id: string; topic_id: string; content: string; page_number: number | null;
  section_title: string | null; similarity?: number; rank_score?: number; source_title: string;
  source_type: string; authors: string | null; publication_year: number | null; doi: string | null;
  url: string | null; claim_id: string | null; claim: string | null; claim_summary: string | null;
  evidence_strength: 'high' | 'moderate' | 'low' | 'unclear';
};

function toResult(row: Row, score: number): EvidenceResult {
  return {
    chunkId: row.chunk_id,
    sourceId: row.source_id,
    topicId: row.topic_id,
    content: row.content,
    pageNumber: row.page_number,
    sectionTitle: row.section_title,
    score,
    claimId: row.claim_id,
    claim: row.claim,
    claimSummary: row.claim_summary,
    evidenceStrength: row.evidence_strength,
    citation: {
      sourceId: row.source_id,
      sourceTitle: row.source_title,
      authors: row.authors,
      publicationYear: row.publication_year,
      sourceType: row.source_type,
      doi: row.doi,
      url: row.url,
      pageNumber: row.page_number,
      citationText: row.source_title,
    },
  };
}

export async function retrieveEvidence(queryText: string, topicSlug?: string, limit = 8): Promise<{ results: EvidenceResult[]; mode: 'hybrid' | 'keyword' }> {
  const started = Date.now();
  const supabase = await createSupabaseServerClient();
  let vectorRows: Row[] = [];
  let keywordRows: Row[] = [];

  if (embeddingsConfigured()) {
    try {
      const embedding = await embedText(queryText);
      const { data, error } = await supabase.rpc('match_evidence_chunks', {
        query_embedding: embedding,
        match_threshold: 0.55,
        match_count: Math.max(limit * 2, 8),
        p_topic_slug: topicSlug || null,
      });
      if (!error) vectorRows = (data || []) as Row[];
    } catch (error) {
      logEvent('evidence.embedding.error', { error: error instanceof Error ? error.message : 'unknown' });
    }
  }

  const { data: keywordData, error: keywordError } = await supabase.rpc('match_evidence_keyword', {
    query_text: queryText,
    match_count: Math.max(limit * 2, 8),
    p_topic_slug: topicSlug || null,
  });
  if (!keywordError) keywordRows = (keywordData || []) as Row[];

  const byChunk = new Map<string, { row: Row; score: number }>();
  vectorRows.forEach((row, idx) => {
    const rrf = 1 / (60 + idx + 1);
    byChunk.set(row.chunk_id, { row, score: rrf });
  });
  keywordRows.forEach((row, idx) => {
    const rrf = 1 / (60 + idx + 1);
    const current = byChunk.get(row.chunk_id);
    byChunk.set(row.chunk_id, current ? { row: current.row, score: current.score + rrf } : { row, score: rrf });
  });

  const results = [...byChunk.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ row, score }) => toResult(row, score));

  const user = await supabase.auth.getClaims();
  const userId = user.data?.claims?.sub as string | undefined;
  await supabase.from('evidence_retrieval_logs').insert({
    user_id: userId || null,
    topic_slug: topicSlug || null,
    query_text: queryText.slice(0, 1000),
    result_source_ids: [...new Set(results.map((r) => r.sourceId))],
    retrieval_mode: vectorRows.length ? 'hybrid' : 'keyword',
    latency_ms: Date.now() - started,
  });

  return { results, mode: vectorRows.length ? 'hybrid' : 'keyword' };
}

export async function getEvidenceTopic(topicSlug: string): Promise<EvidenceTopicPayload | null> {
  const supabase = await createSupabaseServerClient();
  const { data: topic } = await supabase.from('knowledge_topics').select('id, slug, name, description, why_relevant, category, default_actions').eq('slug', topicSlug).eq('status', 'published').maybeSingle();
  if (!topic) return null;

  const { data: claims } = await supabase
    .from('evidence_claims')
    .select('id, claim, summary, evidence_strength, limitations, action_suggestions, source_id, evidence_sources!inner(id, title, authors, publication_year, source_type, doi, url)')
    .eq('topic_id', topic.id)
    .eq('review_status', 'approved')
    .limit(12);

  const mappedClaims = (claims || []).map((claim: any) => ({
    id: claim.id,
    claim: claim.claim,
    summary: claim.summary,
    evidenceStrength: claim.evidence_strength,
    limitations: Array.isArray(claim.limitations) ? claim.limitations : [],
    actionSuggestions: Array.isArray(claim.action_suggestions) ? claim.action_suggestions : [],
  }));

  const sourcesMap = new Map<string, any>();
  (claims || []).forEach((claim: any) => {
    const source = Array.isArray(claim.evidence_sources) ? claim.evidence_sources[0] : claim.evidence_sources;
    if (source) sourcesMap.set(source.id, source);
  });

  const { results } = await retrieveEvidence(topic.name, topicSlug, 6);
  results.forEach((r) => sourcesMap.set(r.sourceId, r.citation));

  return {
    topic: {
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      description: topic.description,
      whyRelevant: topic.why_relevant,
      category: topic.category,
      defaultActions: Array.isArray(topic.default_actions) ? topic.default_actions : [],
    },
    results,
    sources: [...sourcesMap.values()].map((s: any) => ({
      sourceId: s.id || s.sourceId,
      sourceTitle: s.title || s.sourceTitle,
      authors: s.authors,
      publicationYear: s.publication_year || s.publicationYear,
      sourceType: s.source_type || s.sourceType,
      doi: s.doi,
      url: s.url,
    })),
    claims: mappedClaims,
  };
}
