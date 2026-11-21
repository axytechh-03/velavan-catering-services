import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import path from 'path'
import { verifyAdminAuth, isValidAdminRequestOrigin } from '@/lib/admin-auth'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const BUCKET_NAME = 'velavan-media'
const ALLOWED_FOLDERS = ['gallery', 'services', 'branding'] as const
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB in bytes

interface MimeConfig {
  extension: string
  validateContent: (buffer: Buffer) => boolean
}

const MIME_CONFIGS: Record<string, MimeConfig> = {
  'image/jpeg': {
    extension: '.jpg',
    validateContent: (buf: Buffer) =>
      buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  'image/png': {
    extension: '.png',
    validateContent: (buf: Buffer) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
  },
  'image/webp': {
    extension: '.webp',
    validateContent: (buf: Buffer) =>
      buf.length >= 12 &&
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP',
  },
  'image/svg+xml': {
    extension: '.svg',
    validateContent: (buf: Buffer) => isSafeSvg(buf),
  },
}

/**
 * Strict SVG Security Validation.
 * Inspects SVG content for malicious script injections, inline event handlers,
 * XML External Entities (XXE), and embedded objects.
 */
function isSafeSvg(buffer: Buffer): boolean {
  try {
    const text = buffer.toString('utf8')
    // Must contain root svg tag
    if (!/<svg[\s\S]*?>[\s\S]*?<\/svg>/i.test(text)) {
      return false
    }

    // Disallow dangerous tags, event handlers, and entity declarations
    const dangerousPatterns = [
      /<script[\s\S]*?>/i,
      /on\w+\s*=/i, // onload, onerror, onclick, etc.
      /javascript\s*:/i,
      /data\s*:\s*text\/html/i,
      /<!ENTITY/i,
      /<!DOCTYPE/i,
      /<foreignObject[\s\S]*?>/i,
      /<iframe[\s\S]*?>/i,
      /<embed[\s\S]*?>/i,
      /<object[\s\S]*?>/i,
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(text)) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

/**
 * Generates an unguessable, collision-free, sanitized storage filename.
 * Format: <folder>_<timestamp>_<random-hex><extension>
 */
function generateSafeFilename(folder: AllowedFolder, extension: string): string {
  const timestamp = Date.now()
  const randomHex = crypto.randomBytes(6).toString('hex')
  return `${folder}_${timestamp}_${randomHex}${extension}`
}

/**
 * Validates the file buffer, MIME type, and binary magic numbers.
 */
function validateFile(
  buffer: Buffer,
  declaredMimeType: string,
  originalFilename: string
): { valid: true; contentType: string; extension: string } | { valid: false; error: string } {
  const normalizedMime = declaredMimeType.trim().toLowerCase()
  const config = MIME_CONFIGS[normalizedMime]

  if (!config) {
    return {
      valid: false,
      error: `Unsupported file type '${declaredMimeType}'. Allowed types: image/jpeg, image/png, image/webp, image/svg+xml.`,
    }
  }

  // Cross-check file extension if available
  const ext = path.extname(originalFilename || '').toLowerCase()
  const validExtensions =
    normalizedMime === 'image/jpeg'
      ? ['.jpg', '.jpeg']
      : [config.extension]

  if (ext && !validExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension '${ext}' does not match declared MIME type '${declaredMimeType}'.`,
    }
  }

  // Verify binary signatures / content safety
  if (!config.validateContent(buffer)) {
    if (normalizedMime === 'image/svg+xml') {
      return {
        valid: false,
        error: 'SVG validation failed. File contains unsafe scripts, active content, or invalid XML structure.',
      }
    }
    return {
      valid: false,
      error: `File content does not match the valid signature for '${declaredMimeType}'.`,
    }
  }

  return {
    valid: true,
    contentType: normalizedMime,
    extension: config.extension,
  }
}

/**
 * POST: Authenticated Image Upload Endpoint
 *
 * Accepts multipart/form-data:
 * - 'file': The image file binary (max 5 MB)
 * - 'folder': The destination folder ('gallery' | 'services' | 'branding')
 */
export async function POST(request: NextRequest) {
  // 1. Enforce origin validation
  if (!isValidAdminRequestOrigin(request)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Invalid request origin.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // 2. Enforce admin authentication
  if (!(await verifyAdminAuth())) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin session required.' },
      { status: 401 }
    )
  }

  // 2. Parse multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid form data payload. Expected multipart/form-data.' },
      { status: 400 }
    )
  }

  // 3. Validate target folder
  const folderRaw = String(formData.get('folder') || '').trim().toLowerCase()
  if (!ALLOWED_FOLDERS.includes(folderRaw as AllowedFolder)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid destination folder '${folderRaw}'. Allowed folders: ${ALLOWED_FOLDERS.join(', ')}.`,
      },
      { status: 400 }
    )
  }
  const folder = folderRaw as AllowedFolder

  // 4. Validate file existence
  const file = formData.get('file')
  if (!file || typeof file === 'string' || !(file instanceof Blob)) {
    return NextResponse.json(
      { success: false, error: 'No file provided. Please attach a valid image file.' },
      { status: 400 }
    )
  }

  // 5. Validate file size (max 5 MB, non-empty)
  if (file.size === 0) {
    return NextResponse.json(
      { success: false, error: 'Cannot upload empty (0 byte) file.' },
      { status: 400 }
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        success: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 5 MB.`,
      },
      { status: 400 }
    )
  }

  // 6. Read bytes and validate file type & content signatures
  let buffer: Buffer
  try {
    buffer = Buffer.from(await file.arrayBuffer())
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to read uploaded file buffer.' },
      { status: 400 }
    )
  }

  const originalFilename = (file as any).name || ''
  const validation = validateFile(buffer, file.type || '', originalFilename)
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
  }

  // 7. Generate safe unique filename and destination path
  const filename = generateSafeFilename(folder, validation.extension)
  const storagePath = `${folder}/${filename}`

  // 8. Upload to Supabase Storage using server-only service-role client
  try {
    const sb = getSupabaseServerClient()
    const { error: uploadError } = await sb.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: validation.contentType,
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload-api] Storage upload error:', uploadError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to upload image. Please check the file format and try again.' },
        { status: 500 }
      )
    }

    // 9. Retrieve permanent public URL
    const { data: urlData } = sb.storage.from(BUCKET_NAME).getPublicUrl(storagePath)

    return NextResponse.json({
      success: true,
      file: {
        path: storagePath,
        url: urlData.publicUrl,
        folder,
        filename,
        size: file.size,
        contentType: validation.contentType,
      },
    })
  } catch (err: any) {
    console.error('[upload-api] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing image upload.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Authenticated Image Deletion Endpoint
 *
 * Accepts either:
 * - Query parameter: ?path=<folder>/<filename>
 * - JSON body: { "path": "<folder>/<filename>" } (or full public URL)
 */
export async function DELETE(request: NextRequest) {
  // 1. Enforce origin validation
  if (!isValidAdminRequestOrigin(request)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Invalid request origin.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // 2. Enforce admin authentication
  if (!(await verifyAdminAuth())) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin session required.' },
      { status: 401 }
    )
  }

  // 2. Extract path from query parameter or JSON body
  let rawPath = ''
  const searchParamPath = request.nextUrl.searchParams.get('path')
  if (searchParamPath) {
    rawPath = searchParamPath.trim()
  } else {
    try {
      const body = await request.json()
      if (typeof body.path === 'string') {
        rawPath = body.path.trim()
      }
    } catch {
      // Body not JSON or empty
    }
  }

  if (!rawPath) {
    return NextResponse.json(
      { success: false, error: 'Storage path is required for deletion.' },
      { status: 400 }
    )
  }

  // If a full public URL was provided, extract the relative storage path
  let targetPath = rawPath
  if (targetPath.includes(`/${BUCKET_NAME}/`)) {
    targetPath = targetPath.split(`/${BUCKET_NAME}/`)[1]
  }

  // Normalize path and reject path traversal attempts
  targetPath = targetPath.replace(/\\/g, '/').replace(/^\/+/, '')

  if (targetPath.includes('..') || targetPath.includes('//')) {
    return NextResponse.json(
      { success: false, error: 'Invalid storage path: traversal characters not permitted.' },
      { status: 400 }
    )
  }

  // 3. Enforce folder restriction: must reside in approved folders
  const parts = targetPath.split('/')
  if (parts.length < 2) {
    return NextResponse.json(
      { success: false, error: 'Invalid path structure. Expected: <folder>/<filename>.' },
      { status: 400 }
    )
  }

  const folder = parts[0].toLowerCase()
  if (!ALLOWED_FOLDERS.includes(folder as AllowedFolder)) {
    return NextResponse.json(
      {
        success: false,
        error: `Deletion outside approved folders is prohibited. Allowed folders: ${ALLOWED_FOLDERS.join(', ')}.`,
      },
      { status: 403 }
    )
  }

  // 4. Protect placeholder markers and entire folders
  const filename = parts.slice(1).join('/')
  if (!filename || filename === '.folder-placeholder.svg') {
    return NextResponse.json(
      { success: false, error: 'Deletion of folder markers or root folders is prohibited.' },
      { status: 400 }
    )
  }

  // 5. Delete object from Supabase Storage
  try {
    const sb = getSupabaseServerClient()
    const { data: removeData, error: removeError } = await sb.storage
      .from(BUCKET_NAME)
      .remove([targetPath])

    if (removeError) {
      console.error('[delete-api] Storage delete error:', removeError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to delete image from storage. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `File '${targetPath}' successfully deleted from storage.`,
      deletedPath: targetPath,
    })
  } catch (err: any) {
    console.error('[delete-api] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error while deleting image from storage.' },
      { status: 500 }
    )
  }
}
