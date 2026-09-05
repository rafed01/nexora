import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

/**
 * Server-only administrator Supabase client.
 * Protected by 'server-only' package: attempting to import this into any client component
 * will trigger a compile-time build failure.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY to perform privileged operations (e.g. administrative approvals,
 * service worker tasks, backend triggers).
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Server Admin Client Error: NEXT_PUBLIC_SUPABASE_URL is not defined.');
  }

  if (!serviceRoleKey) {
    throw new Error('Server Admin Client Error: SUPABASE_SERVICE_ROLE_KEY is not defined in server environment.');
  }

  if (!adminClient) {
    adminClient = createSupabaseClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
