'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { gsap, ScrollTrigger, isMotionAllowed, isTouchDevice } from '@/lib/motion/gsap'
import { X, ChevronLeft, ChevronRight, ArrowRight, ChevronUp } from 'lucide-react'

export interface GalleryItemData {
  id: string
  titleEn: string
  titleTa: string
  categoryEn: string
  categoryTa: string
  url: string
  captionEn: string
  captionTa: string
  objectPosition?: string
  isFeatured?: boolean
}

export const defaultGalleryItems: GalleryItemData[] = [
  // 5 Initial Compact View Items
  {
    id: 'gal-1',
    titleEn: 'Auspicious Banana Leaf Virundhu Hospitality',
    titleTa: 'சுப முகூர்த்த தலைவாழை இலை விருந்து உபசரிப்பு',
    categoryEn: 'Traditional Dining',
    categoryTa: 'பாரம்பரிய இலை விருந்து',
    url: '/images/gallery/traditional-banana-leaf-feast.webp',
    captionEn: 'Guests partaking in an authentic Kongu wedding feast served generously on fresh plantain leaves with pure ghee and hot delicacies.',
    captionTa: 'மங்களகரமான திருமண விழாவில் மணக்க மணக்க தூய நெய்யுடன் தலைவாழையிலையில் பரிமாறப்படும் பாரம்பரிய கொங்குநாட்டு விருந்து.',
    objectPosition: 'center 45%',
    isFeatured: true,
  },
  {
    id: 'gal-2',
    titleEn: 'Illuminated Luxury Buffet & Brass Uruli Service',
    titleTa: 'ஒளிரும் அலங்கார பஃபே & பாரம்பரிய பித்தளை உபசரிப்பு',
    categoryEn: 'Buffet & Presentation',
    categoryTa: 'பஃபே & அரங்கம்',
    url: '/images/gallery/luxury-illuminated-buffet-counter.webp',
    captionEn: 'Warmly illuminated lattice banquet counters featuring traditional brass chafing urns serving fragrant culinary creations.',
    captionTa: 'பாரம்பரிய பித்தளை பாத்திரங்களில் மணமணக்கும் சுவையான பதார்த்தங்களுடன் ஒளிரும் நவீன பஃபே அரங்கம்.',
    objectPosition: 'center 45%',
  },
  {
    id: 'gal-3',
    titleEn: 'Velavan Signature Emblem Fruit Carving',
    titleTa: 'வேலவன் தனித்துவ இலச்சினை தர்பூசணி செதுக்கல்',
    categoryEn: 'Artistic Food Display',
    categoryTa: 'கலை அலங்காரம்',
    url: '/images/gallery/velavan-signature-watermelon-carving.webp',
    captionEn: 'Hand-carved royal watermelon emblem showcasing the official Velavan Catering chef crest and executive culinary contact details.',
    captionTa: 'வேலவன் கேட்டரிங் அதிகாரப்பூர்வ இலச்சினை மற்றும் தொடர்பு எண்களுடன் கைவண்ணத்தில் உருவான நேர்த்தியான தர்பூசணி சிற்பம்.',
    objectPosition: 'center 40%',
  },
  {
    id: 'gal-4',
    titleEn: 'Live Hot Buffet Culinary Service',
    titleTa: 'சுடச்சுட நேரடி பஃபே உணவு உபசரிப்பு',
    categoryEn: 'Live Counters',
    categoryTa: 'நேரடி உபசரிப்பு',
    url: '/images/gallery/live-buffet-hot-service.webp',
    captionEn: 'Our skilled hospitality staff serving piping hot delicacies directly from heavy-gauge traditional brass vessels with genuine warmth.',
    captionTa: 'பித்தளை பாத்திரங்களிலிருந்து விருந்தினர்களுக்கு சுடச்சுட சுவையான உணவுகளை மனநிறைவோடு பரிமாறும் எங்கள் ஊழியர்கள்.',
    objectPosition: 'center 40%',
  },
  {
    id: 'gal-5',
    titleEn: 'The Complete Velavan Catering Brigade',
    titleTa: 'முழுமையான வேலவன் கேட்டரிங் குடும்பம்',
    categoryEn: 'Team & Event Atmosphere',
    categoryTa: 'எங்கள் குழு',
    url: '/images/gallery/velavan-catering-team-portrait.webp',
    captionEn: 'The proud master chefs, supervisors, banquet leads, and service specialists that make every Velavan event an unforgettable success.',
    captionTa: 'ஒவ்வொரு சுபநிகழ்ச்சியையும் சுவைமிகு வெற்றியாக மாற்றும் வேலவன் கேட்டரிங்கின் தலைமை சமையல் கலைஞர்கள் மற்றும் களப்பணியாளர்கள்.',
    objectPosition: 'center 40%',
  },
  // 6 Expanded View Items
  {
    id: 'gal-6',
    titleEn: 'Artisanal Vegetable & Fruit Carving Centerpiece',
    titleTa: 'கலைநயமிக்க காய்கறி & பழ அலங்கார அரங்கம்',
    categoryEn: 'Artistic Food Display',
    categoryTa: 'கலை அலங்காரம்',
    url: '/images/gallery/artistic-vegetable-carving-display.webp',
    captionEn: 'Magnificent banquet entrance centerpiece sculpted with peacocks, graceful swans, floral motifs, and carved watermelons.',
    captionTa: 'திருமண மண்டப வாயிலில் கண்கவர் மயில்கள், அன்னப் பறவைகள் மற்றும் பழங்களால் செதுக்கப்பட்ட கலைநயமிக்க வரவேற்பு அலங்காரம்.',
    objectPosition: 'center 50%',
  },
  {
    id: 'gal-7',
    titleEn: 'Traditional South Indian Filter Coffee Stall',
    titleTa: 'பாரம்பரிய மணக்கும் பில்டர் காபி நேரடி அரங்கம்',
    categoryEn: 'Live Counters',
    categoryTa: 'பானங்கள் & அரங்கம்',
    url: '/images/gallery/traditional-filter-coffee-counter.webp',
    captionEn: 'Freshly decocted Kumbakonam-style filter coffee brewed live with pure milk in stainless steel urns and served in brass davarah cups.',
    captionTa: 'தூய பசும்பாலில் சுடச்சுட வாடிக்கையாளர் கண்முன்னே தயாரிக்கப்படும் மணமணக்கும் கும்பகோணம் டிகிரி பில்டர் காபி அரங்கம்.',
    objectPosition: 'center 35%',
  },
  {
    id: 'gal-8',
    titleEn: 'Grand Banquet Dining Hall & Festive Hospitality',
    titleTa: 'பிரம்மாண்ட திருமண மண்டப உணவுக் கூடம்',
    categoryEn: 'Dining Experience',
    categoryTa: 'விழா அரங்கம்',
    url: '/images/gallery/grand-banquet-dining-hall.webp',
    captionEn: 'Spacious banquet hall setup with golden linens, pristine chair covers, and seamless dining hospitality for thousands of wedding guests.',
    captionTa: 'ஆயிரக்கணக்கான விருந்தினர்கள் அமர்ந்து மகிழ்ச்சியோடு உணவருந்தும் வகையில் பொன்நிற அலங்காரத்துடன் கூடிய நேர்த்தியான உணவு அரங்கம்.',
    objectPosition: 'center 45%',
  },
  {
    id: 'gal-9',
    titleEn: 'Attentive Velavan Hospitality & Guest Care',
    titleTa: 'கனிவான வேலவன் விருந்தோம்பல் & தொடர் கவனிப்பு',
    categoryEn: 'Team & Event Atmosphere',
    categoryTa: 'கனிவான உபசரிப்பு',
    url: '/images/gallery/attentive-banquet-hospitality.webp',
    captionEn: 'Attentive service staff in signature embroidered green vests overseeing guest comfort and dining satisfaction across the hall.',
    captionTa: 'வேலவன் கேட்டரிங் பிரத்யேக சீருடையில் விருந்தினர்களின் ஒவ்வொரு தேவையையும் உடனுக்குடன் கவனிக்கும் எங்கள் உபசரிப்பு ஊழியர்.',
    objectPosition: 'center 35%',
  },
  {
    id: 'gal-10',
    titleEn: 'Uniformed Service Crew & Food Hygiene Standards',
    titleTa: 'முறையான சீருடை & தூய்மையான உணவு சேவை குழு',
    categoryEn: 'Team & Event Atmosphere',
    categoryTa: 'எங்கள் குழு',
    url: '/images/gallery/professional-service-team-lineup.webp',
    captionEn: 'Disciplined service personnel equipped with hygienic caps, face masks, and spotless uniforms stationed ready for banquet service.',
    captionTa: 'தலைக்கவசம், முகக்கவசம் மற்றும் சீருடையுடன் தூய்மை நெறிமுறைகளை முழுமையாக பின்பற்றி விருந்தினர்களை வரவேற்கும் எங்கள் சிறப்புக் குழு.',
    objectPosition: 'center 40%',
  },
  {
    id: 'gal-11',
    titleEn: 'Catering Crew Banana Leaf Dining Tradition',
    titleTa: 'பாரம்பரிய இலை விருந்தில் எங்கள் கேட்டரிங் குழு',
    categoryEn: 'Dining Experience',
    categoryTa: 'பாரம்பரிய கலாச்சாரம்',
    url: '/images/gallery/catering-crew-traditional-meal.webp',
    captionEn: 'Our event culinary crew in ceremonial purple uniforms sharing a traditional South Indian banana leaf feast together.',
    captionTa: 'வேலவன் கேட்டரிங் சிறப்பு ஊதா நிற உடையில் மங்களகரமான தலைவாழை இலை விருந்தை ஒன்றாக ருசிக்கும் எங்கள் பணியாளர் குழு.',
    objectPosition: 'center 45%',
  },
]

