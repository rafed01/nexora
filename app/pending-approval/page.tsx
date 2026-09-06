'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  FileCheck,
  Compass,
  LogOut,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

const ROLE_PENDING_MESSAGES: Record<string, (organizationName: string | null) => string> = {
  employee: (organizationName) =>
    `Your account is awaiting approval from ${organizationName || 'your organization'}.`,
  enterprise: () => 'Your organization account is awaiting NEXORA administrator approval.',
  advisor: () => 'Your advisor account is awaiting NEXORA administrator approval.',
  user: () => 'Your account is awaiting NEXORA administrator approval.',
};

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user, profile, isLoading, refreshProfile, signOut } = useAuth();

  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Redirect according to the verified profile's current status, whenever it changes
  // (covers both the initial load and any subsequent refreshProfile() call).
  useEffect(() => {
    if (isLoading || !profile) return;

    if (profile.approval_status === 'rejected') {
      router.push('/rejected');
      return;
    }

    if (profile.approval_status === 'approved') {
      if (profile.onboarding_completed) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [isLoading, profile, router]);

  const handleRecheck = useCallback(async () => {
    setIsChecking(true);
    setStatusMessage(null);
    try {
      // Refresh may reload the profile status, but it never approves the account itself —
      // approval only ever happens server-side via NEXORA administrator action.
      await refreshProfile();
      setStatusMessage('Clearance telemetry refreshed.');
    } catch {
      setStatusMessage('Unable to query clearance telemetry. Please retry shortly.');
    } finally {
      setIsChecking(false);
    }
  }, [refreshProfile]);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  if (isLoading) {
    return (
      <div className="min-h-[85vh] bg-neutral-950 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <div className="text-xs font-mono text-neutral-400">Verifying clearance with security gateway...</div>
      </div>
    );
  }

  const role = profile?.role || 'user';
  const email = user?.email || profile?.email || '';
  const organizationName = profile?.organization || null;
  const pendingMessage = (ROLE_PENDING_MESSAGES[role] || ROLE_PENDING_MESSAGES.user)(organizationName);

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
              {pendingMessage}
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
            <span className="text-amber-400 font-bold uppercase">{role}</span>
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
