import { NextResponse } from 'next/server';
import { getSupabaseClient, IS_SUPABASE, getCatalog } from '@/lib/db';

export interface ApprovedOrg {
  id: string;
  name: string;
  industry?: string;
  domain?: string;
  tier?: string;
}

const DEFAULT_APPROVED_ORGS: ApprovedOrg[] = [
  { id: 'org-cern-eth', name: 'CERN OpenLab & ETH Zurich', industry: 'Quantum Computing & Particle Physics', domain: 'cern.ch' },
  { id: 'org-kyoto-mat', name: 'Kyoto Materials Innovation Lab / Tokyo Tech', industry: 'Advanced Energy Storage', domain: 'kyoto-u.ac.jp' },
  { id: 'org-nexora-opto', name: 'NEXORA Optoelectronics Core / IMEC Spinout', industry: 'Silicon Photonics & Optical Computing', domain: 'imec-int.com' },
  { id: 'org-isae-onera', name: 'ISAE-SUPAERO & ONERA Spinout', industry: 'Hypersonic Propulsion & Defense', domain: 'isae-supaero.fr' },
  { id: 'org-biozentrum', name: 'Biozentrum Basel & ETH Zurich', industry: 'Synthetic Biology & Gene Editing', domain: 'unibas.ch' },
  { id: 'org-novavolt', name: 'Novavolt Powertrain Systems', industry: 'Heavy EV Powertrains', domain: 'novavolt.tech' },
  { id: 'org-max-planck', name: 'Max Planck Institute for Quantum Optics', industry: 'Quantum Error Mitigation', domain: 'mpq.mpg.de' },
  { id: 'org-helios', name: 'Helios Cloud Infrastructure Group', industry: 'Sub-Watt AI Hardware', domain: 'helios-ai.io' },
  { id: 'org-siemens-ventures', name: 'Siemens Energy Ventures AG', industry: 'Clean Energy & Grid Systems', domain: 'siemens-energy.com' },
  { id: 'org-defense-cluster', name: 'European Aerospace Defense Consortium', industry: 'Aerospace & Defense', domain: 'eadc.eu' },
  { id: 'org-nordic-clean', name: 'Nordic Clean Energy Fund', industry: 'Clean Energy Investments', domain: 'nordicclean.org' },
];

export async function GET() {
  try {
    if (IS_SUPABASE) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, industry, domain, tier')
        .eq('approval_status', 'approved')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ organizations: data });
      }
    }

    // Fallback or seed: Extract unique organization names from catalog
    const catalog = await getCatalog();
    const orgMap = new Map<string, ApprovedOrg>();

    DEFAULT_APPROVED_ORGS.forEach((org) => orgMap.set(org.name.toLowerCase(), org));

    catalog.forEach((item) => {
      if (item.organization && item.organization.trim()) {
        const name = item.organization.trim();
        const key = name.toLowerCase();
        if (!orgMap.has(key)) {
          orgMap.set(key, {
            id: `org-${key.replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`,
            name,
            industry: item.category || 'Deep Tech',
          });
        }
      }
    });

    const organizations = Array.from(orgMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ organizations });
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ organizations: DEFAULT_APPROVED_ORGS });
  }
}