interface GalleryCardProps {
  item: GalleryItemData
  language: string
  isFeatured?: boolean
  onClick: () => void
  priority?: boolean
}

function GalleryCard({ item, language, isFeatured = false, onClick, priority = false }: GalleryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const sheenRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice() || !isMotionAllowed()) return
    const el = cardRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const cx = rect.width / 2
    const cy = rect.height / 2

    const offsetX = (x - cx) / cx
    const offsetY = (y - cy) / cy

    const maxTilt = isFeatured ? 4 : 5.5
    const rotX = -offsetY * maxTilt
    const rotY = offsetX * maxTilt

    el.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(${isFeatured ? 8 : 5}px)`

    if (sheenRef.current) {
      const px = (x / rect.width) * 100
      const py = (y / rect.height) * 100
      sheenRef.current.style.background = `radial-gradient(circle at ${px.toFixed(1)}% ${py.toFixed(1)}%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)`
      sheenRef.current.style.opacity = '1'
    }
  }

  const handleMouseEnter = () => {
    if (isTouchDevice() || !isMotionAllowed()) return
    const el = cardRef.current
    if (el) el.style.transition = 'transform 120ms ease-out, box-shadow 300ms ease, border-color 300ms ease'
  }

  const handleMouseLeave = () => {
    const el = cardRef.current
    if (el) {
      el.style.transition = 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 450ms ease, border-color 350ms ease'
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
    }
    if (sheenRef.current) {
      sheenRef.current.style.opacity = '0'
    }
  }

  return (
    <div
      ref={cardRef}
      className={`gallery-card ${isFeatured ? 'gallery-featured-card' : 'gallery-supporting-card'}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`View photograph: ${language === 'ta' ? item.titleTa : item.titleEn}`}
    >
      <div className="gallery-card-inner">
        <img
          src={item.url}
          alt={language === 'ta' ? item.titleTa : item.titleEn}
          className="gallery-card-img"
          style={{ objectPosition: item.objectPosition || 'center' }}
          loading={priority ? 'eager' : 'lazy'}
          onError={(e) => {
            const target = e.currentTarget
            if (target.src.endsWith('.webp')) {
              target.src = target.src.replace('.webp', '.jpg')
            }
          }}
        />

        {/* Dynamic Specular Sheen Highlight */}
        <div ref={sheenRef} className="gallery-card-sheen" />

        {/* Featured Badge */}
        {isFeatured && (
          <div className="gallery-featured-badge">
            <span className="badge-sparkle">✦</span>
            <span>{language === 'ta' ? 'பிரத்யேக உபசரிப்பு' : 'Featured Experience'}</span>
          </div>
        )}

        {/* Card Overlay Content */}
        <div className="gallery-card-overlay">
          <span className="gallery-card-tag">
            {language === 'ta' ? item.categoryTa : item.categoryEn}
          </span>
          <h3 className="gallery-card-title">
            {language === 'ta' ? item.titleTa : item.titleEn}
          </h3>
          {isFeatured && (
            <p className="gallery-card-caption-teaser">
              {language === 'ta' ? item.captionTa : item.captionEn}
            </p>
          )}
          <div className="gallery-card-cta">
            <span>{language === 'ta' ? 'புகைப்படத்தைப் பார்க்க' : 'View Photograph'}</span>
            <span className="cta-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Gallery() {
  const { language, t } = useLanguage()

  const [galleryList, setGalleryList] = useState<GalleryItemData[]>(defaultGalleryItems)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeItem, setActiveItem] = useState<GalleryItemData | null>(null)

  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const compactGridRef = useRef<HTMLDivElement>(null)
  const expandedGridRef = useRef<HTMLDivElement>(null)
  const exploreBtnRef = useRef<HTMLDivElement>(null)

  // Load dynamic gallery items if available and complete
  useEffect(() => {
    async function loadDynamicGallery() {
      try {
        const res = await fetch('/api/content?section=gallery')
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.data) && json.data.length >= 5) {
            setGalleryList(json.data)
          }
        }
      } catch (e) {
        // Fallback silently to defaultGalleryItems
      }
    }
    loadDynamicGallery()
  }, [])

  // 5 Initial Compact View items
  const featuredItem = galleryList[0] || defaultGalleryItems[0]
  const supportingItems = galleryList.slice(1, 5)

  // Remaining 6 items for Expanded view
  const expandedItems = galleryList.slice(5)

  // Scroll reveal entrance using GSAP ScrollTrigger
  useEffect(() => {
    if (!isMotionAllowed() || !sectionRef.current) return

    const ctx = gsap.context(() => {
      // Header reveal
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          y: 25,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
          },
        })
      }

      // Compact grid reveal
      if (compactGridRef.current) {
        const featuredCard = compactGridRef.current.querySelector('.gallery-featured-card')
        const supportingCards = compactGridRef.current.querySelectorAll('.gallery-supporting-card')

        if (featuredCard) {
          gsap.from(featuredCard, {
            x: -30,
            opacity: 0,
            scale: 0.97,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: compactGridRef.current,
              start: 'top 80%',
            },
          })
        }

        if (supportingCards.length > 0) {
          gsap.from(supportingCards, {
            y: 25,
            opacity: 0,
            scale: 0.97,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: compactGridRef.current,
              start: 'top 80%',
            },
          })
        }
      }

      // Explore button reveal
      if (exploreBtnRef.current) {
        gsap.from(exploreBtnRef.current, {
          y: 18,
          opacity: 0,
          duration: 0.65,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: exploreBtnRef.current,
            start: 'top 92%',
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Toggle expanded full gallery with smooth transition
  const handleToggleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      setTimeout(() => {
        if (expandedGridRef.current && isMotionAllowed()) {
          const cards = expandedGridRef.current.querySelectorAll('.gallery-card')
          gsap.fromTo(
            cards,
            { y: 30, opacity: 0, scale: 0.97 },
            { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' }
          )
        }
      }, 50)
    } else {
      setIsExpanded(false)
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        if (rect.top < -50) {
          sectionRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  // Lightbox index navigation across all items
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

  // Keyboard navigation & body scroll lock for Lightbox
  useEffect(() => {
    if (!activeItem) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveItem(null)
      } else if (e.key === 'ArrowLeft' && currentLightboxIndex > 0) {
        setActiveItem(galleryList[currentLightboxIndex - 1])
      } else if (e.key === 'ArrowRight' && currentLightboxIndex < galleryList.length - 1) {
        setActiveItem(galleryList[currentLightboxIndex + 1])
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeItem, currentLightboxIndex, galleryList])

  return (
    <section ref={sectionRef} className="section gallery" id="gallery">
      <div className="container">
        {/* Native Section Heading — Matches Menu, Services, Story */}
        <div ref={headerRef} className="section-head reveal-up">
          <div className="eyebrow">{t.galleryEyebrow}</div>
          <h2 className="serif">{t.galleryTitle}</h2>
          <div className="gold-line center-line"></div>
          <p>{t.galleryDesc}</p>
        </div>

        {/* Compact Initial 5-Image Asymmetric Grid */}
        <div ref={compactGridRef} className="gallery-compact-grid">
          {/* Left Large Featured Image */}
          <GalleryCard
            item={featuredItem}
            language={language}
            isFeatured={true}
            onClick={() => setActiveItem(featuredItem)}
            priority={true}
          />

          {/* Right 4 Supporting Images in 2x2 Grid */}
          <div className="gallery-supporting-grid">
            {supportingItems.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                language={language}
                isFeatured={false}
                onClick={() => setActiveItem(item)}
              />
            ))}
          </div>
        </div>

        {/* Expanded 6 Additional Images */}
        {isExpanded && (
          <div ref={expandedGridRef} className="gallery-expanded-wrap">
            <div className="gallery-expanded-grid">
              {expandedItems.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  language={language}
                  isFeatured={false}
                  onClick={() => setActiveItem(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Explore Full Gallery / Show Less Button */}
        {expandedItems.length > 0 && (
          <div ref={exploreBtnRef} className="gallery-explore-wrap">
            <button
              type="button"
              className={`btn btn-dark gallery-explore-btn ${isExpanded ? 'expanded' : ''}`}
              onClick={handleToggleExpand}
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? t.galleryShowLessBtn : t.galleryExploreBtn}</span>
              {isExpanded ? <ChevronUp size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeItem && (
        <div
          className="gallery-lightbox-overlay active"
          onClick={() => setActiveItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={language === 'ta' ? activeItem.titleTa : activeItem.titleEn}
        >
          <div className="gallery-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              type="button"
              className="gallery-lightbox-close"
              onClick={() => setActiveItem(null)}
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>

            {/* Previous Navigation */}
            {currentLightboxIndex > 0 && (
              <button
                type="button"
                className="gallery-lightbox-nav-btn prev"
                onClick={handleLightboxPrev}
                aria-label="Previous photograph"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Next Navigation */}
            {currentLightboxIndex < galleryList.length - 1 && (
              <button
                type="button"
                className="gallery-lightbox-nav-btn next"
                onClick={handleLightboxNext}
                aria-label="Next photograph"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Lightbox Image Container */}
            <div className="gallery-lightbox-img-wrap">
              <img
                src={activeItem.url}
                alt={language === 'ta' ? activeItem.titleTa : activeItem.titleEn}
                style={{ objectPosition: activeItem.objectPosition || 'center' }}
                onError={(e) => {
                  const target = e.currentTarget
                  if (target.src.endsWith('.webp')) {
                    target.src = target.src.replace('.webp', '.jpg')
                  }
                }}
              />
            </div>

            {/* Lightbox Caption & Meta */}
            <div className="gallery-lightbox-caption">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="gallery-lightbox-tag">
                  {language === 'ta' ? activeItem.categoryTa : activeItem.categoryEn}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--gold-dark)', letterSpacing: '1px', fontWeight: 600 }}>
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
