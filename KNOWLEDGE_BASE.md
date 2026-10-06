# SYCLE Knowledge Base / Evidence RAG

## Purpose
Knowledge Base terpisah dari data pengguna. `profiles`, `journal_entries` dan konteks personalization menyimpan data user; knowledge base menyimpan sumber penelitian, claims, chunks, embeddings, citations dan review metadata.

## Storage
- Supabase PostgreSQL: metadata, topics, claims, chunks, citations, reviews, jobs.
- Supabase Storage bucket `research-library` (private): PDF/DOCX sumber asli. Admin-only.
- pgvector: embedding `vector(1536)` pada `evidence_chunks`.

## Lifecycle
1. Admin upload PDF + bibliographic metadata.
2. API membuat `evidence_source` + `evidence_document` + `ingestion_job` status `queued`.
3. Worker/CLI `npm run ingest:evidence -- --job-id <JOB_ID>` mengambil file dari Storage memakai service role.
4. PDF -> text menggunakan `pdftotext`.
5. Text -> chunks.
6. Chunks -> embeddings via `EMBEDDING_API_URL`.
7. Chunks disimpan + topic relation.
8. Reviewer menambahkan/menyetujui claims + citations.
9. Source ditandai `verified=true` + `status='published'`.
10. User-facing retrieval hanya membaca published + verified sources dan approved claims.

## Retrieval
`GET /api/evidence?topic=<slug>&q=<query>` uses hybrid retrieval:
- semantic search via `match_evidence_chunks` (pgvector)
- keyword search via `match_evidence_keyword` (PostgreSQL FTS)
- rank fusion (RRF)

`GET /api/evidence/<topic>` returns topic + approved claims + evidence citations for the PAHAMI screen.

## Admin
`/admin/knowledge` provides:
- topic list
- PDF upload
- source review queue
- publish action
- ingestion job status

## Important curation rule
Records seeded from prototype are `draft`, `verified=false`. They are scaffolding only and must not be treated as clinical evidence until exact bibliographic details, document, claim extraction, limitations, and reviewer approval are present.
