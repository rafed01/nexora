import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  Award,
  Sparkles,
  Target,
  FileText,
  Users,
  Compass,
  CheckCircle2,
  Globe,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Mail,
  Zap,
  Briefcase,
  Layers,
  PhoneCall,
  Clock,
  BookOpen,
  Building2,
  Share2,
} from 'lucide-react';

interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  organization: string;
  secondaryAffiliations: string[];
  location: string;
  advisoryStatus: {
    isAvailable: boolean;
    statusLabel: string;
    focusAreas: string[];
    capacityNote: string;
  };
  sectors: string[];
  expertiseTags: string[];
  bio: {
    summary: string;
    careerHighlights: string[];
    theoreticalContributions: string[];
  };
  metrics: {
    citations: string;
    hIndex: number;
    patentsGranted: number;
    completedAudits: number;
  };
  selectedPublications: {
    title: string;
    journal: string;
    year: number;
    citations: number;
  }[];
  advisoryServices: {
    name: string;
    deliverable: string;
    typicalDuration: string;
  }[];
}

const EXPERTS_DATABASE: Record<string, ExpertProfile> = {
  'expert-rostova': {
    id: 'expert-rostova',
    name: 'Dr. Elena Rostova',
    title: 'Principal Investigator & Fellow in Quantum Optoelectronics',
    organization: 'Max Planck Institute for Quantum Optics',
    secondaryAffiliations: [
      'Technical University of Munich (Honorary Chair)',
      'EuroHPC Quantum Interconnect Taskforce',
    ],
    location: 'Munich, Germany',
    advisoryStatus: {
      isAvailable: true,
      statusLabel: 'Available for Q4 Technical Advisory & Architecture Audits',
      focusAreas: [
        'Integrated Silicon Photonics PDK Architecture',
        'Laser-to-Waveguide Thermal Stabilization',
        'Quantum Optical Transceiver Feasibility',
      ],
      capacityNote: 'Currently accepting 1-2 corporate advisory engagements or Scientific Advisory Board (SAB) positions.',
    },
    sectors: [
      'Optical Computing',
      'Silicon Photonics',
      'Quantum Key Distribution (QKD)',
      'High-Performance Datacenter Fabrics',
    ],
    expertiseTags: [
      'Mach-Zehnder Interferometry',
      'Co-Packaged Optics (CPO)',
      'Wafer-Scale Optical Testing',
      'Phase Noise Suppression',
      'Sub-Picosecond Switching',
      'Heterogeneous III-V Bonding',
    ],
    bio: {
      summary:
        'Dr. Elena Rostova is an internationally recognized authority on silicon photonics and optoelectronic packaging with over 18 years of experience bridging academic quantum optics discoveries to high-volume semiconductor foundry tapeouts. She served as Chief Optical Scientist during the early EuroHPC co-packaged optics initiatives and has advised European semiconductor primes on thermal phase stabilization for tensor processors.',
      careerHighlights: [
        'Pioneered sub-picosecond optical matrix multiplier topologies now standardized in next-gen CPO roadmaps.',
        'Recipient of the European Optical Society Fresnel Prize (2021) for advances in integrated waveguide lattices.',
        'Served on technical oversight boards for 5 successful deep-tech spinouts totaling over $120M in private funding.',
        'Over 12,400 peer citations with an h-index of 54 across Nature Photonics, Physical Review Letters, and IEEE JQE.',
      ],
      theoreticalContributions: [
        'Formulation of dynamic thermo-optic phase compensation lattices for silicon micro-ring resonators.',
        'Deterministic mathematical error bounds for analog optical tensor computing units under laser power drift.',
      ],
    },
    metrics: {
      citations: '12,400+',
      hIndex: 54,
      patentsGranted: 19,
      completedAudits: 32,
    },
    selectedPublications: [
      {
        title: 'Sub-Picosecond Non-Volatile Optical Matrix Computation in 300mm Silicon Photonics',
        journal: 'Nature Photonics',
        year: 2023,
        citations: 412,
      },
      {
        title: 'Thermal Drift Suppression in Mach-Zehnder Mesh Multipliers for Deep Learning',
        journal: 'IEEE Journal of Quantum Electronics',
        year: 2022,
        citations: 286,
      },
      {
        title: 'Heterogeneous Integration of III-V Lasers on Silicon for Co-Packaged Data Fabrics',
        journal: 'Optica',
        year: 2021,
        citations: 340,
      },
    ],
    advisoryServices: [
      {
        name: 'Architecture & Tapout Feasibility Audit',
        deliverable: 'Independent technical due diligence report for venture funds and corporate acquirers evaluating photonics PDK readiness.',
        typicalDuration: '2 to 3 weeks',
      },
      {
        name: 'Scientific Advisory Board (SAB) Retainer',
        deliverable: 'Quarterly roadmap reviews, optical engineering talent evaluation, and academic research consortium liaison.',
        typicalDuration: '12-month retainer',
      },
      {
        name: 'Executive Technical Briefing',
        deliverable: '2-hour interactive deep dive on quantum optics and silicon photonics roadmaps for C-suite and R&D leaders.',
        typicalDuration: 'Half-day briefing',
      },
    ],
  },
  'expert-chen': {
    id: 'expert-chen',
    name: 'Dr. Kaviya Chen',
    title: 'Director of Autonomous Systems & Multi-Agent Swarms',
    organization: 'ETH Zurich & MIT CSAIL Affiliate',
    secondaryAffiliations: [
      'Robotics Systems Lab (RSL)',
      'Swiss National Center of Competence in Robotics',
    ],
    location: 'Zurich, Switzerland',
    advisoryStatus: {
      isAvailable: true,
      statusLabel: 'Open for Select Advisory Consultations & Defense System Audits',
      focusAreas: [
        'Byzantine Fault-Tolerant Swarm Consensus',
        'GPS-Denied Cooperative SLAM',
        'Formal Verification of Safety Bounds',
      ],
      capacityNote: 'Open for technical due diligence audits and guest advisory panels for aerospace primes.',
    },
    sectors: [
      'Decentralized Robotics',
      'Autonomous Aerospace (UAV / HAPS)',
      'Multi-Agent Control Theory',
      'Formal Safety Verification',
    ],
    expertiseTags: [
      'Gossip Protocols',
      'Distributed SLAM',
      'Byzantine Consensus',
      'Model Predictive Control (MPC)',
      'Sub-Surface Navigation',
      'Edge Autonomy',
    ],
    bio: {
      summary:
        'Dr. Kaviya Chen leads pioneering research in multi-agent autonomous systems capable of executing mission-critical tasks in GPS-denied, communication-degraded environments. Her algorithmic frameworks have been deployed in subterranean search-and-rescue robotics competitions and stratospheric persistent surveillance platforms.',
      careerHighlights: [
        'Technical lead for the DARPA Subterranean Challenge winning multi-agent autonomy architecture.',
        'Author of the widely adopted OpenSwarm Byzantine consensus library for decentralized flight formations.',
        'Consulted for international defense and civilian aerospace authorities on certifiable multi-UAV airspace deconfliction.',
        'Authored 45+ peer-reviewed papers with 8,900 citations and an h-index of 42.',
      ],
      theoreticalContributions: [
        'Proved deterministic convergence bounds for asynchronous consensus in networks with up to 60% link degradation.',
        'Formulated energy-aware trajectory optimization for solar-powered continuous atmospheric gliders.',
      ],
    },
    metrics: {
      citations: '8,900+',
      hIndex: 42,
      patentsGranted: 8,
      completedAudits: 24,
    },
    selectedPublications: [
      {
        title: 'Asynchronous Distributed Consensus in Severely Bandwidth-Constrained Multi-Agent Formations',
        journal: 'IEEE Transactions on Robotics',
        year: 2024,
        citations: 188,
      },
      {
        title: 'Resilient Multi-Drone Cooperative Localization Without Absolute Global Positioning',
        journal: 'Science Robotics',
        year: 2022,
        citations: 345,
      },
    ],
    advisoryServices: [
      {
        name: 'Autonomy Safety & Convergence Verification',
        deliverable: 'Formal mathematical audit of multi-agent collision avoidance and decentralized state estimation codebases.',
        typicalDuration: '2 weeks',
      },
      {
        name: 'Technical Advisory Retainer',
        deliverable: 'Regular strategic guidance on algorithm selection, simulation testbed architecture, and hardware selection.',
        typicalDuration: '6 to 12 months',
      },
    ],
  },
  'expert-vance': {
    id: 'expert-vance',
    name: 'Marcus Vance, PhD',
    title: 'Lead Battery Architect & Materials Processing Fellow',
    organization: 'Kyoto Materials Innovation Lab / Ex-Tesla Powertrain',
    secondaryAffiliations: [
      'European Battery Alliance Advisory Board',
      'Stanford Electrochemical Energy Center (Alumnus)',
    ],
    location: 'Kyoto, Japan & Stuttgart, Germany',
    advisoryStatus: {
      isAvailable: true,
      statusLabel: 'Accepting Cell Chemistry Due Diligence & Gigafactory Tooling Reviews',
      focusAreas: [
        'Sulfide & Argyrodite Solid Electrolytes',
        'Solvent-Free Dry Roll-to-Roll Coating',
        'Lithium Dendrite Interfacial Passivation',
      ],
      capacityNote: 'Available for automotive OEM pilot cell reviews and gigafactory feasibility studies.',
    },
    sectors: [
      'Advanced Energy Storage',
      'Automotive EV Powertrain',
      'Solid-State Battery Chemistries',
      'Roll-to-Roll Manufacturing',
    ],
    expertiseTags: [
      'Argyrodite Li₆PS₅Cl',
      'Dry Electrode Calendaring',
      'Electrochemical Impedance Spectroscopy',
      'Thermal Runaway Mitigation',
      'Lithium Metal Anodes',
    ],
    bio: {
      summary:
        'Dr. Marcus Vance brings 20 years of hands-on battery materials development experience, spanning early laboratory synthesis of superionic sulfide crystals to industrial roll-to-roll dry powder coating lines in modern gigafactories. He has led cell architecture evaluations for tier-1 European automotive OEMs transitioning to solid-state platforms.',
      careerHighlights: [
        'Spearheaded the engineering transition of argyrodite electrolyte powders into dry-calendered web manufacturing.',
        'Over 26 international patents covering solid-state cell separator coatings and interfacial lithium stabilization.',
        'Conducted technical due diligence on over 40 battery startups for corporate venture capital funds and OEMs.',
      ],
      theoreticalContributions: [
        'Established critical current density (CCD) boundary formulas governing dendrite initiation in sulfide solid electrolytes.',
      ],
    },
    metrics: {
      citations: '8,400+',
      hIndex: 46,
      patentsGranted: 26,
      completedAudits: 45,
    },
    selectedPublications: [
      {
        title: 'Suppression of Dendrite Penetration in Argyrodite Solid Separators at Ultra-High Current Densities',
        journal: 'Nature Energy',
        year: 2023,
        citations: 290,
      },
      {
        title: 'Solvent-Free Dry Coating of Sulfide Solid Electrolytes for High-Volume Automotive Cells',
        journal: 'Advanced Energy Materials',
        year: 2022,
        citations: 215,
      },
    ],
    advisoryServices: [
      {
        name: 'Gigafactory Process & Chemistry Audit',
        deliverable: 'Comprehensive evaluation of dry room specifications, coating uniformity tolerances, and yield bottlenecks.',
        typicalDuration: '3 weeks',
      },
      {
        name: 'OEM Venture Due Diligence',
        deliverable: 'Confidential third-party technical report analyzing energy density claims, cycle life test data, and cost curves.',
        typicalDuration: '10 business days',
      },
    ],
  },
};

