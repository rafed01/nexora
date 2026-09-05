'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  Building2,
  GraduationCap,
  Sparkles,
  Award,
  CheckCircle2,
  FileText,
  Briefcase,
  Layers,
  User,
  Users,
  Search,
  Check,
  Building,
  Info,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { getBrowserSupabase, isSupabaseEnabled, UserRole, UserProfile } from '@/lib/supabaseClient';
import { useIntent, IntentActionInput, StoredIntent, executeIntentPayload } from '@/hooks/useIntent';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
  intent?: IntentActionInput | null;
  onSuccess?: (profile: Partial<UserProfile>) => void;
}

export type PublicSignupChoice = 'user' | 'employee' | 'advisor' | 'enterprise';

interface OrgOption {
  id: string;
  name: string;
  industry?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = 'login',
  intent,
  onSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const { pendingIntent, saveIntent, clearIntent } = useIntent();

  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const [signupChoice, setSignupChoice] = useState<PublicSignupChoice>('user');

  // Common authentication credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Status & Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [signupState, setSignupState] = useState<'form' | 'email_confirmation_required' | 'pending_approval'>('form');
  const [submittedEmail, setSubmittedEmail] = useState('');

  // 1. Independent User Fields
  const [independentOrgText, setIndependentOrgText] = useState('');
  const [independentFocusArea, setIndependentFocusArea] = useState('');

  // 2. Organization Employee Fields & Organization Search
  const [approvedOrgs, setApprovedOrgs] = useState<OrgOption[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsLoadError, setOrgsLoadError] = useState<string | null>(null);
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<OrgOption | null>(null);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  // 3. Advisor Fields
  const [advisorExpertise, setAdvisorExpertise] = useState('');
  const [advisorCredentials, setAdvisorCredentials] = useState('');
  const [advisorHistory, setAdvisorHistory] = useState('');
  const [advisorLinkedin, setAdvisorLinkedin] = useState('');

  // 4. Enterprise Organization Fields
  const [enterpriseContactName, setEnterpriseContactName] = useState('');
  const [enterpriseCompanyName, setEnterpriseCompanyName] = useState('');
  const [enterpriseTaxId, setEnterpriseTaxId] = useState('');
  const [enterpriseSize, setEnterpriseSize] = useState('51-250');
  const [enterpriseIndustry, setEnterpriseIndustry] = useState('Deep Tech / Advanced Materials');

