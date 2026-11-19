import {
  EnquiryRecord,
  MenuCategoryRecord,
  MenuItemRecord,
  ServiceRecord,
  GalleryRecord,
  ClientRecord,
  SiteContentRecord,
  SiteSettingsRecord,
  QuotationRecord,
  ProposalRecord,
  ActivityRecord,
  QuotationStatus,
  EnquiryStatus,
  EnquiryPriority,
} from '@/lib/cms-store'

/**
 * UUID v4 / RFC 4122 format validator
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUUID(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') return false
  return UUID_REGEX.test(value.trim())
}

/**
 * Sanitizes an ISO date or returns a current fallback
 */
export function toIsoString(dateVal?: string | Date | null): string {
  if (!dateVal) return new Date().toISOString()
  if (dateVal instanceof Date) return dateVal.toISOString()
  try {
    const d = new Date(dateVal)
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

// ============================================================================
// 1. ENQUIRIES MAPPERS
// ============================================================================

export function toEnquiryRecord(row: any): EnquiryRecord {
  if (!row) throw new Error('Cannot map empty row to EnquiryRecord')

  // Use legacy_id if present (e.g. "enq-1"), otherwise fall back to row.id
  const effectiveId = row.legacy_id || row.id || `enq-${Date.now()}`

  return {
    id: effectiveId,
    name: row.name || '',
    phone: row.phone || '',
    email: row.email || undefined,
    event_type: row.event_type || 'Wedding',
    other_event_type: row.other_event_type || undefined,
    guest_count: Number(row.guest_count) || 100,
    event_date: row.event_date ? String(row.event_date).split('T')[0] : '',
    event_time: row.event_time || undefined,
    location: row.location || '',
    special_requests: row.special_requests || undefined,
    status: (row.status || 'new') as EnquiryStatus,
    priority: (row.priority || 'normal') as EnquiryPriority,
    follow_up_date: row.follow_up_date ? String(row.follow_up_date).split('T')[0] : undefined,
    follow_up_notes: row.follow_up_notes || undefined,
    admin_notes: row.admin_notes || undefined,
    created_at: toIsoString(row.created_at),
    updated_at: row.updated_at ? toIsoString(row.updated_at) : undefined,
  }
}

export function toEnquiryDbRow(record: Partial<EnquiryRecord>): Record<string, any> {
  const dbRow: Record<string, any> = {
    name: record.name,
    phone: record.phone,
    email: record.email || null,
    event_type: record.event_type,
    other_event_type: record.other_event_type || null,
    guest_count: record.guest_count !== undefined ? Number(record.guest_count) : 100,
    event_date: record.event_date || null,
    event_time: record.event_time || null,
    location: record.location,
    special_requests: record.special_requests || null,
    status: record.status || 'new',
    priority: record.priority || 'normal',
    follow_up_date: record.follow_up_date || null,
    follow_up_notes: record.follow_up_notes || null,
    admin_notes: record.admin_notes || null,
    updated_at: new Date().toISOString(),
  }

  if (record.id) {
    if (isUUID(record.id)) {
      dbRow.id = record.id
    } else {
      dbRow.legacy_id = record.id
    }
  }

  if (record.created_at) {
    dbRow.created_at = toIsoString(record.created_at)
  }

  return dbRow
}

// ============================================================================
// 2. MENU CATEGORIES MAPPERS
// ============================================================================

export function toMenuCategoryRecord(row: any): MenuCategoryRecord {
  if (!row) throw new Error('Cannot map empty row to MenuCategoryRecord')

  return {
    id: row.id,
    nameEn: row.name_en || '',
    nameTa: row.name_ta || '',
    iconName: row.icon_name || 'Utensils',
    badge: row.badge || undefined,
    active: row.active !== false,
    order: row.display_order !== undefined && row.display_order !== null ? Number(row.display_order) : 0,
  }
}

export function toMenuCategoryDbRow(record: Partial<MenuCategoryRecord>): Record<string, any> {
  const row: Record<string, any> = {
    id: record.id,
    name_en: record.nameEn,
    name_ta: record.nameTa,
    icon_name: record.iconName || 'Utensils',
    badge: record.badge || null,
    active: record.active !== false,
    display_order: record.order !== undefined && record.order !== null ? Number(record.order) : 0,
    updated_at: new Date().toISOString(),
  }

  return row
}

// ============================================================================
// 3. MENU ITEMS MAPPERS
// ============================================================================

export function toMenuItemRecord(
  row: any
): MenuItemRecord {
  if (!row) throw new Error('Cannot map empty row to MenuItemRecord')

  const categoryId = row.category_id || ''

  return {
    id: row.id,
    categoryId,
    nameEn: row.name_en || '',
    nameTa: row.name_ta || '',
    descEn: row.desc_en || undefined,
    descTa: row.desc_ta || undefined,
    badge: row.badge || undefined,
    isSignature: Boolean(row.is_signature),
    isLive: Boolean(row.is_live),
    isVeg: row.is_veg !== false,
    priceEstimate: row.price_estimate || undefined,
    active: row.active !== false,
    order: row.display_order !== undefined && row.display_order !== null ? Number(row.display_order) : 0,
  }
}

export function toMenuItemDbRow(record: Partial<MenuItemRecord>): Record<string, any> {
  const row: Record<string, any> = {
    id: record.id,
    category_id: record.categoryId || null,
    name_en: record.nameEn,
    name_ta: record.nameTa,
    desc_en: record.descEn || null,
    desc_ta: record.descTa || null,
    badge: record.badge || null,
    is_signature: Boolean(record.isSignature),
    is_live: Boolean(record.isLive),
    is_veg: record.isVeg !== false,
    price_estimate: record.priceEstimate || null,
    active: record.active !== false,
    display_order: record.order !== undefined && record.order !== null ? Number(record.order) : 0,
    updated_at: new Date().toISOString(),
  }

  return row
}

// ============================================================================
// 4. SERVICES MAPPERS
// ============================================================================

export function toServiceRecord(row: any): ServiceRecord {
  if (!row) throw new Error('Cannot map empty row to ServiceRecord')

  const dishesRaw = row.featured_dishes
  const featuredDishes =
    dishesRaw && typeof dishesRaw === 'object'
      ? {
          en: Array.isArray(dishesRaw.en) ? dishesRaw.en : [],
          ta: Array.isArray(dishesRaw.ta) ? dishesRaw.ta : [],
        }
      : { en: [], ta: [] }

  return {
    id: row.id,
    key: row.key || '',
    number: row.service_number || '',
    titleEn: row.title_en || '',
    titleTa: row.title_ta || '',
    tagEn: row.tag_en || '',
    tagTa: row.tag_ta || '',
    descEn: row.desc_en || '',
    descTa: row.desc_ta || '',
    capacity: row.capacity || undefined,
    leafStyle: row.leaf_style || undefined,
    featuredDishes,
    image: row.image || '',
    imagePosition: row.image_position || 'center center',
    active: row.active !== false,
    order: row.display_order !== undefined && row.display_order !== null ? Number(row.display_order) : 0,
  }
}

export function toServiceDbRow(record: Partial<ServiceRecord>): Record<string, any> {
  const row: Record<string, any> = {
    id: record.id,
    key: record.key,
    service_number: record.number,
    title_en: record.titleEn,
    title_ta: record.titleTa,
    tag_en: record.tagEn,
    tag_ta: record.tagTa,
    desc_en: record.descEn,
    desc_ta: record.descTa,
    capacity: record.capacity || null,
    leaf_style: record.leafStyle || null,
    featured_dishes: record.featuredDishes || { en: [], ta: [] },
    image: record.image,
    image_position: record.imagePosition || 'center center',
    active: record.active !== false,
    display_order: record.order !== undefined && record.order !== null ? Number(record.order) : 0,
    updated_at: new Date().toISOString(),
  }

  return row
}

// ============================================================================
// 5. GALLERY ITEMS MAPPERS
// ============================================================================

export function toGalleryRecord(row: any): GalleryRecord {
  if (!row) throw new Error('Cannot map empty row to GalleryRecord')

  return {
    id: row.id,
    titleEn: row.title_en || '',
    titleTa: row.title_ta || '',
    categoryEn: row.category_en || '',
    categoryTa: row.category_ta || '',
    url: row.url || '',
    captionEn: row.caption_en || '',
    captionTa: row.caption_ta || '',
    objectPosition: row.object_position || 'center center',
    active: row.active !== false,
    order: row.display_order !== undefined && row.display_order !== null ? Number(row.display_order) : 0,
  }
}

export function toGalleryDbRow(record: Partial<GalleryRecord>): Record<string, any> {
  const row: Record<string, any> = {
    id: record.id,
    title_en: record.titleEn,
    title_ta: record.titleTa,
    category_en: record.categoryEn,
    category_ta: record.categoryTa,
    url: record.url,
    caption_en: record.captionEn,
    caption_ta: record.captionTa,
    object_position: record.objectPosition || 'center center',
    active: record.active !== false,
    display_order: record.order !== undefined && record.order !== null ? Number(record.order) : 0,
    updated_at: new Date().toISOString(),
  }

  return row
}

// ============================================================================
// 6. CLIENTS MAPPERS
// ============================================================================

export function toClientRecord(row: any): ClientRecord {
  if (!row) throw new Error('Cannot map empty row to ClientRecord')

  return {
    id: row.id,
    name: row.name || '',
    category: row.category || '',
    active: row.active !== false,
    order: row.display_order !== undefined && row.display_order !== null ? Number(row.display_order) : 0,
  }
}

export function toClientDbRow(record: Partial<ClientRecord>): Record<string, any> {
  const row: Record<string, any> = {
    id: record.id,
    name: record.name,
    category: record.category,
    active: record.active !== false,
    display_order: record.order !== undefined && record.order !== null ? Number(record.order) : 0,
    updated_at: new Date().toISOString(),
  }

  return row
}

// ============================================================================
// 7. SITE CONTENT MAPPERS
// ============================================================================

const CONTENT_SECTIONS = ['hero', 'story', 'tribute', 'contact', 'registrations'] as const

export function toSiteContentRecord(rows: any[], fallback?: SiteContentRecord): SiteContentRecord {
  const base = fallback || {
    hero: {
      eyebrowEn: '',
      eyebrowTa: '',
      titleEn: '',
      titleTa: '',
      descEn: '',
      descTa: '',
      btnPlanEn: '',
      btnPlanTa: '',
      btnWorkEn: '',
      btnWorkTa: '',
      noteEn: '',
      noteTa: '',
      promiseStrip: '',
    },
    story: {
      eyebrowEn: '',
      eyebrowTa: '',
      titleEn: '',
      titleTa: '',
      p1En: '',
      p1Ta: '',
      p2En: '',
      p2Ta: '',
      captionEn: '',
      captionTa: '',
    },
    tribute: {
      eyebrowEn: '',
      eyebrowTa: '',
      name: '',
      taglineEn: '',
      taglineTa: '',
      descEn: '',
      descTa: '',
    },
    contact: {
      phonePrimary: '',
      phoneSecondary: '',
      whatsapp: '',
      email: '',
      addressEn: '',
      addressTa: '',
      workingHoursEn: '',
      workingHoursTa: '',
    },
    registrations: {
      msmeNumber: '',
      msmeEnterpriseType: '',
      msmeMinistry: '',
      msmeStatus: '',
      fssaiNumber: '',
      fssaiCategory: '',
      fssaiValidThrough: '',
      fssaiStatus: '',
    },
  }

  if (!Array.isArray(rows)) return base

  const merged = { ...base }
  for (const row of rows) {
    const key = row.key as keyof SiteContentRecord
    if (CONTENT_SECTIONS.includes(key as any) && row.data && typeof row.data === 'object') {
      (merged as any)[key] = {
        ...(base[key] || {}),
        ...row.data,
      }
    }
  }

  return merged
}

export function toSiteContentDbRows(
  content: Partial<SiteContentRecord>
): Array<{ key: string; section: string; data: any; updated_at: string }> {
  const rows: Array<{ key: string; section: string; data: any; updated_at: string }> = []
  const now = new Date().toISOString()

  for (const section of CONTENT_SECTIONS) {
    if (content[section]) {
      rows.push({
        key: section,
        section,
        data: content[section],
        updated_at: now,
      })
    }
  }

  return rows
}

// ============================================================================
// 8. ADMIN SETTINGS MAPPERS
// ============================================================================

export function toSiteSettingsRecord(row: any, fallback?: SiteSettingsRecord): SiteSettingsRecord {
  const base: SiteSettingsRecord = fallback || {
    siteTitle: 'Velavan Catering Services | Official Admin CMS',
    primaryPhone: '+91 90803 09584',
    whatsappPhone: '+91 90803 09584',
    emailNotifications: true,
    updatedAt: new Date().toISOString(),
  }

  if (!row) return base

  const value = row.value && typeof row.value === 'object' ? row.value : {}
  return {
    ...base,
    ...value,
    updatedAt: row.updated_at || value.updatedAt || base.updatedAt,
  }
}

export function toSiteSettingsDbRow(
  settings: Partial<SiteSettingsRecord>,
  key = 'general'
): { key: string; value: any; updated_at: string } {
  return {
    key,
    value: settings,
    updated_at: new Date().toISOString(),
  }
}

// ============================================================================
// 9. PROPOSALS / QUOTATIONS MAPPERS
// ============================================================================

export function toProposalRecord(row: any): ProposalRecord {
  if (!row) throw new Error('Cannot map empty row to ProposalRecord')

  // If a full snapshot is stored in jsonb, use it as baseline
  const snapshot = row.snapshot && typeof row.snapshot === 'object' ? row.snapshot : null

  const effectiveId = row.legacy_id || row.id || `pr-${Date.now()}`
  const effectiveEnquiryId = row.legacy_enquiry_id || row.enquiry_id || snapshot?.enquiryId

  const base: ProposalRecord = {
    id: effectiveId,
    quotationNumber: row.quotation_number || snapshot?.quotationNumber || 'VCS-2026-0000',
    quotationDate: row.quotation_date || snapshot?.quotationDate,
    validUntil: row.valid_until || snapshot?.validUntil,
    enquiryId: effectiveEnquiryId || undefined,
    enquiryUuid: row.enquiry_id || undefined,
    legacyEnquiryId: row.legacy_enquiry_id || undefined,
    customerName: row.customer_name || snapshot?.customerName || '',
    customerPhone: row.customer_phone || snapshot?.customerPhone || '',
    customerEmail: row.customer_email || snapshot?.customerEmail || undefined,
    eventType: row.event_type || snapshot?.eventType || '',
    eventDate: row.event_date ? String(row.event_date).split('T')[0] : snapshot?.eventDate || '',
    eventLocation: row.event_location || snapshot?.eventLocation || '',
    guestCount: Number(row.guest_count ?? snapshot?.guestCount ?? 100),
    mealType: snapshot?.mealType || undefined,
    specialRequirements: snapshot?.specialRequirements || undefined,
    sessions: Array.isArray(snapshot?.sessions) ? snapshot.sessions : [],
    items: Array.isArray(snapshot?.items) ? snapshot.items : [],
    customDishes: Array.isArray(snapshot?.customDishes) ? snapshot.customDishes : undefined,
    serviceInclusions: Array.isArray(snapshot?.serviceInclusions) ? snapshot.serviceInclusions : undefined,
    serviceNotes: snapshot?.serviceNotes || undefined,
    packageAmount: snapshot?.packageAmount !== undefined ? Number(snapshot.packageAmount) : undefined,
    advanceAmount: snapshot?.advanceAmount !== undefined ? Number(snapshot.advanceAmount) : undefined,
    balanceAmount: snapshot?.balanceAmount !== undefined ? Number(snapshot.balanceAmount) : undefined,
    paymentDueDate: snapshot?.paymentDueDate || undefined,
    paymentNotes: snapshot?.paymentNotes || undefined,
    subtotal: snapshot?.subtotal !== undefined ? Number(snapshot.subtotal) : undefined,
    additionalCharges: Array.isArray(snapshot?.additionalCharges) ? snapshot.additionalCharges : undefined,
    discountType: snapshot?.discountType || undefined,
    discountValue: snapshot?.discountValue !== undefined ? Number(snapshot.discountValue) : undefined,
    discountAmount: snapshot?.discountAmount !== undefined ? Number(snapshot.discountAmount) : undefined,
    taxEnabled: snapshot?.taxEnabled !== undefined ? Boolean(snapshot.taxEnabled) : undefined,
    taxPercent: snapshot?.taxPercent !== undefined ? Number(snapshot.taxPercent) : undefined,
    taxPercentage: snapshot?.taxPercentage !== undefined ? Number(snapshot.taxPercentage) : undefined,
    taxAmount: snapshot?.taxAmount !== undefined ? Number(snapshot.taxAmount) : undefined,
    grandTotal: Number(row.grand_total ?? snapshot?.grandTotal ?? 0),
    notes: snapshot?.notes || undefined,
    terms: snapshot?.terms || undefined,
    termsAndConditions: snapshot?.termsAndConditions || undefined,
    status: (row.status || snapshot?.status || 'draft') as QuotationStatus,
    created_at: toIsoString(row.created_at || snapshot?.created_at),
    updated_at: row.updated_at ? toIsoString(row.updated_at) : snapshot?.updated_at ? toIsoString(snapshot.updated_at) : undefined,
  }

  return base
}

export const toQuotationRecord = toProposalRecord

export function toProposalDbRow(
  record: Partial<ProposalRecord>,
  resolvedEnquiryUuid?: string
): Record<string, any> {
  const dbRow: Record<string, any> = {
    quotation_number: record.quotationNumber,
    quotation_date: record.quotationDate || null,
    valid_until: record.validUntil || null,
    customer_name: record.customerName,
    customer_phone: record.customerPhone,
    customer_email: record.customerEmail || null,
    event_type: record.eventType,
    event_date: record.eventDate?.trim() || null,
    event_location: record.eventLocation,
    guest_count: record.guestCount !== undefined ? Number(record.guestCount) : 100,
    status: record.status || 'draft',
    grand_total: Number(record.grandTotal || 0),
    snapshot: record,
    updated_at: new Date().toISOString(),
  }

  // Handle proposal primary key
  if (record.id) {
    if (isUUID(record.id)) {
      dbRow.id = record.id
    } else {
      dbRow.legacy_id = record.id
    }
  }

  // Handle enquiry relationship
  if (resolvedEnquiryUuid && isUUID(resolvedEnquiryUuid)) {
    dbRow.enquiry_id = resolvedEnquiryUuid
    dbRow.legacy_enquiry_id = record.legacyEnquiryId || (record.enquiryId && !isUUID(record.enquiryId) ? record.enquiryId : null)
  } else if (record.enquiryUuid && isUUID(record.enquiryUuid)) {
    dbRow.enquiry_id = record.enquiryUuid
    dbRow.legacy_enquiry_id = record.legacyEnquiryId || (record.enquiryId && !isUUID(record.enquiryId) ? record.enquiryId : null)
  } else if (record.enquiryId) {
    if (isUUID(record.enquiryId)) {
      dbRow.enquiry_id = record.enquiryId
    } else {
      dbRow.legacy_enquiry_id = record.enquiryId
    }
  }

  if (record.created_at) {
    dbRow.created_at = toIsoString(record.created_at)
  }

  return dbRow
}

export const toQuotationDbRow = toProposalDbRow

// ============================================================================
// 10. ACTIVITIES MAPPERS
// ============================================================================

export function toActivityRecord(row: any): ActivityRecord {
  if (!row) throw new Error('Cannot map empty row to ActivityRecord')

  const effectiveId = row.legacy_id || row.id || `act-${Date.now()}`

  return {
    id: effectiveId,
    type: row.type || 'system',
    description: row.description || '',
    timestamp: toIsoString(row.occurred_at || row.created_at),
    metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata : undefined,
  }
}

export function toActivityDbRow(record: Partial<ActivityRecord>): Record<string, any> {
  const dbRow: Record<string, any> = {
    type: record.type || 'system',
    description: record.description || '',
    metadata: record.metadata || null,
    occurred_at: toIsoString(record.timestamp),
  }

  if (record.id) {
    if (isUUID(record.id)) {
      dbRow.id = record.id
    } else {
      dbRow.legacy_id = record.id
    }
  }

  return dbRow
}
