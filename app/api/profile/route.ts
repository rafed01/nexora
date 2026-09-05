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
    const { id, email } = body;

    if (!id || !email) {
      return NextResponse.json(
        { error: 'id and email are required to save profile.' },
        { status: 400 }
      );
    }

    // A user can only update their own profile unless platform admin
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only modify your own profile.' },
        { status: 403 }
      );
    }

    // Enforce role and approval status immutability:
    // Regular users cannot grant themselves 'admin' or alter approval status
    const existingProfile = await getProfile(id);
    const enforcedRole = currentUser.role === 'admin' 
      ? (body.role || existingProfile?.role || 'user')
      : (existingProfile?.role || currentUser.role || 'user');

    const enforcedStatus = currentUser.role === 'admin'
      ? (body.approval_status || existingProfile?.approval_status || 'pending')
      : (existingProfile?.approval_status || currentUser.approval_status || 'pending');

    const saved = await saveProfile({
      id,
      email,
      full_name: body.full_name,
      organization: body.organization,
      company_name: body.company_name,
      role: enforcedRole,
      approval_status: enforcedStatus,
      focus_area: body.focus_area,
      domain_expertise: body.domain_expertise,
      credentials: body.credentials,
      tax_id: body.tax_id,
      company_size: body.company_size,
      industry: body.industry,
      avatar_url: body.avatar_url,
      tech_stack: body.tech_stack,
      bio: body.bio,
      timezone: body.timezone,
      onboarding_completed: body.onboarding_completed,
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
