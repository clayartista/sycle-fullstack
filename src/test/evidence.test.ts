import { chunkText } from '@/lib/evidence/chunk';

describe('evidence ingestion helpers', () => {
  it('splits long evidence text into overlapping chunks', () => {
    const chunks = chunkText('Paragraph satu. '.repeat(200), { maxChars: 500, overlapChars: 80 });
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks[0].content.length).toBeLessThanOrEqual(500);
    expect(chunks.every((chunk) => chunk.content.length > 0)).toBe(true);
  });

  it('returns empty chunks for empty input', () => {
    expect(chunkText('   ')).toEqual([]);
  });
});
