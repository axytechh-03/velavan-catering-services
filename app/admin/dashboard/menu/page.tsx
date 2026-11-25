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
            Menu CMS & Dish Catalog
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#6b756e' }}>
            Manage {categories.length} categories and {items.length} authentic South Indian banquet dishes in English & தமிழ்.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchMenu}
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
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'transform 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
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
              boxShadow: '0 4px 14px rgba(196, 163, 101, 0.35)',
              transition: 'transform 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Plus size={16} />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Category Tabs Container (Warm Surface with 3D Depth) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e3dcce',
          borderRadius: '14px',
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 4px 18px -2px rgba(21, 61, 45, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Filter by Category ({categories.length} Categories)
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
                color: '#9e7f41',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'underline',
              }}
            >
              <Edit2 size={12} />
              <span>Edit Category Details</span>
            </button>
          )}
        </div>

        {/* 3D Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setActiveCategoryId('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              border: activeCategoryId === 'all' ? '1.5px solid #153d2d' : '1px solid #e3dcce',
              background: activeCategoryId === 'all' ? '#153d2d' : '#faf8f1',
              color: activeCategoryId === 'all' ? '#faf8f1' : '#153d2d',
              fontSize: '0.82rem',
              fontWeight: activeCategoryId === 'all' ? 700 : 500,
              cursor: 'pointer',
              boxShadow: activeCategoryId === 'all' ? '0 4px 12px rgba(21, 61, 45, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)',
              transition: 'all 0.15s ease',
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
                  padding: '8px 15px',
                  borderRadius: '24px',
                  border: active ? '1.5px solid #153d2d' : '1px solid #e3dcce',
                  background: active ? '#153d2d' : '#faf8f1',
                  color: active ? '#faf8f1' : '#153d2d',
                  fontSize: '0.82rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: active ? '0 4px 12px rgba(21, 61, 45, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  if (!active) {
                    e.currentTarget.style.borderColor = '#c4a365'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!active) {
                    e.currentTarget.style.borderColor = '#e3dcce'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                <span>{cat.nameEn}</span>
                <span
                  style={{
                    background: active ? 'rgba(255, 255, 255, 0.2)' : '#e3dcce',
                    color: active ? '#ffffff' : '#153d2d',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search & Modifiers Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9e7f41',
              }}
            />
            <input
              type="text"
              placeholder="Search dishes by English or Tamil name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                background: '#ffffff',
                border: '1px solid #d1c7b7',
                borderRadius: '8px',
                color: '#1f2f25',
                fontSize: '0.86rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#153d2d', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={filterSignatureOnly}
              onChange={(e) => setFilterSignatureOnly(e.target.checked)}
              style={{ accentColor: '#153d2d' }}
            />
            <span>Signature Dishes Only</span>
          </label>
        </div>
      </div>

      {/* Dishes List Table Container (White Surface with 3D Depth) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e3dcce',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -2px rgba(21, 61, 45, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#faf8f1', borderBottom: '2px solid #e3dcce', color: '#153d2d' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: '220px' }}>
                  Dish Name (English / தமிழ்)
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: '180px', width: '180px' }}>
                  Category
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: '160px' }}>
                  Tags & Badges
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Description
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', width: '110px' }}>
                  Status
                </th>
                <th style={{ padding: '14px 18px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', width: '140px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9e7f41' }}>
                    Loading menu catalog...
                  </td>
                </tr>
              ) : filteredDishes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#6b756e' }}>
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
                        borderBottom: '1px solid #f3efe5',
                        opacity: dish.active === false ? 0.6 : 1,
                        transition: 'background 0.12s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = '#faf8f1')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 700, color: '#153d2d', fontSize: '0.92rem' }}>
                          {dish.nameEn}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#9e7f41',
                            marginTop: '2px',
                            fontWeight: 600,
                          }}
                        >
                          {dish.nameTa}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: '0.76rem',
                            color: '#153d2d',
                            background: '#f4f8f5',
                            border: '1px solid #c8d8ce',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            lineHeight: 1.25,
                            letterSpacing: '0.01em',
                          }}
                        >
                          {cat?.nameEn || dish.categoryId}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                          {dish.badge && (
                            <span
                              style={{
                                background: 'rgba(196, 163, 101, 0.15)',
                                border: '1px solid #c4a365',
                                color: '#854d0e',
                                fontSize: '0.68rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                letterSpacing: '0.02em',
                              }}
                            >
                              ★ {dish.badge}
                            </span>
                          )}
                          {dish.isSignature && (
                            <span
                              style={{
                                background: '#fefce8',
                                border: '1px solid #fde047',
                                color: '#854d0e',
                                fontSize: '0.68rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Sparkles size={10} style={{ color: '#ca8a04' }} />
                              Signature
                            </span>
                          )}
                          {dish.isLive && (
                            <span
                              style={{
                                background: '#fff7ed',
                                border: '1px solid #fed7aa',
                                color: '#c2410c',
                                fontSize: '0.68rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Flame size={10} style={{ color: '#ea580c' }} />
                              Live Counter
                            </span>
                          )}
                          {!dish.badge && !dish.isSignature && !dish.isLive && (
                            <span style={{ color: '#9ca3af', fontSize: '0.74rem' }}>—</span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', maxWidth: '280px', verticalAlign: 'middle' }}>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: '#6b756e',
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

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <button
                          onClick={() => handleToggleActive(dish)}
                          title="Click to toggle visibility on website"
                          style={{
                            background: dish.active !== false ? '#ecfdf5' : '#fef2f2',
                            border: `1px solid ${dish.active !== false ? '#a7f3d0' : '#fecaca'}`,
                            color: dish.active !== false ? '#065f46' : '#991b1b',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {dish.active !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                          <span>{dish.active !== false ? 'Active' : 'Hidden'}</span>
                        </button>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right', verticalAlign: 'middle' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(dish)}
                            title="Edit Dish"
                            style={{
                              padding: '6px 11px',
                              background: '#ffffff',
                              border: '1px solid #c4a365',
                              borderRadius: '6px',
                              color: '#153d2d',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                              transition: 'transform 0.12s ease',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                          >
                            <Edit2 size={13} style={{ color: '#9e7f41' }} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setItemToDelete(dish)}
                            title="Delete Dish"
                            style={{
                              padding: '6px 8px',
                              background: '#ffffff',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              color: '#b91c1c',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'transform 0.12s ease',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
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
      {/* MODAL: ADD / EDIT DISH (WARM PALETTE & WHITE SURFACE) */}
      {/* ========================================================================= */}
      {(isNewItemModal || editingItem) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 23, 17, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
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
              background: '#ffffff',
              border: '1.5px solid #c4a365',
              borderRadius: '16px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
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
                borderBottom: '1px solid #f3efe5',
                background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
                color: '#faf8f1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, color: '#faf8f1', fontSize: '1.25rem', fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 700 }}>
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
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Target Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#ffffff',
                    border: '1px solid #d1c7b7',
                    borderRadius: '8px',
                    color: '#1f2f25',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontWeight: 600,
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameTa})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
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
                      background: '#ffffff',
                      border: '1px solid #d1c7b7',
                      borderRadius: '8px',
                      color: '#1f2f25',
                      fontSize: '0.86rem',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
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
                      background: '#ffffff',
                      border: '1px solid #d1c7b7',
                      borderRadius: '8px',
                      color: '#1f2f25',
                      fontSize: '0.86rem',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
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

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', paddingTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#153d2d', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    style={{ accentColor: '#153d2d' }}
                  />
                  <span>Pure Vegetarian</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#153d2d', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isSignature}
                    onChange={(e) => setFormData({ ...formData, isSignature: e.target.checked })}
                    style={{ accentColor: '#153d2d' }}
                  />
                  <span>Signature Dish</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#153d2d', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.isLive}
                    onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })}
                    style={{ accentColor: '#153d2d' }}
                  />
                  <span>Live Counter Dish</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#153d2d', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    style={{ accentColor: '#153d2d' }}
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
                  borderTop: '1px solid #f3efe5',
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
                    background: '#faf8f1',
                    border: '1px solid #d1c7b7',
                    borderRadius: '6px',
                    color: '#6b756e',
                    fontSize: '0.85rem',
                    fontWeight: 600,
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
                    boxShadow: '0 4px 12px rgba(196, 163, 101, 0.3)',
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
            background: 'rgba(7, 23, 17, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
          onClick={() => setEditingCategory(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              border: '1.5px solid #c4a365',
              borderRadius: '14px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
                padding: '18px 22px',
                color: '#faf8f1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, color: '#faf8f1', fontSize: '1.15rem', fontWeight: 700 }}>
                Edit Category: {editingCategory.nameEn}
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                style={{ background: 'none', border: 'none', color: '#faf8f1', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '6px' }}>
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
                  Category Badge
                </label>
                <input
                  type="text"
                  value={categoryFormData.badge}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, badge: e.target.value })}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  style={{
                    padding: '8px 16px',
                    background: '#faf8f1',
                    border: '1px solid #d1c7b7',
                    borderRadius: '6px',
                    color: '#6b756e',
                    fontSize: '0.85rem',
                    fontWeight: 600,
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
                    boxShadow: '0 4px 12px rgba(196, 163, 101, 0.3)',
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
            background: 'rgba(7, 23, 17, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
          onClick={() => setItemToDelete(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#ffffff',
              border: '1.5px solid #fecaca',
              borderRadius: '14px',
              padding: '28px 24px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ margin: '0 0 8px', color: '#153d2d', fontSize: '1.25rem', fontWeight: 700 }}>
              Confirm Dish Deletion
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: '#6b756e', lineHeight: 1.5 }}>
              Are you sure you want to permanently remove <strong style={{ color: '#153d2d' }}>{itemToDelete.nameEn}</strong> from the catalog?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setItemToDelete(null)}
                style={{
                  padding: '10px 18px',
                  background: '#faf8f1',
                  border: '1px solid #d1c7b7',
                  borderRadius: '6px',
                  color: '#6b756e',
                  fontSize: '0.86rem',
                  fontWeight: 600,
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
