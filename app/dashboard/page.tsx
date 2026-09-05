'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import {
  getBrowserSupabase,
  isSupabaseEnabled,
  UserRole,
  ROLE_LABELS,
} from '@/lib/supabaseClient';

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

const INITIAL_RECOMMENDATIONS: ScoutResult[] = [
  {
    id: 'scout-1',
    title: 'Photonic Matrix Processing Unit (P-MPU)',
    type: 'Technology',
    category: 'Optical Computing',
    trl: 6,
    matchScore: 98,
    summary:
      'Demonstrated 42.8 TOPS/W tensor compute density via sub-picosecond optical interference with standard foundry tapeout compatibility.',
    keyMetric: { label: 'Compute Density', value: '42.8 TOPS/W' },
    tags: ['Silicon Photonics', 'CPO', 'Sub-Watt Computing'],
    statusNote: 'Wafer pilot certified at IMEC',
  },
  {
    id: 'scout-2',
    title: 'Novavolt Dry-Coated Solid Separators',
    type: 'Challenge',
    category: 'Advanced Mobility OEM',
    trl: 5,
    matchScore: 94,
    summary:
      'Corporate challenge offering €450k funded pilot for dry-spraying argyrodite sulfide powder with <3% thickness variance.',
    keyMetric: { label: 'Pilot Allocation', value: '€450,000' },
    tags: ['Roll-to-Roll', 'Solvent-Free', 'High-Nickel'],
    statusNote: 'Proposal review closes Nov 15',
  },
  {
    id: 'scout-3',
    title: 'Aetherion High-Altitude Pseudo-Satellites',
    type: 'Startup Lab',
    category: 'Autonomous Aerospace',
    trl: 7,
    matchScore: 91,
    summary:
      'Long-endurance solar aircraft governed by decentralized edge-swarm consensus algorithms for disaster telemetry.',
    keyMetric: { label: 'Max Endurance', value: '62 Days Continual' },
    tags: ['Swarm Autonomy', 'HAPS', 'Decentralized Guidance'],
    statusNote: 'Series A funded ($18.5M)',
  },
];

const INITIAL_SAVED_ITEMS: SavedItem[] = [
  {
    id: 'saved-1',
    title: 'High-Purity Argyrodite Solid Electrolyte',
    category: 'Energy Storage',
    type: 'Technology',
    trl: 7,
    savedAt: '2 days ago',
    updateAlert: 'New pilot pouch cell data added (450 Wh/kg)',
  },
  {
    id: 'saved-2',
    title: 'Dr. Elena Rostova',
    category: 'Quantum Optics',
    type: 'Expert Profile',
    trl: 9,
    savedAt: '5 days ago',
    updateAlert: 'Available for Q4 architecture audits',
  },
  {
    id: 'saved-3',
    title: 'Sub-Femtojoule Optical Transceivers JDA',
    category: 'Cloud Infrastructure',
    type: 'Corporate Challenge',
    trl: 6,
    savedAt: '1 week ago',
    updateAlert: 'Sponsor added tapeout silicon access grant',
  },
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    query: 'High-temperature solid state battery electrolytes with >10 mS/cm',
    timestamp: '15 mins ago',
    matchesFound: 6,
    domain: 'Energy Materials',
  },
  {
    id: 'act-2',
    query: 'Silicon photonics transceivers for 3.2 Tbps aggregate CPO racks',
    timestamp: '2 hours ago',
    matchesFound: 4,
    domain: 'Optical Hardware',
  },
  {
    id: 'act-3',
    query: 'Swarm consensus algorithms under severe packet degradation',
    timestamp: 'Yesterday',
    matchesFound: 8,
    domain: 'Robotics & Control',
  },
];

