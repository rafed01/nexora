'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Cpu,
  Compass,
  Briefcase,
  FileText,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  Lock,
  ArrowRight,
  CheckCircle2,
  Building2,
  Mail,
  User,
} from 'lucide-react';

interface NavLinkItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  description?: string;
}

const NAV_LINKS: NavLinkItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Cpu,
    description: 'Guided innovation platform overview & architecture',
  },
  {
    name: 'Explore',
    href: '/explore',
    icon: Compass,
    badge: 'TRL 1-9',
    badgeColor: 'border-neutral-700 text-neutral-300 bg-neutral-900',
    description: 'Vetted technologies, venture labs & domain experts',
  },
  {
    name: 'Challenges',
    href: '/challenges',
    icon: Briefcase,
    badge: '$5.4M JDA',
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-950/40',
    description: 'Corporate problem statements & co-development trials',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Deep-tech intelligence, audits & patent maps',
  },
  {
    name: 'AI Scout',
    href: '/ai-scout',
    icon: Sparkles,
    badge: 'LIVE',
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/60',
    description: 'Generative search & heuristic matching engine',
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Telemetry console, saved ventures & watchlist',
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: ShieldCheck,
    badge: 'GOV',
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-950/40',
    description: 'Platform governance, triage & vetting pipeline',
  },
];

