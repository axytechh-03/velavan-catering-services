'use client'

import React, { useState, useMemo } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { menuCategories, menuItems } from '@/data/menu'
import {
  Sparkles,
  Soup,
  GlassWater,
  Utensils,
  Flame,
  Cookie,
  Wheat,
  ChefHat,
  UtensilsCrossed,
  CookingPot,
  IceCream,
  Salad,
  Coffee,
  ArrowLeft,
  ArrowRight,
  Search,
  X,
  LucideIcon,
} from 'lucide-react'

// Dedicated icon map for each category
const categoryIconMap: Record<string, LucideIcon> = {
  sweets: Sparkles,
  soups: Soup,
  welcomeDrinks: GlassWater,
  idliBreakfast: Utensils,
  dosaRoast: Flame,
  biryaniPulao: Flame,
  starters: Cookie,
  rotisBreads: Wheat,
  graviesCurries: ChefHat,
  chutneysSambars: UtensilsCrossed,
  riceRasam: CookingPot,
  payasamDesserts: IceCream,
  lunchVegetables: Salad,
  beveragesPan: Coffee,
}

// Subtle, elegant food-themed watermark illustrations for each menu category
const categoryWatermarkMap: Record<string, string> = {
  sweets: '/images/menu-watermarks/sweets.svg',
  soups: '/images/menu-watermarks/soups.svg',
  welcomeDrinks: '/images/menu-watermarks/welcome-drinks.svg',
  idliBreakfast: '/images/menu-watermarks/idli-breakfast.svg',
  dosaRoast: '/images/menu-watermarks/dosa-roast.svg',
  biryaniPulao: '/images/menu-watermarks/biryani-pulao.svg',
  starters: '/images/menu-watermarks/starters.svg',
  rotisBreads: '/images/menu-watermarks/rotis-breads.svg',
  graviesCurries: '/images/menu-watermarks/gravies-curries.svg',
  chutneysSambars: '/images/menu-watermarks/chutneys-sambars.svg',
  riceRasam: '/images/menu-watermarks/rice-rasam.svg',
  payasamDesserts: '/images/menu-watermarks/payasam-desserts.svg',
  lunchVegetables: '/images/menu-watermarks/lunch-vegetables.svg',
  beveragesPan: '/images/menu-watermarks/beverages-pan.svg',
}

