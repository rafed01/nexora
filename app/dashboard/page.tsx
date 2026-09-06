'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Compass,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Layers,
  Building2,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Send,
  RefreshCw,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  FileText,
  Activity,
  Zap,
  Shield,
  LogOut,
  User,
  KeyRound,
  Users,
} from 'lucide-react';
import { ROLE_LABELS, UserRole } from '@/lib/supabaseClient';
import { useAuth } from '@/components/providers/AuthProvider';

interface ScoutResult {
  id: string;
  title: string;
  type: 'Technology' | 'Startup Lab' | 'Expert' | 'Challenge';
  category: string;
  trl: number;
  matchScore: number;
  summary: string;
  keyMetric: { label: string; value: string };
  tags: string[];
  statusNote: string;
  link: string;
}

interface SavedItem {
  id: string;
  title: string;
  category: string;
  type: string;
  trl: number;
  savedAt: string;
  updateAlert?: string;
}

interface ActivityItem {
  id: string;
  query: string;
  timestamp: string;
  matchesFound: number;
  domain: string;
}

type ScoutApiMetric = {
  label?: unknown;
  value?: unknown;
};

type ScoutApiRecommendation = {
  id?: unknown;
  type?: unknown;
  title?: unknown;
  category?: unknown;
  trl?: unknown;
  summary?: unknown;
  keyMetrics?: unknown;
  relevanceScore?: unknown;
  relevanceRationale?: unknown;
  recommendedAction?: unknown;
  link?: unknown;
};

type ScoutApiResponse = {
  executiveSummary?: unknown;
  detectedDomain?: unknown;
  keyVectors?: unknown;
  recommendations?: unknown;
  analysisTimeMs?: unknown;
};

const SCOUT_TYPE_LABELS: Record<string, ScoutResult['type']> = {
  technology: 'Technology',
  startup: 'Startup Lab',
  expert: 'Expert',
  challenge: 'Challenge',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() || fallback : fallback;
}

function getNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function getStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getScoutLink(link: unknown, fallbackType: ScoutResult['type']) {
  const normalized = getString(link);
  if (normalized.startsWith('/')) return normalized;
  if (normalized) return `/${normalized.replace(/^\/+/, '')}`;
  return fallbackType === 'Challenge' ? '/challenges' : '/explore';
}

function mapActivityEntry(entry: unknown): ActivityItem | null {
  if (!isRecord(entry)) return null;
  const metadata = isRecord(entry.metadata) ? entry.metadata : {};
  return {
    id: getString(entry.id, `activity-${Date.now()}`),
    query: getString(metadata.query, getString(entry.entity_id, 'Scouting query')),
    timestamp: getString(entry.created_at)
      ? new Date(getString(entry.created_at)).toLocaleString()
      : 'Just now',
    matchesFound: getNumber(metadata.matchesFound, 0, 0, 999),
    domain: getString(metadata.domain, 'AI Scout'),
  };
}