  // Sync tab on prop change
  useEffect(() => {
    const timer = setTimeout(() => {
      setTab(defaultTab);
      setSignupState('form');
      setErrorMsg(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [defaultTab, isOpen]);

  // Save intent if provided
  useEffect(() => {
    if (intent) {
      saveIntent(intent);
    }
  }, [intent, saveIntent]);

  // Fetch approved organizations for employee searchable selection from /api/organizations
  useEffect(() => {
    let mounted = true;
    async function fetchApprovedOrganizations() {
      setOrgsLoading(true);
      setOrgsLoadError(null);
      try {
        const res = await fetch('/api/organizations');
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            if (Array.isArray(data.organizations)) {
              setApprovedOrgs(data.organizations);
              if (data.organizations.length === 0) {
                setOrgsLoadError('No approved organizations available at this time.');
              }
            } else {
              setApprovedOrgs([]);
              setOrgsLoadError('Invalid organization directory response.');
            }
          }
        } else {
          if (mounted) {
            setApprovedOrgs([]);
            setOrgsLoadError('Failed to load approved organizations from registry.');
          }
        }
      } catch (err: any) {
        if (mounted) {
          setApprovedOrgs([]);
          setOrgsLoadError(err.message || 'Network error loading approved organizations.');
        }
      } finally {
        if (mounted) {
          setOrgsLoading(false);
        }
      }
    }
    if (isOpen && tab === 'signup' && signupChoice === 'employee') {
      fetchApprovedOrganizations();
    }
    return () => {
      mounted = false;
    };
  }, [isOpen, tab, signupChoice]);

  // Close handler with URL cleaning
  const handleClose = useCallback(() => {
    onClose();
    if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
      router.push('/');
    }
  }, [onClose, router]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Filtered organizations for search
  const filteredOrgs = useMemo(() => {
    if (!orgSearchQuery.trim()) return approvedOrgs;
    const q = orgSearchQuery.toLowerCase().trim();
    return approvedOrgs.filter(
      (org) =>
        org.name.toLowerCase().includes(q) ||
        (org.industry && org.industry.toLowerCase().includes(q))
    );
  }, [approvedOrgs, orgSearchQuery]);

  if (!isOpen) return null;

  const currentIntent = intent || pendingIntent;

  // Finalizes authentication and routing (never storing role/approval/admin in localStorage or cookies)
  const finalizeAuth = async (
    userId: string,
    userEmail: string,
    role: UserRole,
    status: 'pending' | 'approved' | 'rejected',
    onboardingCompleted: boolean,
    metadata?: Record<string, any>,
    sessionToken?: string
  ) => {
    if (sessionToken) {
      document.cookie = `sb-access-token=${sessionToken}; path=/; max-age=604800; SameSite=Lax`;
    }

    try {
      localStorage.setItem('nexora_user_email', userEmail);
    } catch {}

    // Execute intercepted intent if exists
    if (currentIntent) {
      await executeIntentPayload(currentIntent as StoredIntent, userEmail);
      clearIntent();
    }

    if (onSuccess) {
      onSuccess({
        id: userId,
        email: userEmail,
        role,
        approval_status: status,
        status,
        onboarding_completed: onboardingCompleted,
      });
    }

    onClose();

    // Check routing conditions
    if (status === 'pending') {
      router.push('/pending-approval');
      return;
    }

    if (!onboardingCompleted) {
      router.push('/onboarding');
      return;
    }

    if (currentIntent?.returnUrl) {
      router.push(currentIntent.returnUrl);
    } else if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessNotice(null);

    try {
      const supabase = getBrowserSupabase();

      if (!isSupabaseEnabled || !supabase) {
        throw new Error('Supabase client is not available. Please verify configuration.');
      }

      // Supabase Authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session && data.user) {
        // Query profile for approval_status and onboarding_completed
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('id, email, role, approval_status, onboarding_completed, full_name, organization, domain_expertise, credentials, company_name, tax_id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileErr) {
          console.warn('Profile read warning:', profileErr.message);
        }

        const role: UserRole = (profileData?.role as UserRole) || 'user';
        const status = profileData?.approval_status || 'pending';
        const onboardingCompleted = profileData?.onboarding_completed === true || role === 'admin';

        await finalizeAuth(
          data.user.id,
          data.user.email || email,
          role,
          status,
          onboardingCompleted,
          profileData || undefined,
          data.session.access_token
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessNotice(null);

    // Strict Role Validation per prompt requirements
    if (signupChoice === 'user') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid work email.');
        setLoading(false);
        return;
      }
      if (!independentFocusArea.trim()) {
        setErrorMsg('Please specify your primary deep-tech focus area.');
        setLoading(false);
        return;
      }
    } else if (signupChoice === 'employee') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter your corporate/work email.');
        setLoading(false);
        return;
      }
      if (orgsLoadError || approvedOrgs.length === 0) {
        setErrorMsg(orgsLoadError || 'Approved organizations registry is unavailable. Employee registration is currently disabled.');
        setLoading(false);
        return;
      }
      if (!selectedOrg) {
        setErrorMsg('Please select your approved organization from the registry list.');
        setLoading(false);
        return;
      }
    } else if (signupChoice === 'advisor') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter your institutional/work email.');
        setLoading(false);
        return;
      }
      if (!advisorExpertise.trim()) {
        setErrorMsg('Please specify your deep-tech domain expertise.');
        setLoading(false);
        return;
      }
      if (!advisorCredentials.trim()) {
        setErrorMsg('Please provide your academic or research credentials.');
        setLoading(false);
        return;
      }
      if (!advisorHistory.trim()) {
        setErrorMsg('Please outline your relevant advisory history.');
        setLoading(false);
        return;
      }
      if (!advisorLinkedin.trim() || !advisorLinkedin.includes('linkedin.com')) {
        setErrorMsg('Please provide a valid LinkedIn profile URL.');
        setLoading(false);
        return;
      }
    } else if (signupChoice === 'enterprise') {
      if (!enterpriseContactName.trim()) {
        setErrorMsg('Please enter the primary executive/contact name.');
        setLoading(false);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a corporate email address.');
        setLoading(false);
        return;
      }
      if (!enterpriseCompanyName.trim()) {
        setErrorMsg('Please enter the legal company name.');
        setLoading(false);
        return;
      }
      if (!enterpriseTaxId.trim()) {
        setErrorMsg('Please provide your corporate Tax ID / Registration #.');
        setLoading(false);
        return;
      }
    }

    if (!password || password.length < 6) {
      setErrorMsg('Passphrase must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const supabase = getBrowserSupabase();
      if (!isSupabaseEnabled || !supabase) {
        throw new Error('Supabase client is not available. Please verify configuration.');
      }

      // Map to strict public role types (Never admin)
      const mappedRole: UserRole =
        signupChoice === 'enterprise'
          ? 'enterprise'
          : signupChoice === 'advisor'
          ? 'advisor'
          : signupChoice === 'employee'
          ? 'employee'
          : 'user';

      // Assemble strict metadata payload
      let metadataPayload: Record<string, any> = {
        role: mappedRole,
      };

      if (signupChoice === 'user') {
        metadataPayload = {
          ...metadataPayload,
          full_name: fullName.trim(),
          organization: independentOrgText.trim() || 'Independent',
          focus_area: independentFocusArea.trim(),
        };
      } else if (signupChoice === 'employee') {
        metadataPayload = {
          ...metadataPayload,
          full_name: fullName.trim(),
          organization: selectedOrg?.name || '',
          organization_id: selectedOrg?.id || undefined,
        };
      } else if (signupChoice === 'advisor') {
        metadataPayload = {
          ...metadataPayload,
          full_name: fullName.trim(),
          domain_expertise: advisorExpertise.trim(),
          credentials: advisorCredentials.trim(),
          advisory_history: advisorHistory.trim(),
          linkedin_url: advisorLinkedin.trim(),
        };
      } else if (signupChoice === 'enterprise') {
        metadataPayload = {
          ...metadataPayload,
          full_name: enterpriseContactName.trim(),
          company_name: enterpriseCompanyName.trim(),
          organization: enterpriseCompanyName.trim(),
          tax_id: enterpriseTaxId.trim(),
          company_size: enterpriseSize,
          industry: enterpriseIndustry,
        };
      }

      // Execute Supabase Auth signUp
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: metadataPayload,
        },
      });

      // If Supabase returned an error, NEVER show success
      if (error) {
        throw error;
      }

      if (!data || !data.user) {
        throw new Error('Registration failed. No user identity was returned by Supabase.');
      }

      setSubmittedEmail(email.trim().toLowerCase());

      // Check if email confirmation is required
      const requiresEmailConfirm = !data.session && (!data.user.identities || data.user.identities.length === 0 || data.user.confirmed_at === null);

      // NOTE: public.profiles is created exclusively by the Supabase database trigger. No client-side profile upsert is performed.

      if (requiresEmailConfirm) {
        setSignupState('email_confirmation_required');
      } else {
        setSignupState('pending_approval');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="auth-modal-container"
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] my-auto transition-all overscroll-contain"
      >
        {/* Sticky Close Button */}
        <div className="sticky top-0 z-30 flex justify-end -mt-2 -mr-2 mb-2 pointer-events-none">
          <button
            id="btn-close-auth-modal"
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="pointer-events-auto p-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800/80 backdrop-blur-md transition-colors cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intent Memory Banner */}
        {currentIntent && (
          <div
            id="intent-memory-banner"
            className="mb-6 p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-start gap-3 text-cyan-200 text-xs shadow-[0_0_15px_rgba(34,211,238,0.1)]"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <span className="font-semibold block uppercase tracking-wider text-[10px] text-cyan-300">
                Action Intercepted &bull; Complete Auth to Resume
              </span>
              <p className="mt-0.5 text-neutral-200">
                {currentIntent.type === 'download_report' && 'Downloading intelligence report: '}
                {currentIntent.type === 'bookmark' && 'Saving to private dossier: '}
                {currentIntent.type === 'apply_challenge' && 'Submitting corporate challenge: '}
                {currentIntent.type === 'request_call' && 'Dispatching expert consultation: '}
                <span className="font-semibold text-white">&ldquo;{currentIntent.title}&rdquo;</span>
              </p>
            </div>
          </div>
        )}

        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              {tab === 'login' ? 'NEXORA Terminal Login' : 'Request Registry Clearance'}
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Public View, Private Interaction Gateway
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {signupState === 'form' && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800 mb-6">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Terminal Login
            </button>
            <button
              id="tab-auth-signup"
              type="button"
              onClick={() => {
                setTab('signup');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Role Clearance
            </button>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div
            id="auth-error-banner"
            className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. EMAIL CONFIRMATION STATE */}
        {signupState === 'email_confirmation_required' && (
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Mail className="w-7 h-7 animate-bounce" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Confirmation Email Dispatched
              </div>
              <h3 className="text-xl font-bold font-mono text-white">Check Your Inbox</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                We sent a verification link to <span className="text-cyan-300 font-semibold">{submittedEmail}</span>.
                Please click the link in that email to confirm your address and activate your submission for curator review.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left font-mono text-xs space-y-2 text-neutral-300">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Info className="w-4 h-4 shrink-0" />
                <span>Next Steps in Governance Pipeline</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px] pt-1">
                <li>Confirm your email address via the received verification link.</li>
                <li>Your account status is queued as <strong className="text-amber-400">PENDING APPROVAL</strong>.</li>
                <li>Platform curators will audit your classification credentials.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-goto-pending-view"
                type="button"
                onClick={() => {
                  handleClose();
                  router.push('/pending-approval');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs font-mono uppercase tracking-wider transition-all"
              >
                View Clearance Holding Gate
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignupState('form');
                  setTab('login');
                }}
                className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* 2. PENDING APPROVAL CONFIRMATION STATE */}
        {signupState === 'pending_approval' && (
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <ShieldCheck className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-mono uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Clearance Gate: Pending Review
              </div>
              <h3 className="text-xl font-bold font-mono text-white">Application Queued</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Your classification credentials for <span className="text-white font-semibold">{submittedEmail}</span> have been recorded in the verification registry.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left font-mono text-xs space-y-2 text-neutral-300">
              <div className="flex justify-between items-center text-neutral-400 border-b border-neutral-800 pb-2">
                <span>Application Role:</span>
                <span className="text-amber-400 font-bold uppercase">
                  {signupChoice === 'enterprise'
                    ? 'Enterprise Organization'
                    : signupChoice === 'advisor'
                    ? 'Technical Advisor'
                    : signupChoice === 'employee'
                    ? 'Organization Employee'
                    : 'Independent Innovator'}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Account Status:</span>
                <span className="text-amber-300 font-semibold uppercase">Pending Approval</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-goto-pending-gate"
                type="button"
                onClick={() => {
                  handleClose();
                  router.push('/pending-approval');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              >
                Proceed to Clearance Gate
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  router.push('/explore');
                }}
                className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors"
              >
                Browse Public Catalog
              </button>
            </div>
          </div>
        )}

        {/* 3. LOGIN TAB */}
        {signupState === 'form' && tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="login-input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@institution.org"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                Passphrase
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="login-input-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs uppercase tracking-wider font-mono transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Session...</span>
                </>
              ) : (
                <>
                  <span>Authenticate &amp; Execute Action</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 4. CANONICAL PUBLIC SIGNUP FORM */}
        {signupState === 'form' && tab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Exactly 4 public signup choices: Independent user | Organization employee | Advisor | Enterprise organization */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                Select Classification Profile
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Independent User */}
                <button
                  type="button"
                  id="role-btn-independent"
                  onClick={() => {
                    setSignupChoice('user');
                    setErrorMsg(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col items-start gap-1 cursor-pointer ${
                    signupChoice === 'user'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-500'
                      : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <User className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs font-bold text-white">Independent User</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 leading-tight">
                    Individual researcher, scout, or unaffiliated innovator
                  </span>
                </button>

                {/* 2. Organization Employee */}
                <button
                  type="button"
                  id="role-btn-employee"
                  onClick={() => {
                    setSignupChoice('employee');
                    setErrorMsg(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col items-start gap-1 cursor-pointer ${
                    signupChoice === 'employee'
                      ? 'border-sky-500 bg-sky-950/40 text-sky-200 ring-1 ring-sky-500'
                      : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Users className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="text-xs font-bold text-white">Organization Employee</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 leading-tight">
                    Member of an approved research lab, university, or company
                  </span>
                </button>

                {/* 3. Advisor */}
                <button
                  type="button"
                  id="role-btn-advisor"
                  onClick={() => {
                    setSignupChoice('advisor');
                    setErrorMsg(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col items-start gap-1 cursor-pointer ${
                    signupChoice === 'advisor'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500'
                      : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-white">Advisor</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 leading-tight">
                    Domain specialist, technical validator, or consultant
                  </span>
                </button>

                {/* 4. Enterprise Organization */}
                <button
                  type="button"
                  id="role-btn-enterprise"
                  onClick={() => {
                    setSignupChoice('enterprise');
                    setErrorMsg(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col items-start gap-1 cursor-pointer ${
                    signupChoice === 'enterprise'
                      ? 'border-amber-500 bg-amber-950/40 text-amber-200 ring-1 ring-amber-500'
                      : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-white">Enterprise Org</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 leading-tight">
                    Corporate entity, R&D sponsor, or bilateral challenge author
                  </span>
                </button>
              </div>
            </div>

            {/* DYNAMIC FORM FIELDS PER ROLE */}
            <div className="space-y-3 pt-1">
              {/* ========================================================================= */}
              {/* ROLE 1: INDEPENDENT USER                                                  */}
              {/* Required: full name, work email, organization text if unaffiliated, focus area */}
              {/* ========================================================================= */}
              {signupChoice === 'user' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Full Name <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      id="signup-input-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Alan Turing"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Work Email <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        id="signup-input-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="innovator@domain.org"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Organization / Affiliation Text (If Unaffiliated)
                    </label>
                    <input
                      id="signup-input-independent-org"
                      type="text"
                      value={independentOrgText}
                      onChange={(e) => setIndependentOrgText(e.target.value)}
                      placeholder="Independent Researcher / Unaffiliated Lab"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Primary Focus Area <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      id="signup-input-focus-area"
                      type="text"
                      required
                      value={independentFocusArea}
                      onChange={(e) => setIndependentFocusArea(e.target.value)}
                      placeholder="e.g. Solid-State Electrolytes, Neuromorphic AI, Silicon Photonics"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* ROLE 2: ORGANIZATION EMPLOYEE                                             */}
              {/* Required: full name, work email, searchable selection from approved orgs */}
              {/* ========================================================================= */}
              {signupChoice === 'employee' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Full Name <span className="text-sky-400">*</span>
                    </label>
                    <input
                      id="signup-input-employee-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Sarah Connor"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Corporate / Institutional Work Email <span className="text-sky-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        id="signup-input-employee-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="s.connor@institution.org"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Searchable Selection from Approved Organizations */}
                  <div className="space-y-1 relative">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Select Approved Organization <span className="text-sky-400">*</span>
                    </label>

                    <div className="relative">
                      <div
                        id="signup-org-select-trigger"
                        onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                        className={`w-full px-3 py-2.5 rounded-lg bg-neutral-950 border text-sm flex items-center justify-between cursor-pointer transition-colors ${
                          selectedOrg
                            ? 'border-sky-500 text-white'
                            : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Building className="w-4 h-4 text-sky-400 shrink-0" />
                          <span className="truncate">
                            {selectedOrg ? selectedOrg.name : 'Search and select approved organization...'}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                      </div>

                      {/* Dropdown with search filter */}
                      {isOrgDropdownOpen && (
                        <div
                          id="signup-org-dropdown"
                          className="absolute left-0 right-0 top-full mt-1 z-50 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 max-h-60 overflow-y-auto"
                        >
                          <div className="relative mb-2">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input
                              id="signup-org-search-input"
                              type="text"
                              autoFocus
                              value={orgSearchQuery}
                              onChange={(e) => setOrgSearchQuery(e.target.value)}
                              placeholder="Filter by name or domain..."
                              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-sky-500"
                            />
                          </div>

                          <div className="space-y-1">
                            {filteredOrgs.length === 0 ? (
                              <div className="p-3 text-center text-xs text-neutral-500 font-mono">
                                No matching approved organization found.
                              </div>
                            ) : (
                              filteredOrgs.map((org) => {
                                const isSelected = selectedOrg?.id === org.id;
                                return (
                                  <div
                                    key={org.id}
                                    id={`org-option-${org.id}`}
                                    onClick={() => {
                                      setSelectedOrg(org);
                                      setIsOrgDropdownOpen(false);
                                      setOrgSearchQuery('');
                                    }}
                                    className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                      isSelected
                                        ? 'bg-sky-950/60 text-sky-200 border border-sky-800/80'
                                        : 'text-neutral-300 hover:bg-neutral-800'
                                    }`}
                                  >
                                    <div>
                                      <div className="font-semibold">{org.name}</div>
                                      {org.industry && (
                                        <div className="text-[10px] text-neutral-500">{org.industry}</div>
                                      )}
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {orgsLoadError && (
                      <p className="text-[11px] text-rose-400 font-mono mt-1">
                        {orgsLoadError}
                      </p>
                    )}
                    {selectedOrg && (
                      <p className="text-[10px] text-sky-400 font-mono mt-1">
                        Linked node: {selectedOrg.name}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* ROLE 3: ADVISOR                                                           */}
              {/* Required: full name, work email, expertise, credentials, advisory history, LinkedIn URL */}
              {/* ========================================================================= */}
              {signupChoice === 'advisor' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Full Name <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      id="signup-input-advisor-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Prof. Linus Thorne"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Work / Institutional Email <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        id="signup-input-advisor-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="linus.thorne@research.ch"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Deep-Tech Expertise Domain <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      id="signup-input-advisor-expertise"
                      type="text"
                      required
                      value={advisorExpertise}
                      onChange={(e) => setAdvisorExpertise(e.target.value)}
                      placeholder="e.g. Optical Computing, Quantum Algorithms, Superconducting Qubits"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Academic &amp; Research Credentials <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      id="signup-input-advisor-credentials"
                      type="text"
                      required
                      value={advisorCredentials}
                      onChange={(e) => setAdvisorCredentials(e.target.value)}
                      placeholder="PhD in Applied Physics (ETH Zurich), ORCID 0000-0002-1825-0097"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Advisory &amp; Consulting History <span className="text-emerald-400">*</span>
                    </label>
                    <textarea
                      id="signup-input-advisor-history"
                      required
                      rows={2}
                      value={advisorHistory}
                      onChange={(e) => setAdvisorHistory(e.target.value)}
                      placeholder="Scientific advisor to 4 quantum hardware spinouts, CERN technical committee member"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      LinkedIn Profile URL <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      id="signup-input-advisor-linkedin"
                      type="url"
                      required
                      value={advisorLinkedin}
                      onChange={(e) => setAdvisorLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/linus-thorne"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* ROLE 4: ENTERPRISE ORGANIZATION                                           */}
              {/* Required: contact name, corporate email, company name, tax/registration ID, size, industry */}
              {/* ========================================================================= */}
              {signupChoice === 'enterprise' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Primary Contact / Executive Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="signup-input-enterprise-contact"
                      type="text"
                      required
                      value={enterpriseContactName}
                      onChange={(e) => setEnterpriseContactName(e.target.value)}
                      placeholder="Elena Vance, VP of Frontier R&D"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Corporate Email <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        id="signup-input-enterprise-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="elena.vance@novartis.com"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Legal Company Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="signup-input-enterprise-company"
                      type="text"
                      required
                      value={enterpriseCompanyName}
                      onChange={(e) => setEnterpriseCompanyName(e.target.value)}
                      placeholder="Siemens Energy Ventures AG"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                      Tax ID / Business Registration # <span className="text-amber-400">*</span>
                    </label>
                    <input
                      id="signup-input-enterprise-tax-id"
                      type="text"
                      required
                      value={enterpriseTaxId}
                      onChange={(e) => setEnterpriseTaxId(e.target.value)}
                      placeholder="CHE-105.805.123 or DE-384920491"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                        Company Size <span className="text-amber-400">*</span>
                      </label>
                      <select
                        id="signup-select-enterprise-size"
                        value={enterpriseSize}
                        onChange={(e) => setEnterpriseSize(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      >
                        <option value="1-50">1 - 50 employees</option>
                        <option value="51-250">51 - 250 employees</option>
                        <option value="251-1000">251 - 1,000 employees</option>
                        <option value="1000+">1,000+ Enterprise</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                        Industry <span className="text-amber-400">*</span>
                      </label>
                      <select
                        id="signup-select-enterprise-industry"
                        value={enterpriseIndustry}
                        onChange={(e) => setEnterpriseIndustry(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      >
                        <option value="Deep Tech / Advanced Materials">Advanced Materials</option>
                        <option value="Quantum Computing & Hardware">Quantum Hardware</option>
                        <option value="Optoelectronics & Photonics">Photonics</option>
                        <option value="Aerospace & Defense">Aerospace &amp; Defense</option>
                        <option value="Clean Energy & Grid Systems">Clean Energy</option>
                        <option value="Synthetic Biology & Bio-Compute">Synthetic Biology</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Secure Passphrase */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                  Secure Passphrase <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="signup-input-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Approval Gate Notice */}
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 font-mono">
              <span className="text-amber-300 font-semibold block mb-0.5">
                &bull; Security Governance: All registrations remain pending until approved.
              </span>
              <span>
                Your clearance application is subject to institutional verification by NEXORA platform curators.
              </span>
            </div>

            <button
              id="btn-signup-submit"
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider font-mono transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
                signupChoice === 'advisor'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : signupChoice === 'enterprise'
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : signupChoice === 'employee'
                  ? 'bg-sky-500 hover:bg-sky-400 text-neutral-950 shadow-[0_0_20px_rgba(14,165,233,0.2)]'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Classification Credentials...</span>
                </>
              ) : (
                <>
                  <span>Submit Clearance Application</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
