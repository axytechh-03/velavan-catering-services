'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  UploadCloud,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  X,
  FileCheck,
} from 'lucide-react'

export interface UploadedFileInfo {
  path: string
  url: string
  folder: string
  filename: string
  size?: number
  contentType?: string
}

interface MediaUploaderProps {
  folder: 'gallery' | 'services' | 'branding'
  currentUrl: string
  onChange: (url: string) => void
  onUploaded?: (info: UploadedFileInfo) => void
  label?: string
  required?: boolean
  helpText?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg']

export function isSupabaseStorageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  return url.includes('/storage/v1/object/public/velavan-media/') || url.includes('/velavan-media/')
}

export function getStoragePathFromUrl(url: string): string | null {
  if (!isSupabaseStorageUrl(url)) return null
  const parts = url.split('/velavan-media/')
  return parts.length > 1 ? parts[1].split('?')[0] : null
}

export async function safelyDeleteStorageImage(
  urlOrPath: string,
  isReferencedByOther: boolean = false
): Promise<boolean> {
  if (!urlOrPath || !isSupabaseStorageUrl(urlOrPath)) return false
  if (isReferencedByOther) {
    console.info('[MediaUploader] Image is referenced by another record, skipping deletion.')
    return false
  }

  const storagePath = getStoragePathFromUrl(urlOrPath)
  if (!storagePath) return false

  try {
    const res = await fetch(`/api/admin/upload?path=${encodeURIComponent(storagePath)}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    return res.ok && data.success
  } catch (err) {
    console.warn('[MediaUploader] Non-critical: Failed to delete storage object:', err)
    return false
  }
}

export default function MediaUploader({
  folder,
  currentUrl,
  onChange,
  onUploaded,
  label = 'Image',
  required = false,
  helpText = 'Upload JPEG, PNG, WebP or SVG up to 5 MB. Stored securely in Supabase Storage.',
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset image error when URL changes
  useEffect(() => {
    setImageError(false)
  }, [currentUrl])

  // Clear messages after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const validateClientFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 5 MB.`
    }
    if (file.size === 0) {
      return 'Selected file is empty (0 bytes).'
    }

    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
    const mime = (file.type || '').toLowerCase()

    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(mime)) {
      return `Unsupported file format. Please upload JPEG, PNG, WebP or SVG.`
    }

    return null
  }

  const handleUploadFile = async (file: File) => {
    setErrorMessage('')
    setSuccessMessage('')

    const validationError = validateClientFile(file)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('folder', folder)
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.success && data.file) {
        onChange(data.file.url)
        onUploaded?.(data.file)
        setSuccessMessage('Image uploaded to Supabase Storage!')
        setShowManualInput(false)
      } else {
        setErrorMessage(data.error || 'Failed to upload image to storage.')
      }
    } catch {
      setErrorMessage('Network error while uploading image. Please check your connection.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUploadFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUploadFile(file)
    }
  }

  const handleClear = () => {
    onChange('')
    setSuccessMessage('')
    setErrorMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isStorage = isSupabaseStorageUrl(currentUrl)
  const isLocal = currentUrl.startsWith('/images/') || currentUrl.startsWith('images/')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Header Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#c4a365',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label} {required && <span style={{ color: '#ff6b6b' }}>*</span>}
        </label>

        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          style={{
            background: 'none',
            border: 'none',
            color: '#c4a365',
            fontSize: '0.72rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: 0.85,
            padding: '2px 4px',
          }}
        >
          <LinkIcon size={12} />
          <span>{showManualInput ? 'Hide manual entry' : 'Enter URL manually'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        style={{
          background: 'rgba(10, 35, 25, 0.65)',
          border: `1px solid ${dragActive ? '#c4a365' : 'rgba(196, 163, 101, 0.3)'}`,
          borderRadius: '10px',
          padding: '14px',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onDragEnter={handleDrag}
      >
        {/* Active Image Preview Card */}
        {currentUrl ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: 'rgba(13, 40, 30, 0.85)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(196, 163, 101, 0.25)',
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  position: 'relative',
                  width: '68px',
                  height: '68px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: 'rgba(5, 20, 15, 0.8)',
                  flexShrink: 0,
                  border: '1px solid rgba(196, 163, 101, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {!imageError ? (
                  <Image
                    src={currentUrl}
                    alt="Preview"
                    fill
                    sizes="68px"
                    style={{ objectFit: 'cover' }}
                    onError={() => setImageError(true)}
                    unoptimized
                  />
                ) : (
                  <ImageIcon size={28} style={{ color: 'rgba(196, 163, 101, 0.4)' }} />
                )}
              </div>

              {/* Info & Source Badge */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: isStorage
                        ? 'rgba(16, 185, 129, 0.2)'
                        : isLocal
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(196, 163, 101, 0.2)',
                      color: isStorage ? '#6ee7b7' : isLocal ? '#93c5fd' : '#c4a365',
                      border: `1px solid ${
                        isStorage
                          ? 'rgba(16, 185, 129, 0.35)'
                          : isLocal
                          ? 'rgba(59, 130, 246, 0.35)'
                          : 'rgba(196, 163, 101, 0.35)'
                      }`,
                    }}
                  >
                    {isStorage ? 'Supabase Storage' : isLocal ? 'Local Static Asset' : 'External Image'}
                  </span>
                  {imageError && (
                    <span style={{ fontSize: '0.68rem', color: '#ff6b6b' }}>
                      Preview unavailable
                    </span>
                  )}
                </div>

                <div
                  title={currentUrl}
                  style={{
                    fontSize: '0.78rem',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentUrl.split('/').pop() || currentUrl}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '2px' }}>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.72rem',
                      color: '#c4a365',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <span>View full</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(196, 163, 101, 0.15)',
                    border: '1px solid rgba(196, 163, 101, 0.4)',
                    borderRadius: '6px',
                    color: '#faf8f1',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'background 0.2s',
                  }}
                >
                  {uploading ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <RefreshCw size={12} />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Replace'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={uploading}
                  title="Clear this image reference"
                  style={{
                    padding: '5px 8px',
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '6px',
                    color: '#f87171',
                    fontSize: '0.72rem',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Dropzone State */
          <div
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? '#c4a365' : 'rgba(196, 163, 101, 0.35)'}`,
              borderRadius: '8px',
              padding: '24px 16px',
              textAlign: 'center',
              background: dragActive ? 'rgba(196, 163, 101, 0.1)' : 'rgba(13, 40, 30, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onClick={() => {
              if (!uploading) fileInputRef.current?.click()
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(196, 163, 101, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c4a365',
              }}
            >
              {uploading ? (
                <RefreshCw size={22} className="animate-spin" />
              ) : (
                <UploadCloud size={22} />
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#faf8f1' }}>
                {uploading ? 'Uploading to Supabase Storage...' : 'Click to upload or drag & drop'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a3b899', marginTop: '3px' }}>
                PNG, JPG, WebP or SVG up to 5 MB
              </div>
            </div>

            <button
              type="button"
              disabled={uploading}
              style={{
                marginTop: '4px',
                padding: '6px 16px',
                background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                border: 'none',
                borderRadius: '6px',
                color: '#0d281e',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            >
              Browse Image
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Manual URL / Path Input Field (Toggleable) */}
        {showManualInput && (
          <div
            style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(196, 163, 101, 0.2)',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#a3b899',
                marginBottom: '4px',
              }}
            >
              Direct Path or Remote URL:
            </label>
            <input
              type="text"
              value={currentUrl}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`/images/${folder}/... or https://...`}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'rgba(5, 20, 15, 0.8)',
                border: '1px solid rgba(196, 163, 101, 0.3)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
              }}
            />
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMessage && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#a7f3d0',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Helper text */}
      {helpText && (
        <span style={{ fontSize: '0.72rem', color: '#8a9b88', fontStyle: 'italic' }}>
          {helpText}
        </span>
      )}
    </div>
  )
}