function mapScoutResults(payload: unknown): { results: ScoutResult[]; detectedDomain: string; executiveSummary: string; analysisTimeMs: number } {
  const response = isRecord(payload) ? payload as ScoutApiResponse : {};
  const detectedDomain = getString(response.detectedDomain, 'AI Scout');
  const executiveSummary = getString(response.executiveSummary, 'Scouting intelligence briefing compiled.');
  const keyVectors = getStringArray(response.keyVectors);
  const analysisTimeMs = getNumber(response.analysisTimeMs, 0, 0, 600000);

  const results = (Array.isArray(response.recommendations) ? response.recommendations : [])
    .map((recommendation, index) => {
      if (!isRecord(recommendation)) return null;
      const candidate = recommendation as ScoutApiRecommendation;
      const type = SCOUT_TYPE_LABELS[getString(candidate.type).toLowerCase()] || 'Technology';
      const trl = getNumber(candidate.trl, 6, 1, 9);
      const keyMetrics = (Array.isArray(candidate.keyMetrics) ? candidate.keyMetrics : [])
        .map((metric) => {
          if (!isRecord(metric)) return null;
          const { label, value } = metric as ScoutApiMetric;
          const metricLabel = getString(label);
          const metricValue = getString(value);
          if (!metricLabel || !metricValue) return null;
          return { label: metricLabel, value: metricValue };
        })
        .filter((metric): metric is { label: string; value: string } => Boolean(metric));
      const fallbackCategory = type === 'Challenge' ? 'Open Innovation Challenge' : detectedDomain;
      const tags = [...keyMetrics.map((metric) => metric.label), ...keyVectors]
        .filter(Boolean)
        .filter((tag, tagIndex, source) => source.indexOf(tag) === tagIndex)
        .slice(0, 3);

      return {
        id: getString(candidate.id, `ai-scout-result-${index + 1}`),
        title: getString(candidate.title, `AI Scout Recommendation ${index + 1}`),
        type,
        category: getString(candidate.category, fallbackCategory),
        trl,
        matchScore: getNumber(candidate.relevanceScore, 85, 0, 100),
        summary: getString(candidate.summary, executiveSummary),
        keyMetric: keyMetrics[0] || { label: 'Readiness', value: `TRL ${trl}` },
        tags: tags.length > 0 ? tags : ['AI Scout', 'Verified', `TRL ${trl}`],
        statusNote: getString(candidate.recommendedAction, getString(candidate.relevanceRationale, 'Review AI Scout recommendation details.')),
        link: getScoutLink(candidate.link, type),
      } satisfies ScoutResult;
    })
    .filter((result): result is ScoutResult => Boolean(result));

  return { results, detectedDomain, executiveSummary, analysisTimeMs };
}

const PRESET_QUERIES = [
  {
    label: 'Photonic AI Accelerators',
    prompt: 'Identify TRL 6+ Photonic Tensor Accelerators with silicon foundry partnerships and sub-picosecond latency.',
  },
  {
    label: 'Solid-State Electrolytes',
    prompt: 'Compare solid-state battery electrolytes by dendrite suppression and operating temperature delta.',
  },
  {
    label: 'Swarm Mesh Robotics',
    prompt: 'Scout autonomous drone swarm teams with Byzantine fault tolerance for GPS-denied environments.',
  },
  {
    label: 'Biocatalytic Plastics',
    prompt: 'Map commercialization opportunities for generative enzyme depolymerization of multi-layer polymers.',
  },
];

