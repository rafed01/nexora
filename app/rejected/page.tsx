'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  XCircle,
  ShieldAlert,
  Mail,
  ArrowRight,
  LogOut,
  RefreshCw,
  Compass,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';
import { getBrowserSupabase, isSupabaseEnabled } from '@/lib/supabaseClient';

export default function RejectedPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('applicant@institution.org');
  const [reason, setReason] = useState<string>(
    'Identity verification or institutional accreditation could not be validated by platform curators.'
  );

  useEffect(() => {
    async function loadIdentity() {
      const supabase = getBrowserSupabase();
      if (isSupabaseEnabled && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setEmail(session.user.email || '');
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, approval_status, metadata')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            if (profile.approval_status === 'approved') {
              router.push('/dashboard');
              return;
            }
            if (profile.metadata?.rejection_reason) {
              setReason(profile.metadata.rejection_reason);
            }
          }
        }
      }
    }
    loadIdentity();
  }, [router]);

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
    <div className="min-h-[88vh] bg-neutral-950 flex flex-col items-center justify-center p-4 selection:bg-rose-500/20 selection:text-rose-200">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 via-red-500 to-amber-600" />

        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_25px_rgba(244,63,94,0.2)]">
          <XCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-mono uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Clearance Application Rejected
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
            Access Declined
          </h1>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Your application for private terminal clearance under <span className="text-white font-semibold font-mono">{email}</span> was reviewed and declined by NEXORA platform curators.
          </p>
        </div>

        {/* Reason card */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left font-mono text-xs space-y-2">
          <div className="text-neutral-400 flex items-center gap-2 font-semibold">
            <FileQuestion className="w-3.5 h-3.5 text-rose-400" />
            <span>Audit Determination:</span>
          </div>
          <p className="text-neutral-300 text-[11px] leading-relaxed">
            {reason}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link
            id="btn-rejected-explore"
            href="/explore"
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono flex items-center justify-center gap-2 transition-colors"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Browse Public Catalog (Read-Only)</span>
          </Link>

          <button
            id="btn-rejected-signout"
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-rose-950/30 hover:border-rose-800 border border-neutral-800 text-neutral-400 hover:text-rose-300 text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out &amp; Use Another Account</span>
          </button>
        </div>

        <div className="pt-3 border-t border-neutral-800/60 text-center">
          <p className="text-[11px] text-neutral-500 font-mono">
            Need clarification? Contact our governance desk at <span className="text-neutral-400">compliance@nexora.intelligence</span>
          </p>
        </div>
      </div>
    </div>
  );
}
