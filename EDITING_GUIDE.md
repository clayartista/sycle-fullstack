# SYCLE UI Editing Guide

This build intentionally does not contain a Figma-source folder. The app keeps the SYCLE UI as regular, editable Next.js/React code.

## Landing page

Route: `/`

Primary files:

- `src/components/landing/LandingPage.tsx` — page composition and responsive layout.
- `src/components/landing/LandingLocationBar.tsx` — location/search block.
- `src/components/landing/LandingEnvironmentCard.tsx` — environment data block.
- `src/components/landing/LandingHero.tsx` — hero headline and main CTA.
- `src/components/landing/LandingQuickLinks.tsx` — Pelajari / Healthcare cards.
- `src/components/landing/LandingAccountPrompt.tsx` — account conversion card.
- `src/config/landing.ts` — landing-page text, CTA labels, links, and quick-link content.

Change the visual layout in `LandingPage.tsx`; change copy and content in `landing.ts`; change reusable visual primitives in `src/components/ui/`.

## All other pages

Each Next.js route lives in `src/app/<route>/page.tsx` and delegates the actual UI to `src/pages/*.tsx`.

Examples:

- `/personalisasi` → `src/pages/Personalization.tsx`
- `/memproses` → `src/pages/Processing.tsx`
- `/untukmu` → `src/pages/UntukmuHariIni.tsx`
- `/pelajari` → `src/pages/Pelajari.tsx`
- `/healthcare` → `src/pages/Healthcare.tsx`
- `/faskes` → `src/pages/Faskes.tsx`
- `/journal` → `src/pages/Journal.tsx`
- `/tracker` → `src/pages/HealthTracker.tsx`
- `/saya` → `src/pages/Profile.tsx`
- `/admin/knowledge` → `src/pages/KnowledgeAdmin.tsx`

## Reusable UI

- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/SectionHeading.tsx`
- `src/components/ui/IconBadge.tsx`
- `src/components/InfoModal.tsx`
- `src/components/EvidenceBadge.tsx`
- `src/components/Layout.tsx`
- `src/components/Toast.tsx`

## Data and backend

Do not put Supabase calls in UI components. Keep server/data work in:

- `src/app/api/**`
- `src/lib/**`
- `src/context/AppContext.tsx` for client orchestration

This separation lets each page be redesigned without rewriting authentication, journal CRUD, or Evidence RAG.

## Visual system

Colors, typography and shared styles are in `src/app/globals.css`.
The official logo is served from `public/sycle-logo.png`.

## Evidence RAG

Evidence retrieval remains independent from page UI. Admin/editor pages use the Knowledge Base under `src/pages/KnowledgeAdmin.tsx`, while user-facing evidence uses `src/pages/EvidenceDetail.tsx` and `/api/evidence/**`.
