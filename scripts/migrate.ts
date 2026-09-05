/**
 * ============================================================================
 * NEXORA Database Migration Script: data.json -> Supabase (PostgreSQL)
 * ============================================================================
 * 
 * Usage:
 *   npx tsx scripts/migrate.ts
 * 
 * Prerequisites:
 *   Ensure the following environment variables are set in .env.local or shell:
 *     NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
 *     SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
 * 
 * Supabase Table Schema SQL (Run in Supabase SQL Editor if tables do not exist):
 * 
 *   CREATE TABLE IF NOT EXISTS catalog (
 *     id TEXT PRIMARY KEY,
 *     type TEXT NOT NULL,
 *     title TEXT NOT NULL,
 *     category TEXT,
 *     trl INTEGER,
 *     "trlStage" TEXT,
 *     organization TEXT,
 *     location TEXT,
 *     description TEXT,
 *     tags TEXT[],
 *     metrics JSONB,
 *     milestones TEXT[],
 *     budget TEXT,
 *     deadline TEXT,
 *     "verifiedBy" TEXT,
 *     status TEXT DEFAULT 'Active',
 *     "createdAt" TIMESTAMPTZ DEFAULT NOW()
 *   );
 * 
 *   CREATE TABLE IF NOT EXISTS requests (
 *     id TEXT PRIMARY KEY,
 *     name TEXT,
 *     email TEXT NOT NULL,
 *     organization TEXT,
 *     "proposalBrief" TEXT,
 *     purpose TEXT,
 *     "entityTitle" TEXT,
 *     "entityType" TEXT,
 *     "ndaStatus" TEXT,
 *     status TEXT DEFAULT 'Pending',
 *     "dateRequested" TEXT,
 *     "createdAt" TIMESTAMPTZ DEFAULT NOW()
 *   );
 * ============================================================================
 */

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_CATALOG_SEEDS, DEFAULT_REQUEST_SEEDS, CatalogItem, AccessRequest } from '../lib/db';

async function runMigration() {
  console.log('\n========================================================');
  console.log('  NEXORA PLATFORM: JSON -> SUPABASE MIGRATION ENGINE   ');
  console.log('========================================================\n');

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Supabase environment variables missing!');
    console.error('   Please provide:');
    console.error('     - NEXT_PUBLIC_SUPABASE_URL');
    console.error('     - SUPABASE_SERVICE_ROLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
    console.error('   Example:');
    console.error('     NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=ey... npx tsx scripts/migrate.ts\n');
    process.exit(1);
  }

  console.log(`📡 Connecting to Supabase at: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  const dataFilePath = path.join(process.cwd(), 'data.json');
  let catalogRecords: CatalogItem[] = [];
  let requestRecords: AccessRequest[] = [];

  try {
    const rawData = await fs.readFile(dataFilePath, 'utf8');
    const parsed = JSON.parse(rawData);
    catalogRecords = Array.isArray(parsed.catalog) && parsed.catalog.length > 0
      ? parsed.catalog
      : DEFAULT_CATALOG_SEEDS;
    requestRecords = Array.isArray(parsed.requests) && parsed.requests.length > 0
      ? parsed.requests
      : DEFAULT_REQUEST_SEEDS;
    console.log(`📄 Loaded local data.json (${catalogRecords.length} catalog items, ${requestRecords.length} requests).`);
  } catch (err: any) {
    console.warn(`⚠️ Could not read data.json (${err.message}). Using default high-fidelity seeds.`);
    catalogRecords = DEFAULT_CATALOG_SEEDS;
    requestRecords = DEFAULT_REQUEST_SEEDS;
  }

  // 1. Migrate Catalog Items
  console.log(`\n🚀 [1/2] Migrating Catalog records to Supabase 'catalog' table...`);
  let catalogSuccess = 0;
  for (const item of catalogRecords) {
    const { error } = await supabase
      .from('catalog')
      .upsert(item, { onConflict: 'id' });

    if (error) {
      console.error(`   ❌ Failed to migrate item '${item.id}' (${item.title}): ${error.message}`);
    } else {
      catalogSuccess++;
      console.log(`   ✅ [${item.type.toUpperCase()}] ${item.title} -> OK`);
    }
  }

  // 2. Migrate Access Requests
  console.log(`\n🚀 [2/2] Migrating Access Requests to Supabase 'requests' table...`);
  let requestsSuccess = 0;
  for (const req of requestRecords) {
    const { error } = await supabase
      .from('requests')
      .upsert(req, { onConflict: 'id' });

    if (error) {
      console.error(`   ❌ Failed to migrate request '${req.id}' (${req.email}): ${error.message}`);
    } else {
      requestsSuccess++;
      console.log(`   ✅ [REQUEST] ${req.email} (${req.organization || 'Individual'}) -> OK`);
    }
  }

  console.log('\n========================================================');
  console.log('  MIGRATION SUMMARY');
  console.log('========================================================');
  console.log(`  Catalog Items Processed: ${catalogSuccess} / ${catalogRecords.length}`);
  console.log(`  Requests Processed:      ${requestsSuccess} / ${requestRecords.length}`);
  console.log('========================================================');

  if (catalogSuccess === catalogRecords.length && requestsSuccess === requestRecords.length) {
    console.log('\n🎉 ALL RECORDS MIGRATED WITH ZERO DATA LOSS!');
    console.log('💡 To activate Supabase mode in the web application, add:');
    console.log('   NEXT_PUBLIC_USE_SUPABASE="true" to your environment variables.\n');
  } else {
    console.warn('\n⚠️ Some records failed to migrate. Ensure database tables and permissions are configured.\n');
  }
}

runMigration().catch((err) => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
