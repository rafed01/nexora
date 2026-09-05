import 'server-only';
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";
import { UserProfile, UserRole } from "./supabaseClient";
import { createAdminClient } from "./supabase/admin";

export interface AccessRequest {
  id: string;
  name?: string;
  email: string;
  organization?: string;
  proposalBrief?: string;
  purpose?: string;
  tierRequested?: string;
  roleRequested?: UserRole;
  entityTitle?: string;
  entityType?: string;
  ndaStatus?: string;
  status?: string;
  dateRequested?: string;
  createdAt: string;
  [key: string]: any;
}

export interface CatalogItem {
  id: string;
  type: 'technology' | 'startup' | 'expert' | 'challenge' | 'report';
  title: string;
  category: string;
  trl?: number;
  trlStage?: string;
  organization: string;
  location?: string;
  description: string;
  tags: string[];
  metrics?: { label: string; value: string }[];
  milestones?: string[];
  budget?: string;
  deadline?: string;
  verifiedBy?: string;
  status?: 'Active' | 'Pending' | 'Archived' | 'Draft';
  createdAt: string;
  [key: string]: any;
}

interface DatabaseSchema {
  requests: AccessRequest[];
  catalog: CatalogItem[];
  profiles?: UserProfile[];
}

const DB_FILE_PATH = path.join(process.cwd(), "data.json");

/**
 * Dual-Mode Environment Flag
 * Set NEXT_PUBLIC_USE_SUPABASE=true in .env / settings to activate Supabase PostgreSQL backend.
 */
export const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';
export const IS_SUPABASE = useSupabase;

/**
 * Server-only Supabase Client Initializer
 */
export function getSupabaseClient(): SupabaseClient {
  return createAdminClient();
}

/**
 * Default Seed Records for NEXORA's Deep-Tech Taxonomy
 */
