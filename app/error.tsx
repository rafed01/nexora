'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, Terminal, ShieldAlert } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime exception to console
    console.error('NEXORA Global Runtime Exception Caught:', error);
  }, [error]);

  return (
    <div className="min-h-[85vh] bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full relative z-10 text-center">
        {/* Warning Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/20 text-amber-400 text-xs font-mono uppercase tracking-wider mb-6">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Runtime Fault Isolated</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Execution Anomaly Detected
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-md mx-auto mb-8">
          The application intercepted an unhandled runtime exception. Safe state recovery is available without session data loss.
        </p>

        {/* Diagnostic Stack / Telemetry Box */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 text-left font-mono text-xs text-neutral-300 mb-8 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-neutral-500">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Runtime Diagnostic Stream
            </span>
            {error.digest && (
              <span className="text-[11px] text-neutral-500">
                DIGEST: <span className="text-cyan-400">{error.digest}</span>
              </span>
            )}
          </div>
          
          <div className="text-red-400 font-semibold break-words">
            {error.name || 'Error'}: {error.message || 'An unexpected state fault occurred.'}
          </div>

          <div className="text-neutral-500 text-[11px] pt-1">
            TRACE_RECOVERY: Thread sandbox halted to prevent memory corruption.
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Execution</span>
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-200 font-medium text-sm transition-colors"
          >
            <Home className="w-4 h-4 text-neutral-400" />
            <span>Return to Safe Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
