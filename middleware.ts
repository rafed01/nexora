import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

type UserRole = 'guest' | 'researcher' | 'advisor' | 'company' | 'enterprise' | 'admin' | 'user' | 'employee';
type UserStatus = 'pending' | 'approved' | 'rejected';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PUBLIC READ-ONLY ACCESS:
  // Home, Explore, published detail pages, Challenges, Report previews, public AI Scout,
  // Login, Register, Rejected, and static/api assets are completely accessible without authentication.
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/explore') ||
    pathname.startsWith('/challenges') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/technology') ||
    pathname.startsWith('/startup') ||
    pathname.startsWith('/expert') ||
    pathname.startsWith('/ai-scout') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/rejected') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.');

  // Always refresh cookies/session for downstream SSR and client hydration
  const { supabaseResponse, user, supabase } = await updateSession(request);

  if (isPublicRoute) {
    return supabaseResponse;
  }

  // 2. AUTHENTICATION & IDENTITY VERIFICATION
  // If the user has no active cryptographic Supabase session and requests a protected route
  if (!user || !supabase) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Retrieve user's verified database profile using user's RLS session (NO service-role key in middleware)
  let userRole: UserRole = 'user';
  let userStatus: UserStatus = 'pending';
  let onboardingCompleted = false;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, approval_status, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      if (profile.role) userRole = profile.role as UserRole;
      if (profile.approval_status) userStatus = profile.approval_status as UserStatus;
      if (typeof profile.onboarding_completed === 'boolean') {
        onboardingCompleted = profile.onboarding_completed;
      }
    }
  } catch {
    // If profile lookup errors, retain default pending/user values
  }

  // 3. ADMIN ACCESS CONTROL:
  // Admin route allowed only for role === 'admin'; non-Admins are strictly forbidden
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      // Non-Admin: redirect to appropriate destination based on status
      if (userStatus === 'rejected') {
        return NextResponse.redirect(new URL('/rejected', request.url));
      }
      if (userStatus === 'pending') {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
      if (!onboardingCompleted) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Admin is allowed
    const response = supabaseResponse || NextResponse.next({ request });
    response.headers.set('x-user-role', 'admin');
    response.headers.set('x-user-status', 'approved');
    return response;
  }

  // 4. REJECTED STATUS:
  // Users with 'rejected' status must be routed to /rejected
  if (userRole !== 'admin' && userStatus === 'rejected') {
    if (pathname !== '/rejected') {
      return NextResponse.redirect(new URL('/rejected', request.url));
    }
    return supabaseResponse;
  }

  // 5. PENDING APPROVAL STATUS:
  // Non-admin users with 'pending' status must be routed to /pending-approval
  if (userRole !== 'admin' && userStatus === 'pending') {
    if (pathname !== '/pending-approval') {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
    const response = supabaseResponse || NextResponse.next({ request });
    response.headers.set('x-user-role', userRole);
    response.headers.set('x-user-status', 'pending');
    return response;
  }

  // 6. IF APPROVED USER ATTEMPTS TO ACCESS /pending-approval OR /rejected:
  // Avoid loop: forward approved user to /onboarding (if incomplete) or /dashboard
  if (pathname === '/pending-approval' || pathname === '/rejected') {
    if (userStatus === 'approved' || userRole === 'admin') {
      if (!onboardingCompleted && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 7. ONBOARDING GATE:
  // Approved users with onboarding incomplete must be routed to /onboarding
  if (userRole !== 'admin' && !onboardingCompleted) {
    if (pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    const response = supabaseResponse || NextResponse.next({ request });
    response.headers.set('x-user-role', userRole);
    response.headers.set('x-user-status', userStatus);
    return response;
  }

  // 8. ONBOARDED USERS ATTEMPTING TO RE-VISIT /onboarding:
  // Forward to /dashboard
  if (pathname === '/onboarding' && (onboardingCompleted || userRole === 'admin')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 9. AUTHORIZED ACCESS (Dashboard & Protected Routes):
  const response = supabaseResponse || NextResponse.next({ request });
  response.headers.set('x-user-role', userRole);
  response.headers.set('x-user-status', userStatus);
  response.headers.set('x-onboarding-completed', onboardingCompleted ? 'true' : 'false');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (.svg, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
