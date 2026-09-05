# NEXORA Architecture & Technical Audit

> **Audit Date:** 2026-09-05  
> **Status:** Discovery & Baseline Record (Read-only step, no code fixes applied)  
> **Scope:** Full codebase audit covering routes, database schemas, access control, state persistence, technical debt, and build verification.

---

## 1. All Current Routes

### 1.1 Application Pages & Dynamic Endpoints
| Route | Type | File Path | Access / Guard | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Page (Client) | `app/page.tsx` | Public | Hero introduction, high-level platform value proposition, search entry point |
| `/explore` | Page (Client) | `app/explore/page.tsx` | Public / Role filtered | Interactive registry explorer (technologies, startups, experts, challenges, reports) |
| `/technology/[id]` | Page (Dynamic) | `app/technology/[id]/page.tsx` | Public | Deep-tech node dossier, physics specifications, TRL breakdown, challenge alignment |
| `/startup/[id]` | Page (Dynamic) | `app/startup/[id]/page.tsx` | Public | Commercial venture dossier, TRL stage, cap table / funding metrics, leadership |
| `/expert/[id]` | Page (Dynamic) | `app/expert/[id]/page.tsx` | Public | Fellow dossier, advisory status, citation telemetry, publications, advisory booking |
| `/challenges` | Page (Client) | `app/challenges/page.tsx` | Public | Corporate co-development briefs, sponsored pilots, application modal |
| `/reports` | Page (Client) | `app/reports/page.tsx` | Public | Frontier research publications, market maps, techno-economic audits, simulated downloads |
| `/ai-scout` | Page (Client) | `app/ai-scout/page.tsx` | Public / Role contextual | Conversational deep-tech intelligence scout and matchmaking interface |
| `/login` | Page (Client) | `app/(auth)/login/page.tsx` | Public | Credentials authentication, quick-switch demo profiles, OAuth redirect |
| `/register` | Page (Client) | `app/(auth)/register/page.tsx` | Public | User onboarding registration form with role selection |
| `/onboarding` | Page (Client) | `app/onboarding/page.tsx` | Authenticated | Multi-step role profile enrichment (institution, sector, capabilities) |
| `/dashboard` | Page (Client) | `app/dashboard/page.tsx` | Authenticated (`approved`) | Personalized role-specific workspace dashboard |
| `/admin` | Page (Client) | `app/admin/page.tsx` | Admin (`admin` role) | System governance, access request triage, registry catalog manager |
| `/pending-approval` | Page (Client) | `app/pending-approval/page.tsx` | Authenticated (`pending`) | Informational holding view for unapproved user accounts |

### 1.2 API Routes
| Endpoint | Method(s) | File Path | Description |
| :--- | :--- | :--- | :--- |
| `/api/catalog` | `GET`, `POST` | `app/api/catalog/route.ts` | Retrieve and submit catalog entities (technologies, startups, experts, challenges, reports) |
| `/api/profile` | `GET`, `POST`, `PUT` | `app/api/profile/route.ts` | Query user profile, create initial profile, or update profile settings |
| `/api/request-access` | `GET`, `POST` | `app/api/request-access/route.ts` | Access request submission and listing for NDAs / enterprise briefings |
| `/api/ai-scout` | `POST` | `app/api/ai-scout/route.ts` | Gemini AI query proxy with heuristic fallback for offline scout queries |
| `/api/seed` | `POST` | `app/api/seed/route.ts` | Database initialization / reset endpoint |

---

## 2. Supabase Tables and Columns Referenced by Code

### 2.1 Table: `public.catalog`
*Referenced in `lib/db.ts`, `app/api/catalog/route.ts`, and `scripts/schema-rbac.sql`*

