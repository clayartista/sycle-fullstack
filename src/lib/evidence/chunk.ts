export interface TextChunk {
  index: number;
  content: string;
  pageNumber?: number;
  sectionTitle?: string;
}

export function chunkText(text: string, options: { maxChars?: number; overlapChars?: number } = {}): TextChunk[] {
  const maxChars = Math.max(options.maxChars ?? 1800, 400);
  const overlapChars = Math.min(options.overlapChars ?? 250, maxChars - 50);
  const normalized = text.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: TextChunk[] = [];
  let buffer = '';
  let index = 0;

  const push = () => {
    const content = buffer.trim();
    if (!content) return;
    chunks.push({ index, content });
    index += 1;
    buffer = content.slice(Math.max(0, content.length - overlapChars));
  };

  for (const paragraph of paragraphs) {
    if ((buffer + '\n\n' + paragraph).length <= maxChars) {
      buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
      continue;
    }
    push();
    if (paragraph.length <= maxChars) {
      buffer = paragraph;
      continue;
    }
    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      if ((buffer + ' ' + sentence).trim().length <= maxChars) {
        buffer = `${buffer} ${sentence}`.trim();
      } else {
        push();
        buffer = sentence;
      }
    }
  }
  push();
  return chunks;
}
