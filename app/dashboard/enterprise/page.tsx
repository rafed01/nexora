'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Lock,
  KeyRound,
  Mail,
  Calendar,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

interface ManagedEmployee {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  status?: string | null;
  organization_id: string | null;
  created_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  rejection_reason?: string | null;
}

interface ManagedOrganization {
  id: string;
  name: string;
  legal_name?: string | null;
  approval_status: string;
  industry?: string | null;
  domain?: string | null;
  verified_at?: string | null;
  owner_id?: string | null;
}

type TabKey = 'pending' | 'approved' | 'rejected';

interface DecisionState {
  employee: ManagedEmployee;
  decision: 'approved' | 'rejected';
}

export default function EnterpriseManagementPage() {
  const { user, profile, isLoading } = useAuth();

  // 'company' is a legacy synonym for 'enterprise' on older profile rows.
  const isEnterpriseOwner =
    (profile?.role === 'enterprise' || profile?.role === 'company') &&
    profile.approval_status === 'approved' &&
    !!profile.organization_id;

  const [organization, setOrganization] = useState<ManagedOrganization | null>(null);
  const [pending, setPending] = useState<ManagedEmployee[]>([]);
  const [approved, setApproved] = useState<ManagedEmployee[]>([]);
  const [rejected, setRejected] = useState<ManagedEmployee[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [pendingDecision, setPendingDecision] = useState<DecisionState | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchOrganizationData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const res = await fetch('/api/organizations/manage', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to load organization data.');
      }
      setOrganization(json.organization || null);
      setPending(json.pending || []);
      setApproved(json.approved || []);
      setRejected(json.rejected || []);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load organization data.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load organization data only once auth resolution is complete AND authorization is confirmed.
    if (isLoading || !isEnterpriseOwner) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional data fetch on mount/auth-ready
    fetchOrganizationData();
  }, [isLoading, isEnterpriseOwner, fetchOrganizationData]);

  const openDecision = (employee: ManagedEmployee, decision: 'approved' | 'rejected') => {
    setActionError(null);
    setSuccessMessage(null);
    setRejectionReason('');
    setPendingDecision({ employee, decision });
  };

  const closeDecision = () => {
    if (submitting) return;
    setPendingDecision(null);
    setRejectionReason('');
  };

  const submitDecision = async () => {
    if (!pendingDecision) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch('/api/organizations/manage', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: pendingDecision.employee.id,
          decision: pendingDecision.decision,
          reason: pendingDecision.decision === 'rejected' ? rejectionReason.trim() || undefined : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Failed to save decision.');
      }
      setSuccessMessage(
        pendingDecision.decision === 'approved'
          ? `${pendingDecision.employee.full_name || pendingDecision.employee.email} has been approved.`
          : `${pendingDecision.employee.full_name || pendingDecision.employee.email} has been declined.`
      );
      setPendingDecision(null);
      setRejectionReason('');
      await fetchOrganizationData();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to save decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; items: ManagedEmployee[] }[] = useMemo(
    () => [
      { key: 'pending', label: 'Pending', icon: <Clock className="w-3.5 h-3.5" />, items: pending },
      { key: 'approved', label: 'Approved', icon: <CheckCircle2 className="w-3.5 h-3.5" />, items: approved },
      { key: 'rejected', label: 'Rejected', icon: <XCircle className="w-3.5 h-3.5" />, items: rejected },
    ],
    [pending, approved, rejected]
  );

  const activeItems = tabs.find((t) => t.key === activeTab)?.items || [];

  // ---- Auth resolution loading state ----
  if (isLoading) {
    return (
      <div className="min-h-[85vh] bg-neutral-950 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <div className="text-xs font-mono text-neutral-400">Verifying enterprise clearance with security gateway...</div>
      </div>
    );
  }

  // ---- Unauthenticated ----
  if (!user) {
    return (
      <div className="min-h-[85vh] bg-neutral-950 flex items-center justify-center p-4 sm:p-6 text-neutral-100">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Authentication Required</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              You must sign in with an approved enterprise account to manage organization employees.
            </p>
          </div>
          <Link
            href="/login?redirect=/dashboard/enterprise"
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  // ---- Authenticated but not an approved enterprise owner ----
  if (!isEnterpriseOwner) {
    return (
      <div className="min-h-[85vh] bg-neutral-950 flex items-center justify-center p-4 sm:p-6 text-neutral-100">
        <div className="max-w-lg w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-950/60 border border-amber-600/40 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
                Access Restricted
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">Organization Management Restricted</h2>
            </div>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            This page is reserved for approved enterprise account owners managing their organization&apos;s employees.
            {profile?.role === 'enterprise' && profile.approval_status !== 'approved'
              ? ' Your enterprise account is still awaiting NEXORA administrator approval.'
              : ''}
          </p>
          <Link
            href="/dashboard"
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  // ---- Approved enterprise owner: render management console ----
  return (
    <div className="min-h-[85vh] bg-neutral-950 text-neutral-100 p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <button
            type="button"
            onClick={() => fetchOrganizationData()}
            disabled={dataLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 text-[11px] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                {organization?.name || profile?.organization || 'Your Organization'}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-mono uppercase tracking-wider">
                  {organization?.approval_status === 'approved' ? 'Verified Organization' : organization?.approval_status || 'Unknown'}
                </span>
                {organization?.industry && <span>· {organization.industry}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-lg font-bold text-white leading-none">{pending.length}</div>
              <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Pending</div>
            </div>
          </div>
        </div>

        {dataError && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{dataError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="flex items-center border-b border-neutral-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'border-cyan-500 text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="text-neutral-600">({tab.items.length})</span>
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-5">
            {dataLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                <span className="text-xs text-neutral-500 font-mono">Loading employee records...</span>
              </div>
            ) : activeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                <Users className="w-8 h-8 text-neutral-700" />
                <span className="text-sm text-neutral-400">
                  No {activeTab} employees{activeTab === 'pending' ? ' at this time.' : '.'}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {activeItems.map((employee) => (
                  <div
                    key={employee.id}
                    className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="font-semibold text-white truncate">{employee.full_name || 'Unnamed Employee'}</div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {employee.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      {employee.approval_status === 'rejected' && employee.rejection_reason && (
                        <div className="text-[11px] text-rose-400 mt-1">Reason: {employee.rejection_reason}</div>
                      )}
                    </div>

                    {activeTab === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openDecision(employee, 'approved')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 text-[11px] font-semibold transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openDecision(employee, 'rejected')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 text-[11px] font-semibold transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingDecision && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Confirm {pendingDecision.decision === 'approved' ? 'Approval' : 'Rejection'}
              </h3>
              <button
                type="button"
                onClick={closeDecision}
                className="text-neutral-500 hover:text-neutral-300"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {pendingDecision.decision === 'approved' ? (
                <>
                  You are about to approve{' '}
                  <span className="text-white font-semibold">
                    {pendingDecision.employee.full_name || pendingDecision.employee.email}
                  </span>{' '}
                  to join your organization. They will gain employee access immediately.
                </>
              ) : (
                <>
                  You are about to reject{' '}
                  <span className="text-white font-semibold">
                    {pendingDecision.employee.full_name || pendingDecision.employee.email}
                  </span>
                  . You may optionally provide a reason.
                </>
              )}
            </p>

            {pendingDecision.decision === 'rejected' && (
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason (optional)"
                rows={3}
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
            )}

            {actionError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={closeDecision}
                disabled={submitting}
                className="flex-1 py-2 rounded-lg border border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDecision}
                disabled={submitting}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                  pendingDecision.decision === 'approved'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
                    : 'bg-rose-500 hover:bg-rose-400 text-neutral-950'
                }`}
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm {pendingDecision.decision === 'approved' ? 'Approval' : 'Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
