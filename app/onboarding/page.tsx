'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Target,
  ShieldCheck,
  Zap,
  Plus,
  X,
  Loader2,
  Compass,
} from 'lucide-react';
import { getBrowserSupabase, isSupabaseEnabled } from '@/lib/supabaseClient';
import { useIntent } from '@/hooks/useIntent';

const AVAILABLE_TECH_DOMAINS = [
  {
    category: 'Quantum & Optical Computing',
    tags: [
      'Silicon Photonics',
      'Quantum Error Mitigation',
      'Photonic MPU',
      'Superconducting Qubits',
      'Optical Tensor Cores',
      'Waveguide Interferometry',
    ],
  },
  {
    category: 'Advanced Materials & Energy',
    tags: [
      'Solid-State Electrolytes',
      'Argyrodite Crystals',
      'High-Nickel Cathodes',
      'Lithium Metal Anodes',
      'Perovskite Photovoltaics',
      'Metamaterials',
    ],
  },
  {
    category: 'Frontier AI & Silicon',
    tags: [
      'Neuromorphic Compute',
      'Sub-Watt Inference',
      'Analog In-Memory Computing',
      'Edge AI Processors',
      'Transformer Accelerators',
    ],
  },
  {
    category: 'Synthetic Biology & MedTech',
    tags: [
      'Directed Evolution',
      'Enzymatic DNA Synthesis',
      'mRNA Targeted Nanoparticles',
      'Structural Proteomics',
      'Microfluidic Chips',
    ],
  },
];

const OBJECTIVES = [
  {
    id: 'scouting',
    title: 'Technology Scouting & Due Diligence',
    desc: 'Track emerging lab prototypes, patent lineage, and readiness verification.',
  },
  {
    id: 'corporate_pilots',
    title: 'Corporate Challenge & Pilot Sponsorship',
    desc: 'Fund active challenges, pilot grants, and commercial licensing pipelines.',
  },
  {
    id: 'patent_licensing',
    title: 'IP & Patent Telemetry Licensing',
    desc: 'Direct licensing of verified university patents and foundry blueprints.',
  },
  {
    id: 'advisory',
    title: 'Technical Advisory & Consultation',
    desc: 'Provide or solicit 1-on-1 deep domain expertise and architectural review.',
  },
];