| Column | Data Type | Referenced In Code | Present in `schema-rbac.sql`? | Notes / Discrepancies |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `lib/db.ts`, `app/api/catalog/route.ts` | Yes (`TEXT PRIMARY KEY`) | Entity identifier (e.g. `tech-photonic-compute`) |
| `type` | `TEXT` | `lib/db.ts`, `app/api/catalog/route.ts` | Yes (`TEXT NOT NULL`) | Type of entity: `'technology'`, `'startup'`, `'expert'`, `'challenge'`, `'report'` |
| `title` | `TEXT` | `lib/db.ts`, `app/api/catalog/route.ts` | Yes (`TEXT NOT NULL`) | Display title |
| `category` | `TEXT` | `lib/db.ts`, `app/api/catalog/route.ts` | Yes (`TEXT NOT NULL`) | Sector or technological discipline |
| `organization`| `TEXT` | `lib/db.ts`, `app/api/catalog/route.ts` | Yes (`TEXT NOT NULL`) | Affiliated organization or institution |
| `trl` | `INTEGER` | `lib/db.ts`, `app/api/catalog/route.ts` | Yes (`INTEGER`) | Technology Readiness Level (1–9) |
| `budget` | `TEXT` | `lib/db.ts`, `app/api/catalog/route.ts` | Yes (`TEXT`) | Budget allocation string (for challenges) |
| `description` | `TEXT` | `lib/db.ts`, `app/api/catalog/route.ts` | Yes (`TEXT`) | Detailed summary |
| `tags` | `TEXT[]` | `lib/db.ts`, `app/api/catalog/route.ts` | Yes (`TEXT[] DEFAULT '{}'`) | Taxonomy labels |
| `status` | `TEXT` | `lib/db.ts`, `app/api/catalog/route.ts` | Yes (`TEXT NOT NULL DEFAULT 'published'`) | Publication status (`'published'`, `'draft'`, `'archived'`, `'active'`) |
| `metadata` | `JSONB` | `lib/db.ts`, `app/api/catalog/route.ts` | Yes (`JSONB DEFAULT '{}'`) | Arbitrary entity details and metrics |
| `created_at` | `TIMESTAMPTZ`| `lib/db.ts` | Yes (`TIMESTAMPTZ DEFAULT now()`) | Timestamp of creation |
| `updated_at` | `TIMESTAMPTZ`| `lib/db.ts` | Yes (`TIMESTAMPTZ DEFAULT now()`) | Timestamp of last modification |

### 2.2 Table: `public.requests`
*Referenced in `lib/db.ts`, `app/api/request-access/route.ts`, and `scripts/schema-rbac.sql`*

| Column | Data Type | Referenced In Code | Present in `schema-rbac.sql`? | Notes / Discrepancies |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `lib/db.ts`, `app/api/request-access/route.ts` | Yes (`TEXT PRIMARY KEY`) | Request ID |
| `user_id` | `UUID` / `TEXT` | `lib/db.ts` | Yes (`UUID REFERENCES auth.users(id)`) | Associated authenticated user (if signed in) |
| `catalog_id` | `TEXT` | `lib/db.ts` | Yes (`TEXT REFERENCES public.catalog(id)`) | Associated target catalog entity |
| `name` | `TEXT` | `lib/db.ts`, `app/api/request-access/route.ts` | Yes (`TEXT NOT NULL`) | Requester full name |
| `email` | `TEXT` | `lib/db.ts`, `app/api/request-access/route.ts` | Yes (`TEXT NOT NULL`) | Requester email address |
| `organization`| `TEXT` | `lib/db.ts`, `app/api/request-access/route.ts` | Yes (`TEXT NOT NULL`) | Requester organization |
| `proposal_brief`| `TEXT` | `lib/db.ts`, `app/api/request-access/route.ts` | Yes (`TEXT`) | Proposal or rationale for access |
| `status` | `TEXT` | `lib/db.ts`, `app/api/request-access/route.ts` | Yes (`TEXT NOT NULL DEFAULT 'pending'`) | Status (`'pending'`, `'approved'`, `'rejected'`) |
| `created_at` | `TIMESTAMPTZ`| `lib/db.ts` | Yes (`TIMESTAMPTZ DEFAULT now()`) | Timestamp of creation |

### 2.3 Table: `public.profiles`
*Referenced in `lib/db.ts`, `app/api/profile/route.ts`, `middleware.ts`, `components/providers/AuthProvider.tsx`, `components/auth/AuthModal.tsx`, `app/admin/page.tsx`, and `scripts/schema-rbac.sql`*

