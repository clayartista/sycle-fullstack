# SYCLE Full Stack v5 — Action Plan Revision

This revision implements the five requested criteria:

## P1 — Onboarding contextual relevance
- `ContextRelevanceCard` appears during onboarding after profile/context selection.
- It explains why the live environment matters for the selected context and shows practical actions.
- The same relevance explanation remains visible on `/untukmu`.

## P1 — Fewer input screens
- Personalization is reduced to two input stages: `Tentang kamu` and `Konteks hari ini`.
- Returning members skip repeated profile questions and go directly to today's context.
- Member setup is reduced to two stages.

## P2 — Real Knowledge Base retrieval on `/untukmu`
- `/api/evidence/context` ranks published Knowledge Base topics against user context + environment.
- `/untukmu` consumes the API result instead of `SIM_TOPICS`.
- Evidence cards expose publication/source counts and can open the curated evidence detail.
- No unpublished source is surfaced by retrieval due to existing RLS/retrieval gates.

## P2 — Reorder Catat → Ringkas
The same `/untukmu` page now follows:

`LIHAT → KENALI KONTEKS → PAHAMI → CATAT TUBUH → RINGKASAN + AKSI → SIMPAN & KEMBALI`

There is still no `/ringkasan` or `/tindakan` route.

## P3 — Actual UAT support
- Added `/uat` task runner for 1–2 candidate users.
- Added `uat_sessions` migration and `/api/uat` submission endpoint.
- Captures task completion, task time, participant observations, three key findings, and overall note.
- This repository provides the capture mechanism; actual human UAT must still be executed by testers.

## Location authorization + live environmental context
- Browser Permissions API + Geolocation API are used to show `prompt / granted / denied` state.
- User must explicitly grant location permission before live environmental data is requested.
- `Permissions-Policy: geolocation=(self)` is set in `next.config.ts`.
- Server route `/api/environment` fetches current weather + air quality from Open-Meteo using the temporary coordinates.
- Latitude/longitude are not persisted to the user profile or journal payload.
- If location is denied or the provider is unavailable, the UI explicitly marks the environment data as demo/fallback.

## Important implementation note
Open-Meteo current weather and air-quality outputs are model/grid-based environmental data rather than a local physical sensor reading. The UI therefore labels the source accordingly.
