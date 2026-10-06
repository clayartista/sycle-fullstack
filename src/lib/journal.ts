import { z } from 'zod';

export const journalSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().min(1).max(160),
  envData: z.object({
    temp: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    airQuality: z.string(),
    pm25: z.number(),
    weather: z.string(),
  }),
  personalization: z.record(z.string(), z.unknown()),
  topics: z.array(z.record(z.string(), z.unknown())),
  reflection: z.record(z.string(), z.unknown()).optional().nullable(),
});

export type JournalPayload = z.infer<typeof journalSchema>;

export function toJournalEntry(row: any) {
  return {
    id: row.id,
    date: row.entry_date,
    location: row.location,
    envData: row.env_data,
    personalization: row.personalization,
    topics: row.journal_entry_topics?.map((item: any) => item.topic).filter(Boolean) ?? row.topics ?? [],
    reflection: row.reflection ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
