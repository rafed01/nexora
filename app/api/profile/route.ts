import { NextRequest, NextResponse } from 'next/server';
import { getProfile, saveProfile, getAllProfiles } from '@/lib/db';
import { getCurrentUser, requirePlatformAdmin } from '@/lib/supabase/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Sign-in required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idOrEmail = searchParams.get('id') || searchParams.get('email');
    const all = searchParams.get('all') === 'true';

    if (all) {
      const adminAuth = await requirePlatformAdmin();
      if (!adminAuth.authorized) {
        return NextResponse.json(
          { error: 'Forbidden: Administrator privileges required.' },
          { status: 403 }
        );
      }
      const profiles = await getAllProfiles();
      return NextResponse.json({ profiles });
    }

    if (!idOrEmail) {
      return NextResponse.json(
        { error: 'Missing id or email parameter' },
        { status: 400 }
      );
    }

    // A user can only fetch their own profile unless they are a platform admin
    if (
      currentUser.role !== 'admin' &&
      currentUser.id !== idOrEmail &&
      currentUser.email !== idOrEmail
    ) {
      return NextResponse.json(
        { error: 'Forbidden: You can only access your own profile.' },
        { status: 403 }
      );
    }

    const profile = await getProfile(idOrEmail);
    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Sign-in required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const id = currentUser.id;
    const email = currentUser.email;

    // Role, approval and organization authority are exclusively managed by the
    // dedicated server-side approval flows, never this browser payload.
    const existingProfile = await getProfile(id);
    const enforcedRole = existingProfile?.role || currentUser.role || 'user';
    const enforcedStatus = existingProfile?.approval_status || currentUser.approval_status || 'pending';

    const safeText = (value: unknown, limit: number) =>
      typeof value === 'string' ? value.trim().slice(0, limit) : undefined;
    const saved = await saveProfile({
      id,
      email,
      full_name: safeText(body.full_name, 255),
      organization: safeText(body.organization, 255),
      company_name: safeText(body.company_name, 255),
      role: enforcedRole,
      approval_status: enforcedStatus,
      status: existingProfile?.status || enforcedStatus,
      focus_area: safeText(body.focus_area, 1000),
      domain_expertise: safeText(body.domain_expertise, 1000),
      credentials: safeText(body.credentials, 2000),
      tax_id: safeText(body.tax_id, 255),
      company_size: safeText(body.company_size, 100),
      industry: safeText(body.industry, 255),
      avatar_url: safeText(body.avatar_url, 2000),
      tech_stack: Array.isArray(body.tech_stack) ? body.tech_stack.filter((tag: unknown) => typeof tag === 'string').map((tag: string) => tag.trim().slice(0, 100)).slice(0, 30) : undefined,
      bio: safeText(body.bio, 5000),
      timezone: safeText(body.timezone, 100),
      onboarding_completed: existingProfile?.onboarding_completed ?? false,
    });

    return NextResponse.json(
      { message: 'Profile updated successfully', profile: saved },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile.' },
      { status: 500 }
    );
  }
}
