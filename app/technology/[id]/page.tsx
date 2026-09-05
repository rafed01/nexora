import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  CheckCircle2,
  Layers,
  Cpu,
  Activity,
  TrendingUp,
  Target,
  Building2,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  FileText,
  Clock,
  Award,
  ChevronRight,
  Download,
  Mail,
  Flame,
  BarChart3,
  Network,
} from 'lucide-react';

interface TechnologyDetail {
  id: string;
  title: string;
  category: string;
  trl: number;
  trlStage: string;
  organization: string;
  location: string;
  ipStatus: string;
  patentCount: number;
  readinessTimeline: string;
  heroSummary: string;
  technicalOverview: {
    description: string;
    physicsPrinciples: string[];
    breakthroughMetrics: { label: string; value: string; baseline: string }[];
    specifications: { key: string; value: string }[];
  };
  trlBreakdown: {
    level: number;
    title: string;
    description: string;
    status: 'completed' | 'current' | 'future';
    verifiedBy?: string;
  }[];
  marketRelevance: {
    tam: string;
    cagr: string;
    horizonYear: string;
    commercialDrivers: string[];
    barriersToEntry: string[];
    investmentClimate: string;
  };
  targetApplications: {
    domain: string;
    useCase: string;
    impact: string;
    urgency: 'Critical' | 'High' | 'Moderate';
  }[];
  linkedEcosystem: {
    startups: { name: string; stage: string; focus: string; location: string }[];
    labs: { name: string; institute: string; lead: string }[];
    experts: { name: string; title: string; organization: string; citationCount: string }[];
    challenges: { title: string; sponsor: string; budget: string; deadline: string }[];
  };
}

