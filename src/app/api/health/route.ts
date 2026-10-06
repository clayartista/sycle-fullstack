import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'sycle', timestamp: new Date().toISOString() });
}
