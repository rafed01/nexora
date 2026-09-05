'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  getBrowserSupabase,
  isSupabaseEnabled,
  UserProfile,
  UserRole,
  ApprovalStatus,
  UserStatus,
} from '@/lib/supabaseClient';
import AuthModal from '@/components/auth/AuthModal';
import { IntentActionInput, StoredIntent, useIntent } from '@/hooks/useIntent';
import { CheckCircle2, X } from 'lucide-react';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  openAuthModal: (tab?: 'login' | 'signup', intent?: IntentActionInput) => void;
  closeAuthModal: () => void;
  requireAuth: (intent: IntentActionInput, onAuthenticated?: () => void) => boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { saveIntent } = useIntent();

  // Core User & Profile State
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [activeIntent, setActiveIntent] = useState<IntentActionInput | null>(null);

  // Feedback Toast for Intent Execution
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const syncAuthCookiesAndStorage = useCallback((
    userObj: { id: string; email?: string } | null,
    profileObj: UserProfile | null,
    accessToken?: string
  ) => {
    if (typeof document === 'undefined') return;

    if (userObj && profileObj) {
      const role = profileObj.role || 'user';
      const status = profileObj.approval_status || profileObj.status || 'pending';
      const onboarding = profileObj.onboarding_completed === true || role === 'admin';

      document.cookie = `nexora_user_role=${role}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `nexora_user_status=${status}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `nexora_onboarding_completed=${onboarding ? 'true' : 'false'}; path=/; max-age=604800; SameSite=Lax`;

      if (accessToken) {
        document.cookie = `sb-access-token=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
      }

      try {
        localStorage.setItem('nexora_user_role', role);
        localStorage.setItem('nexora_user_status', status);
        localStorage.setItem('nexora_user_email', userObj.email || profileObj.email || '');
        localStorage.setItem('nexora_onboarding_completed', onboarding ? 'true' : 'false');
      } catch {}
    }
  }, []);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = getBrowserSupabase();

      if (isSupabaseEnabled && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);

          // Fetch profile strictly from protected database table
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (userProfile) {
            const castProfile = userProfile as UserProfile;
            const approvalStatus = (castProfile.approval_status || castProfile.status || 'pending') as ApprovalStatus;
            const resolvedProfile: UserProfile = {
              ...castProfile,
              role: (castProfile.role as UserRole) || 'user',
              approval_status: approvalStatus,
              status: approvalStatus,
              onboarding_completed: castProfile.role === 'admin' ? true : castProfile.onboarding_completed === true,
            };
            setProfile(resolvedProfile);
            syncAuthCookiesAndStorage(session.user, resolvedProfile, session.access_token);
          } else {
            // Default unassigned profile
            const unassigned: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'user',
              approval_status: 'pending',
              status: 'pending',
              onboarding_completed: false,
            };
            setProfile(unassigned);
            syncAuthCookiesAndStorage(session.user, unassigned, session.access_token);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Session load error:', err);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [syncAuthCookiesAndStorage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSession();
    }, 0);

    // Listen for intent executed events
    const handleIntentExecuted = (e: Event) => {
      const custom = e as CustomEvent<{ intent: StoredIntent; result: { success: boolean; message: string } }>;
      if (custom.detail?.result?.message) {
        setToastMessage(custom.detail.result.message);
        setTimeout(() => setToastMessage(null), 6000);
      }
    };

    window.addEventListener('nexora:intent-executed', handleIntentExecuted);

    const supabase = getBrowserSupabase();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        loadSession();
      });
      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
        window.removeEventListener('nexora:intent-executed', handleIntentExecuted);
      };
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('nexora:intent-executed', handleIntentExecuted);
    };
  }, [loadSession]);

  const openAuthModal = useCallback((tab: 'login' | 'signup' = 'login', intent?: IntentActionInput) => {
    setAuthModalTab(tab);
    if (intent) {
      setActiveIntent(intent);
      saveIntent(intent);
    }
    setIsAuthModalOpen(true);
  }, [saveIntent]);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setActiveIntent(null);
  }, []);

  /**
   * "Public View, Private Interaction" Interception Gate
   * Returns true if already authenticated, false if intercepted and opened modal.
   */
  const requireAuth = useCallback(
    (intent: IntentActionInput, onAuthenticated?: () => void): boolean => {
      const isAuthed = Boolean(user && profile);
      if (isAuthed) {
        if (onAuthenticated) onAuthenticated();
        return true;
      }

      // Intercept and persist action intent
      openAuthModal('signup', intent);
      return false;
    },
    [user, profile, openAuthModal]
  );

  const signOut = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'nexora_user_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'nexora_user_status=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'nexora_onboarding_completed=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'nexora_admin_session=; path=/; max-age=0; SameSite=Lax';

    try {
      localStorage.removeItem('nexora_user_role');
      localStorage.removeItem('nexora_user_status');
      localStorage.removeItem('nexora_user_email');
      localStorage.removeItem('nexora_onboarding_completed');
      localStorage.removeItem('nexora_admin_session');
    } catch {}

    setUser(null);
    setProfile(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        refreshProfile: loadSession,
        signOut,
      }}
    >
      {children}

      {/* Global Intercepted Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultTab={authModalTab}
        intent={activeIntent}
        onSuccess={() => {
          loadSession();
        }}
      />

      {/* Global Feedback Toast for executed intents */}
      {toastMessage && (
        <div
          id="intent-execution-toast"
          className="fixed bottom-6 right-6 z-[120] max-w-md p-4 rounded-xl bg-neutral-900 border border-cyan-500/50 text-neutral-100 shadow-[0_0_25px_rgba(34,211,238,0.25)] flex items-start gap-3 animate-in slide-in-from-bottom duration-300"
        >
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-cyan-300 block uppercase tracking-wider text-[10px] mb-0.5">
              Intent Successfully Executed
            </span>
            <p className="text-neutral-200">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