export const DEFAULT_CATALOG_SEEDS: CatalogItem[] = [
  // 1. Technologies
  {
    id: 'tech-solid-state-electrolyte',
    type: 'technology',
    title: 'High-Purity Argyrodite Solid Electrolyte (Li₆PS₅Cl)',
    category: 'Advanced Energy Storage',
    trl: 7,
    trlStage: 'TRL 7 Validated System',
    organization: 'Kyoto Materials Innovation Lab / Tokyo Tech',
    location: 'Kyoto, Japan',
    description: 'Engineered superionic sulfide crystalline powder achieving 14.2 mS/cm ionic conductivity at 25°C, eliminating flammable volatile liquid carbonate solvents in next-generation solid-state cells.',
    tags: ['Electrochemistry', 'Solid-State Battery', 'Argyrodite', 'High Energy Density'],
    metrics: [
      { label: 'Conductivity', value: '14.2 mS/cm' },
      { label: 'Critical Current', value: '12.5 mA/cm²' },
      { label: 'Cycle Retention', value: '91% @ 1,200 cyc' },
    ],
    milestones: [
      'Pouch cell 1,000-cycle milestone independently verified',
      'Pilot line throughput scaled to 500 kg/month',
      'TÜV Rheinland thermal runaway immunity certification',
    ],
    verifiedBy: 'NEXORA Materials Board',
    status: 'Active',
    createdAt: new Date('2026-01-15T08:00:00Z').toISOString(),
  },
  {
    id: 'tech-photonic-mpu',
    type: 'technology',
    title: 'Photonic Matrix Processing Unit (P-MPU)',
    category: 'Optical Computing',
    trl: 6,
    trlStage: 'TRL 6 Prototype Demonstrated',
    organization: 'NEXORA Optoelectronics Core / IMEC Spinout',
    location: 'Leuven, Belgium',
    description: 'Silicon-photonic analog matrix accelerator computing GEMM tensor workloads at the speed of light, consuming 42.8 TOPS/W with 0.18 ns latency for ultra-low power AI datacenters.',
    tags: ['Photonics', 'Analog Compute', 'Silicon Photonics', 'AI Acceleration'],
    metrics: [
      { label: 'Energy Eff.', value: '42.8 TOPS/W' },
      { label: 'Latency', value: '0.18 ns' },
      { label: 'Optical Clock', value: '100 GHz' },
    ],
    milestones: [
      'Tape-out on TSMC 300mm photonic wafer',
      'Zero thermo-optic phase drift achieved via active neural controller',
      'Interconnect bandwidth tested to 1.6 Tbps',
    ],
    verifiedBy: 'IMEC Hardware Verification Committee',
    status: 'Active',
    createdAt: new Date('2026-01-20T10:00:00Z').toISOString(),
  },
  {
    id: 'tech-quantum-mitigation',
    type: 'technology',
    title: 'Tensor-Network Quantum Error Mitigation Compiler',
    category: 'Quantum Systems',
    trl: 5,
    trlStage: 'TRL 5 Validated in Relevant Environment',
    organization: 'CERN OpenLab & ETH Zurich',
    location: 'Zurich, Switzerland',
    description: 'Software-hardware co-design executing 100+ qubit molecular Hamiltonian simulations on noisy intermediate-scale quantum (NISQ) processors via matrix product state noise decomposition.',
    tags: ['Quantum Computing', 'Error Mitigation', 'NISQ', 'Hamiltonian Simulation'],
    metrics: [
      { label: 'Fidelity Gain', value: '+4.2x' },
      { label: 'Qubit Scaling', value: '128 Qubits' },
      { label: 'Gate Overhead', value: '-65%' },
    ],
    milestones: [
      'Executed on 127-qubit superconducting transmon testbeds',
      'Nature Computational Physics peer-reviewed publication',
      'Validated for molecular ground state transitions',
    ],
    verifiedBy: 'European Quantum Flagship',
    status: 'Active',
    createdAt: new Date('2026-02-01T09:00:00Z').toISOString(),
  },

  // 2. Startups
  {
    id: 'startup-aetherion',
    type: 'startup',
    title: 'Aetherion Dynamics',
    category: 'Autonomous Aerospace & Swarm AI',
    trl: 7,
    trlStage: 'TRL 7 Operational Prototype',
    organization: 'ISAE-SUPAERO & ONERA Spinout',
    location: 'Toulouse, France',
    description: 'High-altitude solar pseudo-satellite gliders utilizing decentralized Byzantine-tolerant swarm autonomy for 60+ day continuous persistent station-keeping and environmental monitoring.',
    tags: ['Aerospace', 'HAPS', 'Autonomous Swarms', 'Solar Aviation'],
    metrics: [
      { label: 'Flight Endurance', value: '62 Days' },
      { label: 'Drag Reduction', value: '-28.4%' },
      { label: 'Swarm Link', value: '18 ms' },
    ],
    milestones: [
      'Completed 45-day continuous stratospheric flight trial at FL650',
      'Secured €14M Series A round led by NATO Innovation Fund',
      'Granted 4 core patents in aerodynamic wake-vortex harvesting',
    ],
    verifiedBy: 'French Space Agency (CNES) Evaluator',
    status: 'Active',
    createdAt: new Date('2026-02-10T11:00:00Z').toISOString(),
  },
  {
    id: 'startup-synthosyn',
    type: 'startup',
    title: 'SynthoSyn Bio',
    category: 'Generative Protein Engineering',
    trl: 6,
    trlStage: 'TRL 6 Pilot Demonstrated',
    organization: 'Biozentrum Basel & ETH Zurich',
    location: 'Basel, Switzerland',
    description: 'SE(3)-equivariant geometric diffusion models designing ultra-thermostable biocatalysts operational up to 88°C in continuous chemical reactors for industrial plastics depolymerization.',
    tags: ['Synthetic Biology', 'Enzyme Design', 'Biocatalysis', 'Circular Economy'],
    metrics: [
      { label: 'Melting Delta', value: '+38.5°C' },
      { label: 'Turnaround', value: '4,800 s⁻¹' },
      { label: 'Lead Time', value: '14 Days' },
    ],
    milestones: [
      'Depolymerized 1 metric ton PET slurry in 14-day continuous run',
      'Nature Biotechnology publication on de novo alpha-beta barrels',
      'Joint development agreement with BASF Sustainable Polyolefins',
    ],
    verifiedBy: 'Swiss Biotech Association',
    status: 'Active',
    createdAt: new Date('2026-02-14T14:30:00Z').toISOString(),
  },

  // 3. Experts
  {
    id: 'expert-vance',
    type: 'expert',
    title: 'Marcus Vance, PhD',
    category: 'Solid-State Battery Chemistry',
    trl: 8,
    trlStage: 'TRL 8 System Qualified',
    organization: 'Ex-Tesla Powertrain / Kyoto Materials Lab',
    location: 'San Francisco, CA, USA',
    description: 'Lead Battery Architect with 26 patents in solvent-free roll-to-roll dry powder coating, interfacial lithium dendrite passivation, and gigafactory dry-room engineering.',
    tags: ['Battery Chemistry', 'Dry Coating', 'Gigafactory Tooling', 'IP Advisory'],
    metrics: [
      { label: 'h-Index', value: '46' },
      { label: 'Citations', value: '8,400+' },
      { label: 'Patents', value: '26 Granted' },
    ],
    milestones: [
      'Commissioned 10 GWh dry electrode production line in Nevada',
      'Authored Wiley standard reference on sulfide electrolyte interfaces',
    ],
    verifiedBy: 'NEXORA Technical Review Board',
    status: 'Active',
    createdAt: new Date('2026-02-18T16:00:00Z').toISOString(),
  },
  {
    id: 'expert-rostova',
    type: 'expert',
    title: 'Dr. Elena Rostova',
    category: 'Silicon Photonics & Optical Interconnects',
    trl: 8,
    trlStage: 'TRL 8 Operational Deployment',
    organization: 'Max Planck Institute for Quantum Optics',
    location: 'Munich, Germany',
    description: 'Fellow in quantum optoelectronics and lead architect of sub-picosecond non-volatile optical matrix multiplier topologies with active thermal drift compensation.',
    tags: ['Silicon Photonics', 'CPO', 'Optoelectronics', 'Quantum Optics'],
    metrics: [
      { label: 'h-Index', value: '54' },
      { label: 'Citations', value: '12,400+' },
      { label: 'Patents', value: '19 Granted' },
    ],
    milestones: [
      'IEEE Photonic Society Pioneer Award recipient',
      'Technical lead on European Flagship optical interconnect standard',
    ],
    verifiedBy: 'Max Planck Society Review',
    status: 'Active',
    createdAt: new Date('2026-02-20T12:00:00Z').toISOString(),
  },

  // 4. Challenges
  {
    id: 'challenge-novavolt-dry-coating',
    type: 'challenge',
    title: 'Roll-to-Roll Dry Coating Solid-State Separator Scalability',
    category: 'Advanced Energy Storage',
    trl: 6,
    organization: 'Novavolt Powertrain Systems',
    location: 'Stuttgart, Germany',
    description: 'Corporate automotive RFP seeking continuous solvent-free dry web deposition lines for sulfide electrolytes with <5% thickness tolerance and line speeds >30 m/min.',
    tags: ['Automotive RFP', 'Dry Coating', 'Solid-State Battery', 'Pilot Trial'],
    budget: '€450,000 Co-Development Grant',
    deadline: '2026-11-30',
    metrics: [
      { label: 'Grant Pool', value: '€450,000' },
      { label: 'Deadline', value: 'Nov 30, 2026' },
      { label: 'Pilot Type', value: 'JDA Co-Dev' },
    ],
    milestones: [
      'Submissions review and shortlist by Novavolt Chief Engineer',
      'Bench pilot prototype validation at Novavolt R&D Center',
    ],
    verifiedBy: 'Novavolt Corporate Ventures',
    status: 'Active',
    createdAt: new Date('2026-02-22T09:30:00Z').toISOString(),
  },
  {
    id: 'challenge-helios-optics',
    type: 'challenge',
    title: 'Sub-Femtojoule Optical Interconnects for AI Datacenters',
    category: 'Silicon Photonics',
    trl: 5,
    organization: 'Helios Cloud Infrastructure Group',
    location: 'Austin, TX, USA',
    description: 'Seeking heterogeneous III-V on silicon transceivers operating below 0.8 pJ/bit at 800 Gbps per lane to circumvent the GPU cluster power wall.',
    tags: ['Hyperscale AI', 'CPO', 'Interconnects', 'Grant RFP'],
    budget: '$750,000 Allocation',
    deadline: '2027-01-15',
    metrics: [
      { label: 'Grant Pool', value: '$750,000' },
      { label: 'Deadline', value: 'Jan 15, 2027' },
      { label: 'Pilot Type', value: 'Hyperscale Trial' },
    ],
    milestones: [
      'Phase 1: Laboratory silicon bench test verification',
      'Phase 2: 10,000-node hyperscale testbed insertion',
    ],
    verifiedBy: 'Helios Open Compute Lab',
    status: 'Active',
    createdAt: new Date('2026-02-25T15:00:00Z').toISOString(),
  },

  // 5. Reports
  {
    id: 'report-quantum-error-mitigation',
    type: 'report',
    title: 'Tensor-Network Quantum Error Mitigation on NISQ Hardware Report',
    category: 'Quantum Systems',
    trl: 6,
    organization: 'NEXORA Quantum Working Group',
    location: 'Global Consortium',
    description: 'Peer-reviewed techno-economic publication comparing zero-noise extrapolation, randomized compiling, and tensor-network noise filtering on superconducting quantum backends.',
    tags: ['Quantum Computing', 'Research Report', 'Benchmark Data', 'NISQ'],
    metrics: [
      { label: 'Pages', value: '42 Pages' },
      { label: 'Fabs Audited', value: '3 Platforms' },
      { label: 'Read Time', value: '22 min' },
    ],
    milestones: [
      'Empirical cross-platform benchmarks included',
      'Published with full open-access dataset',
    ],
    verifiedBy: 'NEXORA Publications Board',
    status: 'Active',
    createdAt: new Date('2026-03-01T10:00:00Z').toISOString(),
  },
  {
    id: 'report-de-novo-enzymes-biotech',
    type: 'report',
    title: 'Generative Diffusion for Thermostable Biocatalysts Report',
    category: 'Biotechnology',
    trl: 6,
    organization: 'NEXORA Synthetic Biology Practice',
    location: 'Basel, Switzerland',
    description: 'Techno-economic publication assessing continuous batch reactor conversion kinetics and 14-day industrial enzymatic plastic depolymerization at elevated temperatures.',
    tags: ['Biotechnology', 'Diffusion Models', 'Circular Plastics', 'Whitepaper'],
    metrics: [
      { label: 'Pages', value: '48 Pages' },
      { label: 'Reactor Temp', value: '88°C Max' },
      { label: 'Depolymerize', value: '14 Days' },
    ],
    milestones: [
      'Includes comparative kinetics against traditional wild-type enzymes',
      'Validated by 4 industrial partner pilots',
    ],
    verifiedBy: 'NEXORA Publications Board',
    status: 'Active',
    createdAt: new Date('2026-03-02T11:00:00Z').toISOString(),
  },
];

