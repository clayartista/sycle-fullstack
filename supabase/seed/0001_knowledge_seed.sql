-- SYCLE Knowledge Base seed: taxonomy + unpublished review placeholders.
-- Do not treat these records as clinical evidence. Replace with exact bibliographic records and source documents after review.

insert into public.evidence_sources (title, source_type, language, peer_reviewed, verified, status)
select 'Prototype source placeholder — Panas & Kehamilan', 'prototype_seed', 'id', false, false, 'draft'
where not exists (select 1 from public.evidence_sources where title = 'Prototype source placeholder — Panas & Kehamilan');

insert into public.evidence_sources (title, source_type, language, peer_reviewed, verified, status)
select 'Prototype source placeholder — PM2.5 & Kehamilan', 'prototype_seed', 'id', false, false, 'draft'
where not exists (select 1 from public.evidence_sources where title = 'Prototype source placeholder — PM2.5 & Kehamilan');

insert into public.evidence_sources (title, source_type, language, peer_reviewed, verified, status)
select 'Prototype source placeholder — Kelembapan & Kehamilan', 'prototype_seed', 'id', false, false, 'draft'
where not exists (select 1 from public.evidence_sources where title = 'Prototype source placeholder — Kelembapan & Kehamilan');
