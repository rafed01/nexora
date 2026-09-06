-- NEXORA MIGRATION 007: Final production workflow support (idempotent)
-- Adds request classifications needed by the verified challenge and expert flows.

BEGIN;

ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_request_type_check;
ALTER TABLE public.requests ADD CONSTRAINT requests_request_type_check
  CHECK (request_type IN (
    'access_briefing', 'nda', 'collaboration_proposal', 'due_diligence',
    'report_download', 'challenge_application', 'expert_consultation'
  ));

COMMIT;
