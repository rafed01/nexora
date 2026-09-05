'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileCheck,
  Compass,
  LogOut,
  RefreshCw,
  Building2,
  GraduationCap,
  ArrowRight,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { getBrowserSupabase, isSupabaseEnabled, UserRole } from '@/lib/supabaseClient';

export default function PendingApprovalPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('nexora_user_role') || 'advisor') as UserRole;
    }
    return 'advisor';
  });
  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexora_user_email') || 'authorized.applicant@institution.org';
    }
    return 'authorized.applicant@institution.org';
  });
  const [organization, setOrganization] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkCurrentSession = async () => {
      const supabase = getBrowserSupabase();
      if (isSupabaseEnabled && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setEmail(session.user.email || '');
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setRole(profile.role);
            setOrganization(profile.organization || '');
            if (profile.status === 'rejected' || profile.approval_status === 'rejected') {
              router.push('/rejected');
              return;
            }
            if (profile.status === 'approved' || profile.approval_status === 'approved') {
              // Automatically forward if approved
              document.cookie = 'nexora_user_status=approved; path=/; max-age=604800; SameSite=Lax';
              localStorage.setItem('nexora_user_status', 'approved');
              if (profile.onboarding_completed) {
                router.push('/dashboard');
              } else {
                router.push('/onboarding');
              }
            }
          }
        }
      }
    };

    checkCurrentSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecheck = async () => {
    setIsChecking(true);
    setStatusMessage(null);

    try {
      const supabase = getBrowserSupabase();
      if (isSupabaseEnabled && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('approval_status, onboarding_completed, role')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;

          const currentStatus = profile?.approval_status;
          if (currentStatus === 'rejected') {
            document.cookie = 'nexora_user_status=rejected; path=/; max-age=604800; SameSite=Lax';
            localStorage.setItem('nexora_user_status', 'rejected');
            router.push('/rejected');
            return;
          }
          if (currentStatus === 'approved') {
            document.cookie = 'nexora_user_status=approved; path=/; max-age=604800; SameSite=Lax';
            localStorage.setItem('nexora_user_status', 'approved');
            setStatusMessage('Clearance approved! Redirecting to progressive onboarding...');
            setTimeout(() => {
              if (profile.onboarding_completed) {
                router.push('/dashboard');
              } else {
                router.push('/onboarding');
              }
            }, 1000);
            return;
          }
        }
      }

      setStatusMessage('Verification in progress. Platform curators have not finalized sign-off yet.');
    } catch (err: any) {
      setStatusMessage('Unable to query clearance telemetry. Please retry shortly.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = getBrowserSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'nexora_user_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'nexora_user_status=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'nexora_onboarding_completed=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'nexora_admin_session=; path=/; max-age=0; SameSite=Lax';

    try {
      localStorage.removeItem('nexora_user_role');
      localStorage.removeItem('nexora_user_status');
      localStorage.removeItem('nexora_user_email');
      localStorage.removeItem('nexora_onboarding_completed');
      localStorage.removeItem('nexora_admin_session');
    } catch {}

    router.push('/login');
  };

  return (
    <div className="min-h-[90vh] bg-neutral-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500/20 selection:text-amber-200">
      <div className="max-w-xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Glowing Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500" />

        {/* Status Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-mono uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Clearance Gate &bull; Under Curator Audit
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
              Application Under Review
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">
              Your classification credentials have been received and logged into the verification registry.
            </p>
          </div>
        </div>

        {/* Applicant Summary Card */}
        <div className="mb-6 p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs space-y-2">
          <div className="flex justify-between items-center text-neutral-400 border-b border-neutral-800 pb-2">
            <span>Registered Email:</span>
            <span className="text-neutral-200 font-semibold">{email}</span>
          </div>
          <div className="flex justify-between items-center text-neutral-400 border-b border-neutral-800 pb-2">
            <span>Classification Role:</span>
            <span className="text-amber-400 font-bold uppercase">
              {role === 'company' || role === 'enterprise' ? 'Corporate Sponsor (Company)' : 'Technical Advisor'}
            </span>
          </div>
          <div className="flex justify-between items-center text-neutral-400">
            <span>Clearance Protocol:</span>
            <span className="text-emerald-400">Phase 1 (Verification in Progress)</span>
          </div>
        </div>

        {/* Audit Pipeline Progress */}
        <div className="space-y-3 mb-8">
          <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Verification Pipeline &amp; Compliance Steps
          </h3>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-3">
              <div className="p-1 rounded-lg bg-emerald-950/80 text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <span className="font-semibold text-neutral-200 block">
                  1. Credentials &amp; Identity Intake
                </span>
                <p className="text-neutral-400 mt-0.5 text-[11px]">
                  Institutional email, Tax ID/EIN, or ORCID/academic affiliation submitted.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-3">
              <div className="p-1 rounded-lg bg-amber-950/80 text-amber-400 mt-0.5">
                <Clock className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex-1 text-xs">
                <span className="font-semibold text-amber-300 block">
                  2. Curator Review &amp; Dual Authorization
                </span>
                <p className="text-neutral-400 mt-0.5 text-[11px]">
                  NEXORA security officers verify non-disclosure standing and institutional authority.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/40 flex items-start gap-3 opacity-60">
              <div className="p-1 rounded-lg bg-neutral-900 text-neutral-500 mt-0.5">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <span className="font-semibold text-neutral-400 block">
                  3. Terminal Activation &amp; Dossier Access
                </span>
                <p className="text-neutral-400 mt-0.5 text-[11px]">
                  Granting bilateral challenge sponsorship, deep patent telemetry, and expert inquiries.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div className="mb-6 p-3 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-300 text-xs font-mono text-center">
            {statusMessage}
          </div>
        )}

        {/* Interactive Action Controls */}
        <div className="space-y-3">
          <button
            id="btn-recheck-status"
            onClick={handleRecheck}
            disabled={isChecking}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Clearance Telemetry...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Recheck Clearance Status</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              id="btn-browse-public-catalog"
              href="/explore"
              className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono flex items-center justify-center gap-2 transition-colors text-center"
            >
              <Compass className="w-4 h-4 text-neutral-400" />
              <span>Browse Public Catalog</span>
            </Link>

            <button
              id="btn-pending-signout"
              onClick={handleSignOut}
              className="py-2.5 px-4 rounded-xl bg-neutral-800/80 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800 text-neutral-400 text-xs font-mono flex items-center justify-center gap-2 transition-colors border border-transparent"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Notice footer */}
        <div className="mt-8 pt-4 border-t border-neutral-800/60 text-center">
          <p className="text-[11px] text-neutral-400 font-mono">
            Unauthenticated and pending users may browse the public catalog in read-only mode without restriction.
          </p>
        </div>
      </div>
    </div>
  );
}
