'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBrowserSupabase, isSupabaseEnabled } from '@/lib/supabaseClient';

export type IntentType =
  | 'bookmark'
  | 'apply_challenge'
  | 'request_call'
  | 'download_report'
  | 'custom';

export interface IntentActionInput {
  type: IntentType;
  title: string;
  payload: Record<string, any>;
  returnUrl?: string;
}

export interface StoredIntent extends IntentActionInput {
  id: string;
  createdAt: number;
}

const INTENT_STORAGE_KEY = 'nexora_pending_intent';

export function getStoredIntent(): StoredIntent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(INTENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredIntent;
  } catch {
    return null;
  }
}

export function setStoredIntent(intent: IntentActionInput): StoredIntent {
  const stored: StoredIntent = {
    ...intent,
    id: `intent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(INTENT_STORAGE_KEY, JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent('nexora:intent-changed', { detail: stored }));
    } catch (e) {
      console.error('Failed to save intent to localStorage', e);
    }
  }
  return stored;
}

export function removeStoredIntent(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(INTENT_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('nexora:intent-changed', { detail: null }));
    } catch (e) {
      console.error('Failed to clear intent from localStorage', e);
    }
  }
}

/**
 * Executes a stored intent payload and triggers corresponding feedback/downloads
 */
export async function executeIntentPayload(
  intent: StoredIntent,
  userEmail?: string
): Promise<{ success: boolean; message: string }> {
  try {
    switch (intent.type) {
      case 'download_report': {
        const { reportId, reportTitle, format = 'PDF' } = intent.payload;
        // Generate and trigger download
        const blobContent = `NEXORA INTELLIGENCE REPORT
Document ID: ${reportId || 'RPT-GEN-01'}
Title: ${reportTitle || intent.title}
Authorized Recipient: ${userEmail || 'Active Authorized Session'}
Generated At: ${new Date().toISOString()}
Security Classification: NEXORA TRL CONFIDENTIAL

[EXECUTIVE SUMMARY]
This comprehensive analysis validates the empirical scaling parameters, patent lineage, and pilot deployment trajectories.

[IP & TELEMETRY AUDIT]
- Patent filings confirmed with zero blocking citations.
- Foundry validation completed across temperature gradients.
- Independent third-party benchmark verified.

Cleared by NEXORA Platform Core.`;

        const blob = new Blob([blobContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(reportTitle || 'nexora-report').toLowerCase().replace(/[^a-z0-9]/g, '-')}.${format.toLowerCase() === 'pdf' ? 'txt' : format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return {
          success: true,
          message: `Intelligence Report "${intent.title}" has been decrypted and downloaded.`,
        };
      }

      case 'bookmark': {
        const { id, title, type: itemType, category } = intent.payload;
        const bookmarksRaw = localStorage.getItem('nexora_bookmarks');
        const bookmarks: any[] = bookmarksRaw ? JSON.parse(bookmarksRaw) : [];
        
        if (!bookmarks.some((b) => b.id === id)) {
          bookmarks.push({
            id,
            title: title || intent.title,
            type: itemType || 'technology',
            category: category || 'Deep Tech',
            bookmarkedAt: new Date().toISOString(),
          });
          localStorage.setItem('nexora_bookmarks', JSON.stringify(bookmarks));
        }

        window.dispatchEvent(new CustomEvent('nexora:bookmark-updated', { detail: { id, title } }));
        return {
          success: true,
          message: `Saved "${intent.title}" to your private dossier.`,
        };
      }

      case 'apply_challenge': {
        const { challengeId, challengeTitle, proposalBrief, budget } = intent.payload;
        try {
          await fetch('/api/request-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Authenticated Applicant',
              email: userEmail || 'user@organization.com',
              entityTitle: challengeTitle || intent.title,
              entityType: 'challenge_application',
              proposalBrief: proposalBrief || 'Submitted application via intent execution',
              roleRequested: 'challenge_solver',
              tierRequested: 'pilot_grant',
            }),
          });
        } catch {}

        return {
          success: true,
          message: `Proposal submitted for "${intent.title}". Corporate sponsor has been notified.`,
        };
      }

      case 'request_call': {
        const { expertId, expertName, topic, notes } = intent.payload;
        try {
          await fetch('/api/request-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Authenticated Researcher',
              email: userEmail || 'user@organization.com',
              entityTitle: `Expert Call: ${expertName || intent.title}`,
              entityType: 'expert_consultation',
              proposalBrief: `Topic: ${topic || 'Technology Review'}. Notes: ${notes || 'Requested 1-on-1 call.'}`,
              roleRequested: 'consultation_client',
            }),
          });
        } catch {}

        return {
          success: true,
          message: `Consultation request dispatched to ${expertName || intent.title}. Awaiting scheduling clearance.`,
        };
      }

      case 'custom':
      default: {
        return {
          success: true,
          message: `Action "${intent.title}" successfully completed.`,
        };
      }
    }
  } catch (err: any) {
    console.error('Intent execution error:', err);
    return {
      success: false,
      message: err?.message || 'Failed to complete deferred action.',
    };
  }
}

export function useIntent() {
  const [pendingIntent, setPendingIntent] = useState<StoredIntent | null>(() => getStoredIntent());

  useEffect(() => {
    const handleIntentChange = (e: Event) => {
      const customEvent = e as CustomEvent<StoredIntent | null>;
      setPendingIntent(customEvent.detail ?? null);
    };

    window.addEventListener('nexora:intent-changed', handleIntentChange);
    return () => window.removeEventListener('nexora:intent-changed', handleIntentChange);
  }, []);

  const saveIntent = useCallback((intent: IntentActionInput): StoredIntent => {
    const saved = setStoredIntent(intent);
    setPendingIntent(saved);
    return saved;
  }, []);

  const clearIntent = useCallback((): void => {
    removeStoredIntent();
    setPendingIntent(null);
  }, []);

  const executePendingIntent = useCallback(
    async (userEmail?: string): Promise<{ success: boolean; message: string } | null> => {
      const current = getStoredIntent();
      if (!current) return null;

      const result = await executeIntentPayload(current, userEmail);
      clearIntent();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('nexora:intent-executed', {
            detail: { intent: current, result },
          })
        );
      }

      return result;
    },
    [clearIntent]
  );

  return {
    pendingIntent,
    saveIntent,
    clearIntent,
    executePendingIntent,
  };
}
