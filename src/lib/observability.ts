export function logEvent(event: string, payload: Record<string, unknown> = {}) {
  const record = { ts: new Date().toISOString(), event, ...payload };
  if (process.env.NODE_ENV !== 'test') console.info(JSON.stringify(record));
}