export function MenuSection() {
  const { language, t } = useLanguage()

  // When null: renders the Category Overview Grid.
  // When a category ID string: renders ONLY that category's dishes.
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Selected category object
  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null
    return menuCategories.find((c) => c.id === selectedCategoryId) || null
  }, [selectedCategoryId])

  // Current category index for prev/next navigation
  const currentIndex = useMemo(() => {
    if (!selectedCategoryId) return -1
    return menuCategories.findIndex((c) => c.id === selectedCategoryId)
  }, [selectedCategoryId])

  const prevCategory = currentIndex > 0 ? menuCategories[currentIndex - 1] : null
  const nextCategory =
    currentIndex >= 0 && currentIndex < menuCategories.length - 1
      ? menuCategories[currentIndex + 1]
      : null

  // Dishes belonging ONLY to the selected category (never any other category)
  const categoryDishes = useMemo(() => {
    if (!selectedCategoryId) return []
    return menuItems.filter((item) => item.categoryId === selectedCategoryId)
  }, [selectedCategoryId])

  // Global search across the complete menu dataset (all 14 categories)
  const globalMatchingDishes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return []
    return menuItems.filter((dish) => {
      const matchEn = dish.nameEn.toLowerCase().includes(q)
      const matchTa = dish.nameTa.toLowerCase().includes(q)
      const matchDescEn = dish.descEn ? dish.descEn.toLowerCase().includes(q) : false
      const matchDescTa = dish.descTa ? dish.descTa.toLowerCase().includes(q) : false
      const cat = menuCategories.find((c) => c.id === dish.categoryId)
      const matchCatEn = cat ? cat.nameEn.toLowerCase().includes(q) : false
      const matchCatTa = cat ? cat.nameTa.toLowerCase().includes(q) : false
      return matchEn || matchTa || matchDescEn || matchDescTa || matchCatEn || matchCatTa
    })
  }, [searchQuery])

  // Scroll smoothly to menu section top
  const scrollToMenuTop = () => {
    const el = document.getElementById('menu')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId)
    setSearchQuery('')
    scrollToMenuTop()
  }

  const handleBackToCategories = () => {
    setSelectedCategoryId(null)
    setSearchQuery('')
    scrollToMenuTop()
  }

  const getCategory = (catId: string) => {
    return menuCategories.find((c) => c.id === catId)
  }

  const isSearching = searchQuery.trim().length > 0

  return (
    <section className="section menu-section" id="menu">
      <div className="container">
        {/* Section Header */}
        <div className="section-head reveal-up">
          <div className="eyebrow">{t.menuEyebrow}</div>
          <h2 className="serif">{t.menuTitle}</h2>
          <div className="gold-line center-line"></div>
          <p>{t.menuDesc}</p>
        </div>

        {/* =========================================================================
            GLOBAL DISH SEARCH BAR (Visible across category overview and categories)
           ========================================================================= */}
        <div className="menu-global-search-wrap reveal-up" style={{ transitionDelay: '0.08s' }}>
          <div className="menu-global-search-box">
            <Search className="menu-search-icon" size={18} />
            <input
              type="text"
              className="menu-global-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'எங்கள் முழு மெனுவிலும் உணவைத் தேடுங்கள் (எ.கா: முந்திரி, தோசை, பிரியாணி, ரசம்)...'
                  : 'Search any dish across our entire menu (e.g. Kaju, Dosa, Biryani, Rasam)...'
              }
              aria-label={language === 'ta' ? 'மெனு தேடல்' : 'Search dishes'}
            />
            {searchQuery && (
              <button
                type="button"
                className="menu-search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label={language === 'ta' ? 'தேடலை அழிக்கவும்' : 'Clear search'}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            STATE 1: GLOBAL SEARCH RESULTS VIEW (When visitor types a query)
           ========================================================================= */}
        {isSearching ? (
          <div className="menu-search-results-wrap reveal-up">
            <div className="menu-search-results-header">
              <div>
                <h3 className="search-results-title serif">
                  {language === 'ta' ? (
                    <>
                      <span>"{searchQuery}"</span> க்கான தேடல் முடிவுகள் ({globalMatchingDishes.length})
                    </>
                  ) : (
                    <>
                      Search Results for <span>"{searchQuery}"</span> ({globalMatchingDishes.length} dishes found)
                    </>
                  )}
                </h3>
                <p className="search-results-sub">
                  {language === 'ta'
                    ? 'எங்கள் 14 மெனு பிரிவுகளிலும் உள்ள உண்மையான உணவு வகைகள்'
                    : 'Authentic items found across all 14 curated catering categories'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline clear-all-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
                <span>{language === 'ta' ? 'தேடலை அழிக்கவும்' : 'Clear Search'}</span>
              </button>
            </div>

            {globalMatchingDishes.length > 0 ? (
              <div className="category-dishes-grid search-grid">
                {globalMatchingDishes.map((dish) => {
                  const cat = getCategory(dish.categoryId)
                  return (
                    <div key={dish.id} className="dish-card search-dish-card">
                      <div className="dish-card-main">
                        <div className="dish-indicator-wrap">
                          <span className="veg-badge" title="Pure Vegetarian">
                            <span className="veg-badge-dot"></span>
                          </span>
                        </div>
                        <div className="dish-content">
                          <div className="dish-header-row">
                            <h4 className="dish-name">
                              {language === 'ta' ? dish.nameTa : dish.nameEn}
                            </h4>
                            {cat && (
                              <button
                                type="button"
                                className="dish-category-badge"
                                onClick={() => handleSelectCategory(cat.id)}
                                title={
                                  language === 'ta'
                                    ? `${cat.nameTa} பிரிவுக்குச் செல்ல`
                                    : `View all ${cat.nameEn}`
                                }
                              >
                                {language === 'ta' ? cat.nameTa : cat.nameEn}
                                <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                          <div className="dish-sub">
                            {language === 'ta' ? dish.nameEn : dish.nameTa}
                          </div>
                          {(dish.descEn || dish.descTa) && (
                            <p className="dish-desc">
                              {language === 'ta'
                                ? dish.descTa || dish.descEn
                                : dish.descEn || dish.descTa}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="dish-search-empty">
                <div className="empty-search-icon-wrap">
                  <Search size={32} />
                </div>
                <h3>
                  {language === 'ta'
                    ? 'உணவுகள் எதுவும் கிடைக்கவில்லை'
                    : 'No Dishes Found'}
                </h3>
                <p>
                  {language === 'ta'
                    ? `"${searchQuery}" என்ற பெயரில் எந்த உணவும் எங்கள் மெனுவில் இல்லை. தோசை, பிரியாணி அல்லது அல்வா என தேடவும்.`
                    : `We couldn't find any dishes matching "${searchQuery}". Try searching for dosa, biryani, or halwa.`}
                </p>
                <button
                  type="button"
                  className="btn btn-sm btn-dark reset-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                  {language === 'ta' ? 'அனைத்து பிரிவுகளுக்கும் திரும்பு' : 'Return to All Categories'}
                </button>
              </div>
            )}
          </div>
        ) : selectedCategoryId === null ? (
          /* =========================================================================
             STATE 2: CATEGORY OVERVIEW GRID (Initial state - NO dishes dumped)
             ========================================================================= */
          <div className="menu-overview-wrap">
            {/* Category Grid Header note */}
            <div className="menu-grid-intro reveal-up" style={{ transitionDelay: '0.1s' }}>
              <span className="menu-grid-badge">
                {language === 'ta' ? '14 உணவுப் பிரிவுகள்' : '14 Curated Categories'}
              </span>
              <p className="menu-grid-hint">
                {language === 'ta'
                  ? 'உணவு வகைகளைக் காண ஏதேனும் ஒரு பிரிவைத் தேர்ந்தெடுக்கவும்'
                  : 'Select any category below to view its authentic prospectus dishes'}
              </p>
            </div>

            {/* Categories Responsive Grid */}
            <div className="menu-categories-grid">
              {menuCategories.map((cat, idx) => {
                const IconComponent = categoryIconMap[cat.id] || Sparkles
                const dishCount = menuItems.filter((m) => m.categoryId === cat.id).length

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className="menu-category-card reveal-up"
                    style={{ transitionDelay: `${(idx % 4) * 0.08}s` }}
                    onClick={() => handleSelectCategory(cat.id)}
                    aria-label={`View ${cat.nameEn} dishes`}
                  >
                    {/* Subtle, elegant food-themed watermark in bottom-right corner */}
                    <div className="cat-card-watermark" aria-hidden="true">
                      <img
                        src={categoryWatermarkMap[cat.id] || '/images/menu-watermarks/sweets.svg'}
                        alt=""
                        className="cat-watermark-img"
                        loading="lazy"
                      />
                    </div>

                    <div className="cat-card-top">
                      <div className="cat-icon-bubble">
                        <IconComponent size={22} className="cat-icon" />
                      </div>
                      {cat.badge && (
                        <span className="cat-badge-tag">{cat.badge}</span>
                      )}
                    </div>

                    <div className="cat-card-body">
                      <h3 className="cat-title serif">
                        {language === 'ta' ? cat.nameTa : cat.nameEn}
                      </h3>
                      <div className="cat-subtitle">
                        {language === 'ta' ? cat.nameEn : cat.nameTa}
                      </div>
                    </div>

                    <div className="cat-card-footer">
                      <span className="cat-count">
                        {language === 'ta'
                          ? `${dishCount} உணவு வகைகள்`
                          : `${dishCount} Dishes`}
                      </span>
                      <span className="cat-action">
                        {language === 'ta' ? 'காண்க' : 'View'}
                        <ArrowRight size={14} className="cat-arrow" />
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* =========================================================================
             STATE 3: SINGLE CATEGORY DISHES VIEW (Only selected category dishes)
             ========================================================================= */
          <div className="category-detail-wrap">
            {/* Top Navigation Bar: Prominent Back Button & Quick Switcher */}
            <div className="category-nav-bar">
              <button
                type="button"
                className="category-back-btn"
                onClick={handleBackToCategories}
              >
                <ArrowLeft size={16} />
                <span>{t.menuBackToCategories}</span>
              </button>

              {/* Quick switch category pills */}
              <div className="category-quick-pills">
                {menuCategories.map((cat) => {
                  const isActive = cat.id === selectedCategoryId
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`quick-pill ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectCategory(cat.id)}
                    >
                      {language === 'ta' ? cat.nameTa : cat.nameEn}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected Category Banner Card */}
            {selectedCategory && (
              <div className="selected-category-banner">
                {/* Subtle, elegant food-themed watermark in banner */}
                <div className="banner-watermark" aria-hidden="true">
                  <img
                    src={categoryWatermarkMap[selectedCategory.id] || '/images/menu-watermarks/sweets.svg'}
                    alt=""
                    className="banner-watermark-img"
                  />
                </div>

                <div className="banner-left">
                  <div className="banner-icon-bubble">
                    {React.createElement(
                      categoryIconMap[selectedCategory.id] || Sparkles,
                      { size: 26, className: 'banner-icon' }
                    )}
                  </div>
                  <div>
                    <div className="banner-meta">
                      {selectedCategory.badge && (
                        <span className="banner-badge">{selectedCategory.badge}</span>
                      )}
                      <span className="banner-count">
                        {language === 'ta'
                          ? `${categoryDishes.length} உணவு வகைகள்`
                          : `${categoryDishes.length} Authentic Dishes`}
                      </span>
                    </div>
                    <h3 className="banner-title serif">
                      {language === 'ta'
                        ? selectedCategory.nameTa
                        : selectedCategory.nameEn}
                    </h3>
                    <p className="banner-subtitle">
                      {language === 'ta'
                        ? selectedCategory.nameEn
                        : selectedCategory.nameTa}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dishes Grid - Displaying ONLY this category's dishes */}
            <div className="category-dishes-grid">
              {categoryDishes.map((dish) => (
                <div key={dish.id} className="dish-card">
                  <div className="dish-card-main">
                    <div className="dish-indicator-wrap">
                      {/* Pure Veg Green Dot Indicator */}
                      <span className="veg-badge" title="Pure Vegetarian">
                        <span className="veg-badge-dot"></span>
                      </span>
                    </div>
                    <div className="dish-content">
                      <div className="dish-header-row">
                        <h4 className="dish-name">
                          {language === 'ta' ? dish.nameTa : dish.nameEn}
                        </h4>
                        {dish.badge && (
                          <span className="dish-tag">{dish.badge}</span>
                        )}
                      </div>
                      <div className="dish-sub">
                        {language === 'ta' ? dish.nameEn : dish.nameTa}
                      </div>
                      {(dish.descEn || dish.descTa) && (
                        <p className="dish-desc">
                          {language === 'ta'
                            ? dish.descTa || dish.descEn
                            : dish.descEn || dish.descTa}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Navigation: Back to Categories & Prev/Next */}
            <div className="category-bottom-nav">
              <button
                type="button"
                className="category-back-btn secondary"
                onClick={handleBackToCategories}
              >
                <ArrowLeft size={16} />
                <span>{t.menuBackToCategories}</span>
              </button>

              <div className="prev-next-links">
                {prevCategory && (
                  <button
                    type="button"
                    className="prev-cat-btn"
                    onClick={() => handleSelectCategory(prevCategory.id)}
                  >
                    <ArrowLeft size={14} />
                    <span>{language === 'ta' ? prevCategory.nameTa : prevCategory.nameEn}</span>
                  </button>
                )}
                {nextCategory && (
                  <button
                    type="button"
                    className="next-cat-btn"
                    onClick={() => handleSelectCategory(nextCategory.id)}
                  >
                    <span>{language === 'ta' ? nextCategory.nameTa : nextCategory.nameEn}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prospectus Note */}
        <p className="menu-note">{t.menuNote}</p>
      </div>
    </section>
  )
}
