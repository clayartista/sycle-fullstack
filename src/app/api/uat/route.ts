import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const taskSchema = z.object({
  id: z.string().max(60),
  completed: z.boolean(),
  seconds: z.number().int().min(0).max(3600).optional(),
});

const schema = z.object({
  participantCode: z.string().trim().min(2).max(64),
  completedTasks: z.array(taskSchema).max(20),
  responses: z.record(z.string(), z.string().max(1000)).default({}),
  findings: z.array(z.string().max(1000)).max(10).default([]),
  overallNote: z.string().max(3000).default(''),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Data UAT tidak valid.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('uat_sessions').insert({
    participant_code: parsed.data.participantCode,
    completed_tasks: parsed.data.completedTasks,
    responses: parsed.data.responses,
    findings: parsed.data.findings,
    overall_note: parsed.data.overallNote,
  }).select('id, created_at').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, createdAt: data.created_at });
}