const TECHNOLOGIES_DATABASE: Record<string, TechnologyDetail> = {
  'tech-photonic-mpu': {
    id: 'tech-photonic-mpu',
    title: 'Photonic Matrix Processing Unit (P-MPU)',
    category: 'Optical Computing & Tensor Acceleration',
    trl: 6,
    trlStage: 'System Prototype Validated in Relevant Environment',
    organization: 'NEXORA Optoelectronics Core / IMEC Consortium',
    location: 'Munich, Germany & Leuven, Belgium',
    ipStatus: '8 Core Patents Granted (PCT International)',
    patentCount: 8,
    readinessTimeline: 'Pilot Tapeout 2025 · Hyperscale Deployment 2027',
    heroSummary:
      'Sub-picosecond optical interference tensor processor executing dense matrix arithmetic at lightspeed with negligible thermal dissipation and native silicon photonic foundry compatibility.',
    technicalOverview: {
      description:
        'The Photonic Matrix Processing Unit replaces electrical capacitive trace transitions with coherent Mach-Zehnder interferometer (MZI) meshes. Optical phase modulation performs vector-matrix dot products in analog continuous time (0.18 ns travel time across waveguide core), consuming under 0.05 pJ per multiply-accumulate (MAC) operation.',
      physicsPrinciples: [
        'Coherent Light Interference (Mach-Zehnder Lattice)',
        'Thermo-Optic and Electro-Optic Phase Modulation',
        'Co-Packaged Optical (CPO) Silicon Waveguides (1550 nm C-Band)',
        'Heterogeneous III-V on Silicon Continuous Wave Distributed Feedback Laser',
      ],
      breakthroughMetrics: [
        { label: 'Compute Efficiency', value: '42.8 TOPS/W', baseline: 'vs. 4.2 TOPS/W for 4nm GPU' },
        { label: 'Latency per Tile', value: '0.18 ns', baseline: 'vs. 2.40 ns for electronic SRAM' },
        { label: 'Thermal Output', value: '-87%', baseline: 'Eliminates cryogenic/high-flow chillers' },
        { label: 'Optical Modulation', value: '112 Gbps/waveguide', baseline: 'PAM-4 encoding certified' },
      ],
      specifications: [
        { key: 'Optical Waveband', value: '1530 nm - 1565 nm (ITU-T C-Band standard)' },
        { key: 'Foundry PDK', value: 'IMEC iSiPP300 Silicon Photonics Platform' },
        { key: 'Host Interconnect', value: 'PCIe Gen 5 / CXL 3.0 Optical Interposer Bridge' },
        { key: 'Package Architecture', value: '2.5D Heterogeneous Co-Packaged Optics (CPO)' },
        { key: 'Operating Temperature', value: '15°C to 95°C without frequency thermal throttling' },
      ],
    },
    trlBreakdown: [
      {
        level: 1,
        title: 'Basic Principles Observed',
        description: 'Analytical modeling of optical matrix transformations using unitary matrix decomposition.',
        status: 'completed',
        verifiedBy: 'Max Planck Quantum Optics',
      },
      {
        level: 2,
        title: 'Technology Concept Formulated',
        description: 'Design of Mach-Zehnder interferometer mesh layout and electro-optic phase-shifter architecture.',
        status: 'completed',
        verifiedBy: 'TU Munich Photonics Lab',
      },
      {
        level: 3,
        title: 'Analytical & Experimental Proof of Concept',
        description: 'Fabrication of single-cell MZI with sub-picosecond phase shift modulation in silicon waveguide.',
        status: 'completed',
        verifiedBy: 'Fraunhofer HHI Berlin',
      },
      {
        level: 4,
        title: 'Component Validation in Laboratory',
        description: '16x16 optical tensor core demonstrated with 99.4% computational mathematical fidelity.',
        status: 'completed',
        verifiedBy: 'IMEC Advanced Prototyping',
      },
      {
        level: 5,
        title: 'Component Validation in Relevant Environment',
        description: 'Optical core paired with custom electronic DAC/ADC interfaces and optical laser arrays.',
        status: 'completed',
        verifiedBy: 'NEXORA Engineering Fab',
      },
      {
        level: 6,
        title: 'System Prototype in Relevant Environment',
        description: 'Full-rack PCIe form factor operating real-world transformer attention token generation benchmarks.',
        status: 'current',
        verifiedBy: 'CERN OpenLab / EuroHPC Joint Undertaking',
      },
      {
        level: 7,
        title: 'Operational Environment Demonstration',
        description: 'Multi-node hyperscale server cluster validation under continuous 24/7 commercial SLA workload.',
        status: 'future',
      },
      {
        level: 8,
        title: 'System Complete and Qualified',
        description: 'Final packaging tapeout qualification passing AEC-Q100 thermal shock and vibration standards.',
        status: 'future',
      },
      {
        level: 9,
        title: 'Actual System Proven in Operational Environment',
        description: 'High-volume tapeout with global tier-1 cloud datacenter deployments.',
        status: 'future',
      },
    ],
    marketRelevance: {
      tam: '$14.2 Billion',
      cagr: '41.5% through 2030',
      horizonYear: '2027 Commercial Inflection',
      commercialDrivers: [
        'Hyperscale AI datacenter power wall: electrical GPUs hit 1,000W+ per socket, exhausting grid capacity.',
        'Copper interconnect attenuation limits electrical transmission distances to <1 meter at 224 Gbps.',
        'Urgent demand for sub-millisecond LLM reasoning inference in autonomous vehicles and financial engines.',
      ],
      barriersToEntry: [
        'Complex foundry packaging: Requires precision sub-micron pick-and-place for laser-to-waveguide coupling.',
        'Laser thermal sensitivity: Demands continuous micro-ring resonance wavelength locking circuits.',
      ],
      investmentClimate: 'High Institutional Urgency: 14 European and North American tier-1 VC funds actively deploying.',
    },
    targetApplications: [
      {
        domain: 'Hyperscale AI Inference',
        useCase: 'Zero-latency matrix multiplications for frontier generative transformer architectures and vision engines.',
        impact: 'Reduces datacenter power requirements by up to 68% for deep inference workloads.',
        urgency: 'Critical',
      },
      {
        domain: 'Aerospace & Defense Avionics',
        useCase: 'Immune to electromagnetic pulse (EMP) interference and high-frequency radar signal processing.',
        impact: 'Eliminates heavy copper coaxial cabling in unmanned supersonic aerial systems.',
        urgency: 'High',
      },
      {
        domain: 'Real-Time Edge Robotics',
        useCase: 'High-speed SLAM and obstacle classification inside 15W localized edge compute envelopes.',
        impact: 'Enables micro-drones to compute dense depth meshes at 2,000 FPS without battery drain.',
        urgency: 'Moderate',
      },
    ],
    linkedEcosystem: {
      startups: [
        {
          name: 'LuminaPhotonics Core',
          stage: 'Series A ($14.2M)',
          focus: 'Co-packaged optics laser micro-transceivers',
          location: 'Eindhoven, Netherlands',
        },
        {
          name: 'OpticTensor Labs',
          stage: 'Seed ($4.5M)',
          focus: 'Optical compiler toolchains for PyTorch & JAX',
          location: 'Cambridge, UK',
        },
      ],
      labs: [
        {
          name: 'Silicon Photonic Packaging Group',
          institute: 'IMEC Leuven',
          lead: 'Prof. Hendrik van Deventer',
        },
        {
          name: 'Center for Integrated Quantum Optoelectronics',
          institute: 'TU Munich',
          lead: 'Dr. Elena Rostova',
        },
      ],
      experts: [
        {
          name: 'Dr. Elena Rostova',
          title: 'Principal Investigator & Fellow',
          organization: 'Max Planck Institute / NEXORA Advisory',
          citationCount: '12,400+ Citations · h-index 54',
        },
        {
          name: 'Dr. Julian Vane',
          title: 'Chief Optical Architect',
          organization: 'EuroHPC Optical Hardware Taskforce',
          citationCount: '6,800+ Citations · 19 Patents',
        },
      ],
      challenges: [
        {
          title: 'Sub-Femtojoule Optical Transceivers for AI Clusters',
          sponsor: 'Helios Hyperscale Cloud Infrastructure Group',
          budget: '$750,000 JDA Allocation',
          deadline: 'Dec 15, 2026',
        },
        {
          title: 'AEC-Q100 Compliant Silicon Waveguide Coupler Pilot',
          sponsor: 'AeroSynthetix Defense Systems',
          budget: '€400,000 Paid Pilot',
          deadline: 'Jan 20, 2027',
        },
      ],
    },
  },
  'tech-solid-state-electrolyte': {
    id: 'tech-solid-state-electrolyte',
    title: 'High-Purity Argyrodite Solid Electrolyte',
    category: 'Advanced Energy Storage & Materials',
    trl: 7,
    trlStage: 'System Prototype Demonstration in Operational Environment',
    organization: 'Kyoto Materials Innovation Lab / Novavolt Alliance',
    location: 'Kyoto, Japan & Stuttgart, Germany',
    ipStatus: '14 Core Patents Filed across WIPO & USPTO',
    patentCount: 14,
    readinessTimeline: 'Automotive Pilot Cells 2026 · Gigafactory Integration 2028',
    heroSummary:
      'Engineered sulfide crystal matrix (Li₆PS₅Cl) with tailored grain boundary passivation, exhibiting 14.2 mS/cm room-temperature ionic conductivity and preventing dendrite short-circuiting under extreme fast charging.',
    technicalOverview: {
      description:
        'This argyrodite-class solid electrolyte employs chloride-doping and vacuum-annealed nano-crystallites to eliminate liquid electrolyte flammability. The solid matrix facilitates pure lithium metal anodes, boosting pack-level volumetric energy density to over 950 Wh/L while sustaining 12C extreme fast-charging pulses.',
      physicsPrinciples: [
        'Superionic Crystal Lattice Conduction (Li-Ion Vacancy Hopping)',
        'Interfacial Elastic Modulus Tuning (Shear Modulus >8.5 GPa prevents dendrites)',
        'Solvent-Free Dry Roll-to-Roll Electrode Calendaring',
        'Chemical Passivation against High-Nickel Cathode Reduction Reactions',
      ],
      breakthroughMetrics: [
        { label: 'Ionic Conductivity', value: '14.2 mS/cm', baseline: 'Liquid baseline ~10.0 mS/cm' },
        { label: 'Cycle Longevity', value: '92% @ 1,400 cycles', baseline: '450 Wh/kg full pouch format' },
        { label: 'Thermal Safety', value: 'No Thermal Runaway', baseline: 'Passes 100% nail penetration' },
        { label: 'Charge Speed', value: '10% to 80% in 9 mins', baseline: 'Tested at -20°C and 45°C ambient' },
      ],
      specifications: [
        { key: 'Stoichiometry', value: 'Li₆₋ₓPS₅₋ₓCl₁₊ₓ (Engineered Argyrodite)' },
        { key: 'Particle Size Distribution (D50)', value: '1.8 μm nano-milled dry powder' },
        { key: 'Electrochemical Window', value: '0.0 V to 5.2 V vs. Li/Li⁺' },
        { key: 'Mechanical Yield Strength', value: '65 MPa compressive yield threshold' },
        { key: 'Separator Thickness', value: '18 μm uniform dry-coated membrane' },
      ],
    },
    trlBreakdown: [
      {
        level: 1,
        title: 'Basic Principles Observed',
        description: 'First-principles DFT calculation of lithium ion migration barrier energies.',
        status: 'completed',
        verifiedBy: 'Kyoto University Physics Dept',
      },
      {
        level: 2,
        title: 'Technology Concept Formulated',
        description: 'Synthesis routes for halogenated sulfide argyrodite crystals established.',
        status: 'completed',
        verifiedBy: 'Kyoto Materials Innovation Lab',
      },
      {
        level: 3,
        title: 'Experimental Proof of Concept',
        description: 'Swagelok laboratory coin cells demonstrated room-temperature superionic conductivity.',
        status: 'completed',
        verifiedBy: 'AIST National Laboratory',
      },
      {
        level: 4,
        title: 'Component Validation in Laboratory',
        description: 'Multi-layer pouch cell cycles 500 times with lithium metal foil anode.',
        status: 'completed',
        verifiedBy: 'Fraunhofer Battery Alliance',
      },
      {
        level: 5,
        title: 'Validation in Relevant Environment',
        description: 'Roll-to-roll dry powder spraying validated at 10 meters/minute continuous web speed.',
        status: 'completed',
        verifiedBy: 'Novavolt Powertrain Pilot Fab',
      },
      {
        level: 6,
        title: 'System Prototype Demonstration',
        description: '50 Ah automotive prototype pouch cells pass UNECE R100 mechanical integrity tests.',
        status: 'completed',
        verifiedBy: 'TÜV Rheinland Testing',
      },
      {
        level: 7,
        title: 'Operational Environment Demonstration',
        description: 'Integration into experimental EV powertrain module; cold-weather road testing ongoing.',
        status: 'current',
        verifiedBy: 'Stuttgart Mobility Consortia',
      },
      {
        level: 8,
        title: 'System Qualified & Production Line Ready',
        description: 'Turnkey dry-coating machinery integrated into gigafactory cleanroom lines.',
        status: 'future',
      },
      {
        level: 9,
        title: 'Commercial Scale Proof',
        description: 'Serial production rollout across automotive OEM vehicle models.',
        status: 'future',
      },
    ],
    marketRelevance: {
      tam: '$28.6 Billion',
      cagr: '38.2% through 2032',
      horizonYear: '2028 Mass Automotive Commercialization',
      commercialDrivers: [
        'Automotive OEM 1,000 km range mandates without increasing pack curb weight.',
        'Stringent global safety directives forbidding combustible organic solvents in urban transit.',
        'Fast-charge infrastructure demands: Reducing charge wait times to equal conventional petrol refueling.',
      ],
      barriersToEntry: [
        'Sulfide moisture reactivity: Requires dry room environments with dew points below -50°C during cell assembly.',
        'High interface impedance: Requires precision stack pressure mechanisms (1-5 MPa) in pack enclosures.',
      ],
      investmentClimate: 'High Corporate Sponsor Demand: Over $4.2B committed in OEM joint ventures.',
    },
    targetApplications: [
      {
        domain: 'Long-Range Electric Vehicles',
        useCase: 'Premium passenger EVs achieving 1,000 km range with non-flammable structural battery packs.',
        impact: 'Extends gravimetric pack energy to 450 Wh/kg while doubling vehicle resale lifetime.',
        urgency: 'Critical',
      },
      {
        domain: 'eVTOL Urban Air Mobility',
        useCase: 'Electric aircraft takeoff requiring high specific discharge rates (>8C) without thermal risk.',
        impact: 'Unlocks certified passenger payload ranges exceeding 250 miles between recharges.',
        urgency: 'Critical',
      },
      {
        domain: 'Heavy Duty Freight & Mining Haulers',
        useCase: 'Continuous 24/7 duty cycle hauling requiring 10-minute megawatt flash charging.',
        impact: 'Decarbonizes off-grid mining machinery without downtime.',
        urgency: 'High',
      },
    ],
    linkedEcosystem: {
      startups: [
        {
          name: 'SolidIon Energy Corp.',
          stage: 'Series B ($36M)',
          focus: 'Roll-to-roll dry powder coating machinery',
          location: 'Aachen, Germany',
        },
        {
          name: 'LithoShield Materials',
          stage: 'Seed ($3.8M)',
          focus: 'Lithium metal surface protective artificial SEI coatings',
          location: 'Yokohama, Japan',
        },
      ],
      labs: [
        {
          name: 'Solid-State Electrochemistry Division',
          institute: 'Kyoto Materials Innovation Lab',
          lead: 'Prof. Kenjiro Takahashi',
        },
        {
          name: 'Advanced Powertrain Battery Prototyping',
          institute: 'University of Stuttgart',
          lead: 'Dr. Wolfgang Becker',
        },
      ],
      experts: [
        {
          name: 'Marcus Vance, PhD',
          title: 'Technical Director of Cell Engineering',
          organization: 'Ex-Tesla / Novavolt Powertrain Advisor',
          citationCount: '8,400+ Citations · 26 Patents',
        },
        {
          name: 'Dr. Sachiko Mori',
          title: 'Lead Crystallographer',
          organization: 'Kyoto Materials Lab',
          citationCount: '5,900+ Citations · 14 Patents',
        },
      ],
      challenges: [
        {
          title: 'Dry-Coated Solid-State Separator Scalability Challenge',
          sponsor: 'Novavolt Powertrain Engineering',
          budget: '€450,000 Funded Pilot',
          deadline: 'Nov 15, 2026',
        },
      ],
    },
  },
  'tech-quantum-mitigation': {
    id: 'tech-quantum-mitigation',
    title: 'Tensor-Network Quantum Error Mitigation',
    category: 'Quantum Computing & Algorithms',
    trl: 5,
    trlStage: 'Technology Validated in Relevant Environment',
    organization: 'CERN OpenLab Consortium & University of Geneva',
    location: 'Geneva, Switzerland',
    ipStatus: 'Algorithmic Patent Family & Open-Core Framework',
    patentCount: 6,
    readinessTimeline: 'Cloud SDK Integration 2025 · Hybrid HPC Deployment 2026',
    heroSummary:
      'Real-time algorithmic error mitigation framework using matrix product states (MPS) to suppress phase-flip noise and coherent cross-talk on 127+ qubit superconducting quantum processors.',
    technicalOverview: {
      description:
        'This software-hardware hybrid framework intercepts quantum circuit execution on noisy intermediate-scale quantum (NISQ) processors. By executing tensor-network predictive noise modeling alongside zero-noise extrapolation (ZNE), the compiler recovers noise-free expectation values without requiring millions of physical ancilla qubits.',
      physicsPrinciples: [
        'Matrix Product State (MPS) Tensor Decomposition',
        'Dynamical Decoupling Pulse Sequence Shaping',
        'Zero-Noise Extrapolation (ZNE) Polynomial Inversion',
        'Coherent Crosstalk Tomography on Superconducting Transmons',
      ],
      breakthroughMetrics: [
        { label: 'Quantum Fidelity Gain', value: '+34.6%', baseline: 'Tested on 127-qubit IBM Eagle processor' },
        { label: 'Overhead Ratio', value: '1.28x', baseline: 'vs. 1000x for physical surface code QEC' },
        { label: 'Gate Error Reduction', value: '62% Lower', baseline: 'Suppresses 2-qubit CNOT gate drift' },
        { label: 'Sampling Speed', value: '45,000 shots/sec', baseline: 'GPU-accelerated tensor pipeline' },
      ],
      specifications: [
        { key: 'Compiler Pipeline', value: 'Qiskit & Cirq Native OpenQASM 3.0 Middleware' },
        { key: 'Backend Acceleration', value: 'NVIDIA cuQuantum Tensor Core Bridge' },
        { key: 'Supported Qubit Modalities', value: 'Superconducting Transmons, Neutral Atoms, Trapped Ions' },
        { key: 'Max Circuit Depth', value: 'Up to 240 two-qubit entangling layers with <5% variance' },
        { key: 'Target Problem Class', value: 'Molecular Hamiltonian ground-state calculation' },
      ],
    },
    trlBreakdown: [
      {
        level: 1,
        title: 'Basic Principles Observed',
        description: 'Mathematical formulation of tensor-network noise shadows.',
        status: 'completed',
        verifiedBy: 'CERN Quantum Initiative',
      },
      {
        level: 2,
        title: 'Technology Concept Formulated',
        description: 'Algorithmic pipeline for zero-noise extrapolation in chemistry simulation.',
        status: 'completed',
        verifiedBy: 'Univ. of Geneva Physics',
      },
      {
        level: 3,
        title: 'Experimental Proof of Concept',
        description: 'Validated on 5-qubit test processor; demonstrated 20% fidelity improvement.',
        status: 'completed',
        verifiedBy: 'ETH Zurich Quantum Lab',
      },
      {
        level: 4,
        title: 'Component Validation in Laboratory',
        description: 'Benchmarked on 27-qubit Falcon chips with molecular ground state calculation.',
        status: 'completed',
        verifiedBy: 'IBM Quantum Network',
      },
      {
        level: 5,
        title: 'Validation in Relevant Environment',
        description: 'Integrated into European HPC hybrid quantum supercomputing batch queue.',
        status: 'current',
        verifiedBy: 'EuroHPC LUMI-Q Consortia',
      },
      {
        level: 6,
        title: 'System Prototype Demonstration',
        description: 'Real-time drug discovery ligand binding benchmark run across 127 qubits.',
        status: 'future',
      },
      {
        level: 7,
        title: 'Operational Demonstration',
        description: 'Full automated quantum chemistry pipeline serving industrial pharmaceutical clients.',
        status: 'future',
      },
      {
        level: 8,
        title: 'System Complete and Qualified',
        description: 'Standardized ISO quantum compiler runtime release.',
        status: 'future',
      },
      {
        level: 9,
        title: 'Commercial Scale Proof',
        description: 'Widespread commercial cloud API usage solving quantum advantage problems.',
        status: 'future',
      },
    ],
    marketRelevance: {
      tam: '$6.8 Billion',
      cagr: '34.8% through 2031',
      horizonYear: '2026 Commercial Hybrid Integration',
      commercialDrivers: [
        'Bridging the 5-7 year gap until fault-tolerant logical quantum computers arrive.',
        'Immediate pharmaceutical demand for exact molecular ground-state simulations in cancer research.',
        'High-density financial portfolio risk modeling beyond classical Monte Carlo reach.',
      ],
      barriersToEntry: [
        'High algorithmic complexity requiring quantum information theorists and HPC engineers.',
        'Proprietary qubit control architectures across hardware manufacturers.',
      ],
      investmentClimate: 'Active Strategic Capital: Driven by pharmaceutical majors and sovereign quantum initiatives.',
    },
    targetApplications: [
      {
        domain: 'Pharmaceutical Drug Discovery',
        useCase: 'Calculating catalyst binding energies and enzyme active site interactions without wet-lab delays.',
        impact: 'Shortens early-stage lead candidate optimization from 18 months to 3 weeks.',
        urgency: 'Critical',
      },
      {
        domain: 'Aerospace Alloy Materials',
        useCase: 'Simulating grain boundary oxidation resistance in nickel superalloys for jet turbine blades.',
        impact: 'Discovers high-temperature resistant alloy compositions prior to arc-melting.',
        urgency: 'High',
      },
      {
        domain: 'Financial Quantitative Risk',
        useCase: 'Combinatorial portfolio optimization under extreme market volatility scenarios.',
        impact: 'Executes quadratic unconstrained binary optimization (QUBO) at 100x classical speed.',
        urgency: 'Moderate',
      },
    ],
    linkedEcosystem: {
      startups: [
        {
          name: 'QuTensor Analytics',
          stage: 'Seed ($5.2M)',
          focus: 'Quantum-classical hybrid middleware compilers',
          location: 'Geneva, Switzerland',
        },
        {
          name: 'Q-BioDynamics',
          stage: 'Pre-Series A ($8.0M)',
          focus: 'Quantum ligand docking for oncology therapeutics',
          location: 'Basel, Switzerland',
        },
      ],
      labs: [
        {
          name: 'Quantum Computing & Algorithms Center',
          institute: 'CERN OpenLab',
          lead: 'Dr. Alberto Di Meglio',
        },
        {
          name: 'Theoretical Quantum Physics Group',
          institute: 'ETH Zurich',
          lead: 'Prof. Renato Renner',
        },
      ],
      experts: [
        {
          name: 'Dr. Kaviya Chen',
          title: 'Quantum Algorithm Fellow',
          organization: 'CERN OpenLab & MIT CSAIL',
          citationCount: '8,900+ Citations · 18 Papers',
        },
      ],
      challenges: [
        {
          title: 'NISQ Quantum Catalyst Ground-State Challenge',
          sponsor: 'BioSynthetix European Research Consortium',
          budget: '€320,000 R&D Grant',
          deadline: 'Feb 28, 2027',
        },
      ],
    },
  },
};

