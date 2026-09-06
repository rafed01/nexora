'use client';

import React from 'react';
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
import { useAuth } from '@/components/providers/AuthProvider';

export default function RejectedPage() {
  const { user, profile, signOut } = useAuth();
  const email = profile?.email || user?.email || 'your account';
  const reason = typeof profile?.metadata?.rejection_reason === 'string'
    ? profile.metadata.rejection_reason
    : 'Identity verification or institutional accreditation could not be validated by the platform team.';

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
            onClick={() => void signOut()}
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