export const DEFAULT_REQUEST_SEEDS: AccessRequest[] = [
  {
    id: 'req-seed-01',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@aerospace-systems.eu',
    organization: 'European Aerospace Defense Consortium',
    entityTitle: 'Aetherion Dynamics Swarm Glider Telemetry',
    entityType: 'startup',
    purpose: 'Strategic Defense Co-Development',
    proposalBrief: 'Evaluating high-altitude pseudo-satellite swarms for maritime environmental radar relays.',
    ndaStatus: 'Executed',
    status: 'Approved',
    dateRequested: '2026-03-01',
    createdAt: new Date('2026-03-01T08:30:00Z').toISOString(),
  },
  {
    id: 'req-seed-02',
    name: 'Henrik Lindqvist',
    email: 'h.lindqvist@nordicenergyventures.com',
    organization: 'Nordic Clean Energy Fund',
    entityTitle: 'High-Purity Argyrodite Solid Electrolyte Pilot Data',
    entityType: 'technology',
    purpose: 'Series B Due Diligence',
    proposalBrief: 'Auditing coin-cell cycle degradation telemetry under high pressure cycling.',
    ndaStatus: 'Pending Signature',
    status: 'Pending',
    dateRequested: '2026-03-03',
    createdAt: new Date('2026-03-03T14:15:00Z').toISOString(),
  },
];

