import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type UserRole = 'user' | 'employee' | 'advisor' | 'company' | 'enterprise' | 'admin' | 'researcher' | 'guest';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type UserStatus = ApprovalStatus;

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  status?: ApprovalStatus; // convenience alias
  full_name?: string | null;
  name?: string | null;
  organization?: string | null;
  organization_id?: string | null;
  focus_area?: string | null;
  domain_expertise?: string | null;
  credentials?: string | null;
  advisory_history?: string | null;
  linkedin_url?: string | null;
  company_name?: string | null;
  tax_id?: string | null;
  company_size?: string | null;
  industry?: string | null;
  avatar_url?: string | null;
  tech_stack?: string[] | null;
  bio?: string | null;
  timezone?: string | null;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 1,
  user: 2,
  employee: 2,
  researcher: 2,
  advisor: 3,
  company: 3,
  enterprise: 3,
  admin: 4,
};

export const ROLE_LABELS: Record<UserRole, { label: string; badge: string; desc: string }> = {
  user: {
    label: 'Independent Innovator',
    badge: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    desc: 'Deep dossier exploration, interactive scouting, bookmarking, and challenge applications.',
  },
  employee: {
    label: 'Organization Employee',
    badge: 'bg-sky-950 text-sky-300 border-sky-800',
    desc: 'Institutional dossier intelligence, team collaboration, and organization-sponsored challenges.',
  },
  researcher: {
    label: 'Independent Innovator',
    badge: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    desc: 'Deep dossier exploration, interactive scouting, bookmarking, and challenge applications.',
  },
  advisor: {
    label: 'Technical Advisor',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    desc: 'Expert advisory consultations, patent telemetry review, and technical validation.',
  },
  company: {
    label: 'Enterprise Organization',
    badge: 'bg-amber-950 text-amber-300 border-amber-800',
    desc: 'Corporate challenge authoring, bilateral NDA access, and pilot grant allocations.',
  },
  enterprise: {
    label: 'Enterprise Organization',
    badge: 'bg-amber-950 text-amber-300 border-amber-800',
    desc: 'Corporate challenge authoring, bilateral NDA access, and pilot grant allocations.',
  },
  admin: {
    label: 'Platform Curator',
    badge: 'bg-rose-950 text-rose-300 border-rose-800',
    desc: 'Full platform governance, registry curation, verification workflows, and user clearance approvals.',
  },
  guest: {
    label: 'Guest Observer',
    badge: 'bg-neutral-800 text-neutral-300 border-neutral-700',
    desc: 'Public catalog exploration and read-only technology indexing.',
  },
};

import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  return createBrowserSupabaseClient();
}

export const isSupabaseEnabled = isSupabaseConfigured;
