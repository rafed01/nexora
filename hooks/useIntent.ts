'use client';

import { useState, useEffect, useCallback } from 'react';
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
export async function executeIntentPayload(intent: StoredIntent): Promise<{ success: boolean; message: string }> {
  try {
    switch (intent.type) {
      case 'download_report': {
        return submitRequest(intent, 'report_download', 'Report access request submitted.');
      }

      case 'bookmark': {
        const catalogId = typeof intent.payload.catalogId === 'string' ? intent.payload.catalogId : intent.payload.id;
        if (typeof catalogId !== 'string' || !catalogId) throw new Error('A valid catalog item is required.');
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ catalogId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to save bookmark.');
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'bookmark', entityType: intent.payload.type, entityId: catalogId }),
        });
        window.dispatchEvent(new CustomEvent('nexora:bookmark-updated', { detail: { id: catalogId, title: intent.title } }));
        return { success: true, message: `Saved "${intent.title}" to your private dossier.` };
      }

      case 'apply_challenge': {
        return submitRequest(intent, 'challenge_application', `Proposal submitted for "${intent.title}".`);
      }

      case 'request_call': {
        return submitRequest(intent, 'expert_consultation', `Consultation request submitted for "${intent.title}".`);
      }

      case 'custom':
      default: {
        throw new Error('This deferred action is no longer supported.');
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

async function submitRequest(
  intent: StoredIntent,
  requestType: 'challenge_application' | 'expert_consultation' | 'report_download',
  message: string
): Promise<{ success: boolean; message: string }> {
  const catalogId = typeof intent.payload.catalogId === 'string'
    ? intent.payload.catalogId
    : typeof intent.payload.challengeId === 'string'
    ? intent.payload.challengeId
    : typeof intent.payload.expertId === 'string'
    ? intent.payload.expertId
    : typeof intent.payload.reportId === 'string'
    ? intent.payload.reportId
    : null;
  const proposalBrief = typeof intent.payload.proposalBrief === 'string'
    ? intent.payload.proposalBrief
    : typeof intent.payload.notes === 'string'
    ? intent.payload.notes
    : `Request regarding ${intent.title}.`;
  const response = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestType, catalogId, proposalBrief, source: 'deferred-intent' }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to submit request.');
  return { success: true, message };
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
    async (): Promise<{ success: boolean; message: string } | null> => {
      const current = getStoredIntent();
      if (!current) return null;

      const result = await executeIntentPayload(current);
      if (result.success) clearIntent();

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
