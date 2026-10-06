import { journalSchema } from '@/lib/journal';

describe('journalSchema', () => {
  it('accepts a complete journal payload', () => {
    const result = journalSchema.safeParse({
      date: '2026-10-03',
      location: 'Makassar, Sulawesi Selatan',
      envData: { temp: 34, feelsLike: 38, humidity: 72, airQuality: 'Sedang', pm25: 45, weather: 'Cerah' },
      personalization: { ageRange: '25-34' },
      topics: [{ id: 'panas-kehamilan', title: 'Panas & Kehamilan', badge: 'kuat' }],
      reflection: { story: 'Hari yang panas.' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid dates', () => {
    const result = journalSchema.safeParse({
      date: '03-10-2026',
      location: 'Makassar',
      envData: { temp: 34, feelsLike: 38, humidity: 72, airQuality: 'Sedang', pm25: 45, weather: 'Cerah' },
      personalization: {}, topics: [],
    });
    expect(result.success).toBe(false);
  });
});
