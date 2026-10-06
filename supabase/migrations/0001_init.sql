create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  location text not null,
  env_data jsonb not null default '{}'::jsonb,
  personalization jsonb not null default '{}'::jsonb,
  topics jsonb not null default '[]'::jsonb,
  reflection jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists journal_entries_user_date_idx on public.journal_entries(user_id, entry_date desc);

create table if not exists public.evidence_topics (
  id text primary key,
  title text not null,
  badge text not null check (badge in ('kuat', 'terbatas', 'berbeda', 'belum-cukup')),
  created_at timestamptz not null default now()
);

create table if not exists public.journal_entry_topics (
  journal_entry_id uuid not null references public.journal_entries(id) on delete cascade,
  topic_id text not null references public.evidence_topics(id) on delete restrict,
  primary key (journal_entry_id, topic_id)
);

insert into public.evidence_topics (id, title, badge) values
  ('panas-kehamilan', 'Panas & Kehamilan', 'kuat'),
  ('pm25-kehamilan', 'PM2.5 & Kehamilan', 'kuat'),
  ('kelembapan-kehamilan', 'Kelembapan & Kehamilan', 'terbatas')
on conflict (id) do update set title = excluded.title, badge = excluded.badge;

alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.evidence_topics enable row level security;
alter table public.journal_entry_topics enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "journal_select_own" on public.journal_entries for select using (auth.uid() = user_id);
create policy "journal_insert_own" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "journal_update_own" on public.journal_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "journal_delete_own" on public.journal_entries for delete using (auth.uid() = user_id);

create policy "evidence_topics_read" on public.evidence_topics for select using (true);
create policy "journal_entry_topics_read" on public.journal_entry_topics for select using (exists (select 1 from public.journal_entries j where j.id = journal_entry_id and j.user_id = auth.uid()));
create policy "journal_entry_topics_insert" on public.journal_entry_topics for insert with check (exists (select 1 from public.journal_entries j where j.id = journal_entry_id and j.user_id = auth.uid()));
create policy "journal_entry_topics_delete" on public.journal_entry_topics for delete using (exists (select 1 from public.journal_entries j where j.id = journal_entry_id and j.user_id = auth.uid()));

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger journal_entries_set_updated_at before update on public.journal_entries
for each row execute function public.set_updated_at();
