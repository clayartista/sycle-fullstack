-- SYCLE Knowledge Base / Evidence RAG
-- 0003_knowledge_base.sql
-- Requires PostgreSQL + pgvector in Supabase.

create extension if not exists vector with schema extensions;

alter table public.profiles
  add column if not exists role text not null default 'member'
    check (role in ('member', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.knowledge_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  why_relevant text not null default '',
  category text not null default 'reproductive-health',
  default_actions jsonb not null default '[]'::jsonb,
  icon text,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text,
  publisher text,
  publication_year integer,
  doi text,
  url text,
  journal text,
  abstract text,
  source_type text not null default 'research',
  evidence_level text,
  language text not null default 'en',
  peer_reviewed boolean not null default false,
  verified boolean not null default false,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.evidence_sources(id) on delete cascade,
  file_name text not null,
  storage_bucket text not null default 'research-library',
  storage_path text not null,
  mime_type text not null,
  file_size bigint,
  checksum text,
  version integer not null default 1,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.evidence_claims (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.evidence_sources(id) on delete cascade,
  topic_id uuid not null references public.knowledge_topics(id) on delete cascade,
  claim text not null,
  summary text not null default '',
  population text,
  context text,
  evidence_strength text not null default 'unclear' check (evidence_strength in ('high','moderate','low','unclear')),
  certainty text,
  direction text,
  limitations jsonb not null default '[]'::jsonb,
  action_suggestions jsonb not null default '[]'::jsonb,
  review_status text not null default 'draft' check (review_status in ('draft','review','approved','rejected','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.evidence_sources(id) on delete cascade,
  claim_id uuid references public.evidence_claims(id) on delete set null,
  topic_id uuid not null references public.knowledge_topics(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  page_number integer,
  section_title text,
  embedding extensions.vector(1536),
  search_document tsvector generated always as (
    to_tsvector('simple', coalesce(content,'') || ' ' || coalesce(section_title,''))
  ) stored,
  created_at timestamptz not null default now(),
  unique (source_id, chunk_index)
);

create table if not exists public.topic_evidence (
  topic_id uuid not null references public.knowledge_topics(id) on delete cascade,
  source_id uuid not null references public.evidence_sources(id) on delete cascade,
  relevance_score numeric(5,4),
  priority integer not null default 100,
  primary key (topic_id, source_id)
);

create table if not exists public.evidence_citations (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.evidence_claims(id) on delete cascade,
  source_id uuid not null references public.evidence_sources(id) on delete cascade,
  citation_text text not null,
  page integer,
  doi text,
  url text,
  access_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_reviews (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.evidence_sources(id) on delete cascade,
  reviewer uuid not null references public.profiles(id),
  methodology_quality text,
  relevance text,
  risk_of_bias text,
  evidence_strength text,
  notes text,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.ingestion_jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.evidence_sources(id) on delete cascade,
  document_id uuid references public.evidence_documents(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','processing','completed','failed')),
  progress integer not null default 0 check (progress between 0 and 100),
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_retrieval_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  topic_slug text,
  query_text text not null,
  result_source_ids uuid[] not null default '{}',
  retrieval_mode text not null default 'keyword',
  latency_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_knowledge_topics_status on public.knowledge_topics(status);
create index if not exists idx_evidence_sources_status on public.evidence_sources(status, verified);
create index if not exists idx_evidence_claims_topic on public.evidence_claims(topic_id, review_status);
create index if not exists idx_evidence_chunks_topic on public.evidence_chunks(topic_id);
create index if not exists idx_evidence_chunks_search on public.evidence_chunks using gin(search_document);
create index if not exists idx_evidence_chunks_embedding on public.evidence_chunks using ivfflat (embedding extensions.vector_cosine_ops) with (lists = 100);
create index if not exists idx_topic_evidence_topic on public.topic_evidence(topic_id, priority);
create index if not exists idx_ingestion_jobs_status on public.ingestion_jobs(status, created_at desc);

create or replace function public.set_knowledge_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_knowledge_topics_updated on public.knowledge_topics;
create trigger trg_knowledge_topics_updated before update on public.knowledge_topics for each row execute function public.set_knowledge_updated_at();

drop trigger if exists trg_evidence_sources_updated on public.evidence_sources;
create trigger trg_evidence_sources_updated before update on public.evidence_sources for each row execute function public.set_knowledge_updated_at();

drop trigger if exists trg_evidence_claims_updated on public.evidence_claims;
create trigger trg_evidence_claims_updated before update on public.evidence_claims for each row execute function public.set_knowledge_updated_at();

alter table public.knowledge_topics enable row level security;
alter table public.evidence_sources enable row level security;
alter table public.evidence_documents enable row level security;
alter table public.evidence_claims enable row level security;
alter table public.evidence_chunks enable row level security;
alter table public.topic_evidence enable row level security;
alter table public.evidence_citations enable row level security;
alter table public.evidence_reviews enable row level security;
alter table public.ingestion_jobs enable row level security;
alter table public.evidence_retrieval_logs enable row level security;

-- Public/member read access only to published + verified material.
drop policy if exists knowledge_topics_public_read on public.knowledge_topics;
create policy knowledge_topics_public_read on public.knowledge_topics
for select using (status = 'published');

drop policy if exists evidence_sources_public_read on public.evidence_sources;
create policy evidence_sources_public_read on public.evidence_sources
for select using (status = 'published' and verified = true);

drop policy if exists evidence_claims_public_read on public.evidence_claims;
create policy evidence_claims_public_read on public.evidence_claims
for select using (review_status = 'approved');

drop policy if exists evidence_chunks_public_read on public.evidence_chunks;
create policy evidence_chunks_public_read on public.evidence_chunks
for select using (
  exists (
    select 1 from public.evidence_sources s
    where s.id = evidence_chunks.source_id
      and s.status = 'published'
      and s.verified = true
  )
);

drop policy if exists topic_evidence_public_read on public.topic_evidence;
create policy topic_evidence_public_read on public.topic_evidence
for select using (
  exists (
    select 1 from public.evidence_sources s
    where s.id = topic_evidence.source_id
      and s.status = 'published'
      and s.verified = true
  )
);

drop policy if exists evidence_citations_public_read on public.evidence_citations;
create policy evidence_citations_public_read on public.evidence_citations
for select using (
  exists (
    select 1 from public.evidence_claims c
    where c.id = evidence_citations.claim_id
      and c.review_status = 'approved'
  )
);

-- Admin policy matrix.
create policy knowledge_topics_admin_all on public.knowledge_topics for all using (public.is_admin()) with check (public.is_admin());
create policy evidence_sources_admin_all on public.evidence_sources for all using (public.is_admin()) with check (public.is_admin());
create policy evidence_documents_admin_all on public.evidence_documents for all using (public.is_admin()) with check (public.is_admin());
create policy evidence_claims_admin_all on public.evidence_claims for all using (public.is_admin()) with check (public.is_admin());
create policy evidence_chunks_admin_all on public.evidence_chunks for all using (public.is_admin()) with check (public.is_admin());
create policy topic_evidence_admin_all on public.topic_evidence for all using (public.is_admin()) with check (public.is_admin());
create policy evidence_citations_admin_all on public.evidence_citations for all using (public.is_admin()) with check (public.is_admin());
create policy evidence_reviews_admin_all on public.evidence_reviews for all using (public.is_admin()) with check (public.is_admin());
create policy ingestion_jobs_admin_all on public.ingestion_jobs for all using (public.is_admin()) with check (public.is_admin());
create policy evidence_retrieval_logs_user_insert on public.evidence_retrieval_logs for insert with check (auth.uid() = user_id);
create policy evidence_retrieval_logs_admin_read on public.evidence_retrieval_logs for select using (public.is_admin());

-- Private source document bucket. Only admins can access it.
insert into storage.buckets (id, name, public)
values ('research-library', 'research-library', false)
on conflict (id) do update set public = false;

drop policy if exists research_library_admin_select on storage.objects;
create policy research_library_admin_select on storage.objects
for select using (bucket_id = 'research-library' and public.is_admin());

drop policy if exists research_library_admin_insert on storage.objects;
create policy research_library_admin_insert on storage.objects
for insert with check (bucket_id = 'research-library' and public.is_admin());

drop policy if exists research_library_admin_update on storage.objects;
create policy research_library_admin_update on storage.objects
for update using (bucket_id = 'research-library' and public.is_admin()) with check (bucket_id = 'research-library' and public.is_admin());

drop policy if exists research_library_admin_delete on storage.objects;
create policy research_library_admin_delete on storage.objects
for delete using (bucket_id = 'research-library' and public.is_admin());

-- Vector retrieval RPC. Only published, verified sources and approved claims are eligible.
create or replace function public.match_evidence_chunks(
  query_embedding extensions.vector(1536),
  match_threshold float default 0.72,
  match_count int default 8,
  p_topic_slug text default null
)
returns table (
  chunk_id uuid,
  source_id uuid,
  topic_id uuid,
  content text,
  page_number integer,
  section_title text,
  similarity float,
  source_title text,
  source_type text,
  authors text,
  publication_year integer,
  doi text,
  url text,
  claim_id uuid,
  claim text,
  claim_summary text,
  evidence_strength text
)
language sql
stable
as $$
  select
    ec.id,
    ec.source_id,
    ec.topic_id,
    ec.content,
    ec.page_number,
    ec.section_title,
    1 - (ec.embedding <=> query_embedding) as similarity,
    es.title,
    es.source_type,
    es.authors,
    es.publication_year,
    es.doi,
    es.url,
    ec.claim_id,
    c.claim,
    c.summary,
    c.evidence_strength
  from public.evidence_chunks ec
  join public.evidence_sources es on es.id = ec.source_id
  join public.knowledge_topics kt on kt.id = ec.topic_id
  left join public.evidence_claims c on c.id = ec.claim_id
  where es.status = 'published'
    and es.verified = true
    and (c.id is null or c.review_status = 'approved')
    and ec.embedding is not null
    and (p_topic_slug is null or kt.slug = p_topic_slug)
    and 1 - (ec.embedding <=> query_embedding) >= match_threshold
  order by ec.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

create or replace function public.match_evidence_keyword(
  query_text text,
  match_count int default 8,
  p_topic_slug text default null
)
returns table (
  chunk_id uuid,
  source_id uuid,
  topic_id uuid,
  content text,
  page_number integer,
  section_title text,
  rank_score float,
  source_title text,
  source_type text,
  authors text,
  publication_year integer,
  doi text,
  url text,
  claim_id uuid,
  claim text,
  claim_summary text,
  evidence_strength text
)
language sql
stable
as $$
  select
    ec.id,
    ec.source_id,
    ec.topic_id,
    ec.content,
    ec.page_number,
    ec.section_title,
    ts_rank_cd(ec.search_document, plainto_tsquery('simple', query_text))::float,
    es.title,
    es.source_type,
    es.authors,
    es.publication_year,
    es.doi,
    es.url,
    ec.claim_id,
    c.claim,
    c.summary,
    c.evidence_strength
  from public.evidence_chunks ec
  join public.evidence_sources es on es.id = ec.source_id
  join public.knowledge_topics kt on kt.id = ec.topic_id
  left join public.evidence_claims c on c.id = ec.claim_id
  where es.status = 'published'
    and es.verified = true
    and (c.id is null or c.review_status = 'approved')
    and ec.search_document @@ plainto_tsquery('simple', query_text)
    and (p_topic_slug is null or kt.slug = p_topic_slug)
  order by ts_rank_cd(ec.search_document, plainto_tsquery('simple', query_text)) desc
  limit greatest(match_count, 1);
$$;

-- Seed taxonomy only. Any research source inserted from prototype is draft-only and must be reviewed before publication.
insert into public.knowledge_topics (slug, name, description, why_relevant, category, default_actions, status)
values
  ('panas-kehamilan', 'Panas & Kehamilan', 'Paparan panas dan konteks kehamilan.', 'Lingkungan panas dapat menjadi konteks yang relevan saat memahami pengalaman harian selama kehamilan.', 'environment-reproductive-health', '["Cari tempat lebih sejuk", "Minum secara teratur", "Kurangi aktivitas berat saat sangat panas"]'::jsonb, 'published'),
  ('pm25-kehamilan', 'PM2.5 & Kehamilan', 'Partikel udara halus dan konteks kehamilan.', 'Kualitas udara dapat membantu pengguna memahami mengapa kondisi lingkungan tertentu patut diperhatikan.', 'environment-reproductive-health', '["Pantau kualitas udara", "Kurangi aktivitas berat di luar saat kualitas udara buruk", "Perhatikan ventilasi"]'::jsonb, 'published'),
  ('kelembapan-kehamilan', 'Kelembapan & Kehamilan', 'Kelembapan dan beban panas lingkungan.', 'Kelembapan tinggi dapat menjadi bagian dari konteks panas yang dirasakan sehari-hari.', 'environment-reproductive-health', '["Cari tempat yang lebih sejuk", "Istirahat saat tubuh terasa tidak nyaman", "Pantau kombinasi panas dan kelembapan"]'::jsonb, 'published')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  why_relevant = excluded.why_relevant,
  default_actions = excluded.default_actions;