| Column | Data Type | Referenced In Code | Present in `schema-rbac.sql`? | Notes / Discrepancies |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | Everywhere user profile is checked | Yes (`UUID PRIMARY KEY REFERENCES auth.users(id)`) | User unique identifier |
| `email` | `TEXT` | `lib/db.ts`, `app/api/profile/route.ts`, etc. | Yes (`TEXT NOT NULL`) | Email address |
| `full_name` | `TEXT` | `lib/db.ts`, `app/api/profile/route.ts` | Yes (`TEXT`) | Full display name |
| `organization`| `TEXT` | `lib/db.ts`, `app/api/profile/route.ts` | Yes (`TEXT`) | Institutional affiliation |
| `role` | `TEXT` | Everywhere RBAC is handled | Yes (`TEXT NOT NULL DEFAULT 'corporate'`) | Role name |
| `approval_status`| `TEXT` | Everywhere approval gates exist | Yes (`TEXT NOT NULL DEFAULT 'pending'`) | Status (`'pending'`, `'approved'`, `'rejected'`) |
| `metadata` | `JSONB` | `lib/db.ts`, `app/api/profile/route.ts` | Yes (`JSONB DEFAULT '{}'`) | Profile metadata |
| `created_at` | `TIMESTAMPTZ`| `lib/db.ts` | Yes (`TIMESTAMPTZ DEFAULT now()`) | Timestamp of creation |
| `updated_at` | `TIMESTAMPTZ`| `lib/db.ts` | Yes (`TIMESTAMPTZ DEFAULT now()`) | Timestamp of update |

---

## 3. All Role Names and Approval-Status Names

### 3.1 Role Names
Across `middleware.ts`, `AuthProvider.tsx`, `lib/db.ts`, `app/admin/page.tsx`, `app/(auth)/login/page.tsx`, and `scripts/schema-rbac.sql`, the following role identifiers are referenced:

1. **`admin`**: System administrator and platform curator. Grants full administrative dashboard access (`/admin`) and unrestricted access across all platform modules.
2. **`corporate`**: Corporate innovation scout, enterprise R&D leader, or open innovation manager. Focuses on challenges and tech scouting.
3. **`investor`**: Venture capital partner, corporate venture capital (CVC) analyst, or deep-tech syndicate lead. Focuses on startups, TRL validation, and cap tables.
4. **`researcher`**: Academic principal investigator, lab director, or university technology transfer officer. Focuses on technology disclosure and patent licensing.
5. **`startup`**: Deep-tech founder, spinout executive, or corporate venture spin-in lead. Focuses on corporate co-development challenges and pilot allocations.
6. **`expert`**: Domain specialist, scientific advisory board member, or independent technical due diligence auditor.
7. **`user`**: Generic unassigned or newly registered fallback role.

### 3.2 Approval Status Names
1. **`pending`** (or `'Pending'` / `'Pending Review'`): Initial state upon user signup or access request submission. Restricts user access to `/pending-approval` or pending banner.
2. **`approved`** (or `'Approved'`): Access granted by an admin or auto-granted. Gives full access to `/dashboard` and role-specific features.
3. **`rejected`** (or `'Rejected'`): Access declined. Prevents dashboard authorization.
4. **`Active` / `Draft` / `Archived`**: Entity-level publication status used in `app/admin/page.tsx` and `app/api/catalog/route.ts`.

---

## 4. Technical Debt & Workaround Inventory

### 4.1 Local JSON (`data.json`)
- **Location:** `lib/db.ts` (lines 14–23, 222–330).
- **Mechanism:** In local mode (`IS_SUPABASE = false`), reads and writes directly to `data.json` on the container filesystem via Node `fs/promises`.
- **Concurrency Strategy:** Uses an in-memory queue (`writeQueue`) with promise chaining to serialize filesystem writes.
- **Risk:** Resets whenever container rebuilds or state clears; not suitable for multi-instance production environments.

### 4.2 Mock Users & Hardcoded Authentication
- **Location:** `lib/db.ts` (`INITIAL_USERS`, lines 180–220), `app/(auth)/login/page.tsx` (`DEMO_ACCOUNTS`, lines 25–65), `components/auth/AuthModal.tsx` (`DEMO_USERS`, lines 24–65).
- **Hardcoded Demo Accounts:**
  - `admin@nexora.intelligence` (Role: `admin`, Status: `approved`)
  - `corporate@novartis.com` (Role: `corporate`, Status: `approved`)
  - `investor@deeptech-ventures.com` (Role: `investor`, Status: `approved`)
  - `researcher@eth-zurich.ch` (Role: `researcher`, Status: `approved`)
  - `startup@aetherion.space` (Role: `startup`, Status: `approved`)
  - `expert@cern-openlab.ch` (Role: `expert`, Status: `approved`)
  - `pending@newventure.com` (Role: `corporate`, Status: `pending`)
