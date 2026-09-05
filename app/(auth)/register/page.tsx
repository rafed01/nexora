'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';
import { Loader2 } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  return (
    <div className="min-h-[88vh] bg-neutral-950 flex flex-col items-center justify-center p-4">
      <AuthModal
        isOpen={true}
        onClose={() => router.push('/')}
        defaultTab="signup"
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-cyan-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
