import Link from 'next/link';
import { Compass, Home, ShieldAlert, ArrowLeft, Terminal, Cpu } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background tech grid and radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full relative z-10 text-center">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-mono uppercase tracking-wider mb-6">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>Error 404 • Node Unreachable</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3">
          Dossier Not Found in Registry
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-md mx-auto mb-8">
          The requested innovation node, deep-tech dossier, or API route does not exist in the active NEXORA global catalog.
        </p>

        {/* Monospace Telemetry Box */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 text-left font-mono text-xs text-neutral-400 mb-8 backdrop-blur-sm space-y-1.5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2 text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              NEXORA Diagnostic Telemetry
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              SYS_OPERATIONAL
            </span>
          </div>
          <div className="text-neutral-300">
            <span className="text-neutral-500">RESOLVER:</span> Deep-Tech Node Discovery Mesh
          </div>
          <div>
            <span className="text-neutral-500">EXCEPTION:</span> <span className="text-amber-400">ERR_NODE_NOT_FOUND</span>
          </div>
          <div>
            <span className="text-neutral-500">ROUTING_VECTOR:</span> <span className="text-neutral-300">0x7E3A99B // UNINDEXED_URI</span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/10"
          >
            <Compass className="w-4 h-4" />
            <span>Open Discovery Dashboard</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-200 font-medium text-sm transition-colors"
          >
            <Home className="w-4 h-4 text-neutral-400" />
            <span>Return to Overview</span>
          </Link>
          <Link
            href="/challenges"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-200 font-medium text-sm transition-colors"
          >
            <Cpu className="w-4 h-4 text-neutral-400" />
            <span>Challenges</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
