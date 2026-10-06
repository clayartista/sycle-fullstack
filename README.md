# SYCLE Full Stack v5 — Modular UI + Evidence RAG + Live Location

SYCLE is a responsive PWA built with Next.js/React and Supabase. The visual system remains modular so landing page and every route can be edited independently.

## What changed in v5

- P1 contextual relevance in onboarding
- P1 fewer input screens
- P2 real Knowledge Base retrieval on `/untukmu`
- P2 order: PAHAMI → CATAT TUBUH → RINGKASAN + AKSI
- P3 in-app UAT capture flow at `/uat`
- explicit browser location permission
- live environmental context endpoint at `/api/environment`
- Open-Meteo weather + air quality integration
- geolocation Permissions-Policy header

## RULES
RULE 1
Jangan coding langsung di main.

RULE 2
Sebelum coding:
  git checkout develop
  git pull

RULE 3
Buat branch sendiri:
git checkout -b feature/nama-fitur

RULE 4
Satu branch = satu pekerjaan.
  Contoh bagus:
      feature/journal-ui
  Contoh kurang bagus:
      feature/semua-halaman

RULE 5
Commit kecil-kecil.
  Contoh:
      feat: create journal page
      feat: add journal form
      fix: journal validation

Bukan:
update semuanya

RULE 6
Sebelum Pull Request, jalankan:
      npm run typecheck
      npm run test
      npm run build

Kalau semuanya berhasil, baru PR.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Supabase migrations

```text
supabase/migrations/0001_init.sql
supabase/migrations/0002_profile_onboarding.sql
supabase/migrations/0003_knowledge_base.sql
supabase/migrations/0004_uat_sessions.sql
```

## Evidence seed

`supabase/seed/0001_knowledge_seed.sql` contains taxonomy and draft placeholders only. Replace placeholders with exact bibliographic records and reviewed source documents before publication.

## UAT

Open `/uat` on the running app with 1–2 candidate users. The page records task completion, timing, observations, three key findings, and an overall note. Human testing is still required; the repository does not claim external-user UAT has been completed automatically.

## Location privacy

Live location requires an explicit browser permission. Coordinates are used transiently to fetch environmental context and are not written to the profile or journal. If permission is denied, the app remains usable with clearly labeled fallback/demo environment data.