// In-memory write lock for local JSON operations
let writeQueue = Promise.resolve();

function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(task, task);
  writeQueue = next.then(() => {}, () => {});
  return next;
}

/**
 * Performs atomic writing using temporary file swap to eliminate race conditions in local JSON mode
 */
async function writeDbFileAtomic(data: DatabaseSchema): Promise<void> {
  const tempPath = `${DB_FILE_PATH}.${crypto.randomUUID()}.tmp`;
  const jsonContent = JSON.stringify(data, null, 2);
  await fs.writeFile(tempPath, jsonContent, 'utf8');
  await fs.rename(tempPath, DB_FILE_PATH);
}

/**
 * Ensures that the local JSON database file exists and is populated with seeds if empty.
 */
export async function ensureDbFile(): Promise<DatabaseSchema> {
  return enqueueWrite(async () => {
    try {
      const rawData = await fs.readFile(DB_FILE_PATH, 'utf8');
      const parsed = JSON.parse(rawData) as Partial<DatabaseSchema>;
      
      const hasCatalog = Array.isArray(parsed.catalog) && parsed.catalog.length > 0;
      const hasRequests = Array.isArray(parsed.requests);

      if (!hasCatalog) {
        // Auto-seed catalog if empty or missing
        const seededData: DatabaseSchema = {
          requests: hasRequests ? (parsed.requests as AccessRequest[]) : DEFAULT_REQUEST_SEEDS,
          catalog: DEFAULT_CATALOG_SEEDS,
        };
        await writeDbFileAtomic(seededData);
        return seededData;
      }

      return {
        requests: Array.isArray(parsed.requests) ? parsed.requests : [],
        catalog: Array.isArray(parsed.catalog) ? parsed.catalog : DEFAULT_CATALOG_SEEDS,
      };
    } catch (error: any) {
      if (error.code === 'ENOENT' || error instanceof SyntaxError) {
        const initialData: DatabaseSchema = {
          requests: DEFAULT_REQUEST_SEEDS,
          catalog: DEFAULT_CATALOG_SEEDS,
        };
        await writeDbFileAtomic(initialData);
        return initialData;
      }
      throw error;
    }
  });
}

