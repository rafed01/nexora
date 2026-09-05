'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Cpu,
  Building2,
  GraduationCap,
  Layers,
  ArrowUpRight,
  Sparkles,
  CheckCircle,
  ExternalLink,
  SlidersHorizontal,
  X,
  Compass,
  FileText,
  Users,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';

type EntityType = 'technology' | 'startup' | 'expert';

interface DiscoveryItem {
  id: string;
  type: EntityType;
  title: string;
  category: string;
  trl: number;
  trlStage: string;
  organization: string;
  location: string;
  description: string;
  tags: string[];
  metrics: { label: string; value: string }[];
  milestones: string[];
}

const DISCOVERY_DATA: DiscoveryItem[] = [
  {
    id: 'tech-photonic-mpu',
    type: 'technology',
    title: 'Photonic Matrix Processing Unit (P-MPU)',
    category: 'Optical Computing',
    trl: 6,
    trlStage: 'System Prototype Validated in Relevant Environment',
    organization: 'NEXORA Optoelectronics Core',
    location: 'Munich, Germany',
    description:
      'Ultra-low-latency photonic accelerator performing tensor arithmetic at lightspeed with sub-picosecond optical interference waveguides and zero thermal throttle.',
    tags: ['Silicon Photonics', 'Tensor Core', 'Sub-Watt Computing', 'Interferometry'],
    metrics: [
      { label: 'Compute Density', value: '42.8 TOPS/W' },
      { label: 'Latency', value: '0.18 ns' },
      { label: 'Waveguide Spec', value: '1550nm C-Band' },
    ],
    milestones: [
      'Successful wafer-scale test at IMEC foundry',
      'Phase-shifter thermal stability verified across 85°C delta',
      'PCIe Gen 5 optical-to-electrical bridge verified',
    ],
  },
  {
    id: 'tech-solid-state-electrolyte',
    type: 'technology',
    title: 'High-Purity Argyrodite Solid Electrolyte',
    category: 'Advanced Energy Storage',
    trl: 7,
    trlStage: 'System Prototype Demonstration in Operational Environment',
    organization: 'Kyoto Materials Innovation Lab',
    location: 'Kyoto, Japan',
    description:
      'Engineered sulfide-based argyrodite crystal matrices preventing lithium dendrite penetration at ultra-high current densities (>12 mA/cm²).',
    tags: ['Solid State', 'High-Nickel Cathodes', 'Lithium Metal', 'Battery Safety'],
    metrics: [
      { label: 'Ionic Conductivity', value: '14.2 mS/cm' },
      { label: 'Cycle Retention', value: '92% @ 1,400 cycles' },
      { label: 'Operating Window', value: '-35°C to 75°C' },
    ],
    milestones: [
      'Pouch cell pilot demonstration with 450 Wh/kg specific energy',
      'Roll-to-roll dry electrode manufacturing verified',
      'Extreme nail penetration test passed without thermal runaway',
    ],
  },
  {
    id: 'tech-quantum-mitigation',
    type: 'technology',
    title: 'Tensor-Network Quantum Error Mitigation',
    category: 'Quantum Computing',
    trl: 5,
    trlStage: 'Technology Validated in Relevant Environment',
    organization: 'CERN OpenLab Consortium',
    location: 'Geneva, Switzerland',
    description:
      'Real-time algorithmic error mitigation framework using matrix product states to suppress phase-flip noise on 127-qubit superconducting processors.',
    tags: ['QEC', 'NISQ Algorithms', 'Tensor Networks', 'Superconducting Qubits'],
    metrics: [
      { label: 'Fidelity Gain', value: '+34.6%' },
      { label: 'Overhead Ratio', value: '1.28x' },
      { label: 'Qubit Capacity', value: '127 Qubits' },
    ],
    milestones: [
      'Zero-noise extrapolation benchmarked on IBM Eagle architecture',
      'Dynamic decoupling pulse optimization deployed in cloud pipeline',
    ],
  },
  {
    id: 'startup-aetherion',
    type: 'startup',
    title: 'Aetherion Dynamics',
    category: 'Autonomous Aerospace & Swarm AI',
    trl: 7,
    trlStage: 'Operational Demonstration in Representative Setting',
    organization: 'Aetherion Lab Corp.',
    location: 'Toulouse, France',
    description:
      'Next-generation high-altitude pseudo-satellite platforms governed by distributed edge-swarm consensus algorithms for disaster telemetry and communications.',
    tags: ['Swarm Autonomy', 'HAPS Platforms', 'Decentralized Guidance', 'Solar Aerostructures'],
    metrics: [
      { label: 'Flight Endurance', value: '62 Days Continual' },
      { label: 'Payload Capacity', value: '35 kg' },
      { label: 'Funding Stage', value: 'Series A ($18.5M)' },
    ],
    milestones: [
      'Stratospheric flight validation at 68,000 ft',
      'Autonomous formation hold demonstrated under 70 kt jetstream wind shear',
      'Secured dual civil and defense agency validation grants',
    ],
  },
  {
    id: 'startup-synthosyn',
    type: 'startup',
    title: 'SynthoSyn Bio',
    category: 'Generative Protein Engineering',
    trl: 6,
    trlStage: 'System Prototype Validated in Laboratory',
    organization: 'SynthoSyn Therapeutics',
    location: 'Cambridge, MA, USA',
    description:
      'Diffusion-based molecular generation engine tailoring thermostable biocatalysts for industrial microplastic deconstruction and circular monomer recovery.',
    tags: ['Generative Biology', 'Enzyme Design', 'Circular Plastics', 'Directed Evolution'],
    metrics: [
      { label: 'Decomposition Rate', value: '98.2% in 18 hrs' },
      { label: 'Thermal Window', value: 'Up to 72°C' },
      { label: 'Funding Stage', value: 'Seed ($6.2M)' },
    ],
    milestones: [
      'Crystal structure resolution for PETase-NX3 variant at 1.4Å',
      'Bioreactor pilot facility operating at 500-liter capacity',
      'Industrial off-take partnership signed with European recyclers',
    ],
  },
  {
    id: 'startup-helionix',
    type: 'startup',
    title: 'Helionix Fusion Alloys',
    category: 'Magnetic Confinement Materials',
    trl: 5,
    trlStage: 'Technology Validated in Laboratory Environment',
    organization: 'Helionix Materials Ltd.',
    location: 'Oxford, UK',
    description:
      'High-entropy tungsten-carbide alloys engineered to withstand 14 MeV neutron bombardment and extreme heat flux within compact tokamak divertors.',
    tags: ['Fusion Energy', 'High-Entropy Alloys', 'Neutron Resistance', 'Plasma Facing'],
    metrics: [
      { label: 'Heat Flux Limit', value: '25 MW/m²' },
      { label: 'DPA Tolerance', value: '> 45 DPA' },
      { label: 'Funding Stage', value: 'Grant + Pre-Series A ($9.1M)' },
    ],
    milestones: [
      'Linear plasma simulator exposure completed at 10^24 ions/m²',
      'Vacuum plasma spraying technique patented for curved divertor tiles',
    ],
  },
  {
    id: 'expert-dr-rostova',
    type: 'expert',
    title: 'Dr. Elena Rostova',
    category: 'Photonic Architecture & Quantum Optics',
    trl: 9,
    trlStage: 'Proven Operational Leadership (TRL 9 Advisory)',
    organization: 'Max Planck Institute & NEXORA Fellow',
    location: 'Berlin, Germany',
    description:
      'Pioneer in integrated topological photonics and high-dimensional entanglement distribution. Over 18 years leading deep-tech hardware transitions from lab to industrial fab.',
    tags: ['Topological Photonics', 'Entanglement', 'Foundry Packaging', 'Technical Due Diligence'],
    metrics: [
      { label: 'Citations', value: '11,400+' },
      { label: 'h-index', value: '54' },
      { label: 'Advisory Status', value: 'Open for Architecture Audits' },
    ],
    milestones: [
      'Lead author on Nature Photonics landmark review (2024)',
      'Advisor to European Quantum Flagship hardware working group',
      'Architected 3 commercial optoelectronic foundry spin-outs',
    ],
  },
  {
    id: 'expert-marcus-vance',
    type: 'expert',
    title: 'Marcus Vance, PhD',
    category: 'Solid-State Electrochemistry',
    trl: 8,
    trlStage: 'Commercial Scale-Up Veteran (TRL 8 Advisory)',
    organization: 'Stanford Materials Lab & Frontier Battery Advisory',
    location: 'Palo Alto, CA, USA',
    description:
      'Specialist in solid-electrolyte interphase stabilization and high-speed dry-coating line integration. Guided 4 gigafactory pilot line deployments.',
    tags: ['Solid Electrolytes', 'Roll-to-Roll Scale', 'Battery Chemistry', 'Supply Chain Security'],
    metrics: [
      { label: 'Patents Granted', value: '26 Patents' },
      { label: 'Pilot Lines Led', value: '4 Facilities' },
      { label: 'Advisory Status', value: 'Available for Scale Feasibility' },
    ],
    milestones: [
      'Principal investigator on DARPA fast-charge solid state initiative',
      'Formulated dry battery electrode formulation now used in production EVs',
    ],
  },
  {
    id: 'expert-kaviya-chen',
    type: 'expert',
    title: 'Dr. Kaviya Chen',
    category: 'Decentralized Robotics & Multi-Agent Swarms',
    trl: 8,
    trlStage: 'Operational System Architect (TRL 8 Advisory)',
    organization: 'MIT CSAIL & Autonomous Systems Council',
    location: 'Boston, MA, USA',
    description:
      'Expert in formally verified distributed consensus for safety-critical swarm robotic networks operating in GPS-denied and subterranean environments.',
    tags: ['Swarm Autonomy', 'Formal Verification', 'SLAM', 'Edge Intelligence'],
    metrics: [
      { label: 'Conference Chairs', value: 'RSS, ICRA' },
      { label: 'Patents', value: '14' },
      { label: 'Advisory Status', value: 'Accepting Research Residencies' },
    ],
    milestones: [
      'Subterranean autonomous exploration trial record holder',
      'Founding member of Open Swarm Protocol standards committee',
    ],
  },
];

