import { logEvent } from '@/lib/observability';

const endpoint = process.env.EMBEDDING_API_URL;
const apiKey = process.env.EMBEDDING_API_KEY;
const model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const dimensions = Number(process.env.EMBEDDING_DIMENSIONS || 1536);

export function embeddingsConfigured() {
  return Boolean(endpoint && apiKey);
}

export async function embedTexts(inputs: string[]): Promise<number[][]> {
  if (!endpoint || !apiKey) throw new Error('Embedding provider is not configured.');
  if (!inputs.length) return [];
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input: inputs, dimensions }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Embedding provider returned ${response.status}.`);
  const payload = await response.json() as { data?: Array<{ index: number; embedding: number[] }> };
  const vectors = (payload.data || []).sort((a, b) => a.index - b.index).map((item) => item.embedding);
  if (vectors.length !== inputs.length) throw new Error('Embedding provider returned an unexpected number of vectors.');
  logEvent('evidence.embedding.success', { count: vectors.length, model });
  return vectors;
}

export async function embedText(input: string) {
  const [vector] = await embedTexts([input]);
  return vector;
}
