'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Save, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function SettingsPage() {
  const { user, profile, isLoading, refreshProfile, signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const values = new FormData(event.currentTarget);
    const payload = Object.fromEntries(['full_name', 'organization', 'company_name', 'industry', 'focus_area', 'domain_expertise', 'bio', 'timezone'].map((key) => [key, values.get(key)]));
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save profile.');
      await refreshProfile();
      setMessage('Profile saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <main className="min-h-screen bg-neutral-950 grid place-items-center text-neutral-400"><Loader2 className="h-6 w-6 animate-spin" /></main>;
  if (!user || !profile) return <main className="min-h-screen bg-neutral-950 grid place-items-center text-neutral-300">Sign in to manage your profile.</main>;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-cyan-300"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div><div className="mb-2 flex items-center gap-2 text-cyan-300"><Settings className="h-5 w-5" /><span className="text-xs font-mono uppercase tracking-widest">Account settings</span></div><h1 className="text-2xl font-bold">Profile and preferences</h1><p className="mt-2 text-sm text-neutral-400">Your role, approval state, organization membership, and account email are managed securely and cannot be changed here.</p></div>
            <ShieldCheck className="h-7 w-7 shrink-0 text-emerald-400" />
          </div>
          <form onSubmit={saveProfile} className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">Account email<input disabled value={user.email || ''} className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-500" /></label>
            <label className="grid gap-2 text-sm">Role<input disabled value={profile.role} className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 capitalize text-neutral-500" /></label>
            <label className="grid gap-2 text-sm">Full name<input name="full_name" defaultValue={profile.full_name || ''} maxLength={255} className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" /></label>
            <label className="grid gap-2 text-sm">Organization<input name="organization" defaultValue={profile.organization || ''} maxLength={255} className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" /></label>
            <label className="grid gap-2 text-sm">Company name<input name="company_name" defaultValue={profile.company_name || ''} maxLength={255} className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" /></label>
            <label className="grid gap-2 text-sm">Industry<input name="industry" defaultValue={profile.industry || ''} maxLength={255} className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" /></label>
            <label className="grid gap-2 text-sm sm:col-span-2">Focus area<input name="focus_area" defaultValue={profile.focus_area || ''} maxLength={1000} className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" /></label>
            <label className="grid gap-2 text-sm sm:col-span-2">Bio<textarea name="bio" defaultValue={profile.bio || ''} maxLength={5000} rows={5} className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2" /></label>
            {error && <p className="sm:col-span-2 text-sm text-rose-400">{error}</p>}
            {message && <p className="sm:col-span-2 flex items-center gap-2 text-sm text-emerald-400"><CheckCircle2 className="h-4 w-4" />{message}</p>}
            <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2"><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-neutral-950 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Saving' : 'Save profile'}</button><button type="button" onClick={() => void signOut()} className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:border-rose-700 hover:text-rose-300">Sign out</button></div>
          </form>
        </section>
      </div>
    </main>
  );
}
