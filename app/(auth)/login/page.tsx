'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/components/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && profile) {
      const role = profile.role || 'user';
      if (role === 'admin') {
        router.replace(redirectTarget || '/admin');
      } else if (profile.approval_status === 'pending' || profile.status === 'pending') {
        router.replace('/pending-approval');
      } else if (profile.onboarding_completed === false) {
        router.replace('/onboarding');
      } else {
        router.replace(redirectTarget || '/dashboard');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, user, profile, redirectTarget]);

  if (!isLoading && isAuthenticated && profile?.role === 'admin') {
    return (
      <div className="min-h-[88vh] bg-neutral-950 flex flex-col items-center justify-center p-4 text-cyan-400 font-mono text-xs gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span>Admin clearance active. Redirecting to Curator Console...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[88vh] bg-neutral-950 flex flex-col items-center justify-center p-4">
      <AuthModal
        isOpen={true}
        onClose={() => router.push('/')}
        defaultTab="login"
        intent={
          redirectTarget
            ? {
                type: 'custom',
                title: 'Redirecting to requested resource',
                payload: { returnUrl: redirectTarget },
                returnUrl: redirectTarget,
              }
            : null
        }
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-cyan-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
