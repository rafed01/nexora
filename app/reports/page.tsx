'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Lock,
  Unlock,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Bookmark,
  Share2,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Cpu,
  Layers,
  Building2,
  GraduationCap,
  X,
  Check,
  Calendar,
  BookOpen,
  ArrowUpRight,
  Database,
  Briefcase,
} from 'lucide-react';

export interface ReportItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Semiconductor & Photonics' | 'Energy Storage' | 'Quantum Systems' | 'Biotechnology' | 'Autonomous Aerospace';
  type: 'Market Map' | 'Techno-Economic Audit' | 'Patent Landscape' | 'Technical Brief';
  publishDate: string;
  pageCount: number;
  readTime: string;
  isPaid: boolean;
  priceTag?: string;
  leadAnalyst: string;
  organization: string;
  abstract: string;
  keyFindings: string[];
  metrics: { label: string; value: string }[];
  targetAudience: string[];
  sampleChartTitle?: string;
  downloadCount: number;
}

const REPORTS_CATALOG: ReportItem[] = [
  {
    id: 'report-q3-photonics-market',
    title: 'Global Co-Packaged Optics & Sub-Watt AI Hardware Outlook 2026-2030',
    subtitle: 'Overcoming the Datacenter Power Wall: Comparative Benchmarks of Silicon Photonic Transceivers vs. Linear Pluggable Optics',
    category: 'Semiconductor & Photonics',
    type: 'Market Map',
    publishDate: 'August 25, 2026',
    pageCount: 68,
    readTime: '35 min read',
    isPaid: true,
    priceTag: 'Enterprise Tier',
    leadAnalyst: 'Dr. Elena Rostova & NEXORA Research Desk',
    organization: 'NEXORA Optoelectronics Practice',
    abstract:
      'A comprehensive techno-economic analysis detailing the commercial migration from electrical copper interconnects to 3.2 Tbps Co-Packaged Optics (CPO) architectures in hyperscale AI clusters. Features 300mm foundry yield curves, fiber attach loss budgets, and 5-year TCO models.',
    keyFindings: [
      'Sub-0.8 pJ/bit target achieved by 3 leading European and Taiwanese pilot fab lines.',
      'CPO adoption projected to reduce cluster-wide power dissipation by 34% by 2028.',
      'High laser thermal sensitivity remains the primary packaging bottleneck under 80°C ambient operating temperatures.',
    ],
    metrics: [
      { label: 'Cluster Power Delta', value: '-34%' },
      { label: 'Energy Target', value: '<0.8 pJ/bit' },
      { label: 'Foundry Lines Audited', value: '7 Fabs' },
    ],
    targetAudience: ['Hyperscale Architects', 'Chip Design VPs', 'Deep-Tech Investors'],
    sampleChartTitle: 'Foundry Laser Insertion Loss vs. Operating Junction Temperature',
    downloadCount: 840,
  },
  {
    id: 'report-solid-state-benchmarks',
    title: 'Sulfide vs. Oxide Solid Electrolytes: Gigafactory Readiness Audit',
    subtitle: 'Empirical Ionic Conductivity, Dendrite Suppression Critical Current Densities, and Solvent-Free Calendering Scale',
    category: 'Energy Storage',
    type: 'Techno-Economic Audit',
    publishDate: 'August 30, 2026',
    pageCount: 54,
    readTime: '28 min read',
    isPaid: false,
    priceTag: 'Open Access',
    leadAnalyst: 'Marcus Vance, PhD',
    organization: 'Kyoto Materials Innovation Practice',
    abstract:
      'A laboratory-verified comparative audit of 12 solid-state battery pilot facilities across Japan, South Korea, and the European Union. Evaluates roll-to-roll dry powder web deposition speeds, dry room moisture tolerances (<0.1% RH), and pouch-cell cycle lifespans.',
    keyFindings: [
      'Argyrodite sulfide powders (Li₆PS₅Cl) demonstrated superior room-temperature ionic conductivity (>14 mS/cm).',
      'Dry electrode coating reduces gigafactory drying oven footprint by 42% and capex by 28%.',
      'Interfacial stack pressure requirements (5-8 MPa) present packaging hurdles for automotive modular integration.',
    ],
    metrics: [
      { label: 'Peak Ionic Conduct.', value: '14.2 mS/cm' },
      { label: 'Oven Footprint', value: '-42%' },
      { label: 'Pouch Cells Tested', value: '140 Cells' },
    ],
    targetAudience: ['Automotive Powertrain Heads', 'Battery Cell Chemists', 'Industrial Planners'],
    sampleChartTitle: 'Ionic Conductivity vs. Stack Compression Pressure (0-15 MPa)',
    downloadCount: 1420,
  },
  {
    id: 'report-quantum-error-mitigation',
    title: 'Tensor-Network Quantum Error Mitigation on NISQ Hardware',
    subtitle: 'Noise-Resilient Matrix Product State Decompositions for High-Fidelity 100+ Qubit Simulation and VQE Algorithms',
    category: 'Quantum Systems',
    type: 'Technical Brief',
    publishDate: 'July 18, 2026',
    pageCount: 42,
    readTime: '22 min read',
    isPaid: false,
    priceTag: 'Open Access',
    leadAnalyst: 'CERN OpenLab Consortium',
    organization: 'NEXORA Quantum Working Group',
    abstract:
      'Rigorous mathematical and empirical study demonstrating error mitigation techniques that bridge the gap between noisy intermediate-scale quantum (NISQ) processors and fault-tolerant quantum computing (FTQC). Validated on superconducting transmon and neutral-atom hardware.',
    keyFindings: [
      'Tensor network decomposition achieved 4.2x fidelity enhancement on 128-qubit variational quantum eigensolvers.',
      'Software-only error mitigation reduces the quantum volume overhead by 65% compared to zero-noise extrapolation.',
      'Applicable immediately to industrial molecular docking and battery transition state simulations.',
    ],
    metrics: [
      { label: 'Fidelity Gain', value: '+4.2x' },
      { label: 'Qubit Threshold', value: '128 Qubits' },
      { label: 'Overhead Delta', value: '-65%' },
    ],
    targetAudience: ['Quantum Algorithm Researchers', 'Materials R&D Leads', 'Compute HPC Directors'],
    sampleChartTitle: 'State Fidelity vs. Two-Qubit Gate Noise Density',
    downloadCount: 960,
  },
  {
    id: 'report-autonomous-swarm-aerospace',
    title: 'Decentralized Swarm Flight & Stratospheric Pseudo-Satellites (HAPS)',
    subtitle: 'Multi-Week Solar Endurance, Byzantine Fault Tolerance in Disrupted RF Environments, and Earth Observation Economics',
    category: 'Autonomous Aerospace',
    type: 'Patent Landscape',
    publishDate: 'June 29, 2026',
    pageCount: 76,
    readTime: '40 min read',
    isPaid: true,
    priceTag: 'Enterprise Tier',
    leadAnalyst: 'Dr. Kaviya Chen & Aerospace Taskforce',
    organization: 'ISAE-SUPAERO & ONERA Spinout Council',
    abstract:
      'Global patent filing audit and aerodynamic drag reduction study on solar-powered ultralight carbon composite airframes. Maps competitive IP positions across the US, Europe, and Asia-Pacific, evaluating decentralized consensus algorithms during total satellite link degradation.',
    keyFindings: [
      'Over 340 active patent families identified in distributed aerodynamic formation and localized wake-vortex harvesting.',
      'Persistent station-keeping exceeding 60 consecutive days verified in high-altitude European flight campaigns.',
      'HAPS delivery yields a 78% lower launch cost per gigabit compared to traditional Low Earth Orbit (LEO) constellations.',
    ],
    metrics: [
      { label: 'Persistent Days', value: '62 Days' },
      { label: 'Cost per Gbps', value: '-78%' },
      { label: 'Patents Mapped', value: '340 Families' },
    ],
    targetAudience: ['Aerospace Systems Engineers', 'Defense Procurement Officers', 'Telecommunications VPs'],
    sampleChartTitle: 'Global Patent Filings by Autonomous Swarm Control Jurisdictions (2020-2026)',
    downloadCount: 680,
  },
  {
    id: 'report-de-novo-enzymes-biotech',
    title: 'Generative Diffusion for Thermostable Biocatalysts & Plastic Recycling',
    subtitle: 'SE(3)-Equivariant Backbone Synthesis and Experimental Turnaround Rates in 85°C Industrial Bio-Reactors',
    category: 'Biotechnology',
    type: 'Techno-Economic Audit',
    publishDate: 'July 05, 2026',
    pageCount: 48,
    readTime: '24 min read',
    isPaid: true,
    priceTag: 'Enterprise Tier',
    leadAnalyst: 'NEXORA Synthetic Biology Practice',
    organization: 'Biozentrum Basel & ETH Zurich',
    abstract:
      'Laboratory evaluation of de novo engineered PETase and hydrolase variants synthesized via geometric diffusion neural networks. Includes mass-spectrometry yield assays, crystallographic validation, and continuous batch reactor conversion kinetics.',
    keyFindings: [
      'De novo hydrolase mutants maintained 94% enzymatic activity after 72 hours at 88°C in agitated slurry.',
      'Achieved a catalytic turnaround rate of 4,800 s⁻¹, enabling depolymerization within a 14-day industrial cycle.',
      'Reduced enzyme discovery lead time from 18 months of directed evolution to 14 days of generative in silico design.',
    ],
    metrics: [
      { label: 'Melting Point Delta', value: '+38.5°C' },
      { label: 'Depolymerization', value: '14 Days' },
      { label: 'Lead Time Delta', value: '-92%' },
    ],
    targetAudience: ['Industrial Chem Biotech VPs', 'Circular Economy Executives', 'Venture Capitalists'],
    sampleChartTitle: 'Enzymatic Half-Life Decay Curves at 85°C vs. Wild-Type Enzymes',
    downloadCount: 520,
  },
  {
    id: 'report-sub-femtojoule-interconnects',
    title: 'Optical Interconnect Standards & 224G SerDes Silicon Roadmap',
    subtitle: 'Evaluating Transceiver Power Budgets, Micro-Ring Modulator Resonances, and Monolithic Co-Integration',
    category: 'Semiconductor & Photonics',
    type: 'Technical Brief',
    publishDate: 'August 10, 2026',
    pageCount: 36,
    readTime: '18 min read',
    isPaid: false,
    priceTag: 'Open Access',
    leadAnalyst: 'Helios Cloud Infrastructure Research',
    organization: 'NEXORA Open Standards Workgroup',
    abstract:
      'An engineering brief on optical interconnect standards for next-generation AI accelerators. Compares Mach-Zehnder and micro-ring modulator topologies, thermal drift tuning mechanisms, and interface latency under 224 Gbps per lane electrical SerDes constraints.',
    keyFindings: [
      'Micro-ring modulators offer 8x smaller silicon die footprint but require active closed-loop thermal tuning circuitry.',
      'Direct-drive linear optical engines eliminate digital signal processor (DSP) latency, shedding 4.2 watts per transceiver port.',
      'Open Optical Interface standards body established with 16 Tier-1 semiconductor and cloud member corporations.',
    ],
    metrics: [
      { label: 'Die Footprint', value: '-8x Area' },
      { label: 'Port Power Saved', value: '4.2 Watts' },
      { label: 'Standard Adopters', value: '16 Tier-1' },
    ],
    targetAudience: ['Hardware Architecture Leads', 'Optical Transceiver Designers', 'Datacenter Operators'],
    sampleChartTitle: 'Transceiver Power Dissipation per 1.6T Port: DSP vs. Direct Linear Drive',
    downloadCount: 1110,
  },
];