function generateDynamicExpert(id: string): ExpertProfile {
  const formattedName = id
    .replace(/^expert-/, '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id,
    name: `Dr. ${formattedName}`,
    title: `Senior Principal Investigator in Frontier Deep-Tech`,
    organization: 'European Deep-Tech Research Consortium',
    secondaryAffiliations: ['Horizon Europe Advisory Panel'],
    location: 'Munich, Germany',
    advisoryStatus: {
      isAvailable: true,
      statusLabel: 'Available for Technical Architecture Audits & Strategic Advisory',
      focusAreas: [`${formattedName} System Integration`, 'Performance Telemetry Audits', 'TRL Gate Reviews'],
      capacityNote: 'Accepting select corporate advisory inquiries and due diligence commissions.',
    },
    sectors: ['Frontier Deep-Tech Systems', 'Emerging Hardware Architectures', 'Industrial Commercialization'],
    expertiseTags: [
      `${formattedName} Fundamentals`,
      'System Architecture',
      'Empirical Validation',
      'Failure Mode Analysis',
      'Intellectual Property',
    ],
    bio: {
      summary: `Dr. ${formattedName} is a veteran deep-tech researcher and industry advisor with extensive experience guiding hardware and materials technologies through critical Technology Readiness Level (TRL) progression gates.`,
      careerHighlights: [
        `Led multiple interdisciplinary research initiatives in advanced ${formattedName.toLowerCase()} systems.`,
        'Advised European research councils and sovereign technology investment funds.',
        'Author of over 30 peer-reviewed articles in prestigious scientific publications.',
      ],
      theoreticalContributions: [
        'Novel modeling methodologies for deterministic performance verification under extreme operational stress.',
      ],
    },
    metrics: {
      citations: '6,500+',
      hIndex: 38,
      patentsGranted: 12,
      completedAudits: 18,
    },
    selectedPublications: [
      {
        title: `Advances in Systematic ${formattedName} Frameworks for Commercial Deployment`,
        journal: 'Deep-Tech Review Letters',
        year: 2024,
        citations: 110,
      },
    ],
    advisoryServices: [
      {
        name: 'Technical Architecture Audit',
        deliverable: 'Exhaustive verification of engineering claims, patent validity, and scalability bottlenecks.',
        typicalDuration: '2 weeks',
      },
      {
        name: 'Advisory Retainer',
        deliverable: 'Monthly strategic advisory sessions with executive and engineering leadership.',
        typicalDuration: '6 to 12 months',
      },
    ],
  };
}

