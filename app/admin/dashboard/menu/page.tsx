'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Flame,
  ChefHat,
  Filter,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  UtensilsCrossed,
} from 'lucide-react'
import { MenuItemRecord, MenuCategoryRecord } from '@/lib/cms-store'

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<MenuCategoryRecord[]>([])
  const [items, setItems] = useState<MenuItemRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVegOnly, setFilterVegOnly] = useState(false)
  const [filterSignatureOnly, setFilterSignatureOnly] = useState(false)

  // Modals
  const [editingItem, setEditingItem] = useState<MenuItemRecord | null>(null)
  const [isNewItemModal, setIsNewItemModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MenuItemRecord | null>(null)
  const [editingCategory, setEditingCategory] = useState<MenuCategoryRecord | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Form State for Add / Edit Item
  const [formData, setFormData] = useState({
    id: '',
    categoryId: 'sweets',
    nameEn: '',
    nameTa: '',
    descEn: '',
    descTa: '',
    badge: '',
    isSignature: false,
    isLive: false,
    isVeg: true,
    active: true,
  })

  // Category form state
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    nameEn: '',
    nameTa: '',
    badge: '',
  })

  const fetchMenu = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/menu')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCategories(data.categories || [])
          setItems(data.items || [])
        }
      }
    } catch (e) {
      console.error('Error fetching menu:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(''), 3500)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      id: `dish-${Date.now()}`,
      categoryId: activeCategoryId !== 'all' ? activeCategoryId : categories[0]?.id || 'sweets',
      nameEn: '',
      nameTa: '',
      descEn: '',
      descTa: '',
      badge: '',
      isSignature: false,
      isLive: false,
      isVeg: true,
      active: true,
    })
    setIsNewItemModal(true)
  }

  // Open Edit Modal
  const openEditModal = (item: MenuItemRecord) => {
    setEditingItem(item)
    setFormData({
      id: item.id,
      categoryId: item.categoryId,
      nameEn: item.nameEn,
      nameTa: item.nameTa,
      descEn: item.descEn || '',
      descTa: item.descTa || '',
      badge: item.badge || '',
      isSignature: Boolean(item.isSignature),
      isLive: Boolean(item.isLive),
      isVeg: item.isVeg !== false,
      active: item.active !== false,
    })
  }

  // Submit Dish (Create or Update)
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/menu', {
        method: isNewItemModal ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.item) {
          if (isNewItemModal) {
            setItems((prev) => [data.item, ...prev])
            setToastMessage(`Dish "${formData.nameEn}" added to menu catalog!`)
          } else {
            setItems((prev) => prev.map((i) => (i.id === formData.id ? data.item : i)))
            setToastMessage(`Dish "${formData.nameEn}" updated successfully!`)
          }
          setIsNewItemModal(false)
          setEditingItem(null)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Dish
  const handleDeleteDish = async () => {
    if (!itemToDelete) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/menu?id=${itemToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id))
        setToastMessage(`Dish deleted permanently.`)
        setItemToDelete(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle Active Status
  const handleToggleActive = async (item: MenuItemRecord) => {
    const updated = { ...item, active: item.active === false ? true : false }
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)))
        setToastMessage(`Dish ${updated.active ? 'published' : 'hidden'} on public menu.`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Save Category Edit
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category',
          ...categoryFormData,
        }),
      })
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === categoryFormData.id ? { ...c, ...categoryFormData } : c))
        )
        setToastMessage(`Category "${categoryFormData.nameEn}" updated!`)
        setEditingCategory(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Filtered dishes
  const filteredDishes = items.filter((item) => {
    if (activeCategoryId !== 'all' && item.categoryId !== activeCategoryId) return false
    if (filterVegOnly && item.isVeg === false) return false
    if (filterSignatureOnly && !item.isSignature) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchEn = item.nameEn.toLowerCase().includes(q)
      const matchTa = item.nameTa.toLowerCase().includes(q)
      const matchDesc = item.descEn?.toLowerCase().includes(q) || item.descTa?.toLowerCase().includes(q)
      const matchBadge = item.badge?.toLowerCase().includes(q)
      if (!matchEn && !matchTa && !matchDesc && !matchBadge) return false
    }

    return true
  })

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
            Menu CMS & Dish Catalog
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(250, 248, 241, 0.7)' }}>
            Manage 14 categories and 240+ authentic South Indian wedding dishes in English & Tamil.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchMenu}
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

          <button
            onClick={openAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
              color: '#0d281e',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(196, 163, 101, 0.3)',
            }}
          >
            <Plus size={16} />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Category Tabs Scroll */}
      <div
        style={{
          background: 'rgba(21, 61, 45, 0.65)',
          border: '1px solid rgba(196, 163, 101, 0.25)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Select Category ({categories.length} Categories)
          </span>

          {activeCategoryId !== 'all' && (
            <button
              onClick={() => {
                const cat = categories.find((c) => c.id === activeCategoryId)
                if (cat) {
                  setEditingCategory(cat)
                  setCategoryFormData({
                    id: cat.id,
                    nameEn: cat.nameEn,
                    nameTa: cat.nameTa,
                    badge: cat.badge || '',
                  })
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#c4a365',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'underline',
              }}
            >
              <Edit2 size={12} />
              <span>Edit Current Category Details</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setActiveCategoryId('all')}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: activeCategoryId === 'all' ? '1.5px solid #c4a365' : '1px solid rgba(196, 163, 101, 0.2)',
              background: activeCategoryId === 'all' ? 'rgba(196, 163, 101, 0.25)' : 'rgba(0, 0, 0, 0.2)',
              color: activeCategoryId === 'all' ? '#ffffff' : 'rgba(250, 248, 241, 0.75)',
              fontSize: '0.82rem',
              fontWeight: activeCategoryId === 'all' ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            All Categories ({items.length})
          </button>

          {categories.map((cat) => {
            const active = activeCategoryId === cat.id
            const count = items.filter((i) => i.categoryId === cat.id).length

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: active ? '1.5px solid #c4a365' : '1px solid rgba(196, 163, 101, 0.2)',
                  background: active ? 'rgba(196, 163, 101, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                  color: active ? '#ffffff' : 'rgba(250, 248, 241, 0.75)',
                  fontSize: '0.82rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                <span>{cat.nameEn}</span>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search and Modifiers */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(196, 163, 101, 0.7)',
              }}
            />
            <input
              type="text"
              placeholder="Search dishes by English or Tamil name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                background: 'rgba(10, 35, 25, 0.65)',
                border: '1px solid rgba(196, 163, 101, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.86rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#e5ded1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterSignatureOnly}
              onChange={(e) => setFilterSignatureOnly(e.target.checked)}
            />
            <span>Signature Dishes Only</span>
          </label>
        </div>
      </div>

      {/* Dishes List Table */}
      <div
        style={{
          background: 'rgba(21, 61, 45, 0.75)',
          border: '1px solid rgba(196, 163, 101, 0.25)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'rgba(10, 30, 20, 0.6)', borderBottom: '1.5px solid rgba(196, 163, 101, 0.25)', color: '#c4a365' }}>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Dish Name (English / தமிழ்)</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Tags & Badges</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Description</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#c4a365' }}>
                    Loading menu catalog...
                  </td>
                </tr>
              ) : filteredDishes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'rgba(250, 248, 241, 0.6)' }}>
                    No dishes found matching your query.
                  </td>
                </tr>
              ) : (
                filteredDishes.map((dish) => {
                  const cat = categories.find((c) => c.id === dish.categoryId)

                  return (
                    <tr
                      key={dish.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        opacity: dish.active === false ? 0.6 : 1,
                        transition: 'background 0.15s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#faf8f1', fontSize: '0.92rem' }}>
                          {dish.nameEn}
                        </div>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            color: '#c4a365',
                            marginTop: '2px',
                            fontFamily: 'var(--font-tamil, "Noto Sans Tamil", sans-serif)',
                          }}
                        >
                          {dish.nameTa}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            color: 'rgba(250, 248, 241, 0.85)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {cat?.nameEn || dish.categoryId}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {dish.badge && (
                            <span
                              style={{
                                background: 'rgba(196, 163, 101, 0.2)',
                                border: '1px solid rgba(196, 163, 101, 0.4)',
                                color: '#f5d796',
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              {dish.badge}
                            </span>
                          )}
                          {dish.isSignature && (
                            <span
                              style={{
                                background: 'rgba(234, 179, 8, 0.2)',
                                color: '#fde047',
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <Sparkles size={10} />
                              Signature
                            </span>
                          )}
                          {dish.isLive && (
                            <span
                              style={{
                                background: 'rgba(249, 115, 22, 0.2)',
                                color: '#fdba74',
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <Flame size={10} />
                              Live Counter
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', maxWidth: '280px' }}>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'rgba(250, 248, 241, 0.65)',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={dish.descEn}
                        >
                          {dish.descEn || dish.descTa || '—'}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleToggleActive(dish)}
                          title="Click to toggle visibility on website"
                          style={{
                            background: dish.active !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            border: `1px solid ${dish.active !== false ? '#10b981' : '#ef4444'}`,
                            color: dish.active !== false ? '#6ee7b7' : '#fca5a5',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {dish.active !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                          <span>{dish.active !== false ? 'Active' : 'Hidden'}</span>
                        </button>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(dish)}
                            title="Edit Dish"
                            style={{
                              padding: '6px 10px',
                              background: 'rgba(196, 163, 101, 0.15)',
                              border: '1px solid rgba(196, 163, 101, 0.3)',
                              borderRadius: '6px',
                              color: '#c4a365',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.78rem',
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setItemToDelete(dish)}
                            title="Delete Dish"
                            style={{
                              padding: '6px 8px',
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '6px',
                              color: '#fca5a5',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DISH */}
      {/* ========================================================================= */}
      {(isNewItemModal || editingItem) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 80,
          }}
          onClick={() => {
            setIsNewItemModal(false)
            setEditingItem(null)
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
              background: '#0d281e',
              border: '1.5px solid rgba(196, 163, 101, 0.4)',
              borderRadius: '16px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(196, 163, 101, 0.25)',
                background: 'rgba(21, 61, 45, 0.8)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, color: '#faf8f1', fontSize: '1.25rem' }}>
                {isNewItemModal ? 'Add New Dish to Catalog' : `Edit Dish: ${editingItem?.nameEn}`}
              </h3>
              <button
                onClick={() => {
                  setIsNewItemModal(false)
                  setEditingItem(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(250, 248, 241, 0.7)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDish} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Target Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(10, 35, 25, 0.65)',
                    border: '1px solid rgba(196, 163, 101, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameTa})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Dish Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Ghee Badam Halwa"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
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
                    Dish Name (தமிழ்) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="உதா. பாதாம் அல்வா"
                    value={formData.nameTa}
                    onChange={(e) => setFormData({ ...formData, nameTa: e.target.value })}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Description (English)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of flavours or ingredients..."
                    value={formData.descEn}
                    onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(10, 35, 25, 0.65)',
                      border: '1px solid rgba(196, 163, 101, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Description (தமிழ்)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="சுருக்கமான விளக்கம்..."
                    value={formData.descTa}
                    onChange={(e) => setFormData({ ...formData, descTa: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(10, 35, 25, 0.65)',
                      border: '1px solid rgba(196, 163, 101, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Badge Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Sweet, Signature, Live Tawa, Chef Art"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
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

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', paddingTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                  />
                  <span>Pure Vegetarian</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isSignature}
                    onChange={(e) => setFormData({ ...formData, isSignature: e.target.checked })}
                  />
                  <span>Signature Dish</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isLive}
                    onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })}
                  />
                  <span>Live Counter Dish</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Published on Website</span>
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(196, 163, 101, 0.2)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsNewItemModal(false)
                    setEditingItem(null)
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#faf8f1',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 20px',
                    background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#0d281e',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Saving...' : isNewItemModal ? 'Add Dish to Catalog' : 'Save Dish Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT CATEGORY */}
      {/* ========================================================================= */}
      {editingCategory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 80,
          }}
          onClick={() => setEditingCategory(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#0d281e',
              border: '1.5px solid rgba(196, 163, 101, 0.4)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', color: '#faf8f1', fontSize: '1.25rem' }}>
              Edit Category: {editingCategory.nameEn}
            </h3>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c4a365', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Category Name (English)
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.nameEn}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, nameEn: e.target.value })}
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
                  Category Name (தமிழ்)
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.nameTa}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, nameTa: e.target.value })}
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
                  Category Badge
                </label>
                <input
                  type="text"
                  value={categoryFormData.badge}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, badge: e.target.value })}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#faf8f1',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 18px',
                    background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#0d281e',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {itemToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 90,
          }}
          onClick={() => setItemToDelete(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#0d281e',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '14px',
              padding: '28px 24px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ margin: '0 0 8px', color: '#faf8f1', fontSize: '1.25rem' }}>
              Confirm Dish Deletion
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: 'rgba(250, 248, 241, 0.7)', lineHeight: 1.5 }}>
              Are you sure you want to permanently remove <strong style={{ color: '#ffffff' }}>{itemToDelete.nameEn}</strong> from the catalog?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setItemToDelete(null)}
                style={{
                  padding: '10px 18px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#faf8f1',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDish}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Deleting...' : 'Delete Dish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
