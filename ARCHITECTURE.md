# SYCLE Full Stack v5

## Core journey

`LIHAT → KENALI KONTEKS → PAHAMI → CATAT TUBUH → RINGKASAN + AKSI → SIMPAN & KEMBALI`

All summary/action value is on `/untukmu`; `/ringkasan` and `/tindakan` are intentionally absent.

## Location + environment

1. Browser checks Geolocation permission state.
2. User explicitly grants location access.
3. Browser sends temporary latitude/longitude to `/api/environment`.
4. Server fetches current weather and air quality from Open-Meteo.
5. Client stores only transient UI state; coordinates are not saved to profile/journal.
6. `/untukmu` displays live/demo source state and observation time.

## Knowledge RAG

`profile context + environment → /api/evidence/context → topic ranking → hybrid retrieval → curated evidence → /untukmu`

Knowledge data lives in Supabase tables and private Storage. Only published + verified sources and approved claims can be retrieved.

## UAT

`/uat → POST /api/uat → uat_sessions`

The test runner is designed for 1–2 candidate users and avoids collecting identity data.