const TRL_LEVELS = [
  { id: 'early', label: 'TRL 1–3', desc: 'Laboratory Research & Proof of Concept' },
  { id: 'mid', label: 'TRL 4–6', desc: 'System Prototype & Relevant Environment' },
  { id: 'late', label: 'TRL 7–9', desc: 'Operational Demonstration & Commercial Deployment' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { executePendingIntent } = useIntent();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  // Step 1: Selected Tech Stack & Tags
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Silicon Photonics',
    'Quantum Error Mitigation',
  ]);
  const [customTagInput, setCustomTagInput] = useState('');

  // Step 2: Objectives & TRL Focus
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([
    'Technology Scouting & Due Diligence',
  ]);
  const [selectedTrl, setSelectedTrl] = useState<string>('mid');

  // Step 3: Executive Narrative Bio
  const [executiveBio, setExecutiveBio] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [researchFocus, setResearchFocus] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check current auth status and load pre-existing profile information
    const checkUser = async () => {
      const supabase = getBrowserSupabase();
      if (isSupabaseEnabled && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            if (profile.onboarding_completed) {
              router.push('/dashboard');
              return;
            }
            if (profile.domain_expertise && typeof profile.domain_expertise === 'string') {
              setSelectedTags((prev) => Array.from(new Set([...prev, profile.domain_expertise])));
            }
            if (profile.organization) {
              setResearchFocus(`Research and technology strategy at ${profile.organization}`);
            }
          }
        }
      }
    };

    checkUser();
  }, [router]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
      setCustomTagInput('');
    }
  };

  const toggleObjective = (title: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(title) ? prev.filter((o) => o !== title) : [...prev, title]
    );
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1 && selectedTags.length < 1) {
      setErrorMsg('Please select at least one technology domain or tag to calibrate your feed.');
      return;
    }
    if (step === 2 && selectedObjectives.length < 1) {
      setErrorMsg('Please select at least one primary engagement objective.');
      return;
    }
    if (step === 3 && executiveBio.trim().length < 20) {
      setErrorMsg('Please provide a brief executive narrative (at least 20 characters) for profile clearance.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const supabase = getBrowserSupabase();

      if (isSupabaseEnabled && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { error } = await supabase
            .from('profiles')
            .update({
              onboarding_completed: true,
              tech_stack: selectedTags,
              focus_area: selectedObjectives.join(', '),
              bio: executiveBio,
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.user.id);

          if (error) throw error;
        }
      }

      // Synchronize cookies and localStorage for edge middleware and client state
      document.cookie = 'nexora_onboarding_completed=true; path=/; max-age=604800; SameSite=Lax';
      try {
        localStorage.setItem('nexora_onboarding_completed', 'true');
        localStorage.setItem('nexora_user_tech_stack', JSON.stringify(selectedTags));
        localStorage.setItem('nexora_user_bio', executiveBio);
      } catch {}

      // Automatically execute any pending intent
      try {
        await executePendingIntent();
      } catch {}

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to finalize profile onboarding.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[92vh] bg-neutral-950 flex flex-col items-center justify-center p-4 selection:bg-cyan-500/20 selection:text-cyan-200">
      <div className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Step Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-cyan-400 font-semibold uppercase tracking-wider">
              Stage {step} of {totalSteps}:{' '}
              {step === 1 && 'Technology Taxonomy & Focus Stack'}
              {step === 2 && 'Innovation Objectives & TRL Focus'}
              {step === 3 && 'Executive Narrative & Bio'}
              {step === 4 && 'Clearance Finalization'}
            </span>
            <span className="text-neutral-400">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>

          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: TECHNOLOGY TAXONOMY & TAGS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                Configure Technology Matrix
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Select your focus areas. The AI Scout telemetry will index technologies and research alerts to match.
              </p>
            </div>

            {/* Custom Tag Input */}
            <form onSubmit={handleAddCustomTag} className="flex gap-2">
              <input
                id="input-custom-tag"
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="Add custom keyword (e.g. Sub-Watt Optical Interconnects)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Add</span>
              </button>
            </form>

            {/* Tag Selection Groups */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {AVAILABLE_TECH_DOMAINS.map((group) => (
                <div key={group.category} className="space-y-2">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block font-semibold">
                    {group.category}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-cyan-950/80 border border-cyan-500 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                              : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                          }`}
                        >
                          <span>{tag}</span>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-neutral-400 font-mono flex justify-between items-center">
              <span>Selected Domains: {selectedTags.length}</span>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="text-neutral-500 hover:text-neutral-300 underline"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: OBJECTIVES & TRL ALIGNMENT */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                Engagement Objectives &amp; TRL Alignment
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Define your operational mandate and acceptable technology readiness threshold.
              </p>
            </div>

            {/* Objectives Selection */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block font-semibold">
                Primary Platform Objectives
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OBJECTIVES.map((obj) => {
                  const isSelected = selectedObjectives.includes(obj.title);
                  return (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => toggleObjective(obj.title)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-100 ring-1 ring-cyan-500/50'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono">{obj.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">{obj.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TRL Stage Preference */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block font-semibold">
                Target Technology Readiness Level (TRL)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {TRL_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setSelectedTrl(level.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedTrl === level.id
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono block">{level.label}</span>
                    <span className="text-[10px] text-neutral-400 mt-1 block leading-tight">{level.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EXECUTIVE NARRATIVE & BIO */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                Executive Narrative &amp; Focus
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Provide an overview of your technical background or organizational mandate to calibrate verified dossier exchanges.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">
                  Professional Title / Role
                </label>
                <input
                  id="onboarding-input-title"
                  type="text"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  placeholder="e.g. Principal Hardware Architect / VP of Open Innovation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-mono text-neutral-400">
                  <span className="uppercase tracking-wider">Executive Narrative &amp; Bio</span>
                  <span>{executiveBio.length} / 500 characters</span>
                </div>
                <textarea
                  id="onboarding-input-bio"
                  rows={5}
                  value={executiveBio}
                  onChange={(e) => setExecutiveBio(e.target.value)}
                  placeholder="Describe your primary technical focus, research trajectory, or target technological partnerships..."
                  className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono leading-relaxed"
                />
              </div>

              {/* Suggested template buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Quick Prompts:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExecutiveBio(
                        'Leading R&D due diligence on photonic accelerators, quantum error mitigation, and optical interconnects for high-throughput tensor computing.'
                      )
                    }
                    className="text-[10px] font-mono px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-cyan-300 hover:border-neutral-700 transition-colors text-left"
                  >
                    + Optical Computing Due Diligence
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setExecutiveBio(
                        'Evaluating solid-state electrolyte battery chemistries and advanced roll-to-roll manufacturing blueprints for commercial EV pilots.'
                      )
                    }
                    className="text-[10px] font-mono px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-cyan-300 hover:border-neutral-700 transition-colors text-left"
                  >
                    + Solid-State Battery Commercialization
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FINAL CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                  Clearance Ready for Finalization
                </h2>
                <p className="text-xs text-neutral-400 font-mono">
                  Review your profile configuration prior to terminal activation.
                </p>
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs space-y-3">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Configured Tech Focus Stack:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedTags.slice(0, 8).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800 text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                  {selectedTags.length > 8 && (
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[11px]">
                      +{selectedTags.length - 8} more
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-neutral-800/80 pt-2">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Engagement Objectives:
                </span>
                <p className="text-neutral-200 mt-0.5">{selectedObjectives.join(' • ')}</p>
              </div>

              <div className="border-t border-neutral-800/80 pt-2">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Executive Bio Narrative:
                </span>
                <p className="text-neutral-300 mt-0.5 italic line-clamp-3">&ldquo;{executiveBio}&rdquo;</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              id="btn-onboarding-back"
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              id="btn-onboarding-next"
              type="button"
              onClick={handleNext}
              className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-onboarding-finalize"
              type="button"
              onClick={handleFinalize}
              disabled={isSubmitting}
              className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating Clearance...</span>
                </>
              ) : (
                <>
                  <span>Activate Clearance &amp; Launch Terminal</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
