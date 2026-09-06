-- NEXORA MIGRATION 006: MVP workflow policies (idempotent, additive)
-- Server APIs use verified sessions and service_role; these RLS policies also
-- protect direct authenticated Supabase access from cross-user data exposure.

BEGIN;

DROP POLICY IF EXISTS "Users create requests" ON public.requests;
CREATE POLICY "Users create requests" ON public.requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own activity" ON public.user_activity;
CREATE POLICY "Users view own activity" ON public.user_activity
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own activity" ON public.user_activity;
CREATE POLICY "Users insert own activity" ON public.user_activity
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

COMMIT;