- **Mock Authentication Handler:** `signIn` and `signUp` in `AuthProvider.tsx` directly bypass Supabase auth when `!isSupabaseEnabled`, setting mock tokens (`mock-jwt-token-...`) and mock user records into state and storage.

### 4.3 Role Cookies & Edge Middleware Reliance
- **Location:** `middleware.ts` (lines 48–60), `AuthProvider.tsx` (lines 100–120), `app/admin/page.tsx` (lines 438–442, 550–556).
- **Mechanism:** The edge middleware inspects plain HTTP cookies:
  - `nexora_user_role` (e.g. `'admin'`, `'corporate'`)
  - `nexora_user_status` (e.g. `'approved'`, `'pending'`)
  - `nexora_admin_session` (`'authenticated'`)
- **Vulnerability:** Cookies are set client-side via `document.cookie` without `HttpOnly` or cryptographic signatures. Any client or browser developer console can set `document.cookie = "nexora_user_role=admin"` and `document.cookie = "nexora_admin_session=authenticated"` to pass middleware route checks for `/admin`.

### 4.4 LocalStorage Authorization Checks
- **Location:** `components/providers/AuthProvider.tsx` (lines 68–85), `app/admin/page.tsx` (lines 380–390, 414–420).
- **Mechanism:** In both client components, `localStorage.getItem('nexora_user_role')` and `localStorage.getItem('nexora_admin_session')` are read on mount and directly used to establish `sessionUser` with admin/user rights if Supabase session is not active or returns null.

### 4.5 Hardcoded Catalog Data
- **Location:**
  - `lib/db.ts` (`SEED_DATA`, lines 25–178): 7 baseline catalog nodes (photonic compute, neuromorphic vision, aetherion aerospace, synthosyn bio, cryogenic sensors, solid-state battery, carbon capture).
  - `app/admin/page.tsx` (`INITIAL_REGISTRY`, lines 35–185): 10 hardcoded entities.
  - `app/admin/page.tsx` (`INITIAL_REQUESTS`, lines 187–245): 5 hardcoded access requests.
  - `app/challenges/page.tsx` (`CHALLENGES_AND_REPORTS`, lines 22–165): 8 corporate challenge items.
  - `app/reports/page.tsx` (`REPORTS_DATA`, lines 24–235): 7 deep-tech intelligence publications.
  - `app/technology/[id]/page.tsx` (`HARDCODED_TECH`, lines 40–632): 2 comprehensive technology dossiers.
  - `app/startup/[id]/page.tsx` (`HARDCODED_STARTUPS`, lines 65–275): 2 comprehensive startup dossiers.
  - `app/expert/[id]/page.tsx` (`HARDCODED_EXPERTS`, lines 64–323): 3 comprehensive expert dossiers.

### 4.6 Generated Fallback Profiles
- **Location:**
  - `app/technology/[id]/page.tsx` (`generateDynamicTechnology`, lines 635–715): Procedurally generates physics metrics, TRL milestones, and patent tables based on string parsing of the ID when the ID is not in `HARDCODED_TECH`.
  - `app/startup/[id]/page.tsx` (`generateDynamicStartup`, lines 278–365): Procedurally generates funding stages, problem/solution narratives, and leadership profiles from ID string parsing.
  - `app/expert/[id]/page.tsx` (`generateDynamicExpert`, lines 325–385): Procedurally generates citations, h-index, publications, and advisory scopes based on ID string parsing.

### 4.7 Simulated Downloads
- **Location:** `app/reports/page.tsx` (`handleTriggerDownload`, lines 273–290).
- **Mechanism:** Creates an in-memory client `Blob` with plaintext report abstract content and triggers a browser anchor download for `<id>.txt` while displaying a toast claiming "Downloading PDF: ...". No real binary file or PDF generation backend exists.

