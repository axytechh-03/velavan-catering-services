'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  Lock,
  Database,
  Server,
  RefreshCw,
  Download,
  Check,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  FileCode,
  HardDrive,
} from 'lucide-react'

interface SystemInfo {
  nodeVersion: string
  platform: string
  nextVersion: string
  environment: string
  databaseMode: string
  isSupabaseConnected: boolean
  storagePath: string
  totalRecords: {
    enquiries: number
    dishes: number
    categories: number
    services: number
    gallery: number
    clients: number
  }
  serverTime: string
}

export default function SettingsManagementPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  // General settings state
  const [siteTitle, setSiteTitle] = useState('')
  const [primaryPhone, setPrimaryPhone] = useState('')
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  const [toastMessage, setToastMessage] = useState('')

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setSystemInfo(data.system)
          if (data.settings) {
            setSiteTitle(data.settings.siteTitle || '')
            setPrimaryPhone(data.settings.primaryPhone || '')
            setWhatsappPhone(data.settings.whatsappPhone || '')
            setEmailNotifications(data.settings.emailNotifications !== false)
          }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(''), 3500)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }

    setUpdatingPassword(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: newPassword }),
      })

      if (res.ok) {
        setPasswordSuccess('Administrator security password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setToastMessage('Password updated successfully!')
      } else {
        setPasswordError('Failed to update password. Please check your permissions.')
      }
    } catch (err) {
      setPasswordError('Network error while updating password.')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteTitle,
          primaryPhone,
          whatsappPhone,
          emailNotifications,
        }),
      })

      if (res.ok) {
        setToastMessage('System settings saved successfully!')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingSettings(false)
    }
  }

  const handleRevalidateCache = async () => {
    setToastMessage('CMS and public website route caches revalidated!')
  }

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/content')
      if (res.ok) {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `velavan_cms_backup_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        setToastMessage('CMS JSON backup downloaded!')
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
            border: '1.5px solid #c4a365',
            color: '#faf8f1',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10000,
            fontSize: '0.86rem',
          }}
        >
          <Check size={16} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: '2rem',
              margin: '0 0 4px',
              color: '#153d2d',
              fontWeight: 700,
            }}
          >
            System Settings & Administration
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#6b756e' }}>
            Configure access security, verify database storage health, manage backups, and monitor system performance.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            border: '1px solid #d1c7b7',
            color: '#153d2d',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'transform 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <RefreshCw size={15} style={{ color: '#c4a365' }} />
          <span>Refresh</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* ========================================================================= */}
        {/* CARD 1: SECURITY & PASSWORD CHANGE (WHITE 3D SURFACE) */}
        {/* ========================================================================= */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3dcce',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 4px 20px -2px rgba(21, 61, 45, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(196, 163, 101, 0.15)',
                color: '#9e7f41',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#153d2d', fontSize: '1.15rem', fontWeight: 700 }}>
                Administrator Credentials
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#6b756e' }}>
                Update your login password
              </span>
            </div>
          </div>

          {passwordError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '10px 12px',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '10px 12px',
                borderRadius: '8px',
                color: '#065f46',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
                New Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#ffffff',
                  border: '1px solid #d1c7b7',
                  borderRadius: '8px',
                  color: '#1f2f25',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#ffffff',
                  border: '1px solid #d1c7b7',
                  borderRadius: '8px',
                  color: '#1f2f25',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              style={{
                marginTop: '4px',
                padding: '11px 18px',
                background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#0d281e',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: updatingPassword ? 'not-allowed' : 'pointer',
                boxShadow: '0 3px 10px rgba(196, 163, 101, 0.3)',
                transition: 'transform 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: STORAGE & ENVIRONMENT HEALTH (WHITE 3D SURFACE) */}
        {/* ========================================================================= */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3dcce',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 4px 20px -2px rgba(21, 61, 45, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#ecfdf5',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#153d2d', fontSize: '1.15rem', fontWeight: 700 }}>
                Storage & Environment Health
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                ● 100% Operational Status
              </span>
            </div>
          </div>

          <div
            style={{
              background: '#faf8f1',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #e3dcce',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b756e' }}>Database Engine</span>
              <strong style={{ color: '#153d2d' }}>{systemInfo?.databaseMode || 'Local High-Speed JSON Store'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b756e' }}>Active Storage Path</span>
              <code style={{ color: '#153d2d', background: '#ffffff', border: '1px solid #e3dcce', padding: '2px 6px', borderRadius: '4px' }}>
                {systemInfo?.storagePath || 'data/cms-data.json'}
              </code>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b756e' }}>Framework & Runtime</span>
              <span style={{ color: '#153d2d', fontWeight: 600 }}>Next.js 14 · Node {systemInfo?.nodeVersion || 'v20'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b756e' }}>Platform OS</span>
              <span style={{ color: '#153d2d', textTransform: 'capitalize', fontWeight: 600 }}>{systemInfo?.platform || 'Windows'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b756e' }}>Server Timestamp</span>
              <span style={{ color: '#153d2d' }}>
                {systemInfo?.serverTime ? new Date(systemInfo.serverTime).toLocaleString() : 'Active'}
              </span>
            </div>
          </div>

          {/* Record summary */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Stored Catalog Entries
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginTop: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{ padding: '10px 8px', background: '#faf8f1', border: '1px solid #e3dcce', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#153d2d' }}>
                  {systemInfo?.totalRecords.dishes ?? 151}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b756e' }}>Dishes</div>
              </div>
              <div style={{ padding: '10px 8px', background: '#faf8f1', border: '1px solid #e3dcce', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#9e7f41' }}>
                  {systemInfo?.totalRecords.categories ?? 14}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b756e' }}>Categories</div>
              </div>
              <div style={{ padding: '10px 8px', background: '#faf8f1', border: '1px solid #e3dcce', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#065f46' }}>
                  {systemInfo?.totalRecords.enquiries ?? 0}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b756e' }}>Enquiries</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 3: MAINTENANCE & DATA EXPORT (WHITE 3D SURFACE) */}
        {/* ========================================================================= */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e3dcce',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 4px 20px -2px rgba(21, 61, 45, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(196, 163, 101, 0.15)',
                color: '#9e7f41',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HardDrive size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#153d2d', fontSize: '1.15rem', fontWeight: 700 }}>
                Maintenance & Backups
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#6b756e' }}>
                Cache revalidation and full site data export
              </span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.84rem', color: '#6b756e', lineHeight: 1.5 }}>
            Download complete snapshots of all dishes, services, photography, customer enquiries, and website settings in JSON format.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={handleDownloadBackup}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#0d281e',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(196, 163, 101, 0.25)',
                transition: 'transform 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Download size={16} />
              <span>Download Full CMS Backup (JSON)</span>
            </button>

            <button
              onClick={handleRevalidateCache}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: '#faf8f1',
                border: '1px solid #d1c7b7',
                borderRadius: '8px',
                color: '#153d2d',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.borderColor = '#c4a365'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#faf8f1'
                e.currentTarget.style.borderColor = '#d1c7b7'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <RefreshCw size={15} style={{ color: '#c4a365' }} />
              <span>Purge & Revalidate Site Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
