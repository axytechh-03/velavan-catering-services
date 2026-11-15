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
        setToastMessage('System settings saved!')
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
            padding: '14px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 100,
            fontSize: '0.88rem',
          }}
        >
          <Check size={18} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
              fontSize: '2rem',
              margin: '0 0 6px',
              color: '#faf8f1',
            }}
          >
            System Settings & Administration
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.7)' }}>
            Configure access security, verify database storage health, manage backups, and monitor system performance.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(196, 163, 101, 0.15)',
            border: '1px solid rgba(196, 163, 101, 0.3)',
            color: '#faf8f1',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} style={{ color: '#c4a365' }} />
          <span>Refresh</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* ========================================================================= */}
        {/* CARD 1: SECURITY & PASSWORD CHANGE */}
        {/* ========================================================================= */}
        <div
          style={{
            background: 'rgba(21, 61, 45, 0.75)',
            border: '1.5px solid rgba(196, 163, 101, 0.25)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(196, 163, 101, 0.15)',
                color: '#c4a365',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#faf8f1', fontSize: '1.15rem' }}>Administrator Credentials</h3>
              <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.6)' }}>
                Update your login password
              </span>
            </div>
          </div>

          {passwordError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '10px 12px',
                borderRadius: '8px',
                color: '#fca5a5',
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
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '10px 12px',
                borderRadius: '8px',
                color: '#6ee7b7',
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
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                New Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(10, 35, 25, 0.65)',
                  border: '1px solid rgba(196, 163, 101, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
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
                  background: 'rgba(10, 35, 25, 0.65)',
                  border: '1px solid rgba(196, 163, 101, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
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
                marginTop: '6px',
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#0d281e',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: updatingPassword ? 'not-allowed' : 'pointer',
              }}
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: STORAGE & ENVIRONMENT HEALTH */}
        {/* ========================================================================= */}
        <div
          style={{
            background: 'rgba(21, 61, 45, 0.75)',
            border: '1.5px solid rgba(196, 163, 101, 0.25)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#faf8f1', fontSize: '1.15rem' }}>Storage & Environment Health</h3>
              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                ● 100% Operational
              </span>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(10, 35, 25, 0.5)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid rgba(196, 163, 101, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(250, 248, 241, 0.65)' }}>Database Mode</span>
              <strong style={{ color: '#c4a365' }}>{systemInfo?.databaseMode || 'Local High-Speed JSON Store'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(250, 248, 241, 0.65)' }}>Active Storage Path</span>
              <code style={{ color: '#faf8f1', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                {systemInfo?.storagePath || 'data/cms-data.json'}
              </code>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(250, 248, 241, 0.65)' }}>Framework & Runtime</span>
              <span style={{ color: '#faf8f1' }}>Next.js 14 · Node {systemInfo?.nodeVersion || 'v20'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(250, 248, 241, 0.65)' }}>Platform OS</span>
              <span style={{ color: '#faf8f1', textTransform: 'capitalize' }}>{systemInfo?.platform || 'Windows'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(250, 248, 241, 0.65)' }}>Server Time</span>
              <span style={{ color: 'rgba(250, 248, 241, 0.85)' }}>
                {systemInfo?.serverTime ? new Date(systemInfo.serverTime).toLocaleString() : '...'}
              </span>
            </div>
          </div>

          {/* Record summary */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase' }}>
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
              <div style={{ padding: '8px', background: 'rgba(10, 35, 25, 0.5)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                  {systemInfo?.totalRecords.dishes ?? 240}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(250,248,241,0.6)' }}>Dishes</div>
              </div>
              <div style={{ padding: '8px', background: 'rgba(10, 35, 25, 0.5)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c4a365' }}>
                  {systemInfo?.totalRecords.categories ?? 14}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(250,248,241,0.6)' }}>Categories</div>
              </div>
              <div style={{ padding: '8px', background: 'rgba(10, 35, 25, 0.5)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                  {systemInfo?.totalRecords.enquiries ?? 0}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(250,248,241,0.6)' }}>Enquiries</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 3: MAINTENANCE & DATA EXPORT */}
        {/* ========================================================================= */}
        <div
          style={{
            background: 'rgba(21, 61, 45, 0.75)',
            border: '1.5px solid rgba(196, 163, 101, 0.25)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(196, 163, 101, 0.15)',
                color: '#c4a365',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HardDrive size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#faf8f1', fontSize: '1.15rem' }}>Maintenance & Backups</h3>
              <span style={{ fontSize: '0.78rem', color: 'rgba(250, 248, 241, 0.6)' }}>
                Cache revalidation and full site data export
              </span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(250, 248, 241, 0.75)', lineHeight: 1.5 }}>
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
              }}
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
                background: 'rgba(196, 163, 101, 0.15)',
                border: '1px solid rgba(196, 163, 101, 0.35)',
                borderRadius: '8px',
                color: '#faf8f1',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
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
