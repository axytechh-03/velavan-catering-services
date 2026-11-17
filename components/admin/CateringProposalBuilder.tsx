'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import {
  X,
  Plus,
  Trash2,
  Printer,
  Save,
  CheckCircle2,
  Search,
  FileText,
  UtensilsCrossed,
  Eye,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  Check,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Copy,
  Layers,
} from 'lucide-react'
import {
  QuotationRecord,
  QuotationItem,
  QuotationStatus,
  EnquiryRecord,
  ProposalMealSession,
  ProposalCustomDish,
} from '@/lib/cms-store'

interface CateringProposalBuilderProps {
  enquiry?: EnquiryRecord | null
  initialQuotation?: QuotationRecord | null
  initialViewMode?: 'build' | 'preview'
  onClose: () => void
  onSaved?: (quotation: QuotationRecord) => void
}

interface MenuCategory {
  id: string
  nameEn?: string
  nameTa?: string
  name?: string
  description?: string
}

interface MenuItem {
  id: string
  categoryId: string
  nameEn: string
  nameTa: string
  descEn?: string
  isVeg?: boolean
  active?: boolean
}

// Meal types for catering sessions
const MEAL_TYPES = [
  'Breakfast',
  'Muhurtham Tiffin',
  'Lunch Feast',
  'Evening High Tea & Snacks',
  'Dinner Buffet',
  'Reception Banquet',
  'Special Pooja Satvik',
]

// Standard Service Inclusions
const STANDARD_SERVICE_INCLUSIONS = [
  {
    id: 'food_prep',
    title: 'Authentic Food Preparation',
    desc: 'Prepared on-site or in central kitchen by master traditional chefs with pure ingredients',
    defaultChecked: true,
  },
  {
    id: 'transport',
    title: 'Food Transportation',
    desc: 'Hot-pack insulated transport containers delivered safely & punctually to event venue',
    defaultChecked: true,
  },
  {
    id: 'buffet_setup',
    title: 'Buffet Table Arrangement',
    desc: 'Complete buffet setup with premium stainless steel chaffing dishes & heating pads',
    defaultChecked: true,
  },
  {
    id: 'serving_staff',
    title: 'Professional Serving Staff',
    desc: 'Uniformed, trained hospitality captains and servers for live serving & guest hospitality',
    defaultChecked: true,
  },
  {
    id: 'vessels_equip',
    title: 'Vessels & Serving Equipment',
    desc: 'Heavy-gauge stainless steel service vessels, serving ladles & insulated dispensers',
    defaultChecked: true,
  },
  {
    id: 'table_arrange',
    title: 'Table Decoration & Frills',
    desc: 'Elegant buffet table cloth, traditional frills, table runners & aesthetic counters',
    defaultChecked: true,
  },
  {
    id: 'banana_leaf',
    title: 'Traditional Banana Leaf Service',
    desc: 'Fresh clean green banana leaves arranged with traditional seated dining protocol',
    defaultChecked: true,
  },
  {
    id: 'water_dispenser',
    title: 'Drinking Water & Paper Cups',
    desc: 'Hygienic RO mineral water dispensers and disposable paper cups/glasses',
    defaultChecked: true,
  },
  {
    id: 'clearing_cleaning',
    title: 'Dining Area Clearing & Waste Disposal',
    desc: 'Prompt clearing of used leaves/plates and dining hall cleanliness management',
    defaultChecked: true,
  },
]

// Helper: Resolve dish category name accurately from quotation item or catalog
export function getDishCategoryName(
  dish: QuotationItem,
  categories: MenuCategory[],
  menuItems: MenuItem[]
): string {
  if (dish.categoryName && dish.categoryName.trim()) {
    return dish.categoryName.trim()
  }
  if (dish.dishId) {
    const foundItem = menuItems.find((m) => m.id === dish.dishId)
    if (foundItem) {
      const foundCat = categories.find((c) => c.id === foundItem.categoryId)
      if (foundCat?.nameEn || foundCat?.name) {
        return foundCat.nameEn || foundCat.name || 'Traditional Feast'
      }
    }
  }
  return 'Chef Specials'
}

export interface GroupedCategoryDishes {
  categoryName: string
  items: { dish: QuotationItem; originalIndex: number }[]
}

export function groupDishesByCategory(
  dishes: QuotationItem[],
  categories: MenuCategory[],
  menuItems: MenuItem[]
): GroupedCategoryDishes[] {
  const groupMap = new Map<string, { dish: QuotationItem; originalIndex: number }[]>()

  dishes.forEach((dish, idx) => {
    const catName = getDishCategoryName(dish, categories, menuItems)
    if (!groupMap.has(catName)) {
      groupMap.set(catName, [])
    }
    groupMap.get(catName)!.push({ dish, originalIndex: idx })
  })

  // Category order map for authentic South Indian feast progression
  const categoryOrderMap = new Map<string, number>()
  categories.forEach((cat, index) => {
    const name = cat.nameEn || cat.name || ''
    if (name) categoryOrderMap.set(name.toLowerCase(), index)
  })

  const groups: GroupedCategoryDishes[] = []
  Array.from(groupMap.entries()).forEach(([categoryName, items]) => {
    groups.push({ categoryName, items })
  })

  groups.sort((a, b) => {
    const orderA = categoryOrderMap.has(a.categoryName.toLowerCase())
      ? categoryOrderMap.get(a.categoryName.toLowerCase())!
      : 999
    const orderB = categoryOrderMap.has(b.categoryName.toLowerCase())
      ? categoryOrderMap.get(b.categoryName.toLowerCase())!
      : 999
    if (orderA !== orderB) return orderA - orderB
    return a.categoryName.localeCompare(b.categoryName)
  })

  return groups
}