/**
 * Explicit seed/reset method useful for manual resets and automated tests
 */
export async function seedDatabase(force: boolean = false): Promise<{
  technologies: number;
  startups: number;
  experts: number;
  challenges: number;
  reports: number;
  requests: number;
  total: number;
}> {
  if (IS_SUPABASE) {
    const supabase = getSupabaseClient();
    
    // Seed Catalog in Supabase
    const { error: catError } = await supabase
      .from('catalog')
      .upsert(DEFAULT_CATALOG_SEEDS, { onConflict: 'id' });
    if (catError) {
      console.error('Supabase seeding catalog error:', catError);
    }

    // Seed Requests in Supabase
    const { error: reqError } = await supabase
      .from('requests')
      .upsert(DEFAULT_REQUEST_SEEDS, { onConflict: 'id' });
    if (reqError) {
      console.error('Supabase seeding requests error:', reqError);
    }

    return {
      technologies: DEFAULT_CATALOG_SEEDS.filter((i) => i.type === 'technology').length,
      startups: DEFAULT_CATALOG_SEEDS.filter((i) => i.type === 'startup').length,
      experts: DEFAULT_CATALOG_SEEDS.filter((i) => i.type === 'expert').length,
      challenges: DEFAULT_CATALOG_SEEDS.filter((i) => i.type === 'challenge').length,
      reports: DEFAULT_CATALOG_SEEDS.filter((i) => i.type === 'report').length,
      requests: DEFAULT_REQUEST_SEEDS.length,
      total: DEFAULT_CATALOG_SEEDS.length + DEFAULT_REQUEST_SEEDS.length,
    };
  }

  return enqueueWrite(async () => {
    let currentDb: Partial<DatabaseSchema> = {};
    if (!force) {
      try {
        const rawData = await fs.readFile(DB_FILE_PATH, 'utf8');
        currentDb = JSON.parse(rawData);
      } catch {
        currentDb = {};
      }
    }

    const requestsToUse = force
      ? DEFAULT_REQUEST_SEEDS
      : Array.isArray(currentDb.requests) && currentDb.requests.length > 0
      ? currentDb.requests
      : DEFAULT_REQUEST_SEEDS;

    const catalogToUse = force
      ? DEFAULT_CATALOG_SEEDS
      : Array.isArray(currentDb.catalog) && currentDb.catalog.length > 0
      ? currentDb.catalog
      : DEFAULT_CATALOG_SEEDS;

    const finalData: DatabaseSchema = {
      requests: requestsToUse,
      catalog: catalogToUse,
    };

    await writeDbFileAtomic(finalData);

    const counts = {
      technologies: finalData.catalog.filter((i) => i.type === 'technology').length,
      startups: finalData.catalog.filter((i) => i.type === 'startup').length,
      experts: finalData.catalog.filter((i) => i.type === 'expert').length,
      challenges: finalData.catalog.filter((i) => i.type === 'challenge').length,
      reports: finalData.catalog.filter((i) => i.type === 'report').length,
      requests: finalData.requests.length,
      total: finalData.catalog.length + finalData.requests.length,
    };

    return counts;
  });
}

