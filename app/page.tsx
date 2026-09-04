'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Cpu,
  Workflow,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Layers,
  Menu,
  X,
  CheckCircle2,
  Activity,
  Sparkles,
  ChevronRight,
  GitBranch,
} from 'lucide-react';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tag: string;
}

const features: FeatureItem[] = [
  {
    id: 'feature-discovery',
    title: 'Guided Architecture Discovery',
    description:
      'Map multi-system tech stacks with continuous constraint matching, dependency mapping, and automated architectural trade-off evaluations.',
    icon: Compass,
    tag: 'Exploration',
  },
  {
    id: 'feature-synthesis',
    title: 'Adaptive Roadmap Synthesis',
    description:
      'Synthesize evolutionary development tracks that autonomously recalibrate as project goals, dependencies, and ecosystem capabilities shift.',
    icon: Workflow,
    tag: 'Strategy',
  },
  {
    id: 'feature-sandbox',
    title: 'Verifiable Prototyping Sandbox',
    description:
      'Simulate high-risk technical integrations inside isolated, deterministic testing environments before committing mission-critical capital.',
    icon: Terminal,
    tag: 'Validation',
  },
  {
    id: 'feature-governance',
    title: 'Autonomous Tech Governance',
    description:
      'Enforce compliance standards, vulnerability gates, and performance telemetry through automated policy baselines.',
    icon: ShieldCheck,
    tag: 'Reliability',
  },
];