export default function DashboardScoutPage() {
  const { user, profile, signOut } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isScouting, setIsScouting] = useState(false);
  const [scoutedResults, setScoutedResults] = useState<ScoutResult[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [scoutFeedback, setScoutFeedback] = useState<string | null>(null);

  const userProfile: {
    email?: string;
    role: UserRole;
    fullName?: string;
    organization?: string;
  } = {
    email: profile?.email || user?.email,
    role: (profile?.role as UserRole) || 'user',
    fullName: profile?.full_name || user?.email?.split('@')[0] || 'User',
    organization: profile?.organization || undefined,
  };

  useEffect(() => {
    let active = true;
    async function loadWorkspaceData() {
      try {
        const [bookmarksResponse, activityResponse] = await Promise.all([
          fetch('/api/bookmarks'),
          fetch('/api/activity'),
        ]);
        if (!bookmarksResponse.ok || !activityResponse.ok) throw new Error('Unable to load workspace data.');
        const [bookmarkData, activityData] = await Promise.all([bookmarksResponse.json(), activityResponse.json()]);
        if (!active) return;
        setSavedItems((bookmarkData.bookmarks || []).map((bookmark: any) => ({
          id: bookmark.catalog_id,
          title: bookmark.catalog?.title || bookmark.catalog_id,
          category: bookmark.catalog?.category || 'Uncategorized',
          type: bookmark.catalog?.type || 'Catalog item',
          trl: bookmark.catalog?.trl || 0,
          savedAt: new Date(bookmark.created_at).toLocaleDateString(),
          updateAlert: bookmark.notes || undefined,
        })));
        setActivities((activityData.activity || []).filter((entry: any) => entry.action === 'scout_query').map((entry: any) => ({
          id: entry.id,
          query: entry.metadata?.query || entry.entity_id || 'Scouting query',
          timestamp: new Date(entry.created_at).toLocaleString(),
          matchesFound: entry.metadata?.matchesFound || 0,
          domain: entry.metadata?.domain || 'AI Scout',
        })));
      } catch (loadError) {
        if (active) setDataError(loadError instanceof Error ? loadError.message : 'Unable to load workspace data.');
      }
    }
    void loadWorkspaceData();
    return () => { active = false; };
  }, []);

  const handleExecuteScout = async (customPrompt?: string) => {
    const queryToRun = (customPrompt || prompt).trim();
    if (!queryToRun || isScouting) return;

    setIsScouting(true);
    setDataError(null);
    setScoutFeedback(null);

    try {
      const response = await fetch('/api/ai-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToRun }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const apiError = isRecord(payload) ? getString(payload.error) : '';
        throw new Error(apiError || 'Unable to run AI Scout query.');
      }

      const { results, detectedDomain, executiveSummary, analysisTimeMs } = mapScoutResults(payload);
      setScoutedResults(results);
      setScoutFeedback(
        `${detectedDomain} intelligence compiled with ${results.length} ranked recommendation${results.length === 1 ? '' : 's'}${analysisTimeMs > 0 ? ` in ${analysisTimeMs} ms` : ''}. ${executiveSummary}`
      );

      try {
        const activityResponse = await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'scout_query',
            entityId: queryToRun,
            metadata: {
              query: queryToRun,
              domain: detectedDomain,
              matchesFound: results.length,
            },
          }),
        });
        const activityPayload = await activityResponse.json().catch(() => null);
        if (activityResponse.ok && isRecord(activityPayload)) {
          const newActivity = mapActivityEntry(activityPayload.activity);
          if (newActivity) {
            setActivities((previous) => [newActivity, ...previous.filter((item) => item.id !== newActivity.id)].slice(0, 20));
          }
        }
      } catch (activityError) {
        console.error('Error recording scout activity:', activityError);
      }
    } catch (scoutError) {
      setDataError(scoutError instanceof Error ? scoutError.message : 'Unable to run AI Scout query.');
    } finally {
      setIsScouting(false);
    }
  };

  const handleApplyPreset = (presetPrompt: string) => {
    setPrompt(presetPrompt);
    void handleExecuteScout(presetPrompt);
  };

  const toggleSaveItem = async (item: ScoutResult) => {
    const isSaved = savedItems.some((s) => s.id === item.id);
    setDataError(null);
    try {
      const response = await fetch(isSaved ? `/api/bookmarks?catalogId=${encodeURIComponent(item.id)}` : '/api/bookmarks', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: isSaved ? undefined : { 'Content-Type': 'application/json' },
        body: isSaved ? undefined : JSON.stringify({ catalogId: item.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        const apiError = isRecord(data) ? getString(data.error) : '';
        if (!isSaved && (response.status === 404 || apiError === 'Catalog item not found.')) {
          throw new Error('This AI Scout recommendation is not catalog-backed yet, so it cannot be saved.');
        }
        throw new Error(apiError || 'Unable to update bookmark.');
      }
      if (isSaved) {
        setSavedItems((items) => items.filter((saved) => saved.id !== item.id));
      } else {
        const newItem: SavedItem = {
          id: item.id,
          title: item.title,
          category: item.category,
          type: item.type,
          trl: item.trl,
          savedAt: 'Just now',
          updateAlert: item.statusNote,
        };
        setSavedItems((items) => [newItem, ...items]);
      }
    } catch (bookmarkError) {
      setDataError(bookmarkError instanceof Error ? bookmarkError.message : 'Unable to update bookmark.');
    }
  };

  const removeSavedItem = async (id: string) => {
    try {
      const response = await fetch(`/api/bookmarks?catalogId=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to remove bookmark.');
      setSavedItems((items) => items.filter((item) => item.id !== id));
    } catch (bookmarkError) {
      setDataError(bookmarkError instanceof Error ? bookmarkError.message : 'Unable to remove bookmark.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {dataError && <div className="mx-auto mt-4 w-full max-w-7xl rounded-lg border border-rose-900 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">{dataError}</div>}
      {/* Top RBAC Command Bar */}
      <div className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>NEXORA Public</span>
            </Link>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${ROLE_LABELS[userProfile.role].badge}`}>
                {ROLE_LABELS[userProfile.role].label.toUpperCase()}
              </span>
              <span className="text-neutral-400 hidden sm:inline">
                {userProfile.email || userProfile.fullName}
              </span>
              {userProfile.organization && (
                <span className="text-neutral-500 hidden md:inline">
                  · {userProfile.organization}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {userProfile.role === 'admin' && (
              <Link
                href="/admin"
                className="px-2.5 py-1 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 transition-colors flex items-center gap-1 text-[11px]"
              >
                <Shield className="w-3 h-3 text-rose-400" />
                <span>Curator Admin</span>
              </Link>
            )}
            {(userProfile.role === 'enterprise' || userProfile.role === 'company') && (
              <Link
                href="/challenges"
                className="px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-800 text-amber-300 hover:bg-amber-900 transition-colors flex items-center gap-1 text-[11px]"
              >
                <Briefcase className="w-3 h-3 text-amber-400" />
                <span>RFP Grants</span>
              </Link>
            )}
            {/* 'company' is a legacy synonym for 'enterprise' still present on older profile rows. */}
            {(userProfile.role === 'enterprise' || userProfile.role === 'company') && (
              <Link
                href="/dashboard/enterprise"
                className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-800 text-sky-300 hover:bg-sky-900 transition-colors flex items-center gap-1 text-[11px]"
              >
                <Users className="w-3 h-3 text-sky-400" />
                <span>Employee Approvals</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-rose-300 transition-colors cursor-pointer text-[11px]"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Intro & AI Scout Hero Header */}
        <div id="scout-hero-header" className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Horizon Intelligence Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-100">
            AI Technology Scout
          </h1>

          <p className="text-neutral-400 text-sm max-w-3xl leading-relaxed">
            Query deep-tech ecosystems using natural language specifications. The scout dynamically
            synthesizes hardware specifications, Technology Readiness Levels (TRLs), verified corporate
            co-development challenges, and verified research fellows.
          </p>
        </div>

        {/* AI Scout Prompt Interface */}
        <section
          id="scout-prompt-panel"
          className="p-6 sm:p-8 rounded-2xl bg-neutral-900/70 border border-neutral-800 shadow-xl relative overflow-hidden"
        >
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-96 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleExecuteScout();
            }}
            className="space-y-4"
          >
            <div className="relative">
              <textarea
                id="scout-prompt-input"
                rows={3}
                placeholder="Ask NEXORA Scout: e.g., 'Identify TRL 6+ Photonic Tensor Accelerators with silicon foundry tapeouts' or 'Find solid-state battery electrolytes with dry-coating compatibility'..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-4 text-sm bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none leading-relaxed"
              />

              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  id="btn-submit-scout"
                  type="submit"
                  disabled={isScouting || !prompt.trim()}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md ${
                    isScouting || !prompt.trim()
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950'
                  }`}
                >
                  {isScouting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Vectors...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run AI Scout</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Pre-built Example Query Chips */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                <span>Pre-calibrated Query Vectors:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {PRESET_QUERIES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset.prompt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 transition-colors text-left cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scout Feedback / Telemetry Notice */}
            {scoutFeedback && (
              <div
                id="scout-feedback-banner"
                className="mt-3 p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-start gap-3 text-xs text-neutral-300"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-mono text-cyan-300 font-semibold">Query Complete: </span>
                  {scoutFeedback}
                </div>
              </div>
            )}
          </form>
        </section>

        {/* Scouted Recommendations Section */}
        <section id="scouted-recommendations-section" className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xl font-bold text-neutral-100">
                Recommended Technology & Opportunity Matches
              </h2>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              Ranked by Feasibility & Vector Proximity
            </span>
          </div>

          {scoutedResults.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 px-6 py-10 text-center text-sm text-neutral-400">
              Run AI Scout to surface live recommendations from the platform intelligence endpoint.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scoutedResults.map((result) => {
                const isSaved = savedItems.some((s) => s.id === result.id);
                return (
                  <div
                    key={result.id}
                    id={`card-${result.id}`}
                    className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Type & Match Score */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                          {result.type}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            {result.matchScore}% Match
                          </span>
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                            TRL {result.trl}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-mono text-cyan-400/90 mb-1">{result.category}</div>

                      <h3 className="text-base font-bold text-neutral-100 leading-snug mb-2">
                        {result.title}
                      </h3>

                      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                        {result.summary}
                      </p>

                      {/* Metric Box */}
                      <div className="mt-4 p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs">
                        <span className="text-neutral-400 font-mono">{result.keyMetric.label}</span>
                        <span className="font-mono font-semibold text-cyan-300">
                          {result.keyMetric.value}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {result.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800/60 text-neutral-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Bottom Actions */}
                    <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSaveItem(result)}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                            : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={result.link}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <span>Explore Vector</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Saved Items & Recent Scouting Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Saved Items / Watched Vectors (Left 7 Cols) */}
          <section id="saved-items-section" className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xl font-bold text-neutral-100">Saved Dossiers & Watched Items</h2>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                {savedItems.length} active monitors
              </span>
            </div>

            {savedItems.length === 0 ? (
              <div className="p-8 rounded-xl bg-neutral-900/30 border border-neutral-800 text-center text-xs text-neutral-400">
                No items saved yet. Use the scout recommendations or catalog to save key vectors.
              </div>
            ) : (
              <div className="space-y-3">
                {savedItems.map((item) => (
                  <div
                    key={item.id}
                    id={`saved-row-${item.id}`}
                    className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {item.type}
                        </span>
                        <span className="text-xs font-mono text-cyan-400">TRL {item.trl}</span>
                        <span className="text-neutral-600">·</span>
                        <span className="text-xs text-neutral-400 font-mono">{item.category}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-neutral-100">{item.title}</h4>
                      {item.updateAlert && (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
                          <Activity className="w-3 h-3" />
                          <span>{item.updateAlert}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80">
                      <Link
                        href={
                          item.type === 'Technology'
                            ? item.title.toLowerCase().includes('argyrodite') || item.title.toLowerCase().includes('solid')
                              ? '/technology/tech-solid-state-electrolyte'
                              : '/technology/tech-photonic-mpu'
                            : item.type === 'Corporate Challenge'
                            ? '/challenges'
                            : '/explore'
                        }
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                      >
                        View Dossier
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeSavedItem(item.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                        aria-label="Remove saved item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Scouting Activity (Right 5 Cols) */}
          <section id="scouting-activity-section" className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xl font-bold text-neutral-100">Scouting Activity</h2>
              </div>
              <span className="text-xs font-mono text-neutral-400">Telemetry History</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span className="text-cyan-400">{act.domain}</span>
                    <span>{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-neutral-200 font-medium line-clamp-2">
                    &ldquo;{act.query}&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400">
                    <span>{act.matchesFound} vector matches</span>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(act.query)}
                      className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <span>Re-run</span>
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer id="dashboard-footer" className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-neutral-300 font-semibold">NEXORA AI Scout</span>
            <span className="text-neutral-400">· Guided Technology Discovery Dashboard</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Scout Inference Engine Operational
            </span>
            <span>&copy; {new Date().getFullYear()} NEXORA Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
