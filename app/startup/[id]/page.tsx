import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
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
  FileCheck,
} from 'lucide-react';

interface StartupProfile {
  id: string;
  name: string;
  headline: string;
  category: string;
  stage: string;
  fundingRaised: string;
  trl: number;
  trlStage: string;
  location: string;
  foundedYear: number;
  teamSize: string;
  leadInstitution: string;
  problem: {
    title: string;
    summary: string;
    bottlenecks: string[];
  };
  solution: {
    title: string;
    summary: string;
    architecturalHighlights: string[];
    empiricalMetrics: { label: string; value: string; context: string }[];
  };
  patentsAndPublications: {
    patents: { title: string; id: string; jurisdiction: string; status: string }[];
    publications: { title: string; journal: string; year: number; citations: number }[];
  };
  lookingFor: {
    category: string;
    description: string;
    urgency: 'Immediate' | 'Open Horizon' | 'Target Q4';
  }[];
  keyPersonnel: { name: string; role: string; background: string }[];
}

const STARTUPS_DATABASE: Record<string, StartupProfile> = {
  'startup-aetherion': {
    id: 'startup-aetherion',
    name: 'Aetherion Dynamics',
    headline: 'High-Altitude Pseudo-Satellite Platforms Governed by Edge-Swarm Autonomy',
    category: 'Autonomous Aerospace & Swarm AI',
    stage: 'Series A ($18.5M)',
    fundingRaised: '$18.5 Million',
    trl: 7,
    trlStage: 'Operational Demonstration in Representative Setting',
    location: 'Toulouse, France',
    foundedYear: 2022,
    teamSize: '34 Full-Time Engineers & Roboticists',
    leadInstitution: 'ISAE-SUPAERO & ONERA Aerospace Lab Spinout',
    problem: {
      title: 'Stratospheric Endurance Degradation & Centralized Link Fragility',
      summary:
        'Conventional stratospheric pseudo-satellites (HAPS) suffer catastrophic loss during jetstream turbulence and rely on centralized ground links that fail in contested or high-latitude environments. Traditional solar airframes cannot maintain persistent station-keeping without unsustainable battery weight penalties.',
      bottlenecks: [
        'Single-aircraft ground tracking latency exceeds 1,200 ms in low-bandwidth disaster corridors.',
        'Airframe structural failure under 65+ knot crosswind shears at the tropopause boundary.',
        'Battery mass fractions (>45% of gross takeoff weight) restrict sensor payload budgets to under 10 kg.',
      ],
    },
    solution: {
      title: 'Decentralized Formation Aerodynamics & Multi-Agent Swarm Consensus',
      summary:
        'Aetherion deploys distributed constellations of ultra-light carbon-composite solar gliders that coordinate via decentralized Byzantine-fault-tolerant mesh networks. Dynamic wake-surfing algorithms reduce collective aerodynamic drag by 28%, enabling continuous 60+ day stratospheric endurance with 35 kg multispectral sensor payloads.',
      architecturalHighlights: [
        'Autonomous localized wake-surfing formation control yielding 28% net aerodynamic drag reduction.',
        'Asynchronous gossip-based mesh protocol operating reliably with up to 60% intermittent packet drop.',
        'Flexible gallium arsenide (GaAs) triple-junction solar skin achieving 32.4% photovoltaic conversion.',
        'Triple-redundant fly-by-wire flight control with zero-trust distributed obstacle avoidance.',
      ],
      empiricalMetrics: [
        { label: 'Continuous Endurance', value: '62 Days', context: 'Validated at 68,000 ft altitude' },
        { label: 'Effective Payload', value: '35 kg', context: 'Triple optical & SAR radar arrays' },
        { label: 'Formational Drag Delta', value: '-28.4%', context: 'Multi-aircraft vortex capture' },
        { label: 'Link Latency', value: '18 ms', context: 'Localized peer-to-peer RF interlink' },
      ],
    },
    patentsAndPublications: {
      patents: [
        {
          title: 'Decentralized Wake-Surfing Flight Control for Multi-Agent Solar Airframes',
          id: 'EP4192801A1',
          jurisdiction: 'European Patent Office (EPO)',
          status: 'Granted',
        },
        {
          title: 'Byzantine Fault-Tolerant Consensus Protocol for GPS-Denied Swarm Localization',
          id: 'PCT/FR2023/051289',
          jurisdiction: 'WIPO International',
          status: 'Published',
        },
        {
          title: 'Ultra-Lightweight Elastomeric Carbon Wing Spar with Integrated Photovoltaic Bus',
          id: 'US20240081290',
          jurisdiction: 'USPTO',
          status: 'Under Examination',
        },
      ],
      publications: [
        {
          title: 'Stratospheric Multi-Agent Station-Keeping via Non-Linear Model Predictive Control',
          journal: 'AIAA Journal of Guidance, Control, and Dynamics',
          year: 2024,
          citations: 84,
        },
        {
          title: 'Distributed State Estimation in Intermittently Connected Aerodynamic Networks',
          journal: 'IEEE Transactions on Robotics (T-RO)',
          year: 2023,
          citations: 128,
        },
      ],
    },
    lookingFor: [
      {
        category: 'Commercial Co-Development / OEM Pilot',
        description: 'Defense and civilian aerospace prime contractors for Arctic maritime border surveillance pilots.',
        urgency: 'Immediate',
      },
      {
        category: 'Series B Lead Investment',
        description: 'Targeting $35M round to scale composite airframe production and expand European manufacturing lines.',
        urgency: 'Target Q4',
      },
      {
        category: 'Radiation-Hardened Edge Compute Hardware',
        description: 'Silicon foundry partners providing ultra-low-power neuromorphic inference silicon for onboard telemetry.',
        urgency: 'Open Horizon',
      },
    ],
    keyPersonnel: [
      {
        name: 'Dr. Martin Lemaire',
        role: 'Co-Founder & CEO',
        background: 'Former Flight Dynamics Lead at Airbus UpNext; PhD in Aeroelasticity from ISAE-SUPAERO.',
      },
      {
        name: 'Camille Dubois',
        role: 'Co-Founder & CTO',
        background: 'Ex-ONERA Swarm Robotics Researcher; Lead Architect of decentralized consensus protocols.',
      },
      {
        name: 'Dr. Henrik Lindqvist',
        role: 'VP of Propulsion & Energy Systems',
        background: '12 years in high-altitude photovoltaic array engineering at ESA solar satellite programs.',
      },
    ],
  },
  'startup-synthosyn': {
    id: 'startup-synthosyn',
    name: 'SynthoSyn Bio',
    headline: 'Generative Protein Engineering Platforms for Thermal-Resilient Industrial Biocatalysts',
    category: 'Generative Protein Engineering & Synthetic Biology',
    stage: 'Seed ($6.2M)',
    fundingRaised: '$6.2 Million',
    trl: 6,
    trlStage: 'System Prototype Validated in Laboratory',
    location: 'Basel, Switzerland',
    foundedYear: 2023,
    teamSize: '22 Computational Biologists & Crystallographers',
    leadInstitution: 'Biozentrum University of Basel & ETH Zurich Spinout',
    problem: {
      title: 'In Vitro Enzyme Degradation under Industrial High-Heat Reaction Envelopes',
      summary:
        'Industrial chemical synthesis consumes billions in energy because natural enzymes denature and lose catalytic activity above 45°C. Traditional directed evolution requires years of wet-lab screening cycles with failure rates exceeding 98%.',
      bottlenecks: [
        'Thermodynamic denaturation of wild-type enzymes at standard industrial reactor temperatures (>60°C).',
        'Direct evolution screening throughput is physically capped at ~10⁴ mutants per campaign.',
        'High organic solvent toxicity halts biological enzymatic digestion of polymer plastics.',
      ],
    },
    solution: {
      title: 'Diffusion-Guided Protein Backbone Optimization & Thermostability Inpainting',
      summary:
        'SynthoSyn utilizes structure-conditioned SE(3)-equivariant generative diffusion models to redesign non-catalytic protein loops, inserting buried hydrophobic salt bridges that increase melting temperatures (Tm) by up to 38°C without impairing catalytic active site kinetics.',
      architecturalHighlights: [
        'SE(3)-equivariant geometric diffusion models conditioning on atomic resolution transition states.',
        'Zero-shot thermostability prediction predicting stability deltas (ΔΔG) within 0.4 kcal/mol accuracy.',
        'High-throughput microfluidic droplets screening 10⁶ computational candidates per 24-hour cycle.',
        'Verified in vivo expression across both Pichia pastoris and engineered E. coli industrial strains.',
      ],
      empiricalMetrics: [
        { label: 'Thermal Melting Delta (ΔTm)', value: '+38.5°C', context: 'Operational up to 88°C in continuous stir reactors' },
        { label: 'Catalytic Turnaround', value: '4,800 s⁻¹', context: '1.4x higher kcat than native wild-type' },
        { label: 'Solvent Tolerance', value: '45% DMF / DMSO', context: 'No loss of quaternary conformation' },
        { label: 'Synthesis Lead Time', value: '14 Days', context: 'From target sequence to purified microgram test' },
      ],
    },
    patentsAndPublications: {
      patents: [
        {
          title: 'Diffusion-Guided Geometric Inpainting for Thermally Stabilized Hydrolase Enzymes',
          id: 'WO2024098231',
          jurisdiction: 'WIPO International',
          status: 'Published',
        },
        {
          title: 'Engineered PET Depolymerase Variants with Elevated Glass-Transition Kinetic Rates',
          id: 'EP4210982A1',
          jurisdiction: 'European Patent Office',
          status: 'Under Examination',
        },
      ],
      publications: [
        {
          title: 'De Novo Computational Design of Ultra-Thermostable Plastic Recycling Hydrolases',
          journal: 'Nature Biotechnology',
          year: 2024,
          citations: 164,
        },
        {
          title: 'Equivariant Graph Neural Networks for Transition State Conformational Ensembles',
          journal: 'ACS Synthetic Biology',
          year: 2023,
          citations: 92,
        },
      ],
    },
    lookingFor: [
      {
        category: 'Chemical OEM Pilot Partners',
        description: 'Multi-ton polymer recycling facilities seeking biocatalytic depolymerization pilots for PET/PU.',
        urgency: 'Immediate',
      },
      {
        category: 'Series A Investment Syndicate',
        description: 'Raising $18M Series A to construct an automated robotic high-throughput foundry in Basel.',
        urgency: 'Target Q4',
      },
      {
        category: 'Industrial Fermentation Capacity',
        description: 'Access to 1,000L to 10,000L pilot bioreactors for GMP protein expression validation.',
        urgency: 'Open Horizon',
      },
    ],
    keyPersonnel: [
      {
        name: 'Dr. Beatrice Vögel',
        role: 'Co-Founder & Chief Scientist',
        background: 'Former Novartis Protein Science fellow; PhD in Structural Biology from ETH Zurich.',
      },
      {
        name: 'Noah Althaus',
        role: 'Co-Founder & CEO',
        background: 'Former Deep-Tech VC partner; led biotechnology licensing at Basel Innovation Transfer.',
      },
    ],
  },
};