// Fallback generator for arbitrary or dynamically generated technology IDs
function generateDynamicTechnology(id: string): TechnologyDetail {
  const formattedTitle = id
    .replace(/^tech-/, '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id,
    title: `${formattedTitle} Node`,
    category: 'Frontier Deep-Tech Systems',
    trl: 6,
    trlStage: 'System Prototype Validated in Relevant Operational Environment',
    organization: 'NEXORA Deep-Tech Research Consortium',
    location: 'Global Engineering Network',
    ipStatus: 'Patent Portfolio Protected under WIPO PCT',
    patentCount: 5,
    readinessTimeline: 'Pilot Validation 2026 · Industrial Scale 2028',
    heroSummary: `Verified technological node featuring validated performance benchmarks, empirical laboratory test telemetry, and structured Technology Readiness Level verification for ${formattedTitle.toLowerCase()}.`,
    technicalOverview: {
      description: `This technology node represents an advanced architectural implementation within the ${formattedTitle.toLowerCase()} domain. Validated against rigorous laboratory tolerances, the subsystem demonstrates significant thermodynamic and computational efficiencies over incumbent technological baselines.`,
      physicsPrinciples: [
        'Deterministic State Space Trajectory Control',
        'Non-Equilibrium Thermodynamic Boundary Stabilization',
        'Sub-Micron Microfabrication Integration',
        'Continuous Empirical Real-Time Telemetry',
      ],
      breakthroughMetrics: [
        { label: 'Energy Density Gain', value: '+44.2%', baseline: 'vs. Conventional standard' },
        { label: 'Operational MTBF', value: '45,000 Hours', baseline: 'Continuous duty cycle verified' },
        { label: 'Thermal Dissipation', value: '-62%', baseline: 'Reduced auxiliary cooling burden' },
        { label: 'System Latency', value: 'Sub-millisecond', baseline: 'Real-time deterministic response' },
      ],
      specifications: [
        { key: 'Subsystem Architecture', value: 'Modular Scalable Matrix' },
        { key: 'Interface Protocols', value: 'Standardized Industrial Bus & Telemetry' },
        { key: 'Certification Standard', value: 'ISO / IEC Deep-Tech Protocol Compliant' },
        { key: 'Scalability Envelope', value: 'Laboratory bench to multi-megawatt industrial fab' },
      ],
    },
    trlBreakdown: [
      { level: 1, title: 'Basic Principles Observed', description: 'Mathematical hypothesis validated.', status: 'completed' },
      { level: 2, title: 'Technology Concept Formulated', description: 'Theoretical models and equations published.', status: 'completed' },
      { level: 3, title: 'Proof of Concept', description: 'Laboratory bench experimental proof complete.', status: 'completed' },
      { level: 4, title: 'Component Validation in Lab', description: 'Isolated component operational metrics proven.', status: 'completed' },
      { level: 5, title: 'Validation in Relevant Environment', description: 'Integrated breadboard testing underway.', status: 'completed' },
      { level: 6, title: 'System Prototype in Relevant Environment', description: 'Full prototype validation in progress.', status: 'current' },
      { level: 7, title: 'Operational Demonstration', description: 'Field testing planned with partner testbeds.', status: 'future' },
      { level: 8, title: 'System Qualified & Production Ready', description: 'Tooling and manufacturing qualification.', status: 'future' },
      { level: 9, title: 'Commercial Operation Proven', description: 'Full-scale market deployment.', status: 'future' },
    ],
    marketRelevance: {
      tam: '$12.4 Billion',
      cagr: '31.4% through 2030',
      horizonYear: '2027 Commercial Adoption',
      commercialDrivers: [
        'Urgent industrial demand for lower energy footprints and carbon compliance.',
        'Obsolescence of legacy mechanical and analog manufacturing approaches.',
        'Supply chain resilience and localized domestic manufacturing imperatives.',
      ],
      barriersToEntry: [
        'High upfront capital expenditure for precision semiconductor or materials tooling.',
        'Strict regulatory qualification requirements in automotive, aerospace, and medical sectors.',
      ],
      investmentClimate: 'Strong Investor Interest: Active inquiries from corporate venture capital arms.',
    },
    targetApplications: [
      {
        domain: 'Autonomous Industrial Systems',
        useCase: 'Deploying high-reliability actuation and sensing in high-throughput factories.',
        impact: 'Increases process yield by up to 28% while minimizing unplanned downtime.',
        urgency: 'Critical',
      },
      {
        domain: 'Next-Gen Aerospace Infrastructure',
        useCase: 'Subsystem weight reduction for high-altitude aerial vehicles and satellite arrays.',
        impact: 'Lowers payload mass budget by 35% without structural degradation.',
        urgency: 'High',
      },
      {
        domain: 'High-Density Renewable Grid Storage',
        useCase: 'Rapid energy buffering for intermittent solar and wind generation hubs.',
        impact: 'Provides sub-second grid stabilization without chemical degradation.',
        urgency: 'Moderate',
      },
    ],
    linkedEcosystem: {
      startups: [
        {
          name: `${formattedTitle.split(' ')[0]} Innovations Lab`,
          stage: 'Seed ($3.5M)',
          focus: `Commercialization of ${formattedTitle.toLowerCase()} platforms`,
          location: 'Stockholm, Sweden',
        },
      ],
      labs: [
        {
          name: 'Advanced Systems Prototyping Division',
          institute: 'NEXORA European Hub',
          lead: 'Dr. Alexis Meyer',
        },
      ],
      experts: [
        {
          name: 'Dr. Alexis Meyer',
          title: 'Principal Systems Architect',
          organization: 'Frontier Technology Institute',
          citationCount: '7,100+ Citations · 21 Patents',
        },
      ],
      challenges: [
        {
          title: `${formattedTitle} Industrial Pilot Brief`,
          sponsor: 'Global Manufacturing Consortia',
          budget: '€350,000 Pilot Allocation',
          deadline: 'Rolling Submissions',
        },
      ],
    },
  };
}