export default function ExplorePage() {
  const [selectedType, setSelectedType] = useState<'all' | EntityType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrlFilter, setSelectedTrlFilter] = useState<number | 'all'>('all');
  const [activeItem, setActiveItem] = useState<DiscoveryItem | null>(null);
  const [discoveryItems, setDiscoveryItems] = useState<DiscoveryItem[]>(DISCOVERY_DATA);

  // Fetch dynamic catalog items from API and merge
  useEffect(() => {
    async function fetchDynamicCatalog() {
      try {
        const res = await fetch('/api/catalog');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.catalog) && json.catalog.length > 0) {
            const mappedCatalog: DiscoveryItem[] = json.catalog.map((c: any) => ({
              id: c.id,
              type: (c.type || 'technology') as EntityType,
              title: c.title || 'Untitled Innovation Node',
              category: c.category || 'Deep Tech',
              trl: typeof c.trl === 'number' ? c.trl : Number(c.trl) || 6,
              trlStage: c.trlStage || `TRL ${c.trl || 6} Validated System`,
              organization: c.organization || 'Independent Innovation Lab',
              location: c.location || 'Global Distributed',
              description: c.description || `${c.title} registered in NEXORA innovation network.`,
              tags: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : [c.category || 'Deep Tech', 'Verified Asset'],
              metrics: Array.isArray(c.metrics) && c.metrics.length > 0 ? c.metrics : [
                { label: 'Readiness', value: `TRL ${c.trl || 6}` },
                { label: 'Status', value: c.status || 'Active' },
              ],
              milestones: Array.isArray(c.milestones) && c.milestones.length > 0 ? c.milestones : [
                'Registered into NEXORA global node registry',
                'Curator verification passed',
              ],
            }));

            setDiscoveryItems((prev) => {
              const existingIds = new Set(prev.map((i) => i.id));
              const newItems = mappedCatalog.filter((item) => !existingIds.has(item.id));
              return [...newItems, ...prev];
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic catalog:', err);
      }
    }

    fetchDynamicCatalog();
  }, []);

  // Filter items based on active criteria
  const filteredItems = useMemo(() => {
    return discoveryItems.filter((item) => {
      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }

      // TRL filter
      if (selectedTrlFilter !== 'all') {
        if (selectedTrlFilter === 5 && (item.trl < 5 || item.trl > 5)) return false;
        if (selectedTrlFilter === 6 && (item.trl < 6 || item.trl > 6)) return false;
        if (selectedTrlFilter === 7 && (item.trl < 7 || item.trl > 7)) return false;
        if (selectedTrlFilter === 8 && (item.trl < 8 || item.trl > 9)) return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesOrg = item.organization.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesTags = item.tags.some((tag) => tag.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesOrg || matchesCategory || matchesTags;
      }

      return true;
    });
  }, [discoveryItems, selectedType, selectedTrlFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: discoveryItems.length,
      technology: discoveryItems.filter((i) => i.type === 'technology').length,
      startup: discoveryItems.filter((i) => i.type === 'startup').length,
      expert: discoveryItems.filter((i) => i.type === 'expert').length,
    };
  }, [discoveryItems]);

  const getTypeIcon = (type: EntityType) => {
    switch (type) {
      case 'technology':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'startup':
        return <Building2 className="w-4 h-4 text-emerald-400" />;
      case 'expert':
        return <GraduationCap className="w-4 h-4 text-amber-400" />;
    }
  };

  const getTrlBadgeColor = (trl: number) => {
    if (trl <= 5) {
      return 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300';
    }
    if (trl <= 7) {
      return 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300';
    }
    return 'border-amber-500/40 bg-amber-950/30 text-amber-300';
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dashboard Title & Introduction */}
        <div id="discovery-title-block" className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Global Innovation Inventory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
              Deep-Tech Discovery Dashboard
            </h1>
            <p className="mt-2 text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Explore vetted breakthrough technologies, high-impact venture labs, and domain experts
              calibrated by Technology Readiness Level (TRL).
            </p>
          </div>

          {/* Result Counter Pill */}
          <div className="flex items-center gap-2">
            <div
              id="results-counter-badge"
              className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300"
            >
              Showing <span className="text-cyan-400 font-semibold">{filteredItems.length}</span> verified entries
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="block md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search technologies, labs, experts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Filters and View Toggles Bar */}
        <div
          id="filters-toolbar"
          className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          {/* Entity Type Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id="filter-tab-all"
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                selectedType === 'all'
                  ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <span>All Artifacts</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 font-mono">
                {counts.all}
              </span>
            </button>

            <button
              id="filter-tab-technologies"
              type="button"
              onClick={() => setSelectedType('technology')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                selectedType === 'technology'
                  ? 'bg-neutral-800 text-cyan-300 border border-cyan-500/50'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Technologies</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 font-mono">
                {counts.technology}
              </span>
            </button>

            <button
              id="filter-tab-startups"
              type="button"
              onClick={() => setSelectedType('startup')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                selectedType === 'startup'
                  ? 'bg-neutral-800 text-emerald-300 border border-emerald-500/50'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Startup Labs</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 font-mono">
                {counts.startup}
              </span>
            </button>

            <button
              id="filter-tab-experts"
              type="button"
              onClick={() => setSelectedType('expert')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                selectedType === 'expert'
                  ? 'bg-neutral-800 text-amber-300 border border-amber-500/50'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Expert Profiles</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 font-mono">
                {counts.expert}
              </span>
            </button>
          </div>

          {/* TRL Filter Pills */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-neutral-400 font-mono text-[11px] flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
              TRL Stage:
            </span>

            <button
              type="button"
              onClick={() => setSelectedTrlFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                selectedTrlFilter === 'all'
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Any
            </button>

            <button
              type="button"
              onClick={() => setSelectedTrlFilter(5)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                selectedTrlFilter === 5
                  ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              TRL 5
            </button>

            <button
              type="button"
              onClick={() => setSelectedTrlFilter(6)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                selectedTrlFilter === 6
                  ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              TRL 6
            </button>

            <button
              type="button"
              onClick={() => setSelectedTrlFilter(7)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                selectedTrlFilter === 7
                  ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              TRL 7
            </button>

            <button
              type="button"
              onClick={() => setSelectedTrlFilter(8)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                selectedTrlFilter === 8
                  ? 'bg-amber-950 border border-amber-500/50 text-amber-300'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              TRL 8-9
            </button>
          </div>
        </div>

        {/* Discovery Grid */}
        {filteredItems.length === 0 ? (
          <div
            id="empty-state-card"
            className="p-12 text-center rounded-xl bg-neutral-900/30 border border-neutral-800"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-neutral-200">No artifacts matched your search</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Try adjusting your query or resetting the filters to view the full inventory.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedTrlFilter('all');
              }}
              className="mt-5 inline-flex items-center px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-100 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div id="artifacts-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                id={`card-${item.id}`}
                className="rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top Section */}
                <div className="p-6">
                  {/* Top metadata tags & TRL badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-mono">
                      {getTypeIcon(item.type)}
                      <span className="capitalize text-neutral-400">{item.type}</span>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium ${getTrlBadgeColor(
                        item.trl
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>TRL {item.trl}</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="text-xs font-mono text-cyan-400/90 mb-1">{item.category}</div>

                  {/* Title */}
                  <Link
                    href={
                      item.type === 'technology'
                        ? `/technology/${item.id}`
                        : item.type === 'startup'
                        ? `/startup/${item.id}`
                        : `/expert/${item.id}`
                    }
                    className="block text-lg font-bold text-neutral-100 leading-snug group-hover:text-cyan-300 transition-colors"
                  >
                    {item.title}
                  </Link>

                  {/* Organization & Location */}
                  <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                    <span>{item.organization}</span>
                    <span>·</span>
                    <span className="text-neutral-400">{item.location}</span>
                  </div>

                  {/* Description */}
                  <p className="mt-3.5 text-xs text-neutral-400 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-300 border border-neutral-700/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Section */}
                <div className="px-6 py-3.5 bg-neutral-950/60 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-neutral-400">
                    <span className="font-mono text-neutral-300">{item.metrics[0]?.label}: </span>
                    <span className="font-mono text-cyan-400 font-semibold">{item.metrics[0]?.value}</span>
                  </div>

                  <button
                    id={`btn-inspect-${item.id}`}
                    type="button"
                    onClick={() => setActiveItem(item)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Artifact Detailed Inspector Modal / Drawer */}
      {activeItem && (
        <div
          id="inspector-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            id="inspector-dialog"
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-mono font-medium ${getTrlBadgeColor(
                      activeItem.trl
                    )}`}
                  >
                    TRL {activeItem.trl} · {activeItem.trlStage}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-100">{activeItem.title}</h2>
                <div className="text-xs text-neutral-400 mt-1 font-mono">
                  {activeItem.organization} — {activeItem.location}
                </div>
              </div>

              <button
                id="close-inspector-btn"
                type="button"
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors"
                aria-label="Close inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                Technical Dossier
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed">{activeItem.description}</p>
            </div>

            {/* Key Performance Metrics */}
            <div>
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2.5">
                Validated Telemetry & Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeItem.metrics.map((metric, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col"
                  >
                    <span className="text-[11px] text-neutral-400 font-mono">{metric.label}</span>
                    <span className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones / Validations */}
            <div>
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                Verification Milestones
              </h4>
              <ul className="space-y-2">
                {activeItem.milestones.map((milestone, i) => (
                  <li
                    key={i}
                    className="text-xs text-neutral-300 flex items-start gap-2 bg-neutral-950/50 p-2.5 rounded-lg border border-neutral-800/70"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{milestone}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                Taxonomy & Standards
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-950 text-neutral-300 border border-neutral-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 text-xs font-medium hover:bg-neutral-800 transition-colors"
              >
                Close Dossier
              </button>
              {activeItem.type === 'technology' && (
                <Link
                  href={`/technology/${activeItem.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700 text-xs font-medium transition-colors"
                >
                  <span>Open Full Node Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              {activeItem.type === 'startup' && (
                <Link
                  href={`/startup/${activeItem.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700 text-xs font-medium transition-colors"
                >
                  <span>Open Startup Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              {activeItem.type === 'expert' && (
                <Link
                  href={`/expert/${activeItem.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700 text-xs font-medium transition-colors"
                >
                  <span>Open Expert Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              <Link
                href="/#cta-section"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold transition-colors"
              >
                <span>Request Collaboration</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="explore-footer" className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="text-neutral-300 font-semibold">NEXORA Discovery</span>
            <span className="text-neutral-400">· Guided Technology Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Deterministic TRL Calibration v2.4</span>
            <span>&copy; {new Date().getFullYear()} NEXORA Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