export default function DashboardScoutPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isScouting, setIsScouting] = useState(false);
  const [scoutedResults, setScoutedResults] = useState<ScoutResult[]>(INITIAL_RECOMMENDATIONS);
  const [savedItems, setSavedItems] = useState<SavedItem[]>(INITIAL_SAVED_ITEMS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [scoutFeedback, setScoutFeedback] = useState<string | null>(null);

  // User Auth & Role State
  const [userProfile, setUserProfile] = useState<{
    email?: string;
    role: UserRole;
    fullName?: string;
    organization?: string;
  }>({
    role: 'researcher',
    fullName: 'Research Fellow',
    organization: 'NEXORA Deep-Tech Network',
  });

  useEffect(() => {
    async function loadUser() {
      if (isSupabaseEnabled) {
        const supabase = getBrowserSupabase();
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const { data: dbProfile } = await supabase
              .from('profiles')
              .select('role, full_name, organization, email')
              .eq('id', data.session.user.id)
              .maybeSingle();

            setUserProfile({
              email: data.session.user.email || dbProfile?.email,
              role: (dbProfile?.role as UserRole) || 'user',
              fullName: dbProfile?.full_name || data.session.user.email?.split('@')[0] || 'User',
              organization: dbProfile?.organization || 'Institutional Partner',
            });
          }
        }
      }
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseEnabled) {
      const supabase = getBrowserSupabase();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'nexora_user_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'nexora_admin_session=; path=/; max-age=0; SameSite=Lax';
    try {
      localStorage.removeItem("nexora_admin_session");
      localStorage.removeItem("nexora_user_role");
      localStorage.removeItem("nexora_user_email");
    } catch {}
    router.push('/login');
  };

  // Handle scouting execution
  const handleExecuteScout = (customPrompt?: string) => {
    const queryToRun = customPrompt || prompt;
    if (!queryToRun.trim()) return;

    setIsScouting(true);
    setScoutFeedback(null);

    // Simulate guided technology vector synthesis
    setTimeout(() => {
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        query: queryToRun,
        timestamp: 'Just now',
        matchesFound: 3,
        domain: 'Frontier Deep-Tech',
      };
      setActivities((prev) => [newActivity, ...prev.slice(0, 5)]);

      // Synthesize specific recommendation dynamic based on query keywords
      const lower = queryToRun.toLowerCase();
      let synthesized: ScoutResult[];

      if (lower.includes('battery') || lower.includes('electrolyte') || lower.includes('solid')) {
        synthesized = [
          {
            id: `scout-${Date.now()}-1`,
            title: 'High-Purity Argyrodite Solid Electrolyte',
            type: 'Technology',
            category: 'Advanced Energy Storage',
            trl: 7,
            matchScore: 99,
            summary:
              'Sulfide crystal matrix preventing lithium dendrite formation at >12 mA/cm² with dry electrode compatibility.',
            keyMetric: { label: 'Conductivity', value: '14.2 mS/cm' },
            tags: ['Argyrodite', 'Lithium Metal', 'Dry-Process'],
            statusNote: 'Operational environment demo verified',
          },
          {
            id: `scout-${Date.now()}-2`,
            title: 'Novavolt Dry-Coated Solid Separators',
            type: 'Challenge',
            category: 'EV & Mobility OEM',
            trl: 5,
            matchScore: 95,
            summary:
              '€450k funded corporate challenge seeking dry-spray powder coating with under 3% thickness variance.',
            keyMetric: { label: 'Award', value: '€450,000' },
            tags: ['Roll-to-Roll', 'Manufacturing', 'Automotive OEM'],
            statusNote: 'Accepting technical applications',
          },
          {
            id: `scout-${Date.now()}-3`,
            title: 'Marcus Vance, PhD',
            type: 'Expert',
            category: 'Solid-State Electrochemistry',
            trl: 8,
            matchScore: 92,
            summary:
              'Stanford Materials Lab veteran who spearheaded 4 battery gigafactory dry-coating production lines.',
            keyMetric: { label: 'Patents', value: '26 Patents' },
            tags: ['Roll-to-Roll Scale', 'Battery Chemistry', 'Advisory'],
            statusNote: 'Available for scale feasibility audits',
          },
        ];
      } else if (lower.includes('swarm') || lower.includes('robot') || lower.includes('drone')) {
        synthesized = [
          {
            id: `scout-${Date.now()}-1`,
            title: 'Fault-Tolerant Consensus for Swarm Robotics',
            type: 'Challenge',
            category: 'Aerospace Systems Prime',
            trl: 6,
            matchScore: 98,
            summary:
              '$300k non-dilutive R&D grant for multi-agent formation self-healing under 60% intermittent packet loss.',
            keyMetric: { label: 'R&D Grant', value: '$300,000' },
            tags: ['Byzantine Fault', 'Mesh Gossip', 'Safety Bounds'],
            statusNote: 'Rolling technical review active',
          },
          {
            id: `scout-${Date.now()}-2`,
            title: 'Aetherion High-Altitude Autonomous Swarms',
            type: 'Startup Lab',
            category: 'Aerospace Systems',
            trl: 7,
            matchScore: 96,
            summary:
              'Pseudo-satellite formations operating decentralized edge-swarm consensus for communications.',
            keyMetric: { label: 'Altitude Record', value: '68,000 ft' },
            tags: ['HAPS', 'Autonomous Swarm', 'Series A'],
            statusNote: 'Flight envelope verified in European airspace',
          },
          {
            id: `scout-${Date.now()}-3`,
            title: 'Dr. Kaviya Chen',
            type: 'Expert',
            category: 'Decentralized Robotics',
            trl: 8,
            matchScore: 91,
            summary:
              'MIT CSAIL architect specializing in formally verified multi-agent consensus in GPS-denied environments.',
            keyMetric: { label: 'Citations', value: '8,900+' },
            tags: ['SLAM', 'Formal Verification', 'Edge Autonomy'],
            statusNote: 'Accepting research residencies',
          },
        ];
      } else {
        synthesized = [
          {
            id: `scout-${Date.now()}-1`,
            title: 'Photonic Matrix Processing Unit (P-MPU)',
            type: 'Technology',
            category: 'Optical Computing',
            trl: 6,
            matchScore: 97,
            summary:
              'Photonic accelerator performing tensor arithmetic at lightspeed with sub-picosecond optical waveguides.',
            keyMetric: { label: 'Compute Density', value: '42.8 TOPS/W' },
            tags: ['Silicon Photonics', 'Interferometry', 'CPO'],
            statusNote: 'Tapeout validated on 300mm wafers',
          },
          {
            id: `scout-${Date.now()}-2`,
            title: 'Sub-Femtojoule Optical Transceivers for Clusters',
            type: 'Challenge',
            category: 'Cloud Infrastructure Group',
            trl: 6,
            matchScore: 94,
            summary:
              '$750k joint development agreement addressing inter-rack thermal bottlenecks in high-density AI clusters.',
            keyMetric: { label: 'JDA Budget', value: '$750,000' },
            tags: ['Co-Packaged Optics', 'HPC Clusters', 'Thermal'],
            statusNote: 'Silicon prototype demonstration required',
          },
          {
            id: `scout-${Date.now()}-3`,
            title: 'Dr. Elena Rostova',
            type: 'Expert',
            category: 'Photonic Architecture & Quantum Optics',
            trl: 9,
            matchScore: 90,
            summary:
              'Max Planck Institute fellow with 18+ years leading optoelectronic hardware transitions from lab to industrial fab.',
            keyMetric: { label: 'h-index', value: '54' },
            tags: ['Foundry Packaging', 'Entanglement', 'Audits'],
            statusNote: 'Open for architecture reviews',
          },
        ];
      }

      setScoutedResults(synthesized);
      setIsScouting(false);
      setScoutFeedback(
        `Scouted 1,240 technological artifacts across global patent registries, research consortia, and corporate briefs. Filtered 3 high-confidence vectors.`
      );
    }, 600);
  };

  const handleApplyPreset = (presetPrompt: string) => {
    setPrompt(presetPrompt);
    handleExecuteScout(presetPrompt);
  };

  const toggleSaveItem = (item: ScoutResult) => {
    const isSaved = savedItems.some((s) => s.id === item.id);
    if (isSaved) {
      setSavedItems(savedItems.filter((s) => s.id !== item.id));
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
      setSavedItems([newItem, ...savedItems]);
    }
  };

  const removeSavedItem = (id: string) => {
    setSavedItems(savedItems.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
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
            {userProfile.role === 'enterprise' && (
              <Link
                href="/challenges"
                className="px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-800 text-amber-300 hover:bg-amber-900 transition-colors flex items-center gap-1 text-[11px]"
              >
                <Briefcase className="w-3 h-3 text-amber-400" />
                <span>RFP Grants</span>
              </Link>
            )}
            <button
              type="button"
              onClick={handleSignOut}
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
              handleExecuteScout();
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
                      href={
                        result.type === 'Challenge'
                          ? '/challenges'
                          : result.title.toLowerCase().includes('photonic')
                          ? '/technology/tech-photonic-mpu'
                          : result.title.toLowerCase().includes('electrolyte')
                          ? '/technology/tech-solid-state-electrolyte'
                          : '/explore'
                      }
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