export default function ReportsPage() {
  const [reports] = useState<ReportItem[]>(REPORTS_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [accessFilter, setAccessFilter] = useState<'All' | 'Free' | 'Enterprise'>('All');
  const [savedReportIds, setSavedReportIds] = useState<string[]>([]);
  
  // Modal states
  const [previewModalReport, setPreviewModalReport] = useState<ReportItem | null>(null);
  const [accessModalReport, setAccessModalReport] = useState<ReportItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Request Access Form state
  const [requesterName, setRequesterName] = useState('');
  const [requesterOrg, setRequesterOrg] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterPurpose, setRequesterPurpose] = useState('Pilot Due Diligence');
  const [ndaAgreed, setNdaAgreed] = useState(true);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleSave = (id: string) => {
    setSavedReportIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    showToast(
      savedReportIds.includes(id)
        ? 'Report removed from saved reading list'
        : 'Report saved to your workspace reading list'
    );
  };

  const handleTriggerDownload = (report: ReportItem) => {
    // Generate simulated download trigger
    showToast(`Downloading PDF: ${report.title.slice(0, 36)}...`);
    const dummyBlob = new Blob(
      [
        `NEXORA RESEARCH BRIEFING\n\nTitle: ${report.title}\nSubtitle: ${report.subtitle}\nLead Analyst: ${report.leadAnalyst}\nOrganization: ${report.organization}\nDate: ${report.publishDate}\n\nABSTRACT:\n${report.abstract}\n\nKEY FINDINGS:\n${report.keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nMETRICS:\n${report.metrics.map((m) => `${m.label}: ${m.value}`).join('\n')}\n\n(c) 2026 NEXORA Technology Innovation Intelligence`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAccessRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterName || !requesterOrg || !requesterEmail) {
      showToast('Please fill out all mandatory credentials');
      return;
    }
    const reportTitle = accessModalReport?.title || 'Selected Intelligence Report';
    setAccessModalReport(null);
    setRequesterName('');
    setRequesterOrg('');
    setRequesterEmail('');
    showToast(`Access clearance requested for "${reportTitle.slice(0, 32)}...". Check your email for verification.`);
  };

  // Filter computation
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // Type filter
      if (selectedType !== 'All' && item.type !== selectedType) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Access tier filter
      if (accessFilter === 'Free' && item.isPaid) {
        return false;
      }
      if (accessFilter === 'Enterprise' && !item.isPaid) {
        return false;
      }
      // Search query
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.abstract.toLowerCase().includes(q) ||
        item.leadAnalyst.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [reports, selectedType, selectedCategory, accessFilter, searchQuery]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    const totalReports = reports.length;
    const freeCount = reports.filter((r) => !r.isPaid).length;
    const paidCount = reports.filter((r) => r.isPaid).length;
    const totalDownloads = reports.reduce((acc, curr) => acc + curr.downloadCount, 0);
    return { totalReports, freeCount, paidCount, totalDownloads };
  }, [reports]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          id="reports-toast"
          className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-cyan-500/50 text-neutral-100 text-xs font-mono px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section id="reports-hero" className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Empirical Intelligence & Market Mappings</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-100 leading-tight">
            Research Reports & Technical Publications
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Curated deep-tech intelligence publications written by certified Principal Investigators, research fellows,
            and industrial analysts. Access peer-reviewed thermodynamic audits, patent landscapes, and pilot scale assessments.
          </p>
        </section>

        {/* High-Level Metric Cards */}
        <section id="reports-metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1.5">
            <div className="text-xs font-mono text-neutral-400">Total Publications</div>
            <div className="text-3xl font-extrabold font-mono text-neutral-100">{metrics.totalReports}</div>
            <div className="text-[11px] text-neutral-500 font-mono">Updated weekly by research desk</div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1.5">
            <div className="text-xs font-mono text-neutral-400">Open Access (Free)</div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">{metrics.freeCount}</div>
            <div className="text-[11px] text-emerald-400/90 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Instant download with no gate</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1.5">
            <div className="text-xs font-mono text-neutral-400">Enterprise Verified</div>
            <div className="text-3xl font-extrabold font-mono text-cyan-400">{metrics.paidCount}</div>
            <div className="text-[11px] text-neutral-500 font-mono">Includes bilateral NDA dataset</div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1.5">
            <div className="text-xs font-mono text-neutral-400">Total Citations & Downloads</div>
            <div className="text-3xl font-extrabold font-mono text-neutral-100">
              {metrics.totalDownloads.toLocaleString()}+
            </div>
            <div className="text-[11px] text-neutral-500 font-mono">Across tier-1 R&D laboratories</div>
          </div>
        </section>

        {/* Filter and Search Section */}
        <section id="reports-filter-section" className="space-y-4">
          {/* Format Type Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Market Map', 'Techno-Economic Audit', 'Patent Landscape', 'Technical Brief'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono whitespace-nowrap transition-colors ${
                    selectedType === type
                      ? 'bg-neutral-800 text-cyan-300 border border-neutral-700 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  {type === 'All' ? `All Formats (${reports.length})` : type}
                </button>
              ))}
            </div>

            {/* Access Tier Toggle */}
            <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setAccessFilter('All')}
                className={`px-2.5 py-1 rounded ${
                  accessFilter === 'All'
                    ? 'bg-neutral-800 text-neutral-100 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All Access
              </button>
              <button
                type="button"
                onClick={() => setAccessFilter('Free')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                  accessFilter === 'Free'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Unlock className="w-3 h-3" />
                <span>Free Open Access</span>
              </button>
              <button
                type="button"
                onClick={() => setAccessFilter('Enterprise')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 ${
                  accessFilter === 'Enterprise'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Enterprise / Paid</span>
              </button>
            </div>
          </div>

          {/* Search and Secondary Dropdowns */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by report title, domain, author..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-mono text-neutral-400">Domain:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="All">All Domains</option>
                <option value="Semiconductor & Photonics">Semiconductors & Photonics</option>
                <option value="Energy Storage">Energy Storage</option>
                <option value="Quantum Systems">Quantum Systems</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Autonomous Aerospace">Autonomous Aerospace</option>
              </select>
            </div>
          </div>
        </section>

        {/* Reports Listing Grid */}
        <section id="reports-grid" className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Showing {filteredReports.length} research publications</span>
            <span className="text-neutral-500">Sorted by publication currency</span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-12 rounded-2xl bg-neutral-900/30 border border-neutral-800 text-center space-y-4">
              <BookOpen className="w-10 h-10 text-neutral-600 mx-auto" />
              <div className="text-base font-semibold text-neutral-300">No publications matched your filter criteria</div>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Try resetting your search query or selecting &quot;All Formats&quot; and &quot;All Access&quot; tiers.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                  setSelectedCategory('All');
                  setAccessFilter('All');
                }}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReports.map((report) => {
                const isSaved = savedReportIds.includes(report.id);
                return (
                  <div
                    key={report.id}
                    className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between space-y-6 transition-all group hover:bg-neutral-900/60"
                  >
                    <div className="space-y-4">
                      {/* Top Badges & Access Indicator */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                            {report.category}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-800">
                            {report.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {report.isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-950/80 border border-amber-500/40 text-amber-300">
                              <Lock className="w-3 h-3" />
                              <span>{report.priceTag || 'Enterprise'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                              <Unlock className="w-3 h-3" />
                              <span>Open Access</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleSave(report.id)}
                            className="p-1 rounded text-neutral-500 hover:text-cyan-400 transition-colors"
                            title={isSaved ? 'Remove from reading list' : 'Save to reading list'}
                          >
                            <Bookmark
                              className={`w-4 h-4 ${isSaved ? 'fill-cyan-400 text-cyan-400' : ''}`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Title and Subtitle */}
                      <div className="space-y-1.5">
                        <h3 className="text-lg sm:text-xl font-bold text-neutral-100 group-hover:text-cyan-300 transition-colors leading-snug">
                          {report.title}
                        </h3>
                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                          {report.subtitle}
                        </p>
                      </div>

                      {/* Publication Metadata Bar */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-mono text-neutral-400 border-y border-neutral-800/80 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{report.publishDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{report.pageCount} Pages</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{report.readTime}</span>
                        </div>
                      </div>

                      {/* Abstract summary */}
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {report.abstract}
                      </p>

                      {/* Key Findings / Empirical highlights */}
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                          Key Empirical Findings:
                        </div>
                        <ul className="space-y-1.5 text-xs text-neutral-300">
                          {report.keyFindings.slice(0, 2).map((finding, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Empirical Metrics Chips */}
                      {report.metrics && report.metrics.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80">
                          {report.metrics.map((m, mIdx) => (
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
                    </div>

                    {/* Bottom Actions & Author */}
                    <div className="space-y-3 pt-3 border-t border-neutral-800">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                        <span className="truncate max-w-[240px]">
                          Lead: <span className="text-neutral-300">{report.leadAnalyst}</span>
                        </span>
                        <span>{report.downloadCount} accesses</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPreviewModalReport(report)}
                          className="flex-1 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>View Preview</span>
                        </button>

                        {!report.isPaid ? (
                          <button
                            type="button"
                            onClick={() => handleTriggerDownload(report)}
                            className="flex-1 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Full PDF</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAccessModalReport(report)}
                            className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Request Access</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Preview Modal Drawer */}
      {previewModalReport && (
        <div
          id="preview-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            id="preview-dialog"
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                    {previewModalReport.category}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    {previewModalReport.type}
                  </span>
                  {previewModalReport.isPaid ? (
                    <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Enterprise License</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      <span>Open Access</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-neutral-100">{previewModalReport.title}</h3>
                <p className="text-xs text-neutral-400">{previewModalReport.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModalReport(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Publication details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-neutral-950 text-xs font-mono text-neutral-300">
              <div>
                <span className="text-neutral-500 block text-[10px]">PAGES</span>
                <span className="font-semibold">{previewModalReport.pageCount} Pages</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">READ TIME</span>
                <span className="font-semibold">{previewModalReport.readTime}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">DATE</span>
                <span className="font-semibold">{previewModalReport.publishDate}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">LEAD ANALYST</span>
                <span className="font-semibold truncate block">{previewModalReport.leadAnalyst}</span>
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Full Executive Abstract
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {previewModalReport.abstract}
              </p>
            </div>

            {/* Key Empirical Findings */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Key Empirical Takeaways
              </h4>
              <ul className="space-y-2 text-xs text-neutral-300">
                {previewModalReport.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target Audiences */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Target Stakeholder Profiles
              </div>
              <div className="flex flex-wrap gap-2">
                {previewModalReport.targetAudience.map((audience, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-neutral-800 text-neutral-200"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewModalReport(null)}
                className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 text-xs font-medium hover:bg-neutral-800 transition-colors"
              >
                Close Preview
              </button>

              {!previewModalReport.isPaid ? (
                <button
                  type="button"
                  onClick={() => {
                    handleTriggerDownload(previewModalReport);
                    setPreviewModalReport(null);
                  }}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report (Free)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const r = previewModalReport;
                    setPreviewModalReport(null);
                    setAccessModalReport(r);
                  }}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Request Enterprise Clearance</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Access Request Modal */}
      {accessModalReport && (
        <div
          id="access-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            id="access-dialog"
            className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                  <Lock className="w-3 h-3" />
                  <span>Enterprise Intelligence Clearance</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-100">Request Publication Access</h3>
                <p className="text-xs text-neutral-400">
                  {accessModalReport.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAccessModalReport(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAccessRequestSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-300">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Henrik Holst"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-300">Organization / Corporate Entity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nordic Semiconductor / BMW Research"
                  value={requesterOrg}
                  onChange={(e) => setRequesterOrg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-300">Corporate / Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. h.holst@nordicsemi.no"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-300">Intended Evaluation Purpose</label>
                <select
                  value={requesterPurpose}
                  onChange={(e) => setRequesterPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="Pilot Due Diligence">Pilot Due Diligence & Validation</option>
                  <option value="JDA Co-Development">JDA Co-Development Partnership</option>
                  <option value="Corporate Venture Investment">Corporate Venture Investment Audit</option>
                  <option value="Academic SAB Consultation">Academic SAB Consultation</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 text-xs text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ndaAgreed}
                    onChange={(e) => setNdaAgreed(e.target.checked)}
                    className="mt-0.5 rounded accent-cyan-400"
                  />
                  <span>
                    I confirm my organization is authorized to execute a bilateral confidentiality agreement (NDA) for
                    unredacted telemetry access.
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAccessModalReport(null)}
                  className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 text-xs font-medium hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!ndaAgreed}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Submit Clearance Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        id="reports-footer"
        className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-400 mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-neutral-300 font-semibold">NEXORA Deep-Tech Research Desk</span>
            <span className="text-neutral-500">· Independent Verification Series</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/explore" className="hover:text-neutral-200 transition-colors">
              Technology Catalog
            </Link>
            <Link href="/challenges" className="hover:text-neutral-200 transition-colors">
              Corporate Challenges
            </Link>
            <Link href="/ai-scout" className="hover:text-neutral-200 transition-colors">
              AI Scout Engine
            </Link>
            <span>&copy; {new Date().getFullYear()} NEXORA Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