### 4.8 UI-Only Database Actions
- **Location:** `app/admin/page.tsx`:
  - `handleToggleStatus` (lines 721–739): Toggles `'Active'`, `'Archived'`, `'Pending Review'` only in local React state (`setEntities`). No HTTP `PUT` or `PATCH` is sent to `/api/catalog`.
  - `handleDeleteEntity` (lines 741–744): Filters item out of local React state (`setEntities`). No HTTP `DELETE` is sent to `/api/catalog`.
  - `handleRequestAction` (lines 746–751): Updates request status to `'Approved'` or `'Rejected'` only in local React state (`setRequests`). No HTTP `PUT` or `PATCH` is sent to `/api/request-access`.
- **Location:** `app/reports/page.tsx`:
  - `handleAccessRequestSubmit` (lines 292–304): Clears modal input fields and displays a toast. Does not call `/api/request-access` or record the submission.

---

## 5. Columns Written by Code That Are Missing From the Deployed Schema

Comparing all write operations in `lib/db.ts`, `app/api/catalog/route.ts`, `app/api/profile/route.ts`, and `app/api/request-access/route.ts` against `scripts/schema-rbac.sql`:

1. **`public.catalog`**:
   - `scripts/schema-rbac.sql` defines: `id`, `type`, `title`, `category`, `organization`, `trl`, `budget`, `description`, `tags`, `status`, `metadata`, `created_at`, `updated_at`.
   - **Code Writes:** All properties written by `lib/db.ts` (`createCatalogItem`, `updateCatalogItem`) map directly into these defined columns (any extra dynamic properties are nested within `metadata`).
   - **Status:** **Clean** — No missing column writes identified.

2. **`public.requests`**:
   - `scripts/schema-rbac.sql` defines: `id`, `user_id`, `catalog_id`, `name`, `email`, `organization`, `proposal_brief`, `status`, `created_at`.
   - **Code Writes:** `createRequest` writes `id`, `user_id`, `catalog_id`, `name`, `email`, `organization`, `proposal_brief`, `status`, `created_at`.
   - **Status:** **Clean** — No missing column writes identified.

3. **`public.profiles`**:
   - `scripts/schema-rbac.sql` defines: `id`, `email`, `full_name`, `organization`, `role`, `approval_status`, `metadata`, `created_at`, `updated_at`.
   - **Code Writes:** `upsertProfile` writes `id`, `email`, `full_name`, `organization`, `role`, `approval_status`, `metadata`, `updated_at`.
   - **Status:** **Clean** — Code matches the database schema.

---

## 6. Verification & Build Results

Per the audit directives, no files were modified or fixed in this step. The verification commands were run directly against the current codebase:

### 6.1 TypeScript Check (`npx tsc --noEmit`)
- **Command:** `npx tsc --noEmit`
- **Exit Code:** `0`
- **Result:** **PASSED**
- **Output:**
  ```text
  (No type errors emitted; TypeScript compilation passed cleanly)
  ```

### 6.2 Production Build (`npm run build` / `npx next build`)
- **Command:** `npm run build`
- **Exit Code:** `1` (Failed)
- **Result:** **FAILED**
- **Exact Output Log:**
  ```text
  > ai-studio-applet@0.1.0 build
  > next build

  ⚠ You are using a non-standard "NODE_ENV" value in your environment. This creates inconsistencies in the project and is strongly advised against. Read more: https://nextjs.org/docs/messages/non-standard-node-env
     ▲ Next.js 15.5.25
     Creating an optimized production build ...
   ✓ Compiled successfully in 14.2s
     Skipping linting
     Checking validity of types ...
     Collecting page data ...
     Generating static pages (0/19) ...
  Error: <Html> should not be imported outside of pages/_document.
  Read more: https://nextjs.org/docs/messages/no-document-import-in-page
      at x (.next/server/chunks/611.js:6:1351)
  Error occurred prerendering page "/500". Read more: https://nextjs.org/docs/messages/prerender-error
  Error: <Html> should not be imported outside of pages/_document.
  Read more: https://nextjs.org/docs/messages/no-document-import-in-page
      at x (.next/server/chunks/611.js:6:1351)
  Export encountered an error on /_error: /500, exiting the build.
  ⨯ Next.js build worker exited with code: 1 and signal: null
  ```
- **Root Cause Analysis of Build Failure:** Next.js 15 App Router triggers an automatic fallback to internal pages `/_error` for `/404` and `/500` static generation when custom root error boundaries conflict with Next's internal document renderer. (Per user instructions, this is strictly recorded without applying any fixes yet).
