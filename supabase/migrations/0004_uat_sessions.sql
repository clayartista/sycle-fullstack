-- UAT capture: no identity data required. Admin-only read.
create table if not exists public.uat_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_code text not null,
  completed_tasks jsonb not null default '[]'::jsonb,
  responses jsonb not null default '{}'::jsonb,
  findings jsonb not null default '[]'::jsonb,
  overall_note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.uat_sessions enable row level security;

drop policy if exists uat_insert_anon on public.uat_sessions;
create policy uat_insert_anon on public.uat_sessions
for insert to anon, authenticated
with check (char_length(participant_code) between 2 and 64);

drop policy if exists uat_admin_read on public.uat_sessions;
create policy uat_admin_read on public.uat_sessions
for select using (public.is_admin());

create index if not exists idx_uat_sessions_created_at on public.uat_sessions(created_at desc);

grant insert on public.uat_sessions to anon, authenticated;
grant select on public.uat_sessions to authenticated;
revoke update, delete on public.uat_sessions from anon, authenticated;
