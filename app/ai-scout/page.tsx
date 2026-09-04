'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Building2,
  GraduationCap,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Share2,
  CheckCircle2,
  Clock,
  Zap,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Copy,
  Check,
  SlidersHorizontal,
  Compass,
  FileText,
  HelpCircle,
  Database,
  Terminal,
} from 'lucide-react';

interface RecommendationCard {
  id: string;
  type: 'technology' | 'startup' | 'expert' | 'challenge';
  title: string;
  organization: string;
  category: string;
  trl: number;
  summary: string;
  keyMetrics: { label: string; value: string }[];
  relevanceScore: number;
  relevanceRationale: string;
  recommendedAction: string;
  link: string;
}

interface ScoutingResult {
  query: string;
  executiveSummary: string;
  detectedDomain: string;
  keyVectors: string[];
  recommendations: RecommendationCard[];
  analysisTimeMs: number;
}

const PRESET_QUERIES = [
  {
    label: 'Solid-State Batteries > TRL 4',
    query: 'Find startups working on solid-state batteries with TRL above 4 and dry-coating scalability',
    domain: 'Energy Storage',
  },
  {
    label: 'Photonic AI Accelerators',
    query: 'Identify optical computing hardware overcoming the AI power wall with sub-picosecond latency',
    domain: 'Optical Computing',
  },
  {
    label: 'Quantum Error Mitigation',
    query: 'Discover quantum error mitigation algorithms ready for NISQ hardware validation on 100+ qubits',
    domain: 'Quantum Algorithms',
  },
  {
    label: 'Autonomous Swarm Aerodynamics',
    query: 'Show me autonomous swarm robotics and pseudo-satellite airframes with multi-week stratospheric endurance',
    domain: 'Autonomous Aerospace',
  },
  {
    label: 'Sub-Femtojoule Interconnects',
    query: 'Find corporate co-development challenges and pilot RFPs in sub-femtojoule co-packaged optics',
    domain: 'Corporate Challenges',
  },
];

