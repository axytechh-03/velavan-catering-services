import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// 1. Load .env.local if not already populated in process.env
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=')
      const k = trimmed.substring(0, idx).trim()
      let v = trimmed.substring(idx + 1).trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      if (!process.env[k]) {
        process.env[k] = v
      }
    }
  }
}

// 2. Import server Supabase client and mappers using relative paths
import { getSupabaseServerClient, isSupabaseServerConfigured } from '../lib/supabase-server'
import {
  isUUID,
  toEnquiryDbRow,
  toMenuCategoryDbRow,
  toMenuItemDbRow,
  toServiceDbRow,
  toGalleryDbRow,
  toClientDbRow,
  toSiteContentDbRows,
  toSiteSettingsDbRow,
  toProposalDbRow,
  toActivityDbRow,
} from '../lib/cms-mappers'

/**
 * Deterministically generates an RFC 4122 v5 UUID from a namespace and legacy identifier.
 * Ensures identical UUIDs across multiple script runs for idempotent foreign keys.
 */
export function toDeterministicUuid(namespace: string, id: string): string {
  if (isUUID(id)) return id
  const hash = crypto.createHash('sha1').update(`${namespace}:${id}`).digest('hex')
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '5' + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20),
    hash.substring(20, 32),
  ].join('-')
}

interface MigrationOptions {
  dryRun: boolean
}

export interface EntityPlan {
  name: string
  tableName: string
  sourceCount: number
  currentDbCount: number
  plannedUpserts: number
  sampleIdMapping?: { sourceId: string; targetId: string; legacyId?: string }[]
  status: 'READY' | 'SKIPPED' | 'WARNING'
  notes?: string
}

