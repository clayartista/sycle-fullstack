alter table public.profiles
  add column if not exists setup_complete boolean not null default false,
  add column if not exists first_home_seen boolean not null default false,
  add column if not exists age_range text,
  add column if not exists women_context text[] not null default '{}',
  add column if not exists preferred_location text;

create index if not exists profiles_setup_complete_idx on public.profiles(setup_complete);