export default function AiScoutPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ScoutingResult | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [copiedBriefing, setCopiedBriefing] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>([
    'Solid-state electrolytes with TRL above 4',
    'Photonic analog tensor accelerators',
  ]);

  // Loading status steps sequence
  useEffect(() => {
    if (!isLoading) return;

    const timers: NodeJS.Timeout[] = [
      setTimeout(() => setLoadingStep(1), 600),
      setTimeout(() => setLoadingStep(2), 1400),
      setTimeout(() => setLoadingStep(3), 2200),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isLoading]);

  const handleExecuteScout = async (customQuery?: string) => {
    const searchQuery = customQuery || query;
    if (!searchQuery.trim() || isLoading) return;

    setIsLoading(true);
    setLoadingStep(0);
    if (!recentQueries.includes(searchQuery)) {
      setRecentQueries((prev) => [searchQuery, ...prev.slice(0, 4)]);
    }

    try {
      const res = await fetch('/api/ai-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI Scout briefing');
      }

      const data: ScoutingResult = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error querying AI Scout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyBriefing = () => {
    if (!result) return;
    const text = `# NEXORA Deep-Tech Scouting Intelligence Briefing
Query: ${result.query}
Domain: ${result.detectedDomain}
Analysis Latency: ${result.analysisTimeMs}ms

## Executive Summary
${result.executiveSummary}

## Core Technological Vectors
${result.keyVectors.map((v) => `- ${v}`).join('\n')}

## Recommended Entities
${result.recommendations
  .map(
    (r, i) =>
      `${i + 1}. ${r.title} (${r.type.toUpperCase()} · TRL ${r.trl})
   - Organization: ${r.organization}
   - Relevance: ${r.relevanceScore}%
   - Rationale: ${r.relevanceRationale}
   - Action: ${r.recommendedAction}`
  )
  .join('\n\n')}
`;

    navigator.clipboard.writeText(text);
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Header */}
      <header
        id="scout-header"
        className="sticky top-0 z-40 border-b border-neutral-800/90 bg-neutral-950/95 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              id="back-home-btn"
              href="/"
              className="flex items-center gap-2 text-neutral-100 font-bold tracking-tight hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-mono text-sm tracking-wider">NEXORA</span>
            </Link>

            <div className="h-4 w-px bg-neutral-800" />

            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="text-neutral-500">Engine:</span>
              <span className="text-cyan-400 font-semibold">Gemini 3.8 Flash AI Scout</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-900"
            >
              Catalog
            </Link>

            <Link
              href="/challenges"
              className="text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-900"
            >
              Challenges
            </Link>

            <Link
              href="/reports"
              className="text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-900"
            >
              Reports
            </Link>

            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Curator Admin
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Workspace Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Hero Section */}
        <section id="scout-hero" className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Server-Side Natural Language Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-100 leading-tight">
            Autonomous Deep-Tech Intelligence Scout
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Query across audited hardware physics, university laboratory spinouts, and validated Technology Readiness
            Levels (TRL 1–9) with contextual natural language queries.
          </p>
        </section>

        {/* Query Input Box */}
        <section id="scout-input-container" className="space-y-4">
          <div className="relative rounded-2xl bg-neutral-900/80 border border-neutral-800 p-2 shadow-2xl focus-within:border-cyan-500/80 transition-all">
            <div className="flex items-center gap-3 px-3">
              <Search className="w-5 h-5 text-neutral-500 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteScout();
                }}
                placeholder="Ask any deep-tech question, e.g., 'Find startups working on solid-state batteries with TRL above 4'..."
                className="w-full py-3 bg-transparent text-sm sm:text-base text-neutral-100 placeholder-neutral-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => handleExecuteScout()}
                disabled={isLoading || !query.trim()}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Scout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Live Progress Bar during execution */}
            {isLoading && (
              <div className="mt-3 pt-3 border-t border-neutral-800/80 px-3 pb-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>
                      {loadingStep === 0 && 'Parsing deep-tech semantic intent...'}
                      {loadingStep === 1 && 'Scanning 4,800+ patent filings & TRL verification gates...'}
                      {loadingStep === 2 && 'Cross-referencing verified spinouts and lab benchmarks...'}
                      {loadingStep >= 3 && 'Synthesizing actionable executive recommendations...'}
                    </span>
                  </div>
                  <span className="text-neutral-500">Gemini 3.8 Flash</span>
                </div>
                <div className="w-full bg-neutral-950 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${loadingStep === 0 ? 25 : loadingStep === 1 ? 55 : loadingStep === 2 ? 80 : 98}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Preset Demonstrations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                Instant Presets (Click to Execute)
              </span>
              <span className="text-[11px] font-mono text-neutral-500">Tested prompts</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(preset.query);
                    handleExecuteScout(preset.query);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 hover:text-neutral-100 transition-all text-left flex items-center gap-2 group cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
                  <span>{preset.label}</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Container */}
        {result && (
          <section id="scout-results-section" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Executive Summary Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Domain: {result.detectedDomain}</span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-neutral-500">{result.analysisTimeMs}ms execution</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">
                    Executive Intelligence Briefing
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyBriefing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 font-mono transition-colors"
                  >
                    {copiedBriefing ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Copy Briefing</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Briefing Narrative */}
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                {result.executiveSummary}
              </p>

              {/* Key Technical Vectors */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono text-neutral-400">
                  Critical Technological Vectors & Breakthrough Mechanisms:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {result.keyVectors.map((vector, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-300 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{vector}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xl font-bold text-neutral-100">
                    Scouted Candidate Entities ({result.recommendations.length})
                  </h3>
                </div>
                <span className="text-xs font-mono text-neutral-400">Ranked by Conviction</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.recommendations.map((rec, idx) => {
                  const isSaved = savedIds.includes(rec.id);
                  return (
                    <div
                      key={rec.id || idx}
                      className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between space-y-5 transition-all group hover:bg-neutral-900/60"
                    >
                      <div className="space-y-4">
                        {/* Top Category & Relevance */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-cyan-400 font-semibold">
                              {rec.category}
                            </span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                              {rec.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {rec.relevanceScore}% Match
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleSave(rec.id)}
                              className="p-1 rounded text-neutral-500 hover:text-cyan-400 transition-colors"
                              title={isSaved ? 'Remove from Saved' : 'Save to Monitor'}
                            >
                              <Bookmark
                                className={`w-3.5 h-3.5 ${isSaved ? 'fill-cyan-400 text-cyan-400' : ''}`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Title & Organization */}
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-neutral-100 leading-snug group-hover:text-cyan-300 transition-colors">
                            {rec.title}
                          </h4>
                          <div className="text-xs text-neutral-400 font-mono">{rec.organization}</div>
                        </div>

                        {/* TRL Stage Badge */}
                        <div>
                          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold inline-flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            TRL {rec.trl}
                          </span>
                        </div>

                        {/* Summary Narrative */}
                        <p className="text-xs text-neutral-300 leading-relaxed">{rec.summary}</p>

                        {/* Empirical Metrics */}
                        {rec.keyMetrics && rec.keyMetrics.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-800/80">
                            {rec.keyMetrics.map((m, mIdx) => (
                              <div key={mIdx} className="space-y-0.5">
                                <div className="text-[10px] font-mono text-neutral-500 truncate">
                                  {m.label}
                                </div>
                                <div className="text-xs font-mono font-bold text-neutral-200">
                                  {m.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Relevance Rationale */}
                        <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
                          <div className="text-[10px] font-mono text-neutral-400 uppercase">
                            Scout Conviction Rationale:
                          </div>
                          <div className="text-xs text-neutral-300 leading-snug">
                            {rec.relevanceRationale}
                          </div>
                        </div>
                      </div>

                      {/* Action & Link */}
                      <div className="space-y-3 pt-3 border-t border-neutral-800">
                        <div className="text-[11px] text-cyan-400/90 font-mono">
                          <span className="text-neutral-500">Next Action: </span>
                          <span>{rec.recommendedAction}</span>
                        </div>

                        <Link
                          href={rec.link}
                          className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold transition-colors flex items-center justify-between"
                        >
                          <span>Open Detailed Node Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Empty State / Initial Guide */}
        {!result && !isLoading && (
          <section
            id="scout-guide"
            className="p-8 sm:p-12 rounded-2xl bg-neutral-900/30 border border-neutral-800 text-center space-y-6 max-w-2xl mx-auto"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-neutral-100">
                Ready to Scout the Deep-Tech Frontier
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Enter an engineering bottleneck, TRL threshold, or domain query above, or select one of the instant presets
                to trigger a server-side AI evaluation with verified validation metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4 border-t border-neutral-800/80">
              <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80 space-y-1">
                <div className="text-xs font-mono font-bold text-cyan-400">1. Natural Query</div>
                <p className="text-[11px] text-neutral-400">
                  Formulate queries in plain English with specific criteria like TRL levels, materials, or latency.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80 space-y-1">
                <div className="text-xs font-mono font-bold text-cyan-400">2. Gemini Flash 3.8</div>
                <p className="text-[11px] text-neutral-400">
                  Processes technical physics parameters and maps to curated platform nodes.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80 space-y-1">
                <div className="text-xs font-mono font-bold text-cyan-400">3. Actionable Dossiers</div>
                <p className="text-[11px] text-neutral-400">
                  Direct cross-links to technology architectures, startup founders, or research fellows.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Global Footer */}
      <footer
        id="scout-footer"
        className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-400 mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-neutral-300 font-semibold">NEXORA AI Scout Engine</span>
            <span className="text-neutral-500">· Powered by Google GenAI</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/explore" className="hover:text-neutral-200 transition-colors">
              Technology Catalog
            </Link>
            <Link href="/dashboard" className="hover:text-neutral-200 transition-colors">
              Workspace Monitor
            </Link>
            <span>&copy; {new Date().getFullYear()} NEXORA Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