export default async function TechnologyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15 asynchronous params handling
  const { id } = await params;

  // Retrieve curated technology or dynamically synthesize
  const tech = TECHNOLOGIES_DATABASE[id] || generateDynamicTechnology(id);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Section 1: Hero & Metadata Banner */}
        <section id="technology-hero" className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
              {tech.category}
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              TRL {tech.trl} · {tech.trlStage}
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              {tech.ipStatus}
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-100 leading-tight">
              {tech.title}
            </h1>
            <p className="text-base sm:text-lg text-neutral-300 max-w-4xl leading-relaxed">
              {tech.heroSummary}
            </p>
          </div>

          {/* Key Facts Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400">Lead Organization</div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-200">{tech.organization}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400">Geographic Hub</div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-200">{tech.location}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400">Target Scale Horizon</div>
              <div className="text-xs sm:text-sm font-semibold text-cyan-300 font-mono">
                {tech.readinessTimeline}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono text-neutral-400">Market TAM</div>
              <div className="text-xs sm:text-sm font-semibold text-emerald-400 font-mono">
                {tech.marketRelevance.tam} ({tech.marketRelevance.cagr})
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Technical Overview & Physics Principles */}
        <section id="technical-overview" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-2xl font-bold text-neutral-100">Technical Overview & Architecture</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Description & Physics (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400">
                  Engineering Abstract
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {tech.technicalOverview.description}
                </p>

                <div className="pt-2">
                  <div className="text-xs font-mono text-neutral-400 mb-2.5">
                    Foundational Physics & Operational Principles:
                  </div>
                  <ul className="space-y-2">
                    {tech.technicalOverview.physicsPrinciples.map((principle, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-200">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{principle}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Hardware Specifications Table */}
              <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400">
                  Hardware & Architecture Specifications
                </h3>
                <div className="divide-y divide-neutral-800/80 text-xs">
                  {tech.technicalOverview.specifications.map((spec, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                      <span className="font-mono text-neutral-400">{spec.key}</span>
                      <span className="font-medium text-neutral-200 text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Breakthrough Metrics (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400">
                    Empirical Benchmarks
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-400">Verified Telemetry</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {tech.technicalOverview.breakthroughMetrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-neutral-950 border border-neutral-800/90 space-y-1"
                    >
                      <div className="text-xs font-mono text-neutral-400">{metric.label}</div>
                      <div className="text-2xl font-bold font-mono text-cyan-400">
                        {metric.value}
                      </div>
                      <div className="text-[11px] text-neutral-400">{metric.baseline}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intellectual Property Badge */}
              <div className="p-5 rounded-xl bg-neutral-900/30 border border-neutral-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-cyan-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-200">
                    Patent Estate & Freedom-to-Operate
                  </div>
                  <div className="text-xs text-neutral-400">
                    {tech.patentCount} granted international patents covering underlying manufacturing & design.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Technology Readiness Level (TRL) Breakdown */}
        <section id="trl-breakdown" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold text-neutral-100">
                Technology Readiness Level (TRL) Milestone Breakdown
              </h2>
            </div>
            <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse ml-2" /> Current Active
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-neutral-700 ml-2" /> Roadmap
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-6">
            {/* Visual 9-Step Progress Bar */}
            <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
              {tech.trlBreakdown.map((stage) => {
                const isCurrent = stage.status === 'current';
                const isCompleted = stage.status === 'completed';
                return (
                  <div key={stage.level} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-full h-2 rounded-full transition-all ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isCurrent
                          ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                          : 'bg-neutral-800'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-mono ${
                        isCurrent
                          ? 'text-cyan-300 font-bold'
                          : isCompleted
                          ? 'text-emerald-400'
                          : 'text-neutral-600'
                      }`}
                    >
                      TRL {stage.level}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Detailed Stage Rows */}
            <div className="space-y-3 pt-2">
              {tech.trlBreakdown.map((stage) => {
                const isCurrent = stage.status === 'current';
                const isCompleted = stage.status === 'completed';
                return (
                  <div
                    key={stage.level}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isCurrent
                        ? 'bg-cyan-950/20 border-cyan-500/50 shadow-sm'
                        : isCompleted
                        ? 'bg-neutral-950/60 border-neutral-800/80'
                        : 'bg-neutral-950/30 border-neutral-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isCurrent
                            ? 'bg-cyan-500 text-neutral-950'
                            : isCompleted
                            ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                            : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {stage.level}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-semibold ${
                              isCurrent ? 'text-cyan-300' : 'text-neutral-200'
                            }`}
                          >
                            {stage.title}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold animate-pulse">
                              Active Milestone
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400">{stage.description}</p>
                      </div>
                    </div>

                    {stage.verifiedBy && (
                      <div className="text-[11px] font-mono text-neutral-400 shrink-0 self-end sm:self-center pl-10 sm:pl-0">
                        <span className="text-neutral-500">Verified by: </span>
                        <span className="text-neutral-300">{stage.verifiedBy}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 4: Market Relevance & Commercialization */}
        <section id="market-relevance" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-2xl font-bold text-neutral-100">Market Relevance & Commercialization</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TAM & Commercial Drivers */}
            <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400">
                  Macroeconomic & Industry Drivers
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {tech.marketRelevance.tam} TAM by {tech.marketRelevance.horizonYear}
                </span>
              </div>

              <ul className="space-y-3">
                {tech.marketRelevance.commercialDrivers.map((driver, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed">
                    <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-neutral-800/80 space-y-2">
                <div className="text-xs font-mono text-neutral-400">Technological & Industrial Moats:</div>
                <div className="space-y-1.5">
                  {tech.marketRelevance.barriersToEntry.map((barrier, idx) => (
                    <div key={idx} className="text-xs text-neutral-400 flex items-start gap-2">
                      <span className="text-neutral-600 font-mono">▸</span>
                      <span>{barrier}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Investment & Venture Outlook */}
            <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400">
                  Venture & Co-Development Sentiment
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {tech.marketRelevance.investmentClimate}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-2">
                <div className="text-[11px] font-mono text-neutral-400">Recommended Collaboration Model</div>
                <div className="text-xs font-semibold text-neutral-100">
                  Joint Development Agreement (JDA) + Prototype Tapeout Licensing
                </div>
                <div className="text-[11px] text-cyan-400 font-mono">NEXORA IP Protection Enforced</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Target Applications */}
        <section id="target-applications" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h2 className="text-2xl font-bold text-neutral-100">Target Applications & Use Cases</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tech.targetApplications.map((app, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-cyan-400 font-semibold">{app.domain}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        app.urgency === 'Critical'
                          ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                          : 'bg-amber-950/80 border border-amber-800 text-amber-300'
                      }`}
                    >
                      {app.urgency} Urgency
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-100 leading-snug">{app.useCase}</h3>

                  <p className="text-xs text-neutral-400 leading-relaxed">{app.impact}</p>
                </div>

                <div className="pt-3 border-t border-neutral-800 text-xs font-mono text-cyan-400/90 flex items-center justify-between">
                  <span>TRL Compatibility: Ready</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Linked Ecosystem (Startups, Labs, Experts, Challenges) */}
        <section id="linked-ecosystem" className="space-y-6 pt-4 border-t border-neutral-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold text-neutral-100">
                Linked Innovation Ecosystem & Key Stakeholders
              </h2>
            </div>
            <span className="text-xs font-mono text-neutral-400">Cross-Referenced Nodes</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Startups & Labs (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Commercializing Startups & Affiliated Labs</span>
              </div>

              <div className="space-y-3">
                {tech.linkedEcosystem.startups.map((startup, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-neutral-100">{startup.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                          {startup.stage}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">{startup.focus}</p>
                      <div className="text-[11px] font-mono text-neutral-500">{startup.location}</div>
                    </div>

                    <Link
                      href={
                        startup.name.toLowerCase().includes('aetherion')
                          ? '/startup/startup-aetherion'
                          : startup.name.toLowerCase().includes('synthosyn')
                          ? '/startup/startup-synthosyn'
                          : '/explore'
                      }
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors shrink-0"
                    >
                      Dossier
                    </Link>
                  </div>
                ))}

                {tech.linkedEcosystem.labs.map((lab, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-cyan-400 uppercase">Research Lab</div>
                      <h4 className="text-sm font-semibold text-neutral-100">{lab.name}</h4>
                      <p className="text-xs text-neutral-400">{lab.institute}</p>
                      <div className="text-[11px] font-mono text-neutral-500">Lead: {lab.lead}</div>
                    </div>

                    <Link
                      href="/explore"
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors shrink-0"
                    >
                      Lab Profile
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Verified Experts & Active Corporate Challenges (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>Verified Fellows & Co-Development Challenges</span>
              </div>

              <div className="space-y-3">
                {tech.linkedEcosystem.experts.map((expert, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-emerald-400 uppercase">
                        Principal Investigator
                      </div>
                      <h4 className="text-sm font-semibold text-neutral-100">{expert.name}</h4>
                      <p className="text-xs text-neutral-400">{expert.title} · {expert.organization}</p>
                      <div className="text-[11px] font-mono text-cyan-300/90">{expert.citationCount}</div>
                    </div>

                    <Link
                      href={
                        expert.name.toLowerCase().includes('rostova')
                          ? '/expert/expert-rostova'
                          : expert.name.toLowerCase().includes('chen')
                          ? '/expert/expert-chen'
                          : expert.name.toLowerCase().includes('vance')
                          ? '/expert/expert-vance'
                          : '/explore'
                      }
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors shrink-0"
                    >
                      Fellow Profile
                    </Link>
                  </div>
                ))}

                {tech.linkedEcosystem.challenges.map((challenge, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-amber-400 uppercase">
                        Sponsor Challenge
                      </div>
                      <h4 className="text-sm font-semibold text-neutral-100">{challenge.title}</h4>
                      <p className="text-xs text-neutral-400">Sponsor: {challenge.sponsor}</p>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                        <span className="text-emerald-400 font-semibold">{challenge.budget}</span>
                        <span>·</span>
                        <span>Deadline: {challenge.deadline}</span>
                      </div>
                    </div>

                    <Link
                      href="/challenges"
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold transition-colors shrink-0"
                    >
                      Apply
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Action & Inquiry Card */}
        <section
          id="contact-dialog"
          className="p-8 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden text-center space-y-4"
        >
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl font-bold text-neutral-100">
              Engage with the {tech.title} Node
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Request full empirical test telemetry, execute a bilateral NDA for CAD/PDK access, or arrange
              an architectural briefing with the lead research consortium.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/challenges"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold transition-colors"
              >
                Submit Pilot Proposal
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
              >
                Save to AI Scout Monitors
              </Link>
              <Link
                href="/explore"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
              >
                Browse Alternative Vectors
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer
        id="tech-detail-footer"
        className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-400 mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-neutral-300 font-semibold">NEXORA Technology Dossier</span>
            <span className="text-neutral-500">· Node {tech.id}</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-neutral-400">TRL Audit Standard: NASA / Horizon Europe Framework</span>
            <span>&copy; {new Date().getFullYear()} NEXORA Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