export default function Navbar({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [requestAccessModalOpen, setRequestAccessModalOpen] = useState(false);
  const [accessSubmitted, setAccessSubmitted] = useState(false);
  const [clearanceToken, setClearanceToken] = useState('');

  // Form State for Request Access
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    organization: '',
    roleTier: 'Corporate R&D Director',
    intent: 'Bilateral NDA & Due Diligence',
    ndaAgreed: true,
  });

  // Handle escape key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRequestAccessModalOpen(false);
      }
    };
    if (requestAccessModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestAccessModalOpen]);

  const handleOpenAccessModal = () => {
    setRequestAccessModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workEmail.trim() || !formData.organization.trim()) return;

    // Generate deterministic Bloomberg-style clearance token
    const token = `NX-CLR-${Math.floor(100000 + Math.random() * 900000)}`;
    setClearanceToken(token);
    setAccessSubmitted(true);
  };

  const resetModalState = () => {
    setRequestAccessModalOpen(false);
    setTimeout(() => {
      setAccessSubmitted(false);
      setFormData({
        fullName: '',
        workEmail: '',
        organization: '',
        roleTier: 'Corporate R&D Director',
        intent: 'Bilateral NDA & Due Diligence',
        ndaAgreed: true,
      });
    }, 300);
  };

  return (
    <>
      {/* Sticky Global Navigation Bar */}
      <header
        id="nexora-global-navbar"
        className={`sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md transition-colors ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Platform Identity */}
          <div className="flex items-center gap-6">
            <Link
              id="navbar-brand-logo"
              href="/"
              className="flex items-center gap-3 group transition-transform duration-150 active:scale-[0.98]"
            >
              <div className="relative w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-cyan-400 shadow-sm group-hover:border-cyan-500/50 group-hover:text-cyan-300 transition-colors">
                <Cpu className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-neutral-950 animate-pulse" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-wider text-neutral-100 font-mono">
                    NEXORA
                  </span>
                  <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                    MVP
                  </span>
                </div>
                <span className="text-[10px] tracking-wide text-neutral-400 uppercase hidden sm:block font-mono">
                  Deep-Tech Exchange
                </span>
              </div>
            </Link>

            {/* Platform Status Indicator (Desktop Terminal Metric) */}
            <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-neutral-800/80 text-[11px] font-mono text-neutral-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>CORE ACTIVE</span>
              <span className="text-neutral-600">{'//'}</span>
              <span className="text-neutral-400">TRL 1-9 VERIFIED</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            id="navbar-desktop-menu"
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  href={link.href}
                  className={`relative px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-150 ${
                    isActive
                      ? 'text-cyan-300 bg-neutral-900/90 border border-cyan-500/30 shadow-xs font-semibold'
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/50 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-neutral-400 group-hover:text-neutral-300'
                    }`}
                  />
                  <span>{link.name}</span>

                  {link.badge && (
                    <span
                      className={`text-[9px] font-mono px-1 py-0.2 rounded border uppercase tracking-wider ${
                        link.badgeColor || 'border-neutral-700 text-neutral-400 bg-neutral-900'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-cyan-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Header Controls */}
          <div className="flex items-center gap-3">
            {/* Bloomberg / Palantir 'Request Access' Action Button */}
            <button
              id="navbar-btn-request-access"
              type="button"
              onClick={handleOpenAccessModal}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold font-mono tracking-wide rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 shadow-sm transition-all duration-150 cursor-pointer group"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span>Request Access</span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-cyan-400" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              id="navbar-mobile-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-neutral-800 transition-colors lg:hidden focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div
            id="navbar-mobile-drawer"
            className="lg:hidden border-t border-neutral-800 bg-neutral-950/98 px-4 py-5 space-y-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-200"
          >
            {/* Telemetry Status in Mobile */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-900 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-neutral-300 font-semibold">NEXORA NETWORK</span>
              </div>
              <span className="text-[11px] text-neutral-500">CLEARANCE: LEVEL 1</span>
            </div>

            {/* Mobile Navigation Links */}
            <div className="grid grid-cols-1 gap-1.5">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.name}
                    id={`mobile-nav-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-neutral-900 border-cyan-500/40 text-cyan-300'
                        : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300 hover:bg-neutral-900/60 hover:text-neutral-100 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center border ${
                          isActive
                            ? 'bg-cyan-950/80 border-cyan-800 text-cyan-400'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>{link.name}</span>
                          {link.badge && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                link.badgeColor || 'border-neutral-700 text-neutral-400 bg-neutral-900'
                              }`}
                            >
                              {link.badge}
                            </span>
                          )}
                        </div>
                        {link.description && (
                          <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                            {link.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-neutral-500 shrink-0" />
                  </Link>
                );
              })}
            </div>

            {/* Mobile Request Access Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenAccessModal}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
              >
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Request Enterprise Clearance / NDA</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Enterprise 'Request Access' Modal */}
      {requestAccessModalOpen && (
        <div
          id="request-access-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-access-title"
        >
          <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 sm:p-8 text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              type="button"
              onClick={resetModalState}
              className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {!accessSubmitted ? (
              <div>
                {/* Bloomberg / Palantir Security Protocol Header */}
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>SECURE ACCESS DISCLOSURE // TIER 2 CLEARANCE</span>
                </div>

                <h2 id="modal-access-title" className="text-xl font-bold tracking-tight text-neutral-100">
                  Request Enterprise Verification & NDA
                </h2>

                <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
                  Gain unrestricted access to verified TRL dossiers, unredacted corporate co-development challenges, proprietary techno-economic models, and direct bilateral communications with Principal Investigators.
                </p>

                <form onSubmit={handleAccessSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        required
                        placeholder="Dr. Alexander Vance"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Enterprise / Institutional Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                          type="email"
                          required
                          placeholder="vance@aerospace-labs.com"
                          value={formData.workEmail}
                          onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                          className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Organization / Fund
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                          type="text"
                          required
                          placeholder="European Aerospace Consortium"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Stakeholder Persona
                      </label>
                      <select
                        value={formData.roleTier}
                        onChange={(e) => setFormData({ ...formData, roleTier: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="Corporate R&D Director">Corporate R&D Director</option>
                        <option value="Venture Capital / CVC Partner">Venture Capital / CVC Partner</option>
                        <option value="Sovereign / Defense Procurement">Sovereign / Defense Procurement</option>
                        <option value="University Tech Transfer Officer">University Tech Transfer Officer</option>
                        <option value="Principal Investigator / Founder">Principal Investigator / Founder</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Evaluation Intent
                      </label>
                      <select
                        value={formData.intent}
                        onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="Bilateral NDA & Due Diligence">Bilateral NDA & Due Diligence</option>
                        <option value="Direct JDA Co-Development">Direct JDA Co-Development</option>
                        <option value="Pilot Hardware Sandbox Deployment">Pilot Hardware Sandbox Deployment</option>
                        <option value="Early-Stage Venture Syndicate">Early-Stage Venture Syndicate</option>
                        <option value="Academic Licensing & IP Acquisition">Academic Licensing & IP Acquisition</option>
                      </select>
                    </div>
                  </div>

                  {/* Mutual NDA Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.ndaAgreed}
                        onChange={(e) => setFormData({ ...formData, ndaAgreed: e.target.checked })}
                        className="mt-0.5 rounded border-neutral-700 bg-neutral-950 text-cyan-500 focus:ring-cyan-500"
                        required
                      />
                      <span className="text-xs text-neutral-400 leading-relaxed">
                        I confirm that our institution agrees to reciprocal non-disclosure obligations (NEXORA Master NDA Framework) regarding confidential bench telemetry, unreleased patent claims, and pilot term sheets.
                      </span>
                    </label>
                  </div>

                  {/* Submission Trigger */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={resetModalState}
                      className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.ndaAgreed}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold font-mono tracking-wider rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Clearance Request</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success / Clearance Generated State */
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400">APPLICATION REGISTERED</div>
                  <h3 className="text-lg font-bold text-neutral-100">
                    Enterprise Clearance Request Dispatched
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                    Our compliance committee and cryptographic key exchange team have received your credentials. An encrypted access link will be transmitted to <span className="text-neutral-200 font-mono font-medium">{formData.workEmail}</span>.
                  </p>
                </div>

                {/* Cryptographic Clearance Token Box */}
                <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-left font-mono space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span>CLEARANCE REFERENCE ID</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE QUEUE
                    </span>
                  </div>
                  <div className="text-sm text-cyan-300 font-bold tracking-wider">
                    {clearanceToken}
                  </div>
                  <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-900 flex justify-between">
                    <span>ORGANIZATION: {formData.organization.toUpperCase()}</span>
                    <span>TIER: RECIPROCAL NDA</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={resetModalState}
                    className="w-full py-2.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold font-mono tracking-wider transition-colors"
                  >
                    Return to Platform
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
