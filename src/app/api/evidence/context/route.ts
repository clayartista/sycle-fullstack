import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { retrieveEvidence } from '@/lib/evidence/retrieval';
import type { EvidenceTopic } from '@/types';

const schema = z.object({
  personalization: z.object({
    ageRange: z.string().max(80),
    womenContext: z.array(z.string().max(80)).max(10),
    activity: z.string().max(120),
    locationPref: z.string().max(120),
    outdoorDuration: z.string().max(80),
    resources: z.array(z.string().max(120)).max(20),
    phaseData: z.record(z.string(), z.string()).optional(),
  }),
  environment: z.object({
    temp: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    pm25: z.number(),
    weather: z.string(),
    airQuality: z.string(),
  }),
});

function topicScore(topic: any, p: z.infer<typeof schema>['personalization'], env: z.infer<typeof schema>['environment']) {
  const haystack = `${topic.slug} ${topic.name} ${topic.description} ${topic.category}`.toLowerCase();
  const contexts = p.womenContext.map((value) => value.toLowerCase());
  let score = 0;
  const contextMatched =
    (haystack.includes('kehamilan') && contexts.some((value) => value.includes('hamil'))) ||
    (haystack.includes('menstruasi') && contexts.some((value) => value.includes('menstruasi'))) ||
    (haystack.includes('menopause') && contexts.some((value) => value.includes('menopause')));
  if (haystack.includes('reproductive-health') && !contextMatched && !haystack.includes('environment-general')) return -1;
  if (contextMatched) score += 5;
  if (haystack.includes('panas') && (env.temp >= 30 || env.feelsLike >= 34)) score += 4;
  if (haystack.includes('pm25') && env.pm25 >= 25) score += 4;
  if (haystack.includes('kelembapan') && env.humidity >= 70) score += 3;
  if (p.locationPref.toLowerCase().includes('luar') && haystack.includes('environment')) score += 1;
  return score;
}

function badgeFromStrength(strength?: string): EvidenceTopic['badge'] {
  if (strength === 'high') return 'kuat';
  if (strength === 'moderate') return 'terbatas';
  if (strength === 'low') return 'berbeda';
  return 'belum-cukup';
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Konteks tidak valid.' }, { status: 400 });
  const { personalization, environment } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data: topics, error } = await supabase
    .from('knowledge_topics')
    .select('id, slug, name, description, why_relevant, category, default_actions')
    .eq('status', 'published');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ranked = (topics || [])
    .map((topic) => ({ topic, score: topicScore(topic, personalization, environment) }))
    .sort((a, b) => b.score - a.score)
    .filter(({ score }) => score > 0)
    .slice(0, 4);

  const results = await Promise.all(ranked.map(async ({ topic, score }) => {
    const query = [
      topic.name,
      personalization.womenContext.join(', '),
      personalization.activity,
      personalization.outdoorDuration,
      `${environment.temp}°C`,
      `kelembapan ${environment.humidity}%`,
      `PM2.5 ${environment.pm25}`,
    ].join(' ');
    const retrieved = await retrieveEvidence(query, topic.slug, 4);
    const strongest = retrieved.results[0]?.evidenceStrength || 'unclear';
    const claims = retrieved.results.map((item) => item.claimSummary || item.claim).filter(Boolean).slice(0, 2);
    return {
      id: topic.slug,
      title: topic.name,
      badge: badgeFromStrength(strongest),
      sourceCount: new Set(retrieved.results.map((item) => item.sourceId)).size,
      hasEvidence: retrieved.results.length > 0,
      whyRelevant: topic.why_relevant,
      actionSuggestions: Array.isArray(topic.default_actions) ? topic.default_actions : [],
      claimSummary: claims.join(' '),
      relevanceScore: score,
    } satisfies EvidenceTopic & Record<string, unknown>;
  }));

  return NextResponse.json({ topics: results });
}