export default async function ExpertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expert = EXPERTS_DATABASE[id] || generateDynamicExpert(id);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Sticky Header */}
      <header
        id="expert-header"
        className="sticky top-0 z-40 border-b border-neutral-800/90 bg-neutral-950/95 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              id="back-to-explore-btn"
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-100 transition-colors p-1.5 rounded-lg hover:bg-neutral-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Catalog</span>
            </Link>

            <div className="h-4 w-px bg-neutral-800" />

            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="text-neutral-500">Expert Fellow:</span>
              <span className="text-cyan-400 font-semibold">{expert.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-900"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Scout</span>
            </Link>

            <Link
              href="/challenges"
              className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 transition-colors"
            >
              Related Challenges
            </Link>

            <a
              id="btn-request-advisory-call"
              href="#call-request-section"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Request Advisory Call</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Expert Hero Profile Banner */}
        <section id="expert-hero" className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              Verified NEXORA Research Fellow
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {expert.advisoryStatus.statusLabel}
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-100 leading-tight">
              {expert.name}
            </h1>
            <p className="text-base sm:text-lg text-neutral-300 max-w-4xl leading-relaxed">
              {expert.title}
            </p>
            <div className="text-xs sm:text-sm font-mono text-cyan-400 flex flex-wrap items-center gap-2">
              <span>{expert.organization}</span>
              {expert.secondaryAffiliations.map((aff, i) => (
                <React.Fragment key={i}>
                  <span className="text-neutral-600">·</span>
                  <span className="text-neutral-400">{aff}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-neutral-400" />
                <span>Academic Citations</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
                {expert.metrics.citations}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-neutral-400" />
                <span>h-Index Rating</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-cyan-400 font-mono">
                {expert.metrics.hIndex}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-neutral-400" />
                <span>Patents Granted</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-neutral-100 font-mono">
                {expert.metrics.patentsGranted} Patents
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-neutral-400" />
                <span>Completed Audits</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">
                {expert.metrics.completedAudits} Due Diligences
              </div>
            </div>
          </div>
        </section>

        {/* Advisory Availability & Focus Areas */}
        <section
          id="advisory-status-section"
          className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-neutral-100">Advisory Availability & Capacity</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Currently Active
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {expert.advisoryStatus.capacityNote}
          </p>

          <div className="space-y-2">
            <div className="text-xs font-mono text-neutral-400">Target Advisory & Consultation Vectors:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {expert.advisoryStatus.focusAreas.map((area, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sectors & Deep-Tech Expertise Tags */}
        <section id="sectors-expertise-section" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Primary Sectors */}
            <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Primary Technological Sectors
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {expert.sectors.map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs font-semibold text-neutral-200 flex items-center justify-between"
                  >
                    <span>{sec}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Granular Technical Tags */}
            <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Specialized Technical Methodologies
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {expert.expertiseTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Biography & Career Track Record */}
        <section id="bio-section" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-2xl font-bold text-neutral-100">Biography & Track Record</h2>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-6">
            <p className="text-sm text-neutral-300 leading-relaxed">{expert.bio.summary}</p>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Career Distinctions & Advisory Milestones
              </h4>
              <ul className="space-y-2.5">
                {expert.bio.careerHighlights.map((item, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-neutral-300 flex items-start gap-3">
                    <span className="text-cyan-400 font-bold shrink-0 mt-0.5">▪</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Foundational Theoretical Formulations
              </h4>
              <ul className="space-y-2.5">
                {expert.bio.theoreticalContributions.map((contrib, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-neutral-300 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{contrib}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Selected Landmark Publications */}
        <section id="publications-section" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold text-neutral-100">Selected Landmark Publications</h2>
            </div>
            <span className="text-xs font-mono text-neutral-400">Peer-Reviewed Literature</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {expert.selectedPublications.map((pub, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="text-cyan-400 font-semibold">{pub.journal}</span>
                    <span>{pub.year}</span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-100 leading-snug">{pub.title}</h4>
                </div>

                <div className="pt-3 border-t border-neutral-800 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
                  <span>{pub.citations} Citations</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Standard Advisory Engagements */}
        <section id="advisory-services-section" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <h2 className="text-2xl font-bold text-neutral-100">Advisory Engagements & Service Scopes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {expert.advisoryServices.map((service, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <span className="text-xs font-mono text-cyan-400 font-semibold">{service.name}</span>
                  <p className="text-xs text-neutral-300 leading-relaxed">{service.deliverable}</p>
                </div>

                <div className="pt-3 border-t border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                  <span>Typical Duration:</span>
                  <span className="text-neutral-200 font-semibold">{service.typicalDuration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Request Call Action Section */}
        <section
          id="call-request-section"
          className="p-8 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden text-center space-y-4"
        >
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl font-bold text-neutral-100">
              Request an Advisory Briefing with {expert.name}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Inquire regarding technical due diligence commissions, architecture audits, or scientific advisory
              board appointments through NEXORA&apos;s verified fellow network.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`mailto:advisory@nexora.intelligence?subject=Advisory Request for ${encodeURIComponent(
                  expert.name
                )} via NEXORA`}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Schedule Confidential Call</span>
              </a>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-5 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
              >
                Save Expert to Monitor
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer
        id="expert-footer"
        className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-400 mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span className="text-neutral-300 font-semibold">{expert.name} Profile</span>
            <span className="text-neutral-500">· Node {expert.id}</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-neutral-400">Verified by NEXORA Academic Integrity Council</span>
            <span>&copy; {new Date().getFullYear()} NEXORA Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
