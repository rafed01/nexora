# Deployment checklist

1. Run Supabase migrations in order: `001_production_schema.sql`, `002_production_security.sql`, `003_auth_trigger_repair.sql`, `004_enterprise_employee_approval.sql`, `005_atomic_approval_workflows.sql`, then `006_mvp_workflow_security.sql`.
2. Configure `NEXT_PUBLIC_USE_SUPABASE`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `APP_URL`, and optionally `ENABLE_ADMIN_SEED` (only when administrative production seeding is explicitly required).
3. In Supabase Auth, configure the deployed application URL and permitted redirect URLs, enable the desired email-confirmation policy, and confirm the signup trigger runs `AFTER INSERT` only.
4. In Vercel, set the production environment variables, confirm the build command is `npm run build`, and do not expose `SUPABASE_SERVICE_ROLE_KEY` to browser-prefixed variables.
5. Smoke-test anonymous browsing; standard signup/approval/onboarding; enterprise approval and organization linking; employee approval and cross-organization denial; bookmark ownership; and platform-admin catalog/approval access.
6. For rollback, deploy the prior application version first. Do not delete users, profiles, organizations, memberships, requests, bookmarks, or activity records. Apply a forward corrective migration for database behavior instead of rolling back data.