function generateDynamicStartup(id: string): StartupProfile {
  const formattedName = id
    .replace(/^startup-/, '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id,
    name: `${formattedName} Dynamics`,
    headline: `Next-Generation Deep-Tech Commercialization and Engineering Lab for ${formattedName}`,
    category: 'Frontier Systems & Deep-Tech Hardware',
    stage: 'Seed / Series A',
    fundingRaised: '$7.5 Million',
    trl: 6,
    trlStage: 'System Prototype Validated in Relevant Environment',
    location: 'Zurich, Switzerland',
    foundedYear: 2023,
    teamSize: '18 Engineers & Scientists',
    leadInstitution: 'European Deep-Tech Institute Spinout',
    problem: {
      title: `Engineering Scalability and Efficiency Limits in ${formattedName}`,
      summary: `Legacy methodologies encounter severe energy dissipation, throughput caps, and manual fabrication constraints when operating in the ${formattedName.toLowerCase()} domain.`,
      bottlenecks: [
        'High cost per unit throughput under incumbent manufacturing techniques.',
        'Thermal dissipation barriers preventing miniaturization and dense subsystem packaging.',
        'Strict regulatory qualification hurdles requiring empirical field verification.',
      ],
    },
    solution: {
      title: `Proprietary Modular Architecture and Sub-Tolerance Optimization`,
      summary: `Our engineering platform eliminates the primary throughput bottleneck by integrating algorithmic real-time feedback with proprietary physical substrates, achieving superior mechanical and electrical metrics.`,
      architecturalHighlights: [
        'Proprietary hardware-software co-design with sub-millisecond control loops.',
        'Integrated sensory telemetry yielding continuous drift compensation.',
        'Modular industrial interconnects compatible with global tier-1 standards.',
        'High-density packaging minimizing parasitic capacitive and thermal losses.',
      ],
      empiricalMetrics: [
        { label: 'Throughput Gain', value: '+42.5%', context: 'Empirically tested against industry baselines' },
        { label: 'Energy Consumption', value: '-38.0%', context: 'Continuous operational benchmark' },
        { label: 'MTBF Rating', value: '35,000 Hrs', context: 'High-reliability industrial rating' },
        { label: 'Response Latency', value: '1.2 ms', context: 'Real-time deterministic execution' },
      ],
    },
    patentsAndPublications: {
      patents: [
        {
          title: `System and Method for Automated Subsystem Control in ${formattedName}`,
          id: 'PCT/EP2024/091234',
          jurisdiction: 'WIPO International',
          status: 'Published',
        },
      ],
      publications: [
        {
          title: `Empirical Characterization of High-Performance Modular ${formattedName} Architectures`,
          journal: 'IEEE Journal of Selected Topics in Deep Tech',
          year: 2024,
          citations: 45,
        },
      ],
    },
    lookingFor: [
      {
        category: 'Corporate Pilot Partnership',
        description: 'Tier-1 enterprise testing partners seeking operational validation and evaluation units.',
        urgency: 'Immediate',
      },
      {
        category: 'Series A Venture Financing',
        description: 'Syndicate lead for upcoming institutional funding round to build assembly lines.',
        urgency: 'Target Q4',
      },
    ],
    keyPersonnel: [
      {
        name: 'Dr. Evelyn Brand',
        role: 'Founder & CEO',
        background: '14 years leading deep-tech hardware transitions from university laboratory to series production.',
      },
      {
        name: 'Marcus Thorne',
        role: 'Chief Technology Officer',
        background: 'Specialist in precision system integration and high-speed embedded architectures.',
      },
    ],
  };
}

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const startup = STARTUPS_DATABASE[id] || generateDynamicStartup(id);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Sticky Header */}
      <header
        id="startup-header"
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
              <span className="text-neutral-500">Startup Dossier:</span>
              <span className="text-cyan-400 font-semibold">{startup.name}</span>
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
              Corporate Challenges
            </Link>

            <a
              id="btn-contact-founders"
              href="#contact-dialog"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Team</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Top Hero Section */}
        <section id="startup-hero" className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              {startup.category}
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
              {startup.stage}
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              TRL {startup.trl} · {startup.trlStage}
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-100 leading-tight">
              {startup.name}
            </h1>
            <p className="text-base sm:text-lg text-neutral-300 max-w-4xl leading-relaxed">
              {startup.headline}
            </p>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-neutral-400" />
                <span>Headquarters</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-200">{startup.location}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-neutral-400" />
                <span>Spinout Origin</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-200 truncate">
                {startup.leadInstitution}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-neutral-400" />
                <span>Capital Raised</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-cyan-300 font-mono">
                {startup.fundingRaised}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-neutral-400" />
                <span>Team & Scale</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-200">
                {startup.teamSize} (Est. {startup.foundedYear})
              </div>
            </div>
          </div>
        </section>

        {/* Problem & Solution Grid */}
        <section id="problem-solution-section" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* The Problem */}
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  The Industrial Bottleneck
                </span>
                <span className="text-[11px] font-mono text-neutral-400">Problem Framing</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-neutral-100 leading-snug">
                {startup.problem.title}
              </h3>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {startup.problem.summary}
              </p>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono text-neutral-400">Critical Pain Points:</div>
                <ul className="space-y-2">
                  {startup.problem.bottlenecks.map((item, idx) => (
                    <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2.5">
                      <span className="text-rose-400 font-bold shrink-0 mt-0.5">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* The Solution */}
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  The Proprietary Solution
                </span>
                <span className="text-[11px] font-mono text-neutral-400">Deep-Tech Breakthrough</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-neutral-100 leading-snug">
                {startup.solution.title}
              </h3>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {startup.solution.summary}
              </p>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono text-neutral-400">Key Architectural Pillars:</div>
                <ul className="space-y-2">
                  {startup.solution.architecturalHighlights.map((item, idx) => (
                    <li key={idx} className="text-xs text-neutral-200 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Solution Empirical Performance Metrics */}
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Empirical Validation Telemetry
              </h4>
              <span className="text-[10px] font-mono text-neutral-400">Independent Lab Validated</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {startup.solution.empiricalMetrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1"
                >
                  <div className="text-xs font-mono text-neutral-400">{metric.label}</div>
                  <div className="text-2xl font-bold font-mono text-cyan-300">{metric.value}</div>
                  <div className="text-[11px] text-neutral-400 leading-snug">{metric.context}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Patents & Publications */}
        <section id="patents-publications-section" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold text-neutral-100">Patents & Peer-Reviewed Publications</h2>
            </div>
            <span className="text-xs font-mono text-neutral-400">Audited IP Portfolio</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patents Column */}
            <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>Intellectual Property & Filed Patents</span>
              </h3>

              <div className="space-y-3">
                {startup.patentsAndPublications.patents.map((pat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{pat.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {pat.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-neutral-200">{pat.title}</h4>
                    <div className="text-[11px] font-mono text-neutral-500">{pat.jurisdiction}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Publications Column */}
            <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Peer-Reviewed Literature & Citations</span>
              </h3>

              <div className="space-y-3">
                {startup.patentsAndPublications.publications.map((pub, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-neutral-400">
                      <span className="text-cyan-400 font-semibold">{pub.journal}</span>
                      <span>{pub.year}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-neutral-200">{pub.title}</h4>
                    <div className="text-[11px] font-mono text-emerald-400">
                      {pub.citations} Academic Citations
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Looking For / Partnership Needs */}
        <section id="looking-for-section" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold text-neutral-100">Partnership Inquiries & Resource Needs</h2>
            </div>
            <span className="text-xs font-mono text-neutral-400">Active Requests</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {startup.lookingFor.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-cyan-400 font-semibold">{item.category}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        item.urgency === 'Immediate'
                          ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                          : item.urgency === 'Target Q4'
                          ? 'bg-amber-950/80 border border-amber-800 text-amber-300'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{item.description}</p>
                </div>

                <a
                  href="#contact-dialog"
                  className="inline-flex items-center justify-between pt-3 border-t border-neutral-800 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span>Inquire on this requirement</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Founding & Engineering Leadership */}
        <section id="leadership-section" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-2xl font-bold text-neutral-100">Founding & Technical Leadership</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {startup.keyPersonnel.map((person, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2"
              >
                <div className="text-xs font-mono text-cyan-400">{person.role}</div>
                <h4 className="text-sm font-bold text-neutral-100">{person.name}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">{person.background}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Team Action Section */}
        <section
          id="contact-dialog"
          className="p-8 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden text-center space-y-4"
        >
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl font-bold text-neutral-100">
              Initiate Discussion with {startup.name}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Connect directly with executive leadership under NEXORA bilateral non-disclosure protocols
              to explore pilot integration, co-development JDAs, or investment allocation.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`mailto:inquiries@nexora.intelligence?subject=Inquiry regarding ${encodeURIComponent(
                  startup.name
                )} via NEXORA`}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Founding Team</span>
              </a>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-5 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
              >
                Save to AI Scout Monitor
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer
        id="startup-footer"
        className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-400 mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="text-neutral-300 font-semibold">{startup.name} Dossier</span>
            <span className="text-neutral-500">· Node {startup.id}</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-neutral-400">Dossier Verified by NEXORA Research Desk</span>
            <span>&copy; {new Date().getFullYear()} NEXORA Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
