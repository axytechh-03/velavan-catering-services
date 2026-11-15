'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { ArrowLeft, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryItemData {
  id: string
  titleEn: string
  titleTa: string
  categoryEn: string
  categoryTa: string
  url: string
  captionEn: string
  captionTa: string
  objectPosition?: string
}

export function Gallery() {
  const { language, t } = useLanguage()

  const defaultGalleryList: GalleryItemData[] = [
    {
      id: 'gal-1',
      titleEn: 'Traditional Muhurtham Virundhu & Payasam',
      titleTa: 'பாரம்பரிய முகூர்த்த விருந்து & பாயாச உபசரிப்பு',
      categoryEn: 'Wedding Virundhu',
      categoryTa: 'திருமண விருந்து',
      url: '/images/gallery/gallery-1.jpg',
      captionEn: 'Authentic South Indian wedding hospitality with rich sweet payasam served hot from traditional brass urulis.',
      captionTa: 'பாரம்பரிய முறையில் பித்தளை உருளியில் சுடச்சுட பரிமாறப்படும் முகூர்த்த பாயாச உபசரிப்பு.',
      objectPosition: 'center 35%',
    },
    {
      id: 'gal-2',
      titleEn: 'Gracious Banana Leaf Hospitality',
      titleTa: 'மனமார்ந்த தலைவாழை இலை உபசரிப்பு',
      categoryEn: 'Traditional Service',
      categoryTa: 'பாரம்பரிய சேவை',
      url: '/images/gallery/gallery-2.jpg',
      captionEn: 'Warm and thoughtful catering service honouring traditional Tamil hospitality on fresh banana leaves.',
      captionTa: 'பண்போடும் பாசத்தோடும் பரிமாறப்படும் மங்களகரமான தலைவாழை இலை விருந்தோம்பல்.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-3',
      titleEn: 'Velavan Artisanal Sweets & Dessert Buffet',
      titleTa: 'வேலவன் பாரம்பரிய நெய் பலகார அரங்கம்',
      categoryEn: 'Sweets & Desserts',
      categoryTa: 'பலகாரங்கள்',
      url: '/images/gallery/gallery-3.jpg',
      captionEn: 'Exquisite dessert counter featuring handcrafted badam halwa, rasmalai, kaju katli and authentic Indian sweets.',
      captionTa: 'தூய நெய்யில் கைவண்ணத்தில் தயாரான சுவையான பாதாம் அல்வா, ரசமலாய் மற்றும் இனிப்புகள்.',
      objectPosition: 'center 40%',
    },
    {
      id: 'gal-4',
      titleEn: 'Live Steaming Chafing Service',
      titleTa: 'நேரடி சூடான பஃபே உபசரிப்பு',
      categoryEn: 'Hot Buffet',
      categoryTa: 'சூடான பஃபே',
      url: '/images/gallery/gallery-4.jpg',
      captionEn: 'Fresh aromatic dishes served piping hot straight from burnished copper chafers by attentive staff.',
      captionTa: 'விருந்தினர்களுக்கு சுடச்சுட மணமணக்க பரிமாறப்படும் நேரடி செப்பு பஃபே உபசரிப்பு.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-5',
      titleEn: 'Royal Copper Chafing Banquet Spread',
      titleTa: 'பிரம்மாண்ட செப்பு பஃபே விருந்து',
      categoryEn: 'Grand Banquets',
      categoryTa: 'பஃபே விருந்து',
      url: '/images/gallery/gallery-5.jpg',
      captionEn: 'Magnificent banquet setup with ornate copper chafers and gourmet South Indian delicacies.',
      captionTa: 'அனைத்து சுவைகளும் நிறைந்த முழுமையான பிரம்மாண்ட பாரம்பரிய பஃபே விருந்து அரங்கம்.',
      objectPosition: 'center 45%',
    },
    {
      id: 'gal-6',
      titleEn: 'Traditional South Indian Feast Live Stalls',
      titleTa: 'பாரம்பரிய நேரடி உணவு அரங்கம்',
      categoryEn: 'Live Counters',
      categoryTa: 'நேரடி அரங்கம்',
      url: '/images/gallery/gallery-6.jpg',
      captionEn: 'Live counters featuring hot dosas, steamed idlis, fresh chutneys and sambars served with a welcoming smile.',
      captionTa: 'சுடச்சுட வாடிக்கையாளர் கண்முன்னே தயாரிக்கப்படும் தோசை மற்றும் இட்லி நேரடி அரங்கம்.',
      objectPosition: 'center 35%',
    },
    {
      id: 'gal-7',
      titleEn: 'Sacred Muhurtham Sambar Service',
      titleTa: 'மங்களகரமான முகூர்த்த சாம்பார் சேவை',
      categoryEn: 'Wedding Virundhu',
      categoryTa: 'திருமண விருந்து',
      url: '/images/gallery/gallery-7.jpg',
      captionEn: 'Authentic Kongu style sambar served hot from traditional brass buckets onto aromatic banana leaves.',
      captionTa: 'பாரம்பரிய பித்தளை வாளியில் மணமணக்க பரிமாறப்படும் அசல் திருமண சாம்பார் சேவை.',
      objectPosition: 'center 30%',
    },
    {
      id: 'gal-8',
      titleEn: 'Festive Banquet Ambience & Fine Dining',
      titleTa: 'விழா விருந்தோம்பல் & நேர்த்தியான அரங்கம்',
      categoryEn: 'Grand Celebrations',
      categoryTa: 'விழா விருந்து',
      url: '/images/gallery/gallery-8.jpg',
      captionEn: 'Elegant table settings and authentic culinary spreads designed for memorable family gatherings.',
      captionTa: 'குடும்ப விழாக்களுக்கு மெருகூட்டும் நேர்த்தியான பாரம்பரிய உணவு மற்றும் மேஜை உபசரிப்பு.',
      objectPosition: 'center center',
    },
    {
      id: 'gal-9',
      titleEn: 'Executive Modern Buffet Hospitality',
      titleTa: 'தொழில்முறை பஃபே கேட்டரிங் சேவை',
      categoryEn: 'Corporate & Receptions',
      categoryTa: 'வரவேற்பு விருந்து',
      url: '/images/gallery/gallery-9.jpg',
      captionEn: 'Professional and courteous catering staff ensuring seamless service for corporate and reception events.',
      captionTa: 'கார்ப்பரேட் மற்றும் வரவேற்பு விழாக்களுக்கு சிறப்பான முறையில் உணவு வழங்கும் தொழில்முறை குழு.',
      objectPosition: 'center 20%',
    },
  ]

  const [galleryList, setGalleryList] = useState<GalleryItemData[]>(defaultGalleryList)

  useEffect(() => {
    async function loadDynamicGallery() {
      try {
        const res = await fetch('/api/content?section=gallery')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data && json.data.length > 0) {
            setGalleryList(json.data)
          }
        }
      } catch (e) {
        // Fallback
      }
    }
    loadDynamicGallery()
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)
  const [isHovered, setIsHovered] = useState(false)
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [hasEnded, setHasEnded] = useState(false)
  const [activeItem, setActiveItem] = useState<GalleryItemData | null>(null)

  // Touch Swipe tracking
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null)

  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Responsive calculation: Desktop 3, Tablet 2, Mobile 1
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth
      if (width < 640) {
        setVisibleCount(1)
      } else if (width < 1024) {
        setVisibleCount(2)
      } else {
        setVisibleCount(3)
      }
    }
    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])

  const maxIndex = Math.max(0, galleryList.length - visibleCount)

  // Bound check when resizing
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [maxIndex, currentIndex])

  // Tab visibility listener
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Finite Autoplay logic (every 5 seconds, halts permanently when end reached)
  const startAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current)
      autoplayTimerRef.current = null
    }

    // Check reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (
      prefersReducedMotion ||
      isHovered ||
      !isTabVisible ||
      activeItem !== null ||
      hasEnded ||
      currentIndex >= maxIndex
    ) {
      return
    }

    autoplayTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1
        if (next >= maxIndex) {
          setHasEnded(true)
          if (autoplayTimerRef.current) {
            clearInterval(autoplayTimerRef.current)
            autoplayTimerRef.current = null
          }
          return maxIndex
        }
        return next
      })
    }, 5000)
  }, [isHovered, isTabVisible, activeItem, hasEnded, currentIndex, maxIndex])

  useEffect(() => {
    startAutoplay()
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current)
        autoplayTimerRef.current = null
      }
    }
  }, [startAutoplay])

  // Navigation handlers (finite non-repeating)
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setHasEnded(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      const nextIdx = currentIndex + 1
      setCurrentIndex(nextIdx)
      if (nextIdx >= maxIndex) {
        setHasEnded(true)
      }
    }
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
    if (index >= maxIndex) {
      setHasEnded(true)
    } else {
      setHasEnded(false)
    }
  }

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchCurrentX(e.touches[0].clientX)
    setIsHovered(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX !== null) {
      setTouchCurrentX(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const delta = touchCurrentX - touchStartX
      if (delta < -45 && currentIndex < maxIndex) {
        handleNext()
      } else if (delta > 45 && currentIndex > 0) {
        handlePrev()
      }
    }
    setTouchStartX(null)
    setTouchCurrentX(null)
    setIsHovered(false)
  }

  // Lightbox navigation
  const currentLightboxIndex = activeItem
    ? galleryList.findIndex((item) => item.id === activeItem.id)
    : -1

  const handleLightboxPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentLightboxIndex > 0) {
      setActiveItem(galleryList[currentLightboxIndex - 1])
    }
  }

  const handleLightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentLightboxIndex < galleryList.length - 1) {
      setActiveItem(galleryList[currentLightboxIndex + 1])
    }
  }

  // Exact step and width calculation
  const cardGap = 20
  const itemWidthCalc = `calc((100% - ${(visibleCount - 1) * cardGap}px) / ${visibleCount})`
  const stepCalc = `calc(${itemWidthCalc} + ${cardGap}px)`
  const transformStyle = `translateX(calc(-${currentIndex} * (${stepCalc})))`

  return (
    <section className="section gallery" id="gallery">
      <div className="container">
        {/* Section Head */}
        <div className="section-head reveal-up">
          <div className="eyebrow">{t.galleryEyebrow}</div>
          <h2 className="serif">{t.galleryTitle}</h2>
          <div className="gold-line center-line"></div>
          <p>{t.galleryDesc}</p>
        </div>

        {/* =========================================================================
            FINITE ANIMATED HORIZONTAL IMAGE CAROUSEL
           ========================================================================= */}
        <div
          className="carousel-container reveal-up"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ transitionDelay: '0.15s' }}
        >
          {/* Carousel Viewport Wrapper for Precise Button Alignment */}
          <div className="carousel-viewport-wrapper">
            <div className="carousel-viewport">
              <div
                className="carousel-track"
                style={{
                  transform: transformStyle,
                  gap: `${cardGap}px`,
                }}
              >
                {galleryList.map((item) => (
                  <div
                    key={item.id}
                    className="carousel-slide"
                    style={{
                      flex: `0 0 ${itemWidthCalc}`,
                      width: itemWidthCalc,
                    }}
                    onClick={() => setActiveItem(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setActiveItem(item)
                    }}
                    aria-label={`View ${item.titleEn}`}
                  >
                    <div className="carousel-card">
                      <img
                        src={item.url}
                        alt={language === 'ta' ? item.titleTa : item.titleEn}
                        className="carousel-img"
                        style={{ objectPosition: item.objectPosition || 'center' }}
                        loading="lazy"
                      />
                      <div className="carousel-overlay">
                        <span className="carousel-tag">
                          {language === 'ta' ? item.categoryTa : item.categoryEn}
                        </span>
                        <h4 className="carousel-title">
                          {language === 'ta' ? item.titleTa : item.titleEn}
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Previous and Next Navigation Buttons (Positioned Neatly Inside Boundaries) */}
            <button
              type="button"
              className="carousel-side-nav-btn prev"
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={currentIndex <= 0}
              aria-label="Previous gallery slides"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="carousel-side-nav-btn next"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={currentIndex >= maxIndex}
              aria-label="Next gallery slides"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Navigation Controls Bar */}
          <div className="carousel-controls-bar">
            {/* Left: Progress Counter */}
            <div className="carousel-counter-wrap">
              <span className="carousel-counter-current">
                {String(
                  visibleCount === 1
                    ? currentIndex + 1
                    : currentIndex === 0
                    ? 1
                    : currentIndex === maxIndex
                    ? galleryList.length
                    : Math.round(1 + (currentIndex / maxIndex) * (galleryList.length - 1))
                ).padStart(2, '0')}
              </span>
              <span className="carousel-counter-sep">/</span>
              <span className="carousel-counter-total">
                {String(galleryList.length).padStart(2, '0')}
              </span>
            </div>

            {/* Center: Pagination Dots */}
            <div className="carousel-dots-wrap" role="tablist" aria-label="Carousel pagination">
              {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => {
                const isActive = dotIdx === currentIndex
                return (
                  <button
                    key={dotIdx}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Slide group ${dotIdx + 1}`}
                    className={`carousel-dot ${isActive ? 'active' : ''}`}
                    onClick={() => handleDotClick(dotIdx)}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Gallery Note */}
        <p className="menu-note reveal-up" style={{ transitionDelay: '0.25s' }}>
          {t.galleryNote}
        </p>
      </div>

      {/* Lightbox Modal with Smooth Scale/Fade Animation */}
      {activeItem && (
        <div
          className="lightbox-overlay active"
          onClick={() => setActiveItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setActiveItem(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Lightbox Prev / Next internal controls */}
            {currentLightboxIndex > 0 && (
              <button
                type="button"
                className="lightbox-nav-btn prev"
                onClick={handleLightboxPrev}
                aria-label="Previous photograph"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {currentLightboxIndex < galleryList.length - 1 && (
              <button
                type="button"
                className="lightbox-nav-btn next"
                onClick={handleLightboxNext}
                aria-label="Next photograph"
              >
                <ChevronRight size={24} />
              </button>
            )}

            <div className="lightbox-img-wrap">
              <img
                src={activeItem.url}
                alt={language === 'ta' ? activeItem.titleTa : activeItem.titleEn}
                style={{ objectPosition: activeItem.objectPosition || 'center' }}
              />
            </div>
            <div className="lightbox-caption">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="lightbox-tag">
                  {language === 'ta' ? activeItem.categoryTa : activeItem.categoryEn}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--gold2)', letterSpacing: '1px', fontWeight: 600 }}>
                  {String(currentLightboxIndex + 1).padStart(2, '0')} / {String(galleryList.length).padStart(2, '0')}
                </span>
              </div>
              <h4>{language === 'ta' ? activeItem.titleTa : activeItem.titleEn}</h4>
              <p>{language === 'ta' ? activeItem.captionTa : activeItem.captionEn}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