export default function CateringProposalBuilder({
  enquiry,
  initialQuotation,
  initialViewMode,
  onClose,
  onSaved,
}: CateringProposalBuilderProps) {
  // Navigation between Builder and Live A4 Preview
  const [viewMode, setViewMode] = useState<'build' | 'preview'>(
    initialViewMode || 'build'
  )

  // Menu database state
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [menuSearchQuery, setMenuSearchQuery] = useState('')

  // Customer & Event details
  const [customerName, setCustomerName] = useState(
    initialQuotation?.customerName || enquiry?.name || ''
  )
  const [customerPhone, setCustomerPhone] = useState(
    initialQuotation?.customerPhone || enquiry?.phone || ''
  )
  const [customerEmail, setCustomerEmail] = useState(
    initialQuotation?.customerEmail || enquiry?.email || ''
  )
  const [eventType, setEventType] = useState(
    initialQuotation?.eventType || enquiry?.event_type || 'Wedding Feast'
  )
  const [eventDate, setEventDate] = useState(
    initialQuotation?.eventDate || enquiry?.event_date || ''
  )
  const [eventLocation, setEventLocation] = useState(
    initialQuotation?.eventLocation || enquiry?.location || ''
  )
  const [guestCount, setGuestCount] = useState<number>(
    initialQuotation?.guestCount || enquiry?.guest_count || 500
  )
  const [mealType, setMealType] = useState<string>(
    initialQuotation?.mealType || 'Grand South Indian Kalyana Virundhu'
  )
  const [specialRequirements, setSpecialRequirements] = useState<string>(
    initialQuotation?.specialRequirements || enquiry?.special_requests || ''
  )

  // Proposal metadata
  const defaultValidDays = 15
  const today = new Date().toISOString().split('T')[0]
  const validDate = new Date()
  validDate.setDate(validDate.getDate() + defaultValidDays)
  const defaultValidUntil = validDate.toISOString().split('T')[0]

  const [quotationNumber, setQuotationNumber] = useState(
    initialQuotation?.quotationNumber ||
      `VCS-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900)).padStart(4, '0')}`
  )
  const [quotationDate, setQuotationDate] = useState(
    initialQuotation?.quotationDate || today
  )
  const [validUntil, setValidUntil] = useState(
    initialQuotation?.validUntil || defaultValidUntil
  )
  const [status, setStatus] = useState<QuotationStatus>(
    initialQuotation?.status || 'draft'
  )

  // =========================================================================
  // MULTI-MEAL SESSIONS STATE (Dynamic Sessions Builder)
  // =========================================================================
  const getInitialSessions = (): ProposalMealSession[] => {
    if (initialQuotation?.sessions && initialQuotation.sessions.length > 0) {
      return initialQuotation.sessions
    }
    // If legacy quote with flat items list, seed as Session 1
    if (initialQuotation?.items && initialQuotation.items.length > 0) {
      return [
        {
          id: 'sess-1',
          name: 'Morning Muhurtham Tiffin',
          mealType: 'Muhurtham Tiffin',
          servingTime: '07:30 AM - 09:30 AM',
          guestCount: initialQuotation.guestCount || guestCount,
          notes: 'Hot breakfast service with filter coffee counter',
          dishes: initialQuotation.items,
        },
      ]
    }
    // Default 2-session wedding configuration
    return [
      {
        id: 'sess-1',
        name: 'Morning Muhurtham Tiffin',
        mealType: 'Muhurtham Tiffin',
        servingTime: '07:30 AM - 09:30 AM',
        guestCount: guestCount,
        notes: 'Live tiffin counter, piping hot ghee sweets, filter coffee',
        dishes: [],
      },
      {
        id: 'sess-2',
        name: 'Grand Kalyana Virundhu Lunch',
        mealType: 'Lunch Feast',
        servingTime: '12:30 PM - 03:00 PM',
        guestCount: guestCount,
        notes: 'Full banana leaf traditional multi-course feast with special payasam',
        dishes: [],
      },
    ]
  }

  const [sessions, setSessions] = useState<ProposalMealSession[]>(getInitialSessions)
  const [activeSessionId, setActiveSessionId] = useState<string>(
    () => sessions[0]?.id || 'sess-1'
  )

  // Custom off-menu dishes modal state
  const [showAddCustomModal, setShowAddCustomModal] = useState(false)
  const [customDishName, setCustomDishName] = useState('')
  const [customDishNameTa, setCustomDishNameTa] = useState('')
  const [customDishSessionId, setCustomDishSessionId] = useState('')
  const [customDishNotes, setCustomDishNotes] = useState('')
  const [customDishCategoryMode, setCustomDishCategoryMode] = useState<'existing' | 'custom'>('existing')
  const [customDishCategorySelected, setCustomDishCategorySelected] = useState<string>('Traditional Sweets')
  const [customDishCategoryCustom, setCustomDishCategoryCustom] = useState<string>('')

  // Expandable accordion categories in menu catalog browser
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    sweets: true,
    idliBreakfast: true,
  })

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }))
  }

  const handleExpandAllCategories = (expand: boolean) => {
    const next: Record<string, boolean> = {}
    categories.forEach((c) => {
      next[c.id] = expand
    })
    setExpandedCategories(next)
  }

  // Scroll container ref and scroll state for Left Menu Items catalog
  const catalogScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = catalogScrollRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    setCanScrollUp(scrollTop > 4)
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 6)
  }, [])

  const handleCatalogScrollUp = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    const el = catalogScrollRef.current
    if (!el) return
    const scrollDistance = Math.max(260, el.clientHeight * 0.75)
    el.scrollBy({ top: -scrollDistance, behavior: 'smooth' })
    setTimeout(updateScrollState, 150)
  }

  const handleCatalogScrollDown = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    const el = catalogScrollRef.current
    if (!el) return
    const scrollDistance = Math.max(260, el.clientHeight * 0.75)
    el.scrollBy({ top: scrollDistance, behavior: 'smooth' })
    setTimeout(updateScrollState, 150)
  }

  // Recalculate scroll availability whenever categories expand, collapse, filter, search, or items change
  useEffect(() => {
    const el = catalogScrollRef.current
    if (!el) return

    updateScrollState()
    const timer = setTimeout(updateScrollState, 100)

    let resizeObserver: ResizeObserver | null = null
    let mutationObserver: MutationObserver | null = null

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateScrollState()
      })
      resizeObserver.observe(el)
    }

    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        updateScrollState()
      })
      mutationObserver.observe(el, { childList: true, subtree: true, attributes: true })
    }

    return () => {
      clearTimeout(timer)
      if (resizeObserver) resizeObserver.disconnect()
      if (mutationObserver) mutationObserver.disconnect()
    }
  }, [expandedCategories, selectedCategory, menuSearchQuery, categories, menuItems, updateScrollState])

  // Service Inclusions Checklist
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>(
    initialQuotation?.serviceInclusions ||
      STANDARD_SERVICE_INCLUSIONS.filter((s) => s.defaultChecked).map((s) => s.title)
  )
  const [customServiceNotes, setCustomServiceNotes] = useState<string>(
    initialQuotation?.serviceNotes ||
      '25 Uniformed serving staff, fresh organic plantain leaves, live coffee bar.'
  )

  // OVERALL PACKAGE PRICING (CRITICAL: Single Manual Package Input, NOT Sum of dishes)
  const [packageAmount, setPackageAmount] = useState<number>(
    initialQuotation?.packageAmount ?? initialQuotation?.grandTotal ?? 250000
  )
  const [advanceAmount, setAdvanceAmount] = useState<number>(
    initialQuotation?.advanceAmount ?? 75000
  )
  const [paymentDueDate, setPaymentDueDate] = useState<string>(
    initialQuotation?.paymentDueDate || ''
  )
  const [paymentNotes, setPaymentNotes] = useState<string>(
    initialQuotation?.paymentNotes ||
      '30% booking advance to lock the auspicious date; 50% 3 days before event; remaining balance on event day.'
  )

  // Optional GST Tax (Default OFF)
  const [taxEnabled, setTaxEnabled] = useState<boolean>(
    initialQuotation?.taxEnabled || false
  )
  const [taxPercentage, setTaxPercentage] = useState<number>(
    initialQuotation?.taxPercentage || initialQuotation?.taxPercent || 5
  )

  // Terms and Notes
  const [terms, setTerms] = useState<string>(
    initialQuotation?.terms ||
      '• Advance booking amount is required to reserve the catering date slot.\n• Final confirmed guest count must be intimated at least 48 hours prior to the event.\n• Authentic South Indian ingredients, pure ghee, and fresh vegetables guaranteed.\n• Balance settlement must be cleared on the event day prior to banquet completion.'
  )
  const [notes, setNotes] = useState<string>(
    initialQuotation?.notes ||
      'Velavan Catering Services is committed to delivering a royal, authentic, and hygienic feast for your auspicious celebration.'
  )

  // Saving state
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Load Menu from API
  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch('/api/admin/menu')
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setCategories(data.categories || [])
            setMenuItems(data.items || [])
          }
        }
      } catch (err) {
        console.error('Error fetching menu items:', err)
      } finally {
        setLoadingMenu(false)
      }
    }
    loadMenu()
  }, [])

  // Auto-sync activeSessionId if sessions change
  useEffect(() => {
    if (!sessions.some((s) => s.id === activeSessionId) && sessions.length > 0) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  // Balance Calculation
  const balanceAmount = Math.max(0, packageAmount - advanceAmount)
  const calculatedTax = taxEnabled ? Math.round((packageAmount * taxPercentage) / 100) : 0
  const grandTotal = packageAmount + calculatedTax

  // Total dishes across all sessions
  const totalDishesCount = sessions.reduce((acc, s) => acc + (s.dishes?.length || 0), 0)

  // Active Session helper
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0]

  // =========================================================================
  // SESSION BUILDER ACTIONS
  // =========================================================================
  const handleAddSession = () => {
    const newId = `sess-${Date.now()}`
    const newSessionNumber = sessions.length + 1
    const newSession: ProposalMealSession = {
      id: newId,
      name: `Session ${newSessionNumber}: Dinner Feast`,
      mealType: 'Dinner Buffet',
      servingTime: '07:30 PM - 10:00 PM',
      guestCount: guestCount,
      notes: 'Evening dinner buffet with live dosa and sweet counter',
      dishes: [],
    }
    setSessions((prev) => [...prev, newSession])
    setActiveSessionId(newId)
  }

  const handleRemoveSession = (sessionId: string) => {
    if (sessions.length <= 1) {
      alert('A catering proposal must have at least one meal session.')
      return
    }
    const confirmed = confirm('Are you sure you want to remove this meal session and its dishes?')
    if (!confirmed) return
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  const handleUpdateSessionField = (sessionId: string, field: keyof ProposalMealSession, value: any) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, [field]: value } : s))
    )
  }

  const handleMoveSession = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= sessions.length) return
    const updated = [...sessions]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp
    setSessions(updated)
  }

  // Add Dish to Active Session (NO DISH PRICES)
  const handleAddDishToSession = (dish: MenuItem) => {
    if (!activeSessionId) return
    const cat = categories.find((c) => c.id === dish.categoryId)
    const categoryName = cat?.nameEn || cat?.name || 'Traditional Feast'

    const newItem: QuotationItem = {
      dishId: dish.id,
      categoryName,
      dishName: dish.nameEn,
      nameEn: dish.nameEn,
      dishNameTa: dish.nameTa,
      nameTa: dish.nameTa,
      quantity: 1,
      unitPrice: 0, // CRITICAL: NEVER DISPLAY DISH PRICE
      total: 0,
      amount: 0,
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, dishes: [...s.dishes, newItem] }
          : s
      )
    )
  }

  // Remove Dish from Session
  const handleRemoveDishFromSession = (sessionId: string, dishIndex: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, dishes: s.dishes.filter((_, idx) => idx !== dishIndex) }
          : s
      )
    )
  }

  // Move Dish Up or Down within session
  const handleMoveDish = (sessionId: string, dishIndex: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? dishIndex - 1 : dishIndex + 1
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        if (targetIdx < 0 || targetIdx >= s.dishes.length) return s
        const updatedDishes = [...s.dishes]
        const temp = updatedDishes[dishIndex]
        updatedDishes[dishIndex] = updatedDishes[targetIdx]
        updatedDishes[targetIdx] = temp
        return { ...s, dishes: updatedDishes }
      })
    )
  }

  // Update Dish Note / Special Instructions
  const handleUpdateDishNote = (sessionId: string, dishIndex: number, note: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const updatedDishes = [...s.dishes]
        updatedDishes[dishIndex] = { ...updatedDishes[dishIndex], unit: note }
        return { ...s, dishes: updatedDishes }
      })
    )
  }

  // Add Custom Off-Menu Dish
  const handleAddCustomDish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customDishName.trim()) return
    const targetSessionId = customDishSessionId || activeSessionId

    const resolvedCategory =
      customDishCategoryMode === 'existing'
        ? (customDishCategorySelected || 'Chef Special Off-Menu')
        : (customDishCategoryCustom.trim() || 'Chef Special Off-Menu')

    const newItem: QuotationItem = {
      dishId: `custom-${Date.now()}`,
      categoryName: resolvedCategory,
      dishName: customDishName.trim(),
      nameEn: customDishName.trim(),
      dishNameTa: customDishNameTa.trim() || undefined,
      nameTa: customDishNameTa.trim() || undefined,
      quantity: 1,
      unitPrice: 0,
      total: 0,
      amount: 0,
      unit: customDishNotes.trim() || undefined,
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetSessionId
          ? { ...s, dishes: [...s.dishes, newItem] }
          : s
      )
    )

    setCustomDishName('')
    setCustomDishNameTa('')
    setCustomDishNotes('')
    setCustomDishCategoryCustom('')
    setShowAddCustomModal(false)
  }

  // Toggle Service Inclusion
  const handleToggleInclusion = (title: string) => {
    setSelectedInclusions((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  // Save Proposal to Database / API
  const handleSaveProposal = async (targetStatus?: QuotationStatus) => {
    if (!customerName.trim()) {
      setErrorMessage('Customer name is required.')
      return
    }

    if (totalDishesCount === 0) {
      setErrorMessage('Please add at least one dish to the meal sessions.')
      return
    }

    setSaving(true)
    setErrorMessage('')

    // Flatten all dishes across sessions for backward compatibility
    const allDishes: QuotationItem[] = sessions.flatMap((s) => s.dishes)

    const payload: Partial<QuotationRecord> = {
      id: initialQuotation?.id,
      quotationNumber,
      quotationDate,
      validUntil,
      enquiryId: enquiry?.id || initialQuotation?.enquiryId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      eventType: eventType.trim(),
      eventDate,
      eventLocation: eventLocation.trim(),
      guestCount,
      mealType: mealType.trim(),
      specialRequirements: specialRequirements.trim() || undefined,
      sessions,
      items: allDishes,
      serviceInclusions: selectedInclusions,
      serviceNotes: customServiceNotes.trim() || undefined,
      packageAmount,
      advanceAmount,
      balanceAmount,
      paymentDueDate: paymentDueDate || undefined,
      paymentNotes: paymentNotes.trim() || undefined,
      subtotal: packageAmount,
      taxEnabled,
      taxPercent: taxPercentage,
      taxPercentage,
      taxAmount: calculatedTax,
      grandTotal,
      notes: notes.trim(),
      terms: terms.trim(),
      termsAndConditions: terms.trim(),
      status: targetStatus || status,
    }

    try {
      const res = await fetch('/api/admin/quotations', {
        method: initialQuotation?.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save catering proposal')
      }

      setSaveSuccess(true)
      if (onSaved && data.quotation) {
        onSaved(data.quotation)
      }

      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 1200)
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving proposal.')
    } finally {
      setSaving(false)
    }
  }

  // Filtered menu catalog
  const filteredMenuItems = menuItems.filter((dish) => {
    const matchesCategory =
      selectedCategory === 'all' || dish.categoryId === selectedCategory
    const matchesSearch =
      !menuSearchQuery ||
      dish.nameEn.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
      dish.nameTa.toLowerCase().includes(menuSearchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 23, 17, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top Modal Navigation Bar */}
      <div
        style={{
          height: '66px',
          background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
          borderBottom: '1.5px solid rgba(196, 163, 101, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          color: '#faf8f1',
          flexShrink: 0,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1.5px solid #c4a365',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px',
            }}
          >
            <Image
              src="/images/logo/logo.png"
              alt="Velavan"
              width={30}
              height={30}
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.18rem',
                  fontWeight: 700,
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  letterSpacing: '0.02em',
                }}
              >
                Catering Proposal & Estimate
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  background: 'rgba(196, 163, 101, 0.25)',
                  border: '1px solid #c4a365',
                  color: '#c4a365',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                #{quotationNumber}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: 'rgba(250, 248, 241, 0.72)' }}>
              Multi-meal session catering package builder with overall package pricing
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View mode toggle */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid rgba(196, 163, 101, 0.3)',
            }}
          >
            <button
              onClick={() => setViewMode('build')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'build' ? '#c4a365' : 'transparent',
                color: viewMode === 'build' ? '#0d281e' : '#faf8f1',
                fontWeight: viewMode === 'build' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <UtensilsCrossed size={14} />
              <span>Multi-Meal Builder</span>
            </button>

            <button
              onClick={() => setViewMode('preview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'preview' ? '#c4a365' : 'transparent',
                color: viewMode === 'preview' ? '#0d281e' : '#faf8f1',
                fontWeight: viewMode === 'preview' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Eye size={14} />
              <span>A4 Document Preview</span>
            </button>
          </div>

          {/* Print / PDF Button */}
          {viewMode === 'preview' && (
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(196, 163, 101, 0.25)',
                border: '1px solid #c4a365',
                color: '#faf8f1',
                padding: '7px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <Printer size={15} />
              <span>Print / Download PDF</span>
            </button>
          )}

          {/* Save Draft */}
          <button
            onClick={() => handleSaveProposal('draft')}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #d1c7b7',
              color: '#153d2d',
              padding: '7px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            <Save size={15} />
            <span>Save Draft</span>
          </button>

          {/* Save & Mark Sent */}
          <button
            onClick={() => handleSaveProposal('sent')}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #c4a365 0%, #b38f4d 100%)',
              border: 'none',
              color: '#0d281e',
              padding: '7px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(196, 163, 101, 0.4)',
            }}
          >
            <Send size={15} />
            <span>Save & Send</span>
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            aria-label="Close Proposal Builder"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#faf8f1',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginLeft: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Save Notifications */}
      {saveSuccess && (
        <div
          style={{
            background: '#10b981',
            color: '#ffffff',
            padding: '10px 24px',
            fontSize: '0.86rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Catering proposal #{quotationNumber} successfully saved!</span>
        </div>
      )}
      {errorMessage && (
        <div
          style={{
            background: '#ef4444',
            color: '#ffffff',
            padding: '10px 24px',
            fontSize: '0.86rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Body (Scrollable) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#faf8f1',
          padding: '24px',
        }}
      >
        {/* =========================================================================
            VIEW 1: MULTI-MEAL PROPOSAL BUILDER
            ========================================================================= */}
        {viewMode === 'build' && (
          <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* 1. CUSTOMER & EVENT DOSSIER CARD (FULL WIDTH) */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e3dcce',
                borderRadius: '14px',
                padding: '20px 24px',
                boxShadow: '0 4px 18px -2px rgba(21, 61, 45, 0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #f3efe5',
                  paddingBottom: '12px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#153d2d' }}>
                  <User size={18} style={{ color: '#c4a365' }} />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                    Customer & Event Dossier
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#6b756e' }}>
                    Proposal Date: <strong>{quotationDate}</strong>
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#9e7f41', fontWeight: 600 }}>
                    Valid Until: <strong>{validUntil}</strong>
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. S. Meenakshi Sundaram"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      marginTop: '4px',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="99445XXXXX"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      marginTop: '4px',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="patron@example.com"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      marginTop: '4px',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                    Event Occasion
                  </label>
                  <input
                    type="text"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    placeholder="e.g. Traditional Wedding, Betrothal, Upanayanam"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      marginTop: '4px',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      marginTop: '4px',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                    Overall Guest Count (Pax)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      marginTop: '4px',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box',
                      fontWeight: 700,
                      color: '#153d2d',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                    Venue / Marriage Mandapam
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Codissia Hall A, Coimbatore"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      marginTop: '4px',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                    Proposal Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as QuotationStatus)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      marginTop: '4px',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent to Customer</option>
                    <option value="accepted">Accepted / Confirmed</option>
                    <option value="rejected">Declined</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. DYNAMIC MULTI-MEAL SESSIONS BUILDER + MENU CATALOG */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 38%) minmax(440px, 62%)',
                gap: '20px',
              }}
            >
              {/* LEFT: Menu Items Catalog */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e3dcce',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  boxShadow: '0 4px 18px -2px rgba(21, 61, 45, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  height: '780px',
                  position: 'relative',
                }}
              >
                {/* Catalog Header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#153d2d' }}>
                      <UtensilsCrossed size={18} style={{ color: '#c4a365' }} />
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Menu Items</h3>
                    </div>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: '#153d2d',
                        background: '#f4f8f5',
                        border: '1px solid #c8d8ce',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {menuItems.length} Food Items
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#6b756e' }}>
                    Add food items to: <strong style={{ color: '#153d2d' }}>{activeSession?.name || 'Selected Session'}</strong>
                  </p>
                </div>

                {/* Search input */}
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#9e7f41' }} />
                  <input
                    type="text"
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    placeholder="Search Idli, Pongal, Halwa, Biryani..."
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 32px',
                      borderRadius: '8px',
                      border: '1px solid #d1c7b7',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Category Filter Chips & Expansion/Scroll Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Horizontally scrollable Category Filter Chips */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      overflowX: 'auto',
                      paddingBottom: '4px',
                      scrollbarWidth: 'none',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '16px',
                        border: selectedCategory === 'all' ? '1px solid #153d2d' : '1px solid #d1c7b7',
                        background: selectedCategory === 'all' ? '#153d2d' : '#f3efe5',
                        color: selectedCategory === 'all' ? '#faf8f1' : '#153d2d',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      All Categories ({categories.length})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id)
                          setExpandedCategories((prev) => ({ ...prev, [cat.id]: true }))
                        }}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '16px',
                          border: selectedCategory === cat.id ? '1px solid #153d2d' : '1px solid #e3dcce',
                          background: selectedCategory === cat.id ? '#153d2d' : '#f3efe5',
                          color: selectedCategory === cat.id ? '#faf8f1' : '#153d2d',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {cat.nameEn || cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Category Instruction & Controls Bar */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 0',
                      borderBottom: '1px solid #f3efe5',
                    }}
                  >
                    <span style={{ fontSize: '0.74rem', color: '#153d2d', fontWeight: 700 }}>
                      Select a food category
                    </span>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleExpandAllCategories(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#153d2d',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '2px 4px',
                          textDecoration: 'underline',
                        }}
                      >
                        Expand All
                      </button>
                      <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>•</span>
                      <button
                        type="button"
                        onClick={() => handleExpandAllCategories(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6b756e',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '2px 4px',
                          textDecoration: 'underline',
                        }}
                      >
                        Collapse All
                      </button>

                      <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>|</span>

                      {/* Dedicated Scroll Up & Down Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={handleCatalogScrollUp}
                          disabled={!canScrollUp}
                          title="Scroll food items upward"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '3px 8px',
                            borderRadius: '5px',
                            border: canScrollUp ? '1px solid #c4a365' : '1px solid #e3dcce',
                            background: canScrollUp ? '#ffffff' : '#f8f8f8',
                            color: canScrollUp ? '#153d2d' : '#9ca3af',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: canScrollUp ? 'pointer' : 'not-allowed',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <ChevronUp size={13} style={{ color: canScrollUp ? '#c4a365' : '#9ca3af' }} />
                          <span>Scroll Up</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCatalogScrollDown}
                          disabled={!canScrollDown}
                          title="Scroll food items downward"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '3px 8px',
                            borderRadius: '5px',
                            border: canScrollDown ? '1px solid #153d2d' : '1px solid #e3dcce',
                            background: canScrollDown ? '#153d2d' : '#f8f8f8',
                            color: canScrollDown ? '#faf8f1' : '#9ca3af',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: canScrollDown ? 'pointer' : 'not-allowed',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <ChevronDown size={13} style={{ color: canScrollDown ? '#c4a365' : '#9ca3af' }} />
                          <span>Scroll Down</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Vertically Scrollable Category & Dish Content Container */}
                <div
                  ref={catalogScrollRef}
                  onScroll={updateScrollState}
                  style={{
                    flex: 1,
                    minHeight: 0, // CRITICAL: Allows flex child to shrink & scroll properly
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    paddingRight: '6px',
                    paddingBottom: '26px', // Clear buffer so last items are never cut off
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#c4a365 #f3efe5',
                  }}
                >
                  {loadingMenu ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b756e', fontSize: '0.84rem' }}>
                      Loading menu dishes...
                    </div>
                  ) : (
                    categories
                      .filter((cat) => selectedCategory === 'all' || cat.id === selectedCategory)
                      .map((cat) => {
                        const catDishes = menuItems.filter((m) => {
                          if (m.categoryId !== cat.id) return false
                          if (!menuSearchQuery) return true
                          const q = menuSearchQuery.toLowerCase()
                          return m.nameEn.toLowerCase().includes(q) || m.nameTa.toLowerCase().includes(q)
                        })

                        if (menuSearchQuery && catDishes.length === 0) return null

                        const isExpanded = menuSearchQuery ? true : !!expandedCategories[cat.id]

                        return (
                          <div
                            key={cat.id}
                            style={{
                              flexShrink: 0,
                              border: isExpanded ? '1.5px solid #c4a365' : '1px solid #d1c7b7',
                              borderRadius: '8px',
                              background: '#ffffff',
                              overflow: 'hidden',
                              boxShadow: isExpanded
                                ? '0 3px 10px rgba(196, 163, 101, 0.12)'
                                : '0 1px 3px rgba(0, 0, 0, 0.02)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {/* Accordion Category Header */}
                            <button
                              type="button"
                              onClick={() => toggleCategoryExpand(cat.id)}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                background: isExpanded
                                  ? 'linear-gradient(90deg, #faf8f1 0%, #f4f0e4 100%)'
                                  : '#ffffff',
                                border: 'none',
                                borderBottom: isExpanded ? '1px solid #e3dcce' : 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#c4a365', fontSize: '0.85rem' }}>❖</span>
                                <div>
                                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#153d2d' }}>
                                    {cat.nameEn || cat.name}
                                  </span>
                                  {cat.nameTa && (
                                    <span style={{ fontSize: '0.72rem', color: '#9e7f41', marginLeft: '6px', fontWeight: 600 }}>
                                      {cat.nameTa}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    color: isExpanded ? '#065f46' : '#153d2d',
                                    background: isExpanded ? '#ecfdf5' : '#f4f8f5',
                                    border: isExpanded ? '1px solid #a7f3d0' : '1px solid #c8d8ce',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                  }}
                                >
                                  {catDishes.length} {catDishes.length === 1 ? 'item' : 'items'}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp size={16} style={{ color: '#153d2d' }} />
                                ) : (
                                  <ChevronDown size={16} style={{ color: '#9e7f41' }} />
                                )}
                              </div>
                            </button>

                            {/* All Dishes in Category (No slice or item limits) */}
                            {isExpanded && (
                              <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', background: '#faf8f1' }}>
                                {catDishes.length === 0 ? (
                                  <div style={{ fontSize: '0.74rem', color: '#6b756e', fontStyle: 'italic', padding: '6px 8px' }}>
                                    No food items available in this category.
                                  </div>
                                ) : (
                                  catDishes.map((dish) => {
                                    const isAddedToActiveSession = activeSession?.dishes?.some(
                                      (d) => d.dishId === dish.id || d.dishName === dish.nameEn
                                    )
                                    return (
                                      <div
                                        key={dish.id}
                                        style={{
                                          flexShrink: 0,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: '8px 12px',
                                          background: '#ffffff',
                                          border: '1px solid #e3dcce',
                                          borderRadius: '6px',
                                          transition: 'all 0.12s ease',
                                        }}
                                      >
                                        <div style={{ overflow: 'hidden', paddingRight: '8px' }}>
                                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#153d2d' }}>
                                            {dish.nameEn}
                                          </div>
                                          <div style={{ fontSize: '0.72rem', color: '#9e7f41', fontWeight: 500 }}>
                                            {dish.nameTa}
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleAddDishToSession(dish)}
                                          style={{
                                            background: isAddedToActiveSession ? '#ecfdf5' : '#153d2d',
                                            border: isAddedToActiveSession ? '1px solid #a7f3d0' : 'none',
                                            color: isAddedToActiveSession ? '#065f46' : '#faf8f1',
                                            padding: '5px 11px',
                                            borderRadius: '6px',
                                            fontSize: '0.74rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            flexShrink: 0,
                                            transition: 'all 0.12s ease',
                                          }}
                                        >
                                          {isAddedToActiveSession ? (
                                            <>
                                              <Check size={12} />
                                              <span>Add More</span>
                                            </>
                                          ) : (
                                            <>
                                              <Plus size={12} />
                                              <span>+ Add</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                  )}
                </div>

                {/* Floating Scroll Helper Pill (bottom-right) */}
                {canScrollDown && (
                  <button
                    type="button"
                    onClick={handleCatalogScrollDown}
                    title="Scroll down for more food items"
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '24px',
                      background: '#153d2d',
                      color: '#faf8f1',
                      border: '1.5px solid #c4a365',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(21, 61, 45, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      zIndex: 10,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ChevronDown size={14} style={{ color: '#c4a365' }} />
                    <span>Scroll for More Items</span>
                  </button>
                )}
                {canScrollUp && (
                  <button
                    type="button"
                    onClick={handleCatalogScrollUp}
                    title="Scroll back to top"
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '24px',
                      background: '#ffffff',
                      color: '#153d2d',
                      border: '1.5px solid #d1c7b7',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      zIndex: 10,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ChevronUp size={14} style={{ color: '#c4a365' }} />
                    <span>Scroll to Top</span>
                  </button>
                )}
              </div>

              {/* RIGHT: Multi-Meal Sessions Manager */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e3dcce',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: '0 4px 18px -2px rgba(21, 61, 45, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  height: '780px',
                }}
              >
                {/* Header & Add Session Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#153d2d' }}>
                      Multi-Meal Catering Sessions
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#6b756e' }}>
                      Configure multiple sessions (Tiffin, Lunch, Snacks, Dinner) in a single catering proposal
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSession}
                    style={{
                      background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
                      color: '#faf8f1',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(21, 61, 45, 0.2)',
                    }}
                  >
                    <Plus size={14} />
                    <span>+ Add Meal Session</span>
                  </button>
                </div>

                {/* Session Tabs Selector */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    borderBottom: '1px solid #e3dcce',
                  }}
                >
                  {sessions.map((session, idx) => {
                    const isActive = session.id === activeSessionId
                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => setActiveSessionId(session.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px 8px 0 0',
                          border: 'none',
                          borderBottom: isActive ? '3px solid #c4a365' : '3px solid transparent',
                          background: isActive ? '#faf8f1' : 'transparent',
                          color: isActive ? '#153d2d' : '#6b756e',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{session.name || `Session ${idx + 1}`}</span>
                        <span
                          style={{
                            background: isActive ? '#153d2d' : '#e3dcce',
                            color: isActive ? '#faf8f1' : '#153d2d',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '10px',
                          }}
                        >
                          {session.dishes?.length || 0}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Active Session Content Area */}
                {activeSession && (
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      paddingRight: '4px',
                    }}
                  >
                    {/* Session Controls Card */}
                    <div
                      style={{
                        background: '#faf8f1',
                        border: '1px solid #e3dcce',
                        borderRadius: '10px',
                        padding: '14px 16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.4fr 1fr 1fr 0.8fr',
                          gap: '10px',
                          marginBottom: '10px',
                        }}
                      >
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b756e', textTransform: 'uppercase' }}>
                            Session Title
                          </label>
                          <input
                            type="text"
                            value={activeSession.name}
                            onChange={(e) => handleUpdateSessionField(activeSession.id, 'name', e.target.value)}
                            placeholder="e.g. Morning Muhurtham Tiffin"
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #d1c7b7',
                              marginTop: '2px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b756e', textTransform: 'uppercase' }}>
                            Meal Type
                          </label>
                          <select
                            value={activeSession.mealType}
                            onChange={(e) => handleUpdateSessionField(activeSession.id, 'mealType', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #d1c7b7',
                              marginTop: '2px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              boxSizing: 'border-box',
                              background: '#ffffff',
                            }}
                          >
                            {MEAL_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b756e', textTransform: 'uppercase' }}>
                            Serving Time
                          </label>
                          <input
                            type="text"
                            value={activeSession.servingTime || ''}
                            onChange={(e) => handleUpdateSessionField(activeSession.id, 'servingTime', e.target.value)}
                            placeholder="07:30 AM - 09:30 AM"
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #d1c7b7',
                              marginTop: '2px',
                              fontSize: '0.82rem',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b756e', textTransform: 'uppercase' }}>
                            Session Guests
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={activeSession.guestCount || guestCount}
                            onChange={(e) => handleUpdateSessionField(activeSession.id, 'guestCount', Number(e.target.value) || 0)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #d1c7b7',
                              marginTop: '2px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              color: '#153d2d',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            value={activeSession.notes || ''}
                            onChange={(e) => handleUpdateSessionField(activeSession.id, 'notes', e.target.value)}
                            placeholder="Session preparation notes (e.g. Live counter with 4 filter coffee stalls, pure ghee sweets)"
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #d1c7b7',
                              fontSize: '0.78rem',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        {/* Reorder & Delete buttons */}
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          {(() => {
                            const curIdx = sessions.findIndex((s) => s.id === activeSession.id)
                            return (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSession(curIdx, 'up')}
                                  disabled={curIdx === 0}
                                  title="Move Session Up"
                                  style={{
                                    padding: '5px 8px',
                                    background: '#ffffff',
                                    border: '1px solid #d1c7b7',
                                    borderRadius: '4px',
                                    color: curIdx === 0 ? '#cbd5e1' : '#153d2d',
                                    cursor: curIdx === 0 ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  <ArrowUp size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSession(curIdx, 'down')}
                                  disabled={curIdx === sessions.length - 1}
                                  title="Move Session Down"
                                  style={{
                                    padding: '5px 8px',
                                    background: '#ffffff',
                                    border: '1px solid #d1c7b7',
                                    borderRadius: '4px',
                                    color: curIdx === sessions.length - 1 ? '#cbd5e1' : '#153d2d',
                                    cursor: curIdx === sessions.length - 1 ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  <ArrowDown size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSession(activeSession.id)}
                                  title="Delete Meal Session"
                                  style={{
                                    padding: '5px 8px',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '4px',
                                    color: '#b83b2e',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Session Dishes Header & Custom Dish Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#153d2d' }}>
                        Food Items in This Session ({activeSession.dishes?.length || 0})
                        <span style={{ fontSize: '0.72rem', color: '#6b756e', fontWeight: 400, marginLeft: '6px' }}>
                          (No individual dish prices)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCustomDishSessionId(activeSession.id)
                          setShowAddCustomModal(true)
                        }}
                        style={{
                          background: 'rgba(196, 163, 101, 0.18)',
                          border: '1px solid #c4a365',
                          color: '#153d2d',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Plus size={13} />
                        <span>+ Add Custom Dish</span>
                      </button>
                    </div>

                    {/* Dishes List */}
                    {activeSession.dishes.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '40px 20px',
                          border: '2px dashed #d1c7b7',
                          borderRadius: '10px',
                          color: '#6b756e',
                        }}
                      >
                        <UtensilsCrossed size={32} style={{ color: '#c4a365', margin: '0 auto 8px' }} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#153d2d' }}>
                          No dishes assigned to this session yet
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#6b756e', marginTop: '4px' }}>
                          Select dishes from the menu catalog on the left or click <strong>+ Add Custom Dish</strong>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {groupDishesByCategory(activeSession.dishes, categories, menuItems).map((group) => (
                          <div
                            key={group.categoryName}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e3dcce',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              boxShadow: '0 2px 6px rgba(21, 61, 45, 0.04)',
                            }}
                          >
                            {/* Category Group Header Banner */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'linear-gradient(90deg, #faf8f1 0%, #f4f0e4 100%)',
                                borderBottom: '1px solid #e3dcce',
                                padding: '8px 14px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#c4a365', fontSize: '0.82rem' }}>❖</span>
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    color: '#153d2d',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                  }}
                                >
                                  {group.categoryName}
                                </span>
                              </div>
                              <span
                                style={{
                                  background: 'rgba(21, 61, 45, 0.08)',
                                  color: '#153d2d',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                }}
                              >
                                {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                              </span>
                            </div>

                            {/* Dishes within this category */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              {group.items.map(({ dish, originalIndex }) => (
                                <div
                                  key={originalIndex}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    borderBottom: '1px solid #f3efe5',
                                    gap: '12px',
                                    background: '#ffffff',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#c4a365', width: '22px' }}>
                                      #{originalIndex + 1}
                                    </span>
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#153d2d' }}>
                                        {dish.dishName || dish.nameEn}
                                      </div>
                                      {(dish.dishNameTa || dish.nameTa) && (
                                        <div style={{ fontSize: '0.74rem', color: '#9e7f41', fontWeight: 600 }}>
                                          {dish.dishNameTa || dish.nameTa}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Chef prep / serving note input */}
                                  <div style={{ flex: 1, maxWidth: '280px' }}>
                                    <input
                                      type="text"
                                      value={dish.unit || ''}
                                      onChange={(e) => handleUpdateDishNote(activeSession.id, originalIndex, e.target.value)}
                                      placeholder="Chef note (e.g. Served hot with ghee)"
                                      style={{
                                        width: '100%',
                                        padding: '5px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid #e3dcce',
                                        fontSize: '0.74rem',
                                        boxSizing: 'border-box',
                                        fontStyle: 'italic',
                                        background: '#faf8f1',
                                      }}
                                    />
                                  </div>

                                  {/* Actions: Reorder within session & Remove */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveDish(activeSession.id, originalIndex, 'up')}
                                      disabled={originalIndex === 0}
                                      title="Move Up"
                                      style={{
                                        padding: '4px 6px',
                                        background: '#ffffff',
                                        border: '1px solid #d1c7b7',
                                        borderRadius: '4px',
                                        color: originalIndex === 0 ? '#cbd5e1' : '#153d2d',
                                        cursor: originalIndex === 0 ? 'not-allowed' : 'pointer',
                                      }}
                                    >
                                      <ArrowUp size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveDish(activeSession.id, originalIndex, 'down')}
                                      disabled={originalIndex === activeSession.dishes.length - 1}
                                      title="Move Down"
                                      style={{
                                        padding: '4px 6px',
                                        background: '#ffffff',
                                        border: '1px solid #d1c7b7',
                                        borderRadius: '4px',
                                        color: originalIndex === activeSession.dishes.length - 1 ? '#cbd5e1' : '#153d2d',
                                        cursor: originalIndex === activeSession.dishes.length - 1 ? 'not-allowed' : 'pointer',
                                      }}
                                    >
                                      <ArrowDown size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveDishFromSession(activeSession.id, originalIndex)}
                                      style={{
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        color: '#b83b2e',
                                        cursor: 'pointer',
                                        padding: '4px 6px',
                                        borderRadius: '4px',
                                      }}
                                      title="Remove Dish"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* =========================================================================
                3. SERVICE INCLUSIONS — FULL-WIDTH HORIZONTAL GRID (ACROSS 100% WIDTH)
                ========================================================================= */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e3dcce',
                borderRadius: '14px',
                padding: '24px 28px',
                boxShadow: '0 4px 18px -2px rgba(21, 61, 45, 0.06)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #f3efe5',
                  paddingBottom: '12px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#153d2d' }}>
                  <ShieldCheck size={20} style={{ color: '#c4a365' }} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                    Service & Operational Inclusions (Full Package Coverage)
                  </h3>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#6b756e' }}>
                  {selectedInclusions.length} of {STANDARD_SERVICE_INCLUSIONS.length} services included
                </span>
              </div>

              {/* Horizontal Multi-Column Grid (3-4 columns) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '12px',
                }}
              >
                {STANDARD_SERVICE_INCLUSIONS.map((inc) => {
                  const checked = selectedInclusions.includes(inc.title)
                  return (
                    <label
                      key={inc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: checked ? '#f4f8f5' : '#faf8f1',
                        border: checked ? '1.5px solid #10b981' : '1px solid #e3dcce',
                        cursor: 'pointer',
                        transition: 'all 0.14s ease',
                        boxShadow: checked ? '0 2px 8px rgba(16, 185, 129, 0.08)' : 'none',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleInclusion(inc.title)}
                        style={{ marginTop: '3px', accentColor: '#153d2d', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: checked ? '#153d2d' : '#4b5563' }}>
                          {inc.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#6b756e', marginTop: '2px', lineHeight: 1.35 }}>
                          {inc.desc}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* Custom Service Notes Textarea */}
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                  Custom Service Notes / Additional Arrangements
                </label>
                <textarea
                  value={customServiceNotes}
                  onChange={(e) => setCustomServiceNotes(e.target.value)}
                  placeholder="e.g. 25 uniformed staff, welcome drink counter at entrance, brass uruli floral decor, extra banana leaves..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1c7b7',
                    marginTop: '4px',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* =========================================================================
                4. OVERALL PACKAGE PRICING (MANDATORY: SINGLE PACKAGE AMOUNT) + TERMS
                ========================================================================= */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1fr)',
                gap: '20px',
              }}
            >
              {/* LEFT: Terms & Conditions */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e3dcce',
                  borderRadius: '14px',
                  padding: '20px 24px',
                  boxShadow: '0 4px 18px -2px rgba(21, 61, 45, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ borderBottom: '1px solid #f3efe5', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#153d2d' }}>
                    Terms, Conditions & Catering Protocol
                  </h3>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b756e', textTransform: 'uppercase' }}>
                    Terms & Conditions
                  </label>
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      marginTop: '4px',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b756e', textTransform: 'uppercase' }}>
                    General Hospitality Note
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      marginTop: '4px',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* RIGHT: Overall Package Pricing Card */}
              <div
                style={{
                  background: '#ffffff',
                  border: '2px solid #c4a365',
                  borderRadius: '14px',
                  padding: '22px 26px',
                  boxShadow: '0 6px 24px -2px rgba(196, 163, 101, 0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ borderBottom: '1.5px solid #f3efe5', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#153d2d' }}>
                      Overall Catering Package Pricing
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#9e7f41', fontWeight: 600 }}>
                      Package-based quotation (Never dish-wise prices)
                    </p>
                  </div>
                  <span style={{ fontSize: '0.74rem', background: '#faf8f1', border: '1px solid #e3dcce', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, color: '#153d2d' }}>
                    {totalDishesCount} Dishes Included
                  </span>
                </div>

                {/* Primary Package Input */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#153d2d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Complete Catering Package Amount (₹) *
                  </label>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '1.25rem', fontWeight: 700, color: '#9e7f41' }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={packageAmount}
                      onChange={(e) => setPackageAmount(Number(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 34px',
                        borderRadius: '8px',
                        border: '2px solid #c4a365',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        color: '#153d2d',
                        background: '#faf8f1',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Advance & Balance Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b756e', textTransform: 'uppercase' }}>
                      Advance Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(Number(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #d1c7b7',
                        marginTop: '3px',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: '#065f46',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b756e', textTransform: 'uppercase' }}>
                      Calculated Balance Due (₹)
                    </label>
                    <div
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #e3dcce',
                        marginTop: '3px',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: balanceAmount > 0 ? '#b83b2e' : '#065f46',
                        background: '#faf8f1',
                        boxSizing: 'border-box',
                      }}
                    >
                      ₹{balanceAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Due Date & GST Toggle */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#6b756e', fontWeight: 700, textTransform: 'uppercase' }}>
                      Balance Due Date
                    </label>
                    <input
                      type="date"
                      value={paymentDueDate}
                      onChange={(e) => setPaymentDueDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 8px',
                        borderRadius: '6px',
                        border: '1px solid #d1c7b7',
                        marginTop: '3px',
                        fontSize: '0.8rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#6b756e', fontWeight: 700, textTransform: 'uppercase' }}>
                      GST Tax (Optional)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <input
                        type="checkbox"
                        id="taxToggle"
                        checked={taxEnabled}
                        onChange={(e) => setTaxEnabled(e.target.checked)}
                        style={{ accentColor: '#153d2d', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <label htmlFor="taxToggle" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#153d2d', cursor: 'pointer' }}>
                        {taxEnabled ? `5% GST (+₹${calculatedTax.toLocaleString('en-IN')})` : 'Tax OFF (Default)'}
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#6b756e', fontWeight: 700, textTransform: 'uppercase' }}>
                    Payment Schedule Notes
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. 50% advance for booking confirmation, balance prior to serving."
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      marginTop: '3px',
                      fontSize: '0.8rem',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Grand Total Box */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    color: '#faf8f1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '2px',
                    border: '1px solid rgba(196, 163, 101, 0.4)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#c4a365', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                      Grand Proposal Total
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'rgba(250, 248, 241, 0.7)' }}>
                      All inclusive catering package
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#faf8f1', lineHeight: 1 }}>
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </div>
                    {taxEnabled && (
                      <div style={{ fontSize: '0.68rem', color: '#c4a365', marginTop: '3px' }}>
                        Includes ₹{calculatedTax.toLocaleString('en-IN')} GST
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: OFFICIAL A4 PROPOSAL PREVIEW & PRINT DOCUMENT
            ========================================================================= */}
        {viewMode === 'preview' && (
          <div
            className="a4-document-container"
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
              padding: '48px 52px',
              color: '#1f2f25',
              fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            {/* Top Royal Brand Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2.5px solid #153d2d',
                paddingBottom: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '2px solid #c4a365',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                  }}
                >
                  <Image
                    src="/images/logo/logo.png"
                    alt="Velavan"
                    width={56}
                    height={56}
                    style={{ objectFit: 'contain' }}
                  />
                </div>

                <div>
                  <h1
                    style={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: '1.9rem',
                      fontWeight: 700,
                      color: '#153d2d',
                      margin: '0 0 2px',
                      lineHeight: 1.1,
                      letterSpacing: '0.02em',
                    }}
                  >
                    Velavan Catering Services
                  </h1>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      color: '#9e7f41',
                      textTransform: 'uppercase',
                    }}
                  >
                    AUTHENTIC SOUTH INDIAN CATERING & WEDDING FEASTS
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#6b756e', marginTop: '4px' }}>
                    15/49, Mariamman Kovil Street, Chettipalayam, Coimbatore – 641201 | Phone: +91 90803 09584 / +91 98422 11223
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#9e7f41', marginTop: '2px' }}>
                    FSSAI: 12426003001273 | MSME: UDYAM-TN-03-0341714
                  </div>
                </div>
              </div>

              {/* Proposal Document Badge */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    background: '#153d2d',
                    color: '#faf8f1',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                >
                  OFFICIAL CATERING PROPOSAL
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#153d2d', marginTop: '6px' }}>
                  #{quotationNumber}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#6b756e', marginTop: '2px' }}>
                  Date: <strong>{quotationDate}</strong>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#6b756e' }}>
                  Valid Until: <strong>{validUntil}</strong>
                </div>
              </div>
            </div>

            {/* Customer & Event Details Dossier Box */}
            <div
              style={{
                background: '#faf8f1',
                border: '1px solid #e3dcce',
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '26px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px 20px',
                fontSize: '0.84rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: '#6b756e', textTransform: 'uppercase', fontWeight: 700 }}>
                  Client / Host Name:
                </span>
                <div style={{ fontWeight: 700, color: '#153d2d', fontSize: '0.92rem', marginTop: '1px' }}>
                  {customerName || 'Valued Patron'}
                </div>
                {customerPhone && <div style={{ fontSize: '0.76rem', color: '#6b756e' }}>{customerPhone}</div>}
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#6b756e', textTransform: 'uppercase', fontWeight: 700 }}>
                  Event Occasion:
                </span>
                <div style={{ fontWeight: 600, color: '#153d2d', marginTop: '1px' }}>
                  {eventType}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#9e7f41', fontWeight: 600 }}>
                  {mealType}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#6b756e', textTransform: 'uppercase', fontWeight: 700 }}>
                  Date & Venue:
                </span>
                <div style={{ fontWeight: 600, color: '#153d2d', marginTop: '1px' }}>
                  {eventDate ? new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#6b756e' }}>
                  {eventLocation || 'Venue To Be Finalized'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#6b756e', textTransform: 'uppercase', fontWeight: 700 }}>
                  Confirmed Guest Count:
                </span>
                <div style={{ fontWeight: 700, color: '#153d2d', fontSize: '1.1rem', marginTop: '1px' }}>
                  {guestCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b756e' }}>Pax</span>
                </div>
              </div>
            </div>

            {/* MULTI-MEAL SESSIONS LISTING (NO DISH PRICES) */}
            <div style={{ marginBottom: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid #153d2d',
                  paddingBottom: '8px',
                  marginBottom: '16px',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#153d2d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Proposed Multi-Meal Feast Menu
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#9e7f41', fontWeight: 700 }}>
                  {sessions.length} Sessions • {totalDishesCount} Total Food Items
                </span>
              </div>

              {sessions.map((session, sIdx) => (
                <div
                  key={session.id}
                  style={{
                    marginBottom: '20px',
                    pageBreakInside: 'avoid',
                  }}
                >
                  {/* Session Header Banner */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#153d2d',
                      color: '#faf8f1',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        Session {sIdx + 1}: {session.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          background: '#c4a365',
                          color: '#0d281e',
                          padding: '1px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}
                      >
                        {session.mealType}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.74rem', color: '#faf8f1' }}>
                      {session.servingTime && (
                        <span>Serving: <strong>{session.servingTime}</strong></span>
                      )}
                      {session.guestCount && (
                        <span>Guests: <strong>{session.guestCount} Pax</strong></span>
                      )}
                    </div>
                  </div>

                  {session.notes && (
                    <div style={{ fontSize: '0.74rem', color: '#6b756e', fontStyle: 'italic', margin: '2px 0 8px 6px' }}>
                      Special Note: {session.notes}
                    </div>
                  )}

                  {/* Dishes Grouped by Category for this Session (NO PRICES) */}
                  {session.dishes.length === 0 ? (
                    <div style={{ padding: '8px 12px', fontSize: '0.76rem', color: '#6b756e', fontStyle: 'italic' }}>
                      No dishes assigned to this session.
                    </div>
                  ) : (
                    <div
                      style={{
                        background: '#faf8f1',
                        borderRadius: '6px',
                        border: '1px solid #e3dcce',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {groupDishesByCategory(session.dishes, categories, menuItems).map((group) => (
                        <div key={group.categoryName} style={{ pageBreakInside: 'avoid' }}>
                          {/* Category Header within Session */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '6px',
                              paddingBottom: '3px',
                              borderBottom: '1px dashed #c4a365',
                            }}
                          >
                            <span style={{ color: '#c4a365', fontSize: '0.72rem' }}>❖</span>
                            <span
                              style={{
                                fontFamily: '"Cormorant Garamond", Georgia, serif',
                                fontSize: '0.92rem',
                                fontWeight: 700,
                                color: '#153d2d',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                              }}
                            >
                              {group.categoryName}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#9e7f41', fontWeight: 600 }}>
                              ({group.items.length})
                            </span>
                          </div>

                          {/* Dishes Grid under Category */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                              gap: '6px 14px',
                              paddingLeft: '8px',
                            }}
                          >
                            {group.items.map(({ dish }, dIdx) => (
                              <div key={dIdx} style={{ display: 'flex', alignItems: 'baseline', gap: '6px', padding: '2px 0' }}>
                                <span style={{ color: '#c4a365', fontSize: '0.65rem' }}>✦</span>
                                <div style={{ fontSize: '0.82rem', color: '#1f2f25' }}>
                                  <strong style={{ color: '#153d2d' }}>{dish.dishName || dish.nameEn}</strong>
                                  {(dish.dishNameTa || dish.nameTa) && (
                                    <span style={{ color: '#9e7f41', fontSize: '0.74rem', marginLeft: '6px' }}>
                                      ({dish.dishNameTa || dish.nameTa})
                                    </span>
                                  )}
                                  {dish.unit && (
                                    <div style={{ color: '#6b756e', fontSize: '0.7rem', fontStyle: 'italic', marginTop: '1px' }}>
                                      {dish.unit}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Service Inclusions Block */}
            {selectedInclusions.length > 0 && (
              <div style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
                <h4
                  style={{
                    margin: '0 0 10px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: '#153d2d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #e3dcce',
                    paddingBottom: '4px',
                  }}
                >
                  Hospitality & Service Inclusions
                </h4>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '6px 14px',
                  }}
                >
                  {selectedInclusions.map((incTitle, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                      <CheckCircle2 size={13} style={{ color: '#065f46', flexShrink: 0 }} />
                      <span style={{ color: '#153d2d', fontWeight: 600 }}>{incTitle}</span>
                    </div>
                  ))}
                </div>

                {customServiceNotes && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: '#faf8f1',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      color: '#4b5563',
                      border: '1px dashed #d1c7b7',
                    }}
                  >
                    <strong>Special Arrangements:</strong> {customServiceNotes}
                  </div>
                )}
              </div>
            )}

            {/* Pricing Summary Box (Complete Catering Package Amount in Bold) */}
            <div
              style={{
                background: 'linear-gradient(135deg, #153d2d 0%, #0d281e 100%)',
                color: '#faf8f1',
                borderRadius: '10px',
                padding: '20px 24px',
                marginBottom: '26px',
                boxShadow: '0 4px 18px rgba(21, 61, 45, 0.25)',
                pageBreakInside: 'avoid',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#c4a365',
                      fontWeight: 700,
                    }}
                  >
                    COMPLETE CATERING PACKAGE ESTIMATE
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'rgba(250, 248, 241, 0.75)', marginTop: '2px' }}>
                    Covers {sessions.length} meal sessions, {totalDishesCount} food items & full hospitality service
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: '2.1rem',
                      fontWeight: 700,
                      color: '#faf8f1',
                      lineHeight: 1,
                    }}
                  >
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </div>
                  {taxEnabled && (
                    <div style={{ fontSize: '0.72rem', color: '#c4a365', marginTop: '2px' }}>
                      (Includes 5% GST ₹{calculatedTax.toLocaleString('en-IN')})
                    </div>
                  )}
                </div>
              </div>

              {/* Advance & Balance Breakdown */}
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(196, 163, 101, 0.25)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  fontSize: '0.78rem',
                }}
              >
                <div>
                  <span style={{ color: 'rgba(250, 248, 241, 0.65)' }}>Booking Advance:</span>
                  <div style={{ fontWeight: 700, color: '#c4a365', fontSize: '0.92rem' }}>
                    ₹{advanceAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'rgba(250, 248, 241, 0.65)' }}>Balance Settlement:</span>
                  <div style={{ fontWeight: 700, color: '#faf8f1', fontSize: '0.92rem' }}>
                    ₹{balanceAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                {paymentDueDate && (
                  <div>
                    <span style={{ color: 'rgba(250, 248, 241, 0.65)' }}>Balance Due Date:</span>
                    <div style={{ fontWeight: 600, color: '#faf8f1' }}>
                      {paymentDueDate}
                    </div>
                  </div>
                )}
              </div>

              {paymentNotes && (
                <div style={{ marginTop: '10px', fontSize: '0.74rem', color: 'rgba(250, 248, 241, 0.8)', fontStyle: 'italic' }}>
                  Note: {paymentNotes}
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            {terms && (
              <div style={{ marginBottom: '28px', pageBreakInside: 'avoid' }}>
                <h4
                  style={{
                    margin: '0 0 8px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: '#153d2d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Terms & Booking Conditions
                </h4>
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: '#4b5563',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line',
                    background: '#faf8f1',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #e3dcce',
                  }}
                >
                  {terms}
                </div>
              </div>
            )}

            {/* Authorized Signatory Block */}
            <div
              style={{
                marginTop: '36px',
                paddingTop: '20px',
                borderTop: '1px solid #e3dcce',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                pageBreakInside: 'avoid',
              }}
            >
              <div>
                <div style={{ height: '42px', display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      border: '1px dashed #c4a365',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      color: '#9e7f41',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Velavan Catering Services · Official Stamp
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#153d2d', marginTop: '6px' }}>
                  Authorized Signatory
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b756e' }}>
                  Velavan Catering Services, Coimbatore
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ height: '42px', borderBottom: '1px solid #d1c7b7', width: '180px' }} />
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#153d2d', marginTop: '6px' }}>
                  Client / Patron Acceptance
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b756e' }}>
                  Signature & Date
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Custom Off-Menu Dish */}
      {showAddCustomModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
              border: '1px solid #c4a365',
            }}
          >
            <div
              style={{
                background: '#153d2d',
                padding: '16px 20px',
                color: '#faf8f1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Add Custom Off-Menu Dish</h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                style={{ background: 'none', border: 'none', color: '#faf8f1', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomDish} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                  Dish Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asoka Halwa, Chettinad Mushroom Biryani"
                  value={customDishName}
                  onChange={(e) => setCustomDishName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1c7b7',
                    marginTop: '3px',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                  Dish Name (Tamil - Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. அசோகா அல்வா"
                  value={customDishNameTa}
                  onChange={(e) => setCustomDishNameTa(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1c7b7',
                    marginTop: '3px',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Menu Category Assignment *
                </label>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#153d2d' }}>
                    <input
                      type="radio"
                      name="customDishCatMode"
                      checked={customDishCategoryMode === 'existing'}
                      onChange={() => setCustomDishCategoryMode('existing')}
                    />
                    Assign to Existing Category
                  </label>
                  <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#153d2d' }}>
                    <input
                      type="radio"
                      name="customDishCatMode"
                      checked={customDishCategoryMode === 'custom'}
                      onChange={() => setCustomDishCategoryMode('custom')}
                    />
                    Type Custom Category Name
                  </label>
                </div>

                {customDishCategoryMode === 'existing' ? (
                  <select
                    value={customDishCategorySelected}
                    onChange={(e) => setCustomDishCategorySelected(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      boxSizing: 'border-box',
                      background: '#ffffff',
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.nameEn || cat.name}>
                        {cat.nameEn || cat.name} {cat.nameTa ? `(${cat.nameTa})` : ''}
                      </option>
                    ))}
                    <option value="Chef Specials">Chef Specials</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required={customDishCategoryMode === 'custom'}
                    placeholder="e.g. Live Dosa Bar, Traditional Tiffin, Welcome Drink"
                    value={customDishCategoryCustom}
                    onChange={(e) => setCustomDishCategoryCustom(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1c7b7',
                      fontSize: '0.86rem',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
                <div style={{ fontSize: '0.7rem', color: '#6b756e', marginTop: '3px' }}>
                  Custom off-menu dishes remain associated with this proposal only and will not modify your public menu.
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                  Target Meal Session
                </label>
                <select
                  value={customDishSessionId || activeSessionId}
                  onChange={(e) => setCustomDishSessionId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #d1c7b7',
                    marginTop: '3px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    boxSizing: 'border-box',
                    background: '#ffffff',
                  }}
                >
                  {sessions.map((sess) => (
                    <option key={sess.id} value={sess.id}>
                      {sess.name} ({sess.mealType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#153d2d', textTransform: 'uppercase' }}>
                  Preparation Note / Serving Instruction (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Served hot with pure ghee, garnished with cashews"
                  value={customDishNotes}
                  onChange={(e) => setCustomDishNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1c7b7',
                    marginTop: '3px',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  style={{
                    padding: '8px 14px',
                    background: '#faf8f1',
                    border: '1px solid #d1c7b7',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    color: '#6b756e',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    background: '#153d2d',
                    color: '#faf8f1',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Add to Meal Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print CSS Rules */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header,
          .admin-sidebar,
          .admin-toolbar,
          button,
          .no-print {
            display: none !important;
          }
          .a4-document-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 16px 20px !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  )
}