/**
 * ============================================================================
 * DATA ACCESS LAYER (DAL) - Dual Mode (Local JSON <-> Supabase PostgreSQL)
 * ============================================================================
 */
export async function saveAccessRequest(data: any): Promise<AccessRequest> {
  const newRequest: AccessRequest = {
    id: data.id || crypto.randomUUID(),
    ...data,
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
  };

  if (IS_SUPABASE) {
    const supabase = getSupabaseClient();
    // Support both camelCase and snake_case in Supabase
    const payload = {
      ...newRequest,
      created_at: newRequest.createdAt,
      proposal_brief: newRequest.proposalBrief,
      entity_title: newRequest.entityTitle,
      entity_type: newRequest.entityType,
      nda_status: newRequest.ndaStatus,
      date_requested: newRequest.dateRequested,
      tier_requested: newRequest.tierRequested,
      role_requested: newRequest.roleRequested,
    };

    const { data: result, error } = await supabase
      .from('requests')
      .upsert([newRequest], { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      // Fallback with snake_case schema if camelCase schema rejected
      const { data: fallbackResult, error: fallbackError } = await supabase
        .from('requests')
        .upsert([payload], { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (fallbackError) {
        console.warn('Supabase error inserting access request:', fallbackError.message);
      } else if (fallbackResult) {
        return fallbackResult as AccessRequest;
      }
    }
    return (result as AccessRequest) || newRequest;
  }

  // Local JSON Mode
  const currentDb = await ensureDbFile();
  currentDb.requests.push(newRequest);
  await enqueueWrite(async () => {
    await writeDbFileAtomic(currentDb);
  });

  return newRequest;
}

/**
 * Retrieves all stored access requests
 */
export async function getAccessRequests(): Promise<AccessRequest[]> {
  if (IS_SUPABASE) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('requests')
      .select('*');

    if (error) {
      console.warn('Supabase error fetching access requests:', error.message);
      try {
        const localDb = await ensureDbFile();
        if (localDb.requests?.length > 0) return localDb.requests;
      } catch {}
      return DEFAULT_REQUEST_SEEDS;
    }

    const items = (data || []).map((req: any) => ({
      ...req,
      proposalBrief: req.proposalBrief || req.proposal_brief,
      entityTitle: req.entityTitle || req.entity_title,
      entityType: req.entityType || req.entity_type,
      ndaStatus: req.ndaStatus || req.nda_status,
      dateRequested: req.dateRequested || req.date_requested,
      tierRequested: req.tierRequested || req.tier_requested,
      roleRequested: req.roleRequested || req.role_requested,
      createdAt: req.createdAt || req.created_at || new Date().toISOString(),
    })) as AccessRequest[];

    return items.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  // Local JSON Mode
  const currentDb = await ensureDbFile();
  return currentDb.requests;
}

/**
 * Retrieves all stored catalog entities (Technologies, Startups, Experts, Challenges, Reports)
 */
export async function getCatalog(): Promise<CatalogItem[]> {
  if (IS_SUPABASE) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('catalog')
      .select('*');

    if (error) {
      console.warn('Supabase error fetching catalog:', error.message);
      try {
        const localDb = await ensureDbFile();
        if (localDb.catalog?.length > 0) return localDb.catalog;
      } catch {}
      return DEFAULT_CATALOG_SEEDS;
    }

    const items = (data || []).map((item: any) => ({
      ...item,
      trlStage: item.trlStage || item.trl_stage,
      verifiedBy: item.verifiedBy || item.verified_by,
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    })) as CatalogItem[];

    return items.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }

  // Local JSON Mode
  const currentDb = await ensureDbFile();
  return currentDb.catalog;
}

/**
 * Saves a new entity to the catalog array
 */
export async function saveCatalogItem(item: any): Promise<CatalogItem> {
  const newItem: CatalogItem = {
    id: item.id || `entity-${crypto.randomUUID().slice(0, 8)}`,
    ...item,
    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
  };

  if (IS_SUPABASE) {
    const supabase = getSupabaseClient();
    const payload = {
      ...newItem,
      created_at: newItem.createdAt,
      trl_stage: newItem.trlStage,
      verified_by: newItem.verifiedBy,
    };

    const { data: result, error } = await supabase
      .from('catalog')
      .upsert([newItem], { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      // Fallback with snake_case schema if camelCase schema rejected
      const { data: fallbackResult, error: fallbackError } = await supabase
        .from('catalog')
        .upsert([payload], { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (fallbackError) {
        console.warn('Supabase error saving catalog item:', fallbackError.message);
      } else if (fallbackResult) {
        return fallbackResult as CatalogItem;
      }
    }
    return (result as CatalogItem) || newItem;
  }

  // Local JSON Mode
  const currentDb = await ensureDbFile();
  currentDb.catalog.push(newItem);
  await enqueueWrite(async () => {
    await writeDbFileAtomic(currentDb);
  });

  return newItem;
}

/**
 * ============================================================================
 * RBAC Profile DAL Methods (Dual-Mode: Supabase profiles table <-> data.json)
 * ============================================================================
 */

export async function getProfile(userIdOrEmail: string): Promise<UserProfile | null> {
  if (!userIdOrEmail) return null;

  if (IS_SUPABASE) {
    const supabase = getSupabaseClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrEmail);
    
    const query = supabase.from('profiles').select('*');
    const { data, error } = isUUID
      ? await query.eq('id', userIdOrEmail).maybeSingle()
      : await query.eq('email', userIdOrEmail).maybeSingle();

    if (error) {
      console.warn('Supabase error fetching profile:', error.message);
      return null;
    }
    return (data as UserProfile) || null;
  }

  // Local JSON Mode
  const currentDb = await ensureDbFile();
  const profiles = currentDb.profiles || [];
  const matched = profiles.find(
    (p) => p.id === userIdOrEmail || p.email.toLowerCase() === userIdOrEmail.toLowerCase()
  );
  return matched || null;
}

export async function saveProfile(profileData: Partial<UserProfile> & { id: string; email: string }): Promise<UserProfile> {
  const approvalStatus = profileData.approval_status || profileData.status || (profileData.role === 'advisor' || profileData.role === 'company' ? 'pending' : 'approved');
  const role: UserRole = (profileData.role as UserRole) || 'user';

  const profile: UserProfile = {
    id: profileData.id,
    email: profileData.email.toLowerCase().trim(),
    full_name: profileData.full_name || '',
    organization: profileData.organization || '',
    focus_area: profileData.focus_area || null,
    domain_expertise: profileData.domain_expertise || null,
    credentials: profileData.credentials || null,
    advisory_history: profileData.advisory_history || null,
    linkedin_url: profileData.linkedin_url || null,
    company_name: profileData.company_name || null,
    tax_id: profileData.tax_id || null,
    company_size: profileData.company_size || null,
    industry: profileData.industry || null,
    avatar_url: profileData.avatar_url || null,
    tech_stack: profileData.tech_stack || null,
    bio: profileData.bio || null,
    timezone: profileData.timezone || null,
    role: role,
    approval_status: approvalStatus,
    status: approvalStatus,
    onboarding_completed: profileData.onboarding_completed ?? false,
    created_at: profileData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (IS_SUPABASE) {
    const supabase = getSupabaseClient();
    // Only send fields that strictly exist in public.profiles table schema
    const dbPayload = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      approval_status: profile.approval_status,
      full_name: profile.full_name,
      organization: profile.organization,
      focus_area: profile.focus_area,
      domain_expertise: profile.domain_expertise,
      credentials: profile.credentials,
      advisory_history: profile.advisory_history,
      linkedin_url: profile.linkedin_url,
      company_name: profile.company_name,
      tax_id: profile.tax_id,
      company_size: profile.company_size,
      industry: profile.industry,
      avatar_url: profile.avatar_url,
      tech_stack: profile.tech_stack,
      bio: profile.bio,
      timezone: profile.timezone,
      onboarding_completed: profile.onboarding_completed,
      updated_at: profile.updated_at,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(dbPayload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase error saving profile:', error);
      throw new Error(`Failed to save profile in Supabase: ${error.message}`);
    }
    return (data as UserProfile) || profile;
  }

  // Local JSON Mode
  const currentDb = await ensureDbFile();
  if (!Array.isArray(currentDb.profiles)) {
    currentDb.profiles = [];
  }

  const existingIdx = currentDb.profiles.findIndex(
    (p) => p.id === profile.id || p.email.toLowerCase() === profile.email.toLowerCase()
  );

  if (existingIdx >= 0) {
    currentDb.profiles[existingIdx] = {
      ...currentDb.profiles[existingIdx],
      ...profile,
      updated_at: new Date().toISOString(),
    };
  } else {
    currentDb.profiles.push(profile);
  }

  await enqueueWrite(async () => {
    await writeDbFileAtomic(currentDb);
  });

  return profile;
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  if (IS_SUPABASE) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase error fetching profiles:', error.message);
      return [];
    }
    return (data as UserProfile[]) || [];
  }

  // Local JSON Mode
  const currentDb = await ensureDbFile();
  return currentDb.profiles || [];
}
