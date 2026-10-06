# Deployment

## Vercel + Supabase

1. Create a Supabase project and run `supabase/migrations/0001_init.sql` and then `supabase/migrations/0002_profile_onboarding.sql`.
2. In Vercel, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Add your production URL to Supabase Auth Redirect URLs for password recovery.
4. Deploy with `npm run build` or the default Vercel Next.js build.
5. Use `/api/health` as the deployment health check.

## Docker

The included `Dockerfile` uses a multi-stage Next.js build. When using standalone output, add `output: 'standalone'` to `next.config.ts`.

## Observability

`src/lib/observability.ts` produces structured JSON events suitable for a log collector. For production, forward these events to your preferred observability platform and add trace IDs at the edge/API boundary.


## Knowledge Base deployment
1. Apply `supabase/migrations/0003_knowledge_base.sql` after existing migrations.
2. Set `SUPABASE_SERVICE_ROLE_KEY` only on the server/ingestion worker; never expose it to the browser.
3. Configure `EMBEDDING_API_URL`, `EMBEDDING_API_KEY`, `EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS=1536`.
4. Optional grounded explanation: set `AI_CHAT_API_URL`, `AI_CHAT_API_KEY`, `AI_CHAT_MODEL`.
5. Ensure `pdftotext` is available in the ingestion worker image/host.
6. Promote a trusted user to admin with SQL: `update public.profiles set role='admin' where id='<USER_UUID>';`.
7. Upload source at `/admin/knowledge`, then run the ingestion job.
8. Review claims/citations and publish only after verification.

For serverless deployments where `pdftotext` is unavailable, run `scripts/ingest-evidence.mjs` in a dedicated worker/container with the same environment variables.