export async function runMigration(options: MigrationOptions = { dryRun: true }) {
  const { dryRun } = options
  const modeHeader = dryRun ? 'DRY-RUN MODE (Simulating operations, 0 database writes)' : 'LIVE EXECUTION MODE (Writing to Supabase)'

  console.log('='.repeat(78))
  console.log(`VELAVAN CATERING SERVICES — CMS TO SUPABASE MIGRATION`)
  console.log(`Timestamp: ${new Date().toISOString()}`)
  console.log(`Mode:      ${modeHeader}`)
  console.log('='.repeat(78))

  // 1. Validate Supabase Configuration
  if (!isSupabaseServerConfigured) {
    throw new Error('Supabase server client is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  }
  const supabase = getSupabaseServerClient()

  // 2. Load and Validate Source JSON
  const jsonFilePath = path.resolve(process.cwd(), 'data', 'cms-data.json')
  if (!fs.existsSync(jsonFilePath)) {
    throw new Error(`Source JSON file not found at: ${jsonFilePath}`)
  }

  const rawJson = fs.readFileSync(jsonFilePath, 'utf8')
  const cms = JSON.parse(rawJson)
  console.log(`\n[SOURCE] Loaded ${jsonFilePath} (${(rawJson.length / 1024).toFixed(1)} KB)`)

  // 3. Query Existing Row Counts in Supabase
  const tables = [
    'menu_categories',
    'menu_items',
    'services',
    'gallery_items',
    'clients',
    'site_content',
    'admin_settings',
    'enquiries',
    'proposals',
    'activities',
  ]

  const dbCounts: Record<string, number> = {}
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    if (error) {
      throw new Error(`Failed to query table "${table}": [${error.code}] ${error.message}`)
    }
    dbCounts[table] = count || 0
  }

  const plans: EntityPlan[] = []

  // ==========================================================================
  // 1. Menu Categories
  // ==========================================================================
  const rawCategories = cms.menuCategories || []
  const catRows = rawCategories.map((c: any) => toMenuCategoryDbRow(c))
  plans.push({
    name: 'Menu Categories',
    tableName: 'menu_categories',
    sourceCount: rawCategories.length,
    currentDbCount: dbCounts['menu_categories'],
    plannedUpserts: catRows.length,
    sampleIdMapping: catRows.slice(0, 3).map((r: any) => ({ sourceId: r.id, targetId: r.id })),
    status: 'READY',
  })

  // ==========================================================================
  // 2. Menu Items
  // ==========================================================================
  const rawItems = cms.menuItems || []
  const itemRows = rawItems.map((item: any) => toMenuItemDbRow(item))
  plans.push({
    name: 'Menu Items',
    tableName: 'menu_items',
    sourceCount: rawItems.length,
    currentDbCount: dbCounts['menu_items'],
    plannedUpserts: itemRows.length,
    sampleIdMapping: itemRows.slice(0, 3).map((r: any) => ({ sourceId: r.id, targetId: r.id })),
    status: 'READY',
  })

  // ==========================================================================
  // 3. Services
  // ==========================================================================
  const rawServices = cms.services || []
  const serviceRows = rawServices.map((s: any) => toServiceDbRow(s))
  plans.push({
    name: 'Services',
    tableName: 'services',
    sourceCount: rawServices.length,
    currentDbCount: dbCounts['services'],
    plannedUpserts: serviceRows.length,
    sampleIdMapping: serviceRows.slice(0, 3).map((r: any) => ({ sourceId: r.id, targetId: r.id })),
    status: 'READY',
  })

  // ==========================================================================
  // 4. Gallery Items
  // ==========================================================================
  const rawGallery = cms.gallery || []
  const galleryRows = rawGallery.map((g: any) => toGalleryDbRow(g))
  plans.push({
    name: 'Gallery Items',
    tableName: 'gallery_items',
    sourceCount: rawGallery.length,
    currentDbCount: dbCounts['gallery_items'],
    plannedUpserts: galleryRows.length,
    sampleIdMapping: galleryRows.slice(0, 3).map((r: any) => ({ sourceId: r.id, targetId: r.id })),
    status: 'READY',
  })

  // ==========================================================================
  // 5. Clients
  // ==========================================================================
  const rawClients = cms.clients || []
  const clientRows = rawClients.map((cl: any) => toClientDbRow(cl))
  plans.push({
    name: 'Clients',
    tableName: 'clients',
    sourceCount: rawClients.length,
    currentDbCount: dbCounts['clients'],
    plannedUpserts: clientRows.length,
    sampleIdMapping: clientRows.slice(0, 3).map((r: any) => ({ sourceId: r.id, targetId: r.id })),
    status: 'READY',
  })

  // ==========================================================================
  // 6. Site Content
  // ==========================================================================
  const rawContent = cms.content || {}
  const contentRows = toSiteContentDbRows(rawContent)
  plans.push({
    name: 'Site Content Sections',
    tableName: 'site_content',
    sourceCount: Object.keys(rawContent).length,
    currentDbCount: dbCounts['site_content'],
    plannedUpserts: contentRows.length,
    sampleIdMapping: contentRows.map((r: any) => ({ sourceId: r.key, targetId: r.key })),
    status: 'READY',
  })

  // ==========================================================================
  // 7. Admin Settings
  // ==========================================================================
  const rawSettings = cms.settings || {}
  const settingsRow = toSiteSettingsDbRow(rawSettings, 'general')
  plans.push({
    name: 'Admin Settings',
    tableName: 'admin_settings',
    sourceCount: 1,
    currentDbCount: dbCounts['admin_settings'],
    plannedUpserts: 1,
    sampleIdMapping: [{ sourceId: 'settings', targetId: 'general' }],
    status: 'READY',
  })

  // ==========================================================================
  // 8. Enquiries (with deterministic UUID mapping)
  // ==========================================================================
  const rawEnquiries = cms.enquiries || []
  const enquiryUuidMap = new Map<string, string>() // originalId -> uuid
  const enquiryRows = rawEnquiries.map((enq: any) => {
    const originalId = String(enq.id)
    const targetUuid = isUUID(originalId) ? originalId : toDeterministicUuid('enquiry', originalId)
    enquiryUuidMap.set(originalId, targetUuid)

    const row = toEnquiryDbRow({ ...enq, id: originalId })
    row.id = targetUuid
    row.legacy_id = originalId
    return row
  })

  plans.push({
    name: 'Enquiries',
    tableName: 'enquiries',
    sourceCount: rawEnquiries.length,
    currentDbCount: dbCounts['enquiries'],
    plannedUpserts: enquiryRows.length,
    sampleIdMapping: enquiryRows.map((r: any) => ({ sourceId: r.legacy_id, targetId: r.id, legacyId: r.legacy_id })),
    status: 'READY',
  })

  // ==========================================================================
  // 9. Proposals / Quotations (with FK resolution & snapshot preservation)
  // ==========================================================================
  const rawQuotations = cms.quotations || []
  const proposalRows = rawQuotations.map((q: any) => {
    const originalId = String(q.id)
    const targetUuid = isUUID(originalId) ? originalId : toDeterministicUuid('proposal', originalId)

    // Resolve Foreign Key to Enquiry
    let resolvedEnquiryUuid: string | undefined = undefined
    if (q.enquiryId) {
      resolvedEnquiryUuid = enquiryUuidMap.get(String(q.enquiryId))
      if (!resolvedEnquiryUuid && isUUID(q.enquiryId)) {
        resolvedEnquiryUuid = q.enquiryId
      }
    }

    const row = toProposalDbRow(q, resolvedEnquiryUuid)
    row.id = targetUuid
    row.legacy_id = originalId
    return row
  })

  // Verify foreign key integrity
  const missingFkCount = proposalRows.filter((p: any) => p.legacy_enquiry_id && !p.enquiry_id).length

  plans.push({
    name: 'Proposals / Quotations',
    tableName: 'proposals',
    sourceCount: rawQuotations.length,
    currentDbCount: dbCounts['proposals'],
    plannedUpserts: proposalRows.length,
    sampleIdMapping: proposalRows.map((r: any) => ({
      sourceId: r.legacy_id,
      targetId: r.id,
      legacyId: `FK enquiry: ${r.legacy_enquiry_id || 'none'} -> ${r.enquiry_id || 'none'}`,
    })),
    status: missingFkCount > 0 ? 'WARNING' : 'READY',
    notes: missingFkCount > 0 ? `${missingFkCount} proposals have unresolvable enquiry IDs` : 'All enquiry FK references resolved',
  })

  // ==========================================================================
  // 10. Activities
  // ==========================================================================
  const rawActivities = cms.activities || []
  const activityRows = rawActivities.map((act: any) => {
    const originalId = String(act.id)
    const targetUuid = isUUID(originalId) ? originalId : toDeterministicUuid('activity', originalId)
    const row = toActivityDbRow(act)
    row.id = targetUuid
    row.legacy_id = originalId
    return row
  })

  plans.push({
    name: 'Activities',
    tableName: 'activities',
    sourceCount: rawActivities.length,
    currentDbCount: dbCounts['activities'],
    plannedUpserts: activityRows.length,
    sampleIdMapping: activityRows.slice(0, 3).map((r: any) => ({ sourceId: r.legacy_id, targetId: r.id })),
    status: 'READY',
  })

  // ==========================================================================
  // Print Detailed Migration Plan
  // ==========================================================================
  console.log('\n' + '-'.repeat(78))
  console.log(`ENTITY MIGRATION SUMMARY TABLE`)
  console.log('-'.repeat(78))
  console.log(
    `${'Entity'.padEnd(25)} | ${'Table'.padEnd(16)} | ${'Source'.padEnd(7)} | ${'Current DB'.padEnd(10)} | ${'Planned'.padEnd(8)} | ${'Status'}`
  )
  console.log('-'.repeat(78))

  let totalSource = 0
  let totalPlanned = 0

  for (const p of plans) {
    totalSource += p.sourceCount
    totalPlanned += p.plannedUpserts
    const srcStr = String(p.sourceCount).padStart(7)
    const curStr = String(p.currentDbCount).padStart(10)
    const planStr = String(p.plannedUpserts).padStart(8)
    console.log(
      `${p.name.padEnd(25)} | ${p.tableName.padEnd(16)} | ${srcStr} | ${curStr} | ${planStr} | ${p.status}`
    )
  }
  console.log('-'.repeat(78))
  console.log(
    `${'TOTAL'.padEnd(25)} | ${''.padEnd(16)} | ${String(totalSource).padStart(7)} | ${''.padEnd(10)} | ${String(totalPlanned).padStart(8)} |`
  )
  console.log('-'.repeat(78))

  // ID and Foreign Key Mapping Samples
  console.log('\n[ID & FOREIGN KEY VALIDATION SAMPLES]')
  for (const p of plans) {
    if (p.sampleIdMapping && p.sampleIdMapping.length > 0) {
      console.log(`\n• ${p.name} (${p.tableName}):`)
      const listToShow = p.tableName === 'proposals' ? p.sampleIdMapping : p.sampleIdMapping.slice(0, 3)
      for (const m of listToShow) {
        if (m.legacyId && m.legacyId.startsWith('FK')) {
          console.log(`    ${m.sourceId} -> UUID ${m.targetId} (${m.legacyId})`)
        } else if (m.legacyId) {
          console.log(`    legacy "${m.legacyId}" -> UUID ${m.targetId}`)
        } else {
          console.log(`    ID "${m.sourceId}" (preserved exactly)`)
        }
      }
    }
  }

  // Tamil Unicode Content Sample Verification
  console.log('\n[TAMIL UNICODE INTEGRITY VERIFICATION]')
  console.log(`• Category 1: ${catRows[0].name_en} -> ${catRows[0].name_ta}`)
  console.log(`• Dish 1:     ${itemRows[0].name_en} -> ${itemRows[0].name_ta}`)
  console.log(`• Service 1:  ${serviceRows[0].title_en} -> ${serviceRows[0].title_ta}`)

  // ==========================================================================
  // Execution Phase (Strictly guarded by !dryRun)
  // ==========================================================================
  if (!dryRun) {
    console.log('\n' + '='.repeat(78))
    console.log('BEGINNING DATABASE UPSERTS...')
    console.log('='.repeat(78))

    // 1. Menu Categories
    console.log(`[1/10] Upserting ${catRows.length} menu_categories...`)
    const { error: err1 } = await supabase.from('menu_categories').upsert(catRows, { onConflict: 'id', ignoreDuplicates: true })
    if (err1) throw new Error(`menu_categories upsert failed: ${err1.message}`)

    // 2. Menu Items
    console.log(`[2/10] Upserting ${itemRows.length} menu_items...`)
    const { error: err2 } = await supabase.from('menu_items').upsert(itemRows, { onConflict: 'id', ignoreDuplicates: true })
    if (err2) throw new Error(`menu_items upsert failed: ${err2.message}`)

    // 3. Services
    console.log(`[3/10] Upserting ${serviceRows.length} services...`)
    const { error: err3 } = await supabase.from('services').upsert(serviceRows, { onConflict: 'id', ignoreDuplicates: true })
    if (err3) throw new Error(`services upsert failed: ${err3.message}`)

    // 4. Gallery Items
    console.log(`[4/10] Upserting ${galleryRows.length} gallery_items...`)
    const { error: err4 } = await supabase.from('gallery_items').upsert(galleryRows, { onConflict: 'id', ignoreDuplicates: true })
    if (err4) throw new Error(`gallery_items upsert failed: ${err4.message}`)

    // 5. Clients
    console.log(`[5/10] Upserting ${clientRows.length} clients...`)
    const { error: err5 } = await supabase.from('clients').upsert(clientRows, { onConflict: 'id', ignoreDuplicates: true })
    if (err5) throw new Error(`clients upsert failed: ${err5.message}`)

    // 6. Site Content
    console.log(`[6/10] Upserting ${contentRows.length} site_content sections...`)
    const { error: err6 } = await supabase.from('site_content').upsert(contentRows, { onConflict: 'key', ignoreDuplicates: true })
    if (err6) throw new Error(`site_content upsert failed: ${err6.message}`)

    // 7. Admin Settings
    console.log(`[7/10] Upserting admin_settings...`)
    const { error: err7 } = await supabase.from('admin_settings').upsert([settingsRow], { onConflict: 'key', ignoreDuplicates: true })
    if (err7) throw new Error(`admin_settings upsert failed: ${err7.message}`)

    // 8. Enquiries
    console.log(`[8/10] Upserting ${enquiryRows.length} enquiries...`)
    const { error: err8 } = await supabase.from('enquiries').upsert(enquiryRows, { onConflict: 'id', ignoreDuplicates: true })
    if (err8) throw new Error(`enquiries upsert failed: ${err8.message}`)

    // 9. Proposals
    console.log(`[9/10] Upserting ${proposalRows.length} proposals...`)
    const { error: err9 } = await supabase.from('proposals').upsert(proposalRows, { onConflict: 'id', ignoreDuplicates: true })
    if (err9) throw new Error(`proposals upsert failed: ${err9.message}`)

    // 10. Activities
    console.log(`[10/10] Upserting ${activityRows.length} activities...`)
    const { error: err10 } = await supabase.from('activities').upsert(activityRows, { onConflict: 'id', ignoreDuplicates: true })
    if (err10) throw new Error(`activities upsert failed: ${err10.message}`)

    console.log('\n✓ ALL 10 ENTITIES UPSERTED SUCCESSFULLY!')
  } else {
    console.log('\n' + '='.repeat(78))
    console.log('DRY-RUN COMPLETE — 0 DATABASE INSERTS OR UPDATES WERE EXECUTED.')
    console.log('Pass --execute flag to perform actual database migration upon approval.')
    console.log('='.repeat(78))
  }

  return { plans, totalSource, totalPlanned }
}

// CLI Execution Entry Point
if (require.main === module || process.argv[1]?.includes('migrate-cms-to-supabase')) {
  const isExecute = process.argv.includes('--execute')
  runMigration({ dryRun: !isExecute })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ MIGRATION ERROR:', err.message)
      process.exit(1)
    })
}