const capabilities = [
  {
    step: 'Phase 01',
    title: 'Vector Technology Ingestion',
    detail: 'Indexes technical standards, RFCs, and repository topologies.',
  },
  {
    step: 'Phase 02',
    title: 'Heuristic Synthesis',
    detail: 'Resolves stack frictions and generates verifiable architectural drafts.',
  },
  {
    step: 'Phase 03',
    title: 'Deterministic Deployment',
    detail: 'Validates throughput, latency profiles, and security envelopes.',
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [activeTab, setActiveTab] = useState<'architecture' | 'roadmap' | 'runtime'>('architecture');

  const handleCtaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setEmailSubmitted(true);
      setEmailInput('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Navigation Bar */}
      <header
        id="navbar-header"
        className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              id="brand-logo-badge"
              className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-cyan-400 shadow-sm"
            >
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-wider text-neutral-100 font-mono">
                NEXORA
              </span>
              <span className="text-[11px] text-neutral-400 hidden sm:inline">
                Technology Innovation Platform
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav id="desktop-navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-400">
            <a href="#hero" className="hover:text-neutral-100 transition-colors">
              Overview
            </a>
            <Link href="/explore" className="text-neutral-400 hover:text-neutral-100 font-medium transition-colors">
              Discovery
            </Link>
            <Link href="/challenges" className="text-neutral-400 hover:text-neutral-100 font-medium transition-colors">
              Challenges
            </Link>
            <Link href="/reports" className="text-neutral-400 hover:text-neutral-100 font-medium transition-colors">
              Reports
            </Link>
            <Link href="/ai-scout" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Scout</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">Live</span>
            </Link>
            <Link href="/admin" className="text-neutral-400 hover:text-neutral-100 font-medium transition-colors">
              Admin
            </Link>
            <a href="#features" className="hover:text-neutral-100 transition-colors">
              Platform
            </a>
          </nav>

          {/* Action CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              id="btn-nav-action"
              href="/dashboard"
              className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Launch Console
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div id="mobile-nav-panel" className="md:hidden border-t border-neutral-800 bg-neutral-950 px-4 pt-3 pb-5 space-y-3">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-300 hover:text-cyan-400 py-1"
            >
              Overview
            </a>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-300 hover:text-cyan-400 py-1"
            >
              Discovery Dashboard
            </Link>
            <Link
              href="/challenges"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-300 hover:text-cyan-400 py-1"
            >
              Challenges
            </Link>
            <Link
              href="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-300 hover:text-cyan-400 py-1"
            >
              Reports & Publications
            </Link>
            <Link
              href="/ai-scout"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-cyan-400 hover:text-cyan-300 py-1"
            >
              AI Scout Engine
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-300 hover:text-cyan-400 py-1"
            >
              Curator Admin Console
            </Link>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-300 hover:text-cyan-400 py-1"
            >
              Platform
            </a>
            <a
              href="#architecture-flow"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-300 hover:text-cyan-400 py-1"
            >
              Architecture
            </a>
            <a
              href="#cta-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-300 hover:text-cyan-400 py-1"
            >
              Get Started
            </a>
            <div className="pt-2">
              <a
                href="#cta-section"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center text-xs font-semibold px-4 py-2.5 rounded-lg bg-cyan-500 text-neutral-950 font-medium"
              >
                Access Platform
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section
          id="hero"
          className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden border-b border-neutral-800/60"
        >
          {/* Subtle geometric ambient backdrop */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] bg-neutral-800 rounded-full blur-[140px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              {/* Platform Status Badge */}
              <div
                id="hero-status-pill"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/90 text-xs text-neutral-300 mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Next-Generation Innovation Engine</span>
              </div>

              {/* Display Headline */}
              <h1
                id="hero-main-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-100 leading-tight"
              >
                Guided technology innovation, engineered for scale.
              </h1>

              {/* Subheading / Description */}
              <p
                id="hero-subtext"
                className="mt-6 text-lg sm:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto"
              >
                NEXORA guides engineering leaders and research teams from ambiguous technological
                hypotheses to verified architectural blueprints and actionable execution paths.
              </p>

              {/* Hero Call To Action Buttons */}
              <div
                id="hero-cta-group"
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  id="btn-hero-primary"
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-sm transition-colors shadow-sm"
                >
                  <span>Launch AI Scout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  id="btn-hero-secondary"
                  href="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-medium text-sm transition-colors"
                >
                  <span>Explore Discovery</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                </Link>
              </div>

              {/* Metrics bar */}
              <div
                id="hero-metrics-bar"
                className="mt-14 pt-8 border-t border-neutral-900 grid grid-cols-2 md:grid-cols-3 gap-6 text-left"
              >
                <div id="metric-item-1" className="p-4 rounded-lg bg-neutral-900/40 border border-neutral-800/40">
                  <div className="text-2xl font-bold font-mono text-neutral-100">99.98%</div>
                  <div className="text-xs text-neutral-400 mt-1">Architecture Feasibility Verification</div>
                </div>
                <div id="metric-item-2" className="p-4 rounded-lg bg-neutral-900/40 border border-neutral-800/40">
                  <div className="text-2xl font-bold font-mono text-neutral-100">4.2x</div>
                  <div className="text-xs text-neutral-400 mt-1">Acceleration to Technical Prototype</div>
                </div>
                <div id="metric-item-3" className="col-span-2 md:col-span-1 p-4 rounded-lg bg-neutral-900/40 border border-neutral-800/40">
                  <div className="text-2xl font-bold font-mono text-neutral-100">Deterministic</div>
                  <div className="text-xs text-neutral-400 mt-1">Constraint & Security Compliance</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section
          id="features"
          className="py-20 bg-neutral-950 border-b border-neutral-800/60"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14">
              <div className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider mb-2">
                Platform Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-100 tracking-tight">
                Structured systems designed to de-risk innovation
              </h2>
              <p className="mt-4 text-neutral-400 text-base leading-relaxed">
                Transform technical uncertainty into structured roadmaps through four integrated
                foundational pillars.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={feature.id}
                    id={feature.id}
                    className="p-8 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center text-cyan-400 border border-neutral-700/60">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/50">
                          {feature.tag}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-100 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-800/70 flex items-center text-xs text-neutral-400 gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Standard-compliant architectural validation</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Guided Technology Workflow Deep Dive */}
        <section
          id="architecture-flow"
          className="py-20 bg-neutral-900/30 border-b border-neutral-800/60"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Details */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    Interactive Preview
                  </span>
                  <h2 className="mt-2 text-3xl font-bold text-neutral-100 tracking-tight">
                    How NEXORA navigates technology stacks
                  </h2>
                  <p className="mt-3 text-neutral-400 text-sm leading-relaxed">
                    Select a stage to inspect the guided intelligence layer processing technical
                    specifications into active implementations.
                  </p>
                </div>

                {/* Tab Switcher */}
                <div id="workflow-tabs" className="space-y-3 pt-2">
                  <button
                    id="tab-architecture-btn"
                    type="button"
                    onClick={() => setActiveTab('architecture')}
                    className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer ${
                      activeTab === 'architecture'
                        ? 'bg-neutral-800/80 border-cyan-500/60 text-neutral-100'
                        : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">1. Architectural Analysis</span>
                      <Layers className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xs mt-1 text-neutral-400">
                      Evaluates interface contracts, database topologies, and microservice latencies.
                    </p>
                  </button>

                  <button
                    id="tab-roadmap-btn"
                    type="button"
                    onClick={() => setActiveTab('roadmap')}
                    className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer ${
                      activeTab === 'roadmap'
                        ? 'bg-neutral-800/80 border-cyan-500/60 text-neutral-100'
                        : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">2. Roadmap Sequencing</span>
                      <GitBranch className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xs mt-1 text-neutral-400">
                      Calculates critical dependency pathing and unblocks prototype iterations.
                    </p>
                  </button>

                  <button
                    id="tab-runtime-btn"
                    type="button"
                    onClick={() => setActiveTab('runtime')}
                    className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer ${
                      activeTab === 'runtime'
                        ? 'bg-neutral-800/80 border-cyan-500/60 text-neutral-100'
                        : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">3. Runtime Verification</span>
                      <Activity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-xs mt-1 text-neutral-400">
                      Deploys synthetic load probes to verify fault tolerance against SLA targets.
                    </p>
                  </button>
                </div>
              </div>

              {/* Right Terminal / Interactive Card */}
              <div className="lg:col-span-7">
                <div
                  id="system-preview-card"
                  className="rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-2xl"
                >
                  <div className="px-4 py-3 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-neutral-700" />
                      <span className="w-3 h-3 rounded-full bg-neutral-700" />
                      <span className="w-3 h-3 rounded-full bg-neutral-700" />
                      <span className="ml-2 font-mono text-xs text-neutral-400">
                        nexora-runtime://sandbox/evaluation.log
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-mono text-neutral-400">READY</span>
                    </div>
                  </div>

                  <div className="p-6 font-mono text-xs space-y-4">
                    {activeTab === 'architecture' && (
                      <div className="space-y-3">
                        <div className="text-neutral-400">
                          <span className="text-cyan-400">$</span> nexora analyze --target=enterprise-core
                        </div>
                        <div className="p-3 rounded bg-neutral-900 border border-neutral-800/80 text-neutral-300 space-y-2">
                          <div className="text-neutral-200 font-semibold">[Analysis Matrix Initialized]</div>
                          <div className="text-neutral-400">- Target Frameworks: Next.js 15, Edge Functions, Distributed Event Broker</div>
                          <div className="text-neutral-400">- Concurrency Target: 25,000 req/sec</div>
                          <div className="text-cyan-300">- Feasibility Index: 98.4% (Optimal trade-off identified)</div>
                        </div>
                        <div className="text-neutral-400 text-[11px]">
                          ✓ Inferred zero-copy serialized memory pipes.
                        </div>
                      </div>
                    )}

                    {activeTab === 'roadmap' && (
                      <div className="space-y-3">
                        <div className="text-neutral-400">
                          <span className="text-cyan-400">$</span> nexora synthesize --scope=mvp
                        </div>
                        <div className="p-3 rounded bg-neutral-900 border border-neutral-800/80 text-neutral-300 space-y-2">
                          <div className="text-neutral-200 font-semibold">[Sequence Graph Generated]</div>
                          <div className="text-neutral-400">Track A: Distributed Data Tier (Weeks 1-2)</div>
                          <div className="text-neutral-400">Track B: Guided Verification Engine (Weeks 2-4)</div>
                          <div className="text-cyan-300">Track C: Automated Regression Suite (Concurrent)</div>
                        </div>
                        <div className="text-neutral-400 text-[11px]">
                          ✓ 0 architectural circularities detected in dependency trees.
                        </div>
                      </div>
                    )}

                    {activeTab === 'runtime' && (
                      <div className="space-y-3">
                        <div className="text-neutral-400">
                          <span className="text-cyan-400">$</span> nexora verify --deterministic
                        </div>
                        <div className="p-3 rounded bg-neutral-900 border border-neutral-800/80 text-neutral-300 space-y-2">
                          <div className="text-neutral-200 font-semibold">[Simulation Benchmarks]</div>
                          <div className="text-neutral-400">- Synthetic Load: 100,000 transactions</div>
                          <div className="text-neutral-400">- P99 Latency: 11.4ms</div>
                          <div className="text-emerald-400">- Stress Verification: PASS (Zero memory leaks)</div>
                        </div>
                        <div className="text-neutral-400 text-[11px]">
                          ✓ Architecture signed and certified for production readiness.
                        </div>
                      </div>
                    )}

                    {/* Step summary */}
                    <div className="pt-4 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {capabilities.map((cap) => (
                        <div key={cap.step} className="p-2.5 rounded bg-neutral-900/70 border border-neutral-800/60">
                          <div className="text-[10px] text-cyan-400 font-mono">{cap.step}</div>
                          <div className="text-neutral-200 font-sans font-medium text-xs mt-0.5">{cap.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section
          id="cta-section"
          className="py-20 bg-neutral-950 relative overflow-hidden"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="p-10 sm:p-14 rounded-2xl bg-neutral-900/70 border border-neutral-800 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-cyan-400 text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Early Access Program</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-100 tracking-tight">
                Ready to accelerate your technological roadmap?
              </h2>

              <p className="mt-4 text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
                Join engineering teams building with NEXORA. Request platform onboarding or access our
                guided innovation sandbox today.
              </p>

              {/* Action Form */}
              <div className="mt-8 max-w-md mx-auto">
                {emailSubmitted ? (
                  <div
                    id="cta-success-message"
                    className="p-4 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                    <span>Access requested. Check your inbox for workspace credentials.</span>
                  </div>
                ) : (
                  <form id="cta-form" onSubmit={handleCtaSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      id="cta-email-input"
                      type="email"
                      required
                      placeholder="engineer@company.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button
                      id="btn-cta-submit"
                      type="submit"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Request Access
                    </button>
                  </form>
                )}
                <p className="text-xs text-neutral-400 mt-3">
                  Instant deployment sandbox included. No long-term lock-in.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="main-footer" className="border-t border-neutral-900 bg-neutral-950 py-10 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-neutral-300 font-semibold">NEXORA</span>
            <span className="text-neutral-400">· Guided Technology Innovation Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              All Systems Operational
            </span>
            <span>&copy; {new Date().getFullYear()} NEXORA Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
