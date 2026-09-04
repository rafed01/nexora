'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Shield,
  Layers,
  Cpu,
  Building2,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  FileText,
  TrendingUp,
  Download,
  Trash2,
  Edit3,
  Eye,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Lock,
  Unlock,
  SlidersHorizontal,
  Mail,
  ArrowLeft,
  Settings,
  Database,
  BarChart3,
  Award,
} from 'lucide-react';

type EntityTab = 'technologies' | 'startups' | 'experts' | 'challenges' | 'reports' | 'requests';

interface AdminItem {
  id: string;
  type: 'technology' | 'startup' | 'expert' | 'challenge' | 'report';
  title: string;
  category: string;
  organization: string;
  trl?: number;
  status: 'Active' | 'Pending Review' | 'Draft' | 'Archived';
  dateAdded: string;
  verifiedBy?: string;
  leadExpert?: string;
  budget?: string;
  accessCount: number;
}

interface AccessRequest {
  id: string;
  entityTitle: string;
  entityType: string;
  requesterName: string;
  requesterOrg: string;
  requesterEmail: string;
  purpose: 'Pilot Due Diligence' | 'JDA Partnership' | 'Investment Inquiry' | 'Academic SAB';
  ndaStatus: 'Executed' | 'Pending Signature';
  dateRequested: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const INITIAL_ENTITIES: AdminItem[] = [
  {
    id: 'tech-photonic-mpu',
    type: 'technology',
    title: 'Photonic Matrix Processing Unit (P-MPU)',
    category: 'Optical Computing',
    organization: 'NEXORA Optoelectronics Core',
    trl: 6,
    status: 'Active',
    dateAdded: '2026-08-12',
    verifiedBy: 'IMEC / CERN OpenLab',
    accessCount: 142,
  },
  {
    id: 'tech-solid-state-electrolyte',
    type: 'technology',
    title: 'High-Purity Argyrodite Solid Electrolyte',
    category: 'Advanced Energy Storage',
    organization: 'Kyoto Materials Innovation Lab',
    trl: 7,
    status: 'Active',
    dateAdded: '2026-08-15',
    verifiedBy: 'TÜV Rheinland / Novavolt',
    accessCount: 98,
  },
  {
    id: 'tech-quantum-mitigation',
    type: 'technology',
    title: 'Tensor-Network Quantum Error Mitigation',
    category: 'Quantum Algorithms',
    organization: 'CERN OpenLab Consortium',
    trl: 5,
    status: 'Active',
    dateAdded: '2026-08-20',
    verifiedBy: 'EuroHPC / ETH Zurich',
    accessCount: 76,
  },
  {
    id: 'tech-biocatalytic-enzymes',
    type: 'technology',
    title: 'Thermostable De Novo Hydrolase Mutants',
    category: 'Synthetic Biology',
    organization: 'Biozentrum Basel',
    trl: 4,
    status: 'Pending Review',
    dateAdded: '2026-09-01',
    verifiedBy: 'In Review',
    accessCount: 23,
  },
  {
    id: 'startup-aetherion',
    type: 'startup',
    title: 'Aetherion Dynamics',
    category: 'Autonomous Aerospace & Swarm AI',
    organization: 'Aetherion Corp.',
    trl: 7,
    status: 'Active',
    dateAdded: '2026-07-28',
    verifiedBy: 'ISAE-SUPAERO Spinout Council',
    accessCount: 215,
  },
  {
    id: 'startup-synthosyn',
    type: 'startup',
    title: 'SynthoSyn Bio',
    category: 'Generative Protein Engineering',
    organization: 'SynthoSyn Lab',
    trl: 6,
    status: 'Active',
    dateAdded: '2026-08-04',
    verifiedBy: 'Novartis Venture Mentorship',
    accessCount: 184,
  },
  {
    id: 'startup-qubit-shield',
    type: 'startup',
    title: 'CryoShield Quantum Cryogenics',
    category: 'Quantum Hardware',
    organization: 'Delft Quantum Campus',
    trl: 5,
    status: 'Draft',
    dateAdded: '2026-09-02',
    verifiedBy: 'Self-Reported',
    accessCount: 8,
  },
  {
    id: 'expert-rostova',
    type: 'expert',
    title: 'Dr. Elena Rostova',
    category: 'Silicon Photonics & Quantum Optics',
    organization: 'Max Planck Institute',
    status: 'Active',
    dateAdded: '2026-06-10',
    verifiedBy: 'NEXORA Fellow Committee',
    accessCount: 312,
  },
  {
    id: 'expert-chen',
    type: 'expert',
    title: 'Dr. Kaviya Chen',
    category: 'Decentralized Swarm Autonomy',
    organization: 'ETH Zurich & MIT CSAIL',
    status: 'Active',
    dateAdded: '2026-06-15',
    verifiedBy: 'NEXORA Fellow Committee',
    accessCount: 245,
  },
  {
    id: 'expert-vance',
    type: 'expert',
    title: 'Marcus Vance, PhD',
    category: 'Battery Chemistry & Dry Coating',
    organization: 'Ex-Tesla / Kyoto Materials',
    status: 'Active',
    dateAdded: '2026-07-01',
    verifiedBy: 'European Battery Alliance',
    accessCount: 198,
  },
  {
    id: 'challenge-helios-optics',
    type: 'challenge',
    title: 'Sub-Femtojoule Optical Interconnects for AI Datacenters',
    category: 'Silicon Photonics',
    organization: 'Helios Cloud Infrastructure Group',
    status: 'Active',
    dateAdded: '2026-08-10',
    budget: '$750,000 Allocation',
    accessCount: 420,
  },
  {
    id: 'challenge-novavolt-dry-coating',
    type: 'challenge',
    title: 'Roll-to-Roll Dry Coating Solid-State Separator Scalability',
    category: 'Advanced Energy Storage',
    organization: 'Novavolt Powertrain Systems',
    status: 'Active',
    dateAdded: '2026-08-14',
    budget: '€450,000 Funded Pilot',
    accessCount: 310,
  },
  {
    id: 'report-q3-photonics-market',
    type: 'report',
    title: 'Global Co-Packaged Optics & Sub-Watt AI Hardware Outlook 2026-2030',
    category: 'Semiconductor Intelligence',
    organization: 'NEXORA Research Desk',
    status: 'Active',
    dateAdded: '2026-08-25',
    accessCount: 520,
  },
  {
    id: 'report-solid-state-benchmarks',
    type: 'report',
    title: 'Sulfide vs. Oxide Solid Electrolytes: Gigafactory Readiness Audit',
    category: 'Battery Intelligence',
    organization: 'NEXORA Research Desk',
    status: 'Active',
    dateAdded: '2026-08-30',
    accessCount: 388,
  },
];

const INITIAL_REQUESTS: AccessRequest[] = [
  {
    id: 'req-001',
    entityTitle: 'Photonic Matrix Processing Unit (P-MPU)',
    entityType: 'technology',
    requesterName: 'Dr. Henrik Holst',
    requesterOrg: 'Nordic Semiconductor Labs',
    requesterEmail: 'h.holst@nordicsemi.no',
    purpose: 'Pilot Due Diligence',
    ndaStatus: 'Executed',
    dateRequested: '2026-09-03',
    status: 'Pending',
  },
  {
    id: 'req-002',
    entityTitle: 'High-Purity Argyrodite Solid Electrolyte',
    entityType: 'technology',
    requesterName: 'Klara Lindemann',
    requesterOrg: 'BMW Group Powertrain Research',
    requesterEmail: 'k.lindemann@bmwgroup.de',
    purpose: 'JDA Partnership',
    ndaStatus: 'Executed',
    dateRequested: '2026-09-02',
    status: 'Pending',
  },
  {
    id: 'req-003',
    entityTitle: 'Aetherion Dynamics',
    entityType: 'startup',
    requesterName: 'Philippe Moreau',
    requesterOrg: 'Thales Alenia Space Systems',
    requesterEmail: 'p.moreau@thalesgroup.com',
    purpose: 'Pilot Due Diligence',
    ndaStatus: 'Pending Signature',
    dateRequested: '2026-09-01',
    status: 'Pending',
  },
  {
    id: 'req-004',
    entityTitle: 'Dr. Elena Rostova',
    entityType: 'expert',
    requesterName: 'Julian Vance',
    requesterOrg: 'Apex Quantum Ventures',
    requesterEmail: 'jvance@apexqv.io',
    purpose: 'Academic SAB',
    ndaStatus: 'Executed',
    dateRequested: '2026-08-29',
    status: 'Approved',
  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<EntityTab>('technologies');
  const [entities, setEntities] = useState<AdminItem[]>(INITIAL_ENTITIES);
  const [requests, setRequests] = useState<AccessRequest[]>(INITIAL_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Entity Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntity, setNewEntity] = useState<{
    type: 'technology' | 'startup' | 'expert' | 'challenge' | 'report';
    title: string;
    category: string;
    organization: string;
    trl: number;
    budget?: string;
    status: 'Active' | 'Pending Review' | 'Draft';
  }>({
    type: 'technology',
    title: '',
    category: '',
    organization: '',
    trl: 6,
    budget: '',
    status: 'Active',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const totalNodes = entities.length;
    const pendingReview = entities.filter((e) => e.status === 'Pending Review').length;
    const activeChallenges = entities.filter((e) => e.type === 'challenge' && e.status === 'Active').length;
    const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
    const totalAccessQueries = entities.reduce((acc, curr) => acc + curr.accessCount, 0);

    return {
      totalNodes,
      pendingReview,
      activeChallenges,
      pendingRequests,
      totalAccessQueries,
    };
  }, [entities, requests]);

  // Filtered items based on active tab and search
  const filteredEntities = useMemo(() => {
    return entities.filter((item) => {
      // Tab matching
      if (activeTab === 'technologies' && item.type !== 'technology') return false;
      if (activeTab === 'startups' && item.type !== 'startup') return false;
      if (activeTab === 'experts' && item.type !== 'expert') return false;
      if (activeTab === 'challenges' && item.type !== 'challenge') return false;
      if (activeTab === 'reports' && item.type !== 'report') return false;

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Search query
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q)
      );
    });
  }, [entities, activeTab, statusFilter, searchQuery]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        req.entityTitle.toLowerCase().includes(q) ||
        req.requesterName.toLowerCase().includes(q) ||
        req.requesterOrg.toLowerCase().includes(q)
      );
    });
  }, [requests, searchQuery]);

  // Handlers
  const handleToggleStatus = (id: string) => {
    setEntities((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus =
            item.status === 'Active'
              ? 'Archived'
              : item.status === 'Archived'
              ? 'Active'
              : item.status === 'Pending Review'
              ? 'Active'
              : 'Active';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
    showToast('Entity status updated successfully');
  };

  const handleDeleteEntity = (id: string) => {
    setEntities((prev) => prev.filter((item) => item.id !== id));
    showToast('Entity removed from registry');
  };

  const handleRequestAction = (id: string, action: 'Approved' | 'Rejected') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
    showToast(`Access Request ${id} has been ${action}`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntity.title || !newEntity.category || !newEntity.organization) {
      showToast('Please fill in all mandatory fields');
      return;
    }

    const generatedId = `${newEntity.type}-${newEntity.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 24)}`;

    const created: AdminItem = {
      id: generatedId,
      type: newEntity.type,
      title: newEntity.title,
      category: newEntity.category,
      organization: newEntity.organization,
      trl: newEntity.type === 'technology' || newEntity.type === 'startup' ? newEntity.trl : undefined,
      budget: newEntity.type === 'challenge' ? newEntity.budget || '€250,000 Pilot Allocation' : undefined,
      status: newEntity.status,
      dateAdded: new Date().toISOString().split('T')[0],
      verifiedBy: 'Curator Manual Entry',
      accessCount: 0,
    };

    setEntities((prev) => [created, ...prev]);
    setIsModalOpen(false);
    setNewEntity({
      type: 'technology',
      title: '',
      category: '',
      organization: '',
      trl: 6,
      budget: '',
      status: 'Active',
    });
    showToast(`Registered new entity: ${created.title}`);
  };

  const exportRegistryData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nexora_registry_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Registry catalog exported as JSON');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div
          id="admin-toast"
          className="fixed bottom-6 right-6 z-50 bg-cyan-950 border border-cyan-500 text-cyan-200 text-xs font-mono px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header
        id="admin-header"
        className="sticky top-0 z-40 border-b border-neutral-800/90 bg-neutral-950/95 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              id="back-home-btn"
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-100 transition-colors p-1.5 rounded-lg hover:bg-neutral-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Platform</span>
            </Link>

            <div className="h-4 w-px bg-neutral-800" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-wider font-mono text-neutral-100">
                    NEXORA
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                    Curator Console
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">Registry & Asset Management</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={exportRegistryData}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">View Catalog</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Node</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Summary Cards */}
        <section id="admin-summary-metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Total Registered Nodes</span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-neutral-100">{metrics.totalNodes}</div>
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">+12 verified this month</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Pending Access Requests</span>
              <Mail className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-amber-400">
              {metrics.pendingRequests}
            </div>
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Awaiting bilateral NDA clearance</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Active Corporate RFPs</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">
              {metrics.activeChallenges}
            </div>
            <div className="text-[11px] text-neutral-400">€4.2M Total Committed Pilot Capital</div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Total Telemetry Queries</span>
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-cyan-400">
              {metrics.totalAccessQueries}
            </div>
            <div className="text-[11px] text-neutral-400">Across tier-1 industry subscribers</div>
          </div>
        </section>

        {/* Management Tabs and Filters */}
        <section id="admin-management-controls" className="space-y-4">
          {/* Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab('technologies')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono flex items-center gap-2 transition-colors ${
                  activeTab === 'technologies'
                    ? 'bg-neutral-800 text-cyan-300 border border-neutral-700 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Technologies ({entities.filter((e) => e.type === 'technology').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('startups')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono flex items-center gap-2 transition-colors ${
                  activeTab === 'startups'
                    ? 'bg-neutral-800 text-cyan-300 border border-neutral-700 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Startups & Labs ({entities.filter((e) => e.type === 'startup').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('experts')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono flex items-center gap-2 transition-colors ${
                  activeTab === 'experts'
                    ? 'bg-neutral-800 text-cyan-300 border border-neutral-700 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Experts ({entities.filter((e) => e.type === 'expert').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('challenges')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono flex items-center gap-2 transition-colors ${
                  activeTab === 'challenges'
                    ? 'bg-neutral-800 text-cyan-300 border border-neutral-700 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Challenges ({entities.filter((e) => e.type === 'challenge').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono flex items-center gap-2 transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-neutral-800 text-cyan-300 border border-neutral-700 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Reports ({entities.filter((e) => e.type === 'report').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono flex items-center gap-2 transition-colors ${
                  activeTab === 'requests'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Access Requests ({requests.filter((r) => r.status === 'Pending').length})</span>
              </button>
            </div>

            {/* Quick Actions Counter */}
            <div className="text-xs font-mono text-neutral-400 hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Curator Sync Live</span>
            </div>
          </div>

          {/* Search and Secondary Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title, domain, or organization..."
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

            {activeTab !== 'requests' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-mono text-neutral-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Tab 1-5: Entities Table View */}
        {activeTab !== 'requests' ? (
          <section id="entities-table-section" className="space-y-4">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-800 bg-neutral-950/60 font-mono text-neutral-400">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Entity / Title</th>
                      <th className="py-3.5 px-4 font-semibold">Domain & Category</th>
                      <th className="py-3.5 px-4 font-semibold">Organization</th>
                      <th className="py-3.5 px-4 font-semibold">TRL / Budget</th>
                      <th className="py-3.5 px-4 font-semibold">Verification Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredEntities.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500 font-mono">
                          No entities matched the specified filters.
                        </td>
                      </tr>
                    ) : (
                      filteredEntities.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-neutral-900/60 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-neutral-100 flex items-center gap-2">
                              <span>{item.title}</span>
                              {item.status === 'Draft' && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                                  Draft
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                              ID: {item.id} · Added {item.dateAdded}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-neutral-300 font-mono">
                            {item.category}
                          </td>

                          <td className="py-3.5 px-4 text-neutral-300">
                            {item.organization}
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            {item.trl ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-800 text-cyan-300 border border-neutral-700">
                                TRL {item.trl}
                              </span>
                            ) : item.budget ? (
                              <span className="text-emerald-400 font-semibold">{item.budget}</span>
                            ) : (
                              <span className="text-neutral-500">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                item.status === 'Active'
                                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                                  : item.status === 'Pending Review'
                                  ? 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                                  : item.status === 'Draft'
                                  ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                                  : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              <span>{item.status}</span>
                            </span>
                            {item.verifiedBy && (
                              <div className="text-[10px] text-neutral-500 mt-1 truncate max-w-[150px]">
                                {item.verifiedBy}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <Link
                                href={
                                  item.type === 'technology'
                                    ? `/technology/${item.id}`
                                    : item.type === 'startup'
                                    ? `/startup/${item.id}`
                                    : item.type === 'expert'
                                    ? `/expert/${item.id}`
                                    : item.type === 'challenge'
                                    ? '/challenges'
                                    : '/explore'
                                }
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-cyan-300 hover:bg-neutral-800 transition-colors"
                                title="Inspect Live View"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item.id)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition-colors"
                                title={item.status === 'Active' ? 'Archive Entity' : 'Activate Entity'}
                              >
                                {item.status === 'Active' ? (
                                  <Lock className="w-3.5 h-3.5" />
                                ) : (
                                  <Unlock className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteEntity(item.id)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                                title="Remove Entity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          /* Tab 6: Pending Access Requests */
          <section id="access-requests-section" className="space-y-4">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-800 bg-neutral-950/60 font-mono text-neutral-400">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Requester Details</th>
                      <th className="py-3.5 px-4 font-semibold">Target Node</th>
                      <th className="py-3.5 px-4 font-semibold">Engagement Purpose</th>
                      <th className="py-3.5 px-4 font-semibold">NDA Clearance</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500 font-mono">
                          No pending access requests match the query.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-neutral-900/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-neutral-100">{req.requesterName}</div>
                            <div className="text-neutral-400 text-[11px]">{req.requesterOrg}</div>
                            <div className="text-cyan-400 font-mono text-[10px] mt-0.5">
                              {req.requesterEmail}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-neutral-200">{req.entityTitle}</div>
                            <span className="text-[10px] font-mono uppercase text-neutral-500">
                              {req.entityType}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-200 border border-neutral-700">
                              {req.purpose}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {req.ndaStatus === 'Executed' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>NDA Executed</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Awaiting Signature</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                req.status === 'Approved'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                  : req.status === 'Rejected'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                  : 'bg-amber-950 text-amber-300 border border-amber-700'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {req.status === 'Pending' ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRequestAction(req.id, 'Approved')}
                                  className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-[11px] font-semibold transition-colors flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Grant</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRequestAction(req.id, 'Rejected')}
                                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-rose-300 text-[11px] font-medium transition-colors flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Decline</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] font-mono text-neutral-500">
                                Decision Recorded
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Creation Modal Drawer */}
      {isModalOpen && (
        <div
          id="create-entity-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            id="create-entity-dialog"
            className="w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-100">Register New Deep-Tech Entity</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Direct manual curation entry into the verified NEXORA catalog
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-300">Entity Classification</label>
                <select
                  value={newEntity.type}
                  onChange={(e) =>
                    setNewEntity({
                      ...newEntity,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="technology">Technology Node (Deep-Tech IP / Subsystem)</option>
                  <option value="startup">Startup / Spinout Laboratory</option>
                  <option value="expert">Principal Investigator / Research Fellow</option>
                  <option value="challenge">Corporate Challenge / RFP Brief</option>
                  <option value="report">Deep-Tech Market Intelligence Report</option>
                </select>
              </div>

              {/* Title / Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-300">
                  {newEntity.type === 'expert'
                    ? 'Full Name & Title'
                    : newEntity.type === 'challenge'
                    ? 'RFP Problem Title'
                    : 'Entity Title / Product Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newEntity.type === 'expert'
                      ? 'e.g. Dr. Aris Thorne'
                      : newEntity.type === 'challenge'
                      ? 'e.g. Sub-Watt High Heat Dissipation Module'
                      : 'e.g. Gallium Nitride Power Inverter'
                  }
                  value={newEntity.title}
                  onChange={(e) => setNewEntity({ ...newEntity, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Category / Sector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-300">Primary Domain / Taxonomy</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optical Computing, Advanced Battery Chemistry, Synthetic Biology"
                  value={newEntity.category}
                  onChange={(e) => setNewEntity({ ...newEntity, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Organization / Affiliation */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-300">Lead Organization / Institute</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fraunhofer Institute, Kyoto Lab, ETH Zurich"
                  value={newEntity.organization}
                  onChange={(e) => setNewEntity({ ...newEntity, organization: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Conditional: TRL or Budget */}
              {(newEntity.type === 'technology' || newEntity.type === 'startup') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-neutral-300">
                      Technology Readiness Level (TRL {newEntity.trl})
                    </label>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {newEntity.trl <= 3
                        ? 'Proof of Concept'
                        : newEntity.trl <= 6
                        ? 'Relevant Lab Validation'
                        : 'Operational Field Demo'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={9}
                    value={newEntity.trl}
                    onChange={(e) =>
                      setNewEntity({ ...newEntity, trl: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>
              )}

              {newEntity.type === 'challenge' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-neutral-300">Pilot Budget / Grant Allocation</label>
                  <input
                    type="text"
                    placeholder="e.g. €500,000 Funded Co-Development"
                    value={newEntity.budget}
                    onChange={(e) => setNewEntity({ ...newEntity, budget: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Initial Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-300">Initial Verification Status</label>
                <select
                  value={newEntity.status}
                  onChange={(e) =>
                    setNewEntity({
                      ...newEntity,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Active">Active (Immediately Discoverable)</option>
                  <option value="Pending Review">Pending Review (Staged for Audit)</option>
                  <option value="Draft">Draft (Internal Sandbox)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 text-xs font-medium hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Commit to Registry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Footer */}
      <footer
        id="admin-footer"
        className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-400 mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-neutral-300 font-semibold">NEXORA Admin Registry</span>
            <span className="text-neutral-500">· Operational Node</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-neutral-400">Curator Session Encrypted</span>
            <span>&copy; {new Date().getFullYear()} NEXORA Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
