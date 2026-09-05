'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  FileText,
  Clock,
  DollarSign,
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
  Building,
  Sparkles,
  ArrowLeft,
  X,
  Send,
  Download,
  Share2,
  Award,
  Layers,
  ArrowUpRight,
  Cpu,
} from 'lucide-react';

type ItemType = 'challenge' | 'report';
type CollabType = 'Paid Pilot / PoC' | 'R&D Grant' | 'Joint Development' | 'Licensing & Tech Transfer' | 'Intelligence Report';

interface ChallengeOrReport {
  id: string;
  type: ItemType;
  title: string;
  sponsor: string;
  sponsorCategory: string;
  collaborationType: CollabType;
  deadline: string;
  awardOrScope: string;
  problemSummary: string;
  requirements: string[];
  tags: string[];
  status: 'Open' | 'Rolling Review' | 'Recently Published';
}

const CHALLENGES_AND_REPORTS: ChallengeOrReport[] = [
  {
    id: 'challenge-solid-state-scale',
    type: 'challenge',
    title: 'Dry-Coated Solid Electrolyte Separators at Industrial Scale',
    sponsor: 'Novavolt Powertrain Labs',
    sponsorCategory: 'Global EV & Mobility OEM',
    collaborationType: 'Paid Pilot / PoC',
    deadline: 'November 15, 2026',
    awardOrScope: '€450,000 Funded Pilot + Gigafactory Line Access',
    problemSummary:
      'Seeking solid electrolyte membrane manufacturers or research labs capable of dry-spraying argyrodite sulfide powders onto copper foil with under 3% thickness variance at 20 m/min throughput.',
    requirements: [
      'Membrane thickness uniformity < 3% over 300mm web width',
      'Demonstrated ionic conductivity > 8 mS/cm at 25°C',
      'Zero volatile organic solvent (VOC) emission in fabrication',
      'Technology Readiness Level TRL 5 or higher',
    ],
    tags: ['Battery Tech', 'Solid State', 'Roll-to-Roll', 'Manufacturing'],
    status: 'Open',
  },
  {
    id: 'challenge-photonic-interconnect',
    type: 'challenge',
    title: 'Sub-Femtojoule Optical Transceivers for Tensor Clusters',
    sponsor: 'Helios Hyperscale Compute',
    sponsorCategory: 'Cloud Infrastructure Group',
    collaborationType: 'Joint Development',
    deadline: 'December 01, 2026',
    awardOrScope: '$750,000 JDA + Tapeout Silicon Allocation',
    problemSummary:
      'Designing co-packaged optical (CPO) transceiver engines operating below 0.8 pJ/bit across 3.2 Tbps aggregate lanes, addressing extreme inter-rack thermal bottlenecks in distributed LLM training.',
    requirements: [
      'Energy efficiency ≤ 0.8 pJ/bit across all PVT corners',
      'Direct coupling to 2.5D substrate without bulky micro-optics',
      'Operating temperature tolerance up to 95°C on-chip',
      'Simulation or silicon prototype demonstration available',
    ],
    tags: ['Co-Packaged Optics', 'Silicon Photonics', 'HPC Clusters', 'Thermal Management'],
    status: 'Open',
  },
  {
    id: 'challenge-autonomous-swarm-mesh',
    type: 'challenge',
    title: 'Fault-Tolerant Consensus for GPS-Denied Swarm Robotics',
    sponsor: 'AeroSynthetix Defense & Civil',
    sponsorCategory: 'Aerospace Systems Prime',
    collaborationType: 'R&D Grant',
    deadline: 'October 30, 2026',
    awardOrScope: '$300,000 Non-Dilutive Grant + Field Trial',
    problemSummary:
      'Deploying decentralised consensus and relative SLAM protocols capable of self-healing multi-agent formations under 60% intermittent packet loss and active RF jamming.',
    requirements: [
      'Byzantine fault tolerance across up to 32 independent UAV nodes',
      'Sub-5ms message gossip latency over ad-hoc UWB/WiFi-HaLow channels',
      'Formally verifiable safety bounds with zero single-point failure',
    ],
    tags: ['Swarm Autonomy', 'Byzantine Fault Tolerance', 'UAVs', 'Mesh Networking'],
    status: 'Rolling Review',
  },
  {
    id: 'challenge-synthetic-deconstruction',
    type: 'challenge',
    title: 'Thermophilic Enzymatic Depolymerization of Composite Polymers',
    sponsor: 'Aethel BioChemicals',
    sponsorCategory: 'Circular Economy Ventures',
    collaborationType: 'Licensing & Tech Transfer',
    deadline: 'January 10, 2027',
    awardOrScope: 'Commercial Royalties + $200,000 Phase 1 Retainer',
    problemSummary:
      'Identifying robust microbial enzyme variants engineered via generative diffusion that achieve >90% conversion of multilayer barrier polymers into reusable monomer streams at temperatures ≥65°C.',
    requirements: [
      'Catalytic efficiency > 80% on multi-layer PET/PE packaging',
      'Enzymatic half-life > 36 hours at 65°C',
      'No halogenated or toxic byproducts produced during breakdown',
    ],
    tags: ['Biocatalysis', 'Synthetic Biology', 'Circular Plastics', 'Protein Design'],
    status: 'Open',
  },
  {
    id: 'report-q4-battery-breakthroughs',
    type: 'report',
    title: 'Horizon Report: The Solid-State Battery Commercialization Race',
    sponsor: 'NEXORA Frontier Intelligence Group',
    sponsorCategory: 'Deep-Tech Research Syndicate',
    collaborationType: 'Intelligence Report',
    deadline: 'Quarterly Release',
    awardOrScope: '48-Page Comprehensive Technical Analysis',
    problemSummary:
      'A deep-dive analysis assessing 34 worldwide pilot lines, evaluating dendrite suppression chemistries, sulfide vs oxide economics, supply chain chokepoints, and commercial roadmaps for 2026–2030.',
    requirements: [
      'Comprehensive comparative benchmark of 14 electrolyte families',
      'Granular CapEx breakdown per GWh for dry-coating vs wet slurry lines',
      'Patent citation network mapping key academic and corporate IP holders',
    ],
    tags: ['Market Intelligence', 'Solid State', 'CapEx Models', 'Supply Chain'],
    status: 'Recently Published',
  },
  {
    id: 'report-photonics-compute-benchmark',
    type: 'report',
    title: 'Benchmark Dossier: Photonic Matrix Processors vs Silicon GPUs',
    sponsor: 'NEXORA Optoelectronics Foundry Working Group',
    sponsorCategory: 'Research Working Group',
    collaborationType: 'Intelligence Report',
    deadline: 'Technical Working Paper',
    awardOrScope: '36-Page Benchmark & Architecture Blueprint',
    problemSummary:
      'Independent laboratory benchmarking of analog optical interference engines versus 3nm digital tensor architectures under real-world matrix GEMM workloads, detailing SNR loss and calibration limits.',
    requirements: [
      'Standardized BERT and Llama tensor layer benchmarks',
      'Bit-precision resolution and ADC/DAC power dissipation breakdown',
      'Comprehensive foundry roadmap for hybrid electro-optic 3D stacking',
    ],
    tags: ['Optical Computing', 'Benchmark', 'Silicon Architecture', 'Foundry Roadmap'],
    status: 'Recently Published',
  },
];

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'challenge' | 'report'>('all');
  const [selectedCollabFilter, setSelectedCollabFilter] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<ChallengeOrReport | null>(null);

  // Application form state
  const [applicantName, setApplicantName] = useState('');
  const [applicantOrg, setApplicantOrg] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [proposalBrief, setProposalBrief] = useState('');
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Filter items
  const filteredItems = useMemo(() => {
    return CHALLENGES_AND_REPORTS.filter((item) => {
      if (activeTab !== 'all' && item.type !== activeTab) {
        return false;
      }
      if (selectedCollabFilter !== 'all' && item.collaborationType !== selectedCollabFilter) {
        return false;
      }
      return true;
    });
  }, [activeTab, selectedCollabFilter]);

  const counts = useMemo(() => {
    return {
      all: CHALLENGES_AND_REPORTS.length,
      challenges: CHALLENGES_AND_REPORTS.filter((i) => i.type === 'challenge').length,
      reports: CHALLENGES_AND_REPORTS.filter((i) => i.type === 'report').length,
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail || !proposalBrief) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: applicantName,
          email: applicantEmail,
          organization: applicantOrg,
          proposalBrief,
        }),
      });

      if (response.ok) {
        setApplicationSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setActiveModalItem(null);
    setApplicationSubmitted(false);
    setApplicantName('');
    setApplicantOrg('');
    setApplicantEmail('');
    setProposalBrief('');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title Section */}
        <div id="page-title-block" className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Corporate Co-Development & R&D Briefs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
              Corporate Challenges & Research Intelligence
            </h1>
            <p className="mt-2 text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Connect directly with verified corporate engineering budgets, sponsored pilot programs, and
              curated frontier intelligence dossiers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              id="active-bounties-pill"
              className="px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>$1.7M+ Allocated Pilot Budgets</span>
            </div>
          </div>
        </div>

        {/* Tab Switchers & Category Filter */}
        <div
          id="challenges-toolbar"
          className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          {/* Main Category Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="tab-all-briefs"
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <span>All Opportunities</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 font-mono">
                {counts.all}
              </span>
            </button>

            <button
              id="tab-challenges-only"
              type="button"
              onClick={() => setActiveTab('challenge')}
              className={`px-4 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'challenge'
                  ? 'bg-neutral-800 text-cyan-300 border border-cyan-500/50'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              <span>Corporate Challenges</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 font-mono">
                {counts.challenges}
              </span>
            </button>

            <button
              id="tab-reports-only"
              type="button"
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'report'
                  ? 'bg-neutral-800 text-emerald-300 border border-emerald-500/50'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Research Reports</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 font-mono">
                {counts.reports}
              </span>
            </button>
          </div>

          {/* Sub-filter by Collaboration Type */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-neutral-400 font-mono text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3 text-neutral-400" />
              Collaboration Type:
            </span>

            <button
              type="button"
              onClick={() => setSelectedCollabFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                selectedCollabFilter === 'all'
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All Types
            </button>

            <button
              type="button"
              onClick={() => setSelectedCollabFilter('Paid Pilot / PoC')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                selectedCollabFilter === 'Paid Pilot / PoC'
                  ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Paid Pilot
            </button>

            <button
              type="button"
              onClick={() => setSelectedCollabFilter('R&D Grant')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                selectedCollabFilter === 'R&D Grant'
                  ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              R&D Grant
            </button>

            <button
              type="button"
              onClick={() => setSelectedCollabFilter('Joint Development')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                selectedCollabFilter === 'Joint Development'
                  ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              JDA
            </button>
          </div>
        </div>

        {/* List of Challenges & Reports */}
        <div id="challenges-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              id={`card-${item.id}`}
              className="rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6">
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                        item.type === 'challenge'
                          ? 'border border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
                          : 'border border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                      }`}
                    >
                      {item.type === 'challenge' ? (
                        <Briefcase className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      <span>{item.type === 'challenge' ? 'Corporate Challenge' : 'Research Report'}</span>
                    </span>

                    <span className="text-xs font-mono text-neutral-400">
                      {item.status}
                    </span>
                  </div>

                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                    {item.collaborationType}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-neutral-100 leading-snug group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>

                {/* Sponsor metadata */}
                <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-400">
                  <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="text-neutral-300 font-medium">{item.sponsor}</span>
                  <span>·</span>
                  <span className="text-neutral-400">{item.sponsorCategory}</span>
                </div>

                {/* Problem Statement / Summary */}
                <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
                  {item.problemSummary}
                </p>

                {/* Requirements / Key Points */}
                <div className="mt-5 space-y-2">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                    {item.type === 'challenge' ? 'Key Technical Criteria' : 'Report Deliverables'}
                  </div>
                  <ul className="space-y-1.5">
                    {item.requirements.slice(0, 3).map((req, idx) => (
                      <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800/60 text-neutral-300 border border-neutral-700/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer with Budget & CTA */}
              <div className="px-6 py-4 bg-neutral-950/70 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-200">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-emerald-300">{item.awardOrScope}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                    <Calendar className="w-3 h-3 text-neutral-400" />
                    <span>Deadline: {item.deadline}</span>
                  </div>
                </div>

                <button
                  id={`btn-apply-${item.id}`}
                  type="button"
                  onClick={() => setActiveModalItem(item)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                >
                  <span>{item.type === 'challenge' ? 'Apply / Request Intro' : 'Access Report'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Application / Request Intro Modal */}
      {activeModalItem && (
        <div
          id="application-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            id="application-modal-dialog"
            className="w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <div className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-wider">
                  {activeModalItem.type === 'challenge' ? 'Corporate Challenge Brief' : 'Research Publication'}
                </div>
                <h3 className="text-xl font-bold text-neutral-100">{activeModalItem.title}</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Sponsor: {activeModalItem.sponsor} · {activeModalItem.awardOrScope}
                </p>
              </div>

              <button
                id="btn-close-application-modal"
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSubmitted ? (
              <div id="application-success-view" className="py-8 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-neutral-100">
                  {activeModalItem.type === 'challenge'
                    ? 'Application Successfully Transmitted'
                    : 'Report Access Link Dispatched'}
                </h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  {activeModalItem.type === 'challenge'
                    ? `Your briefing dossier for "${activeModalItem.sponsor}" has been recorded. Our technical diligence team will review your parameters within 48 hours.`
                    : `The full technical PDF and citation appendix have been sent to ${applicantEmail}.`}
                </p>
                <button
                  id="btn-dismiss-success"
                  type="button"
                  onClick={closeModal}
                  className="mt-4 px-5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-100 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <form id="application-form" onSubmit={handleApplicationSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                    Lead Researcher / Founder Name *
                  </label>
                  <input
                    id="input-applicant-name"
                    type="text"
                    required
                    placeholder="Dr. Jordan Mercer"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                      Lab, Institution, or Startup *
                    </label>
                    <input
                      id="input-applicant-org"
                      type="text"
                      required
                      placeholder="Frontier Photonics Lab"
                      value={applicantOrg}
                      onChange={(e) => setApplicantOrg(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                      Institutional Email *
                    </label>
                    <input
                      id="input-applicant-email"
                      type="email"
                      required
                      placeholder="j.mercer@lab.ac.uk"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                    Executive Hypothesis / Capability Summary *
                  </label>
                  <textarea
                    id="input-proposal-brief"
                    rows={4}
                    required
                    placeholder="Briefly describe your existing technology readiness (TRL), bench prototypes, or proposed technical architecture..."
                    value={proposalBrief}
                    onChange={(e) => setProposalBrief(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>

                <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                  <div className="font-semibold text-neutral-300">Confidentiality & Non-Disclosure:</div>
                  <div>
                    Submissions are routed under mutual non-disclosure baselines. NEXORA does not take IP equity or claims in applicant innovations.
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 text-xs font-medium hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-proposal"
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Proposal / Request Intro</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="challenges-footer" className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span className="text-neutral-300 font-semibold">NEXORA Corporate Co-Development</span>
            <span className="text-neutral-400">· Active Challenges</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Verified Industry Sponsors</span>
            <span>&copy; {new Date().getFullYear()} NEXORA Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
