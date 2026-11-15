'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export function Services() {
  const { language, t } = useLanguage()

  const servicesList = [
    {
      number: '01 / TRADITIONAL VIRUNDHU',
      titleEn: 'Wedding & Muhurtham Catering',
      titleTa: 'திருமண & முகூர்த்த விருந்து',
      tagEn: 'Traditional Tamil Banana Leaf Virundhu',
      tagTa: 'பாரம்பரிய தலைவாழை இலை விருந்து',
      descEn: 'Traditional Tamil wedding virundhu served on banana leaves, with rice, sambar, poriyal, vadai, payasam and other vegetarian dishes.',
      descTa: 'சுப முகூர்த்த மதிய வேளையில் தலைவாழை இலை போட்டு தூய நெய், பருப்பு, சாம்பார், பொரியல், கூட்டு, வடை, பாயாசத்துடன் பரிமாறப்படும் மங்களகரமான விருந்து.',
      image: '/images/services/wedding-muhurtham.jpg',
      imagePosition: 'center center',
    },
    {
      number: '02 / RECEPTION BANQUETS',
      titleEn: 'Wedding Reception Catering',
      titleTa: 'திருமண வரவேற்பு விருந்து',
      tagEn: 'Live Stalls & Grand Reception Buffets',
      tagTa: 'நேரடி கவுண்டர்கள் & வரவேற்பு பஃபே',
      descEn: 'A beautifully arranged South Indian wedding reception buffet with traditional food counters and elegant dining arrangements.',
      descTa: 'நேரடி தவா கவுண்டர்கள், சுவையான பிரியாணி வகைகள், ஸ்பெஷல் தோசைகள், நார்த் இந்தியன் கிரேவிகள் மற்றும் அருமையான டெசர்ட்களுடன் கூடிய நவீன விருந்து.',
      image: '/images/services/reception-catering.jpg',
      imagePosition: 'center center',
    },
    {
      number: '03 / AUSPICIOUS ALLIANCES',
      titleEn: 'Engagement Catering',
      titleTa: 'நிச்சயதார்த்த விருந்து',
      tagEn: 'Traditional Tamil Nichayathartham Feasts',
      tagTa: 'மங்களகரமான நிச்சயதார்த்த வைபவம்',
      descEn: 'Thoughtfully planned catering for Tamil engagements and Nichayathartham ceremonies, with auspicious welcomes, traditional sweets and celebratory feasts.',
      descTa: 'மங்களகரமான நிச்சயதார்த்தம் மற்றும் தாம்பூல மாற்றத்திற்கான பிரத்யேக வரவேற்பு பானங்கள், பாரம்பரிய இனிப்புகள் மற்றும் சுவையான விருந்து உபசரிப்பு.',
      image: '/images/services/engagement-catering.jpg',
      imagePosition: 'center 35%',
    },
    {
      number: '04 / CORPORATE HOSPITALITY',
      titleEn: 'Corporate Events',
      titleTa: 'கார்ப்பரேட் & வணிக நிகழ்வுகள்',
      tagEn: 'Professional Gatherings & Executive Dinners',
      tagTa: 'தொழில்முறை நிகழ்வுகள் & நிறுவன விருந்துகள்',
      descEn: 'Thoughtfully prepared catering for corporate meetings, office celebrations, business gatherings and professional events.',
      descTa: 'நிறுவன கூட்டங்கள், அலுவலக கொண்டாட்டங்கள், வணிக சந்திப்புகள் மற்றும் தொழில்முறை நிகழ்வுகளுக்கு நேர்த்தியாக தயாரிக்கப்படும் உணவு உபசரிப்பு.',
      image: '/images/services/corporate-events.jpg',
      imagePosition: 'center 20%',
    },
    {
      number: '05 / FAMILY CELEBRATIONS',
      titleEn: 'Birthday Celebrations & Family Functions',
      titleTa: 'பிறந்தநாள் & குடும்ப விசேஷங்கள்',
      tagEn: 'Memorable Moments & Tailored Menus',
      tagTa: 'மகிழ்ச்சியான குடும்பத் தருணங்கள்',
      descEn: 'Make every birthday and family gathering special with delicious food, customised menus and warm hospitality.',
      descTa: 'சுவையான உணவு, தனிப்பயனாக்கப்பட்ட மெனுக்கள் மற்றும் அன்பான விருந்தோம்பலுடன் ஒவ்வொரு பிறந்தநாள் மற்றும் குடும்ப விழாவையும் மறக்க முடியாததாக ஆக்குங்கள்.',
      image: '/images/services/birthday-family-functions.jpg',
      imagePosition: 'center center',
    },
    {
      number: '06 / SPECIAL OCCASIONS',
      titleEn: 'Special Events & Occasions',
      titleTa: 'சிறப்பு நிகழ்வுகள் & விசேஷங்கள்',
      tagEn: 'Traditional Flavours Tailored to You',
      tagTa: 'உங்கள் நிகழ்விற்கேற்ற பாரம்பரிய சுவை',
      descEn: "Celebrate life's special moments with carefully planned catering and traditional flavours tailored to your occasion.",
      descTa: 'வாழ்வின் சிறப்பான தருணங்களை, உங்கள் நிகழ்விற்கு ஏற்றவாறு திட்டமிடப்பட்ட பாரம்பரிய சுவைகள் மற்றும் அக்கறையான உணவு உபசரிப்புடன் கொண்டாடுங்கள்.',
      image: '/images/services/special-events-occasions.jpg',
      imagePosition: 'center center',
    },
  ]

  return (
    <section className="section services" id="services">
      <div className="container">
        <div className="section-head reveal-up">
          <div className="eyebrow">
            {t.servicesEyebrow}
          </div>
          <h2 className="serif">
            {t.servicesTitle}
          </h2>
          <div className="gold-line center-line"></div>
          <p>
            {t.servicesDesc}
          </p>
        </div>

        <div className="service-grid">
          {servicesList.map((svc, idx) => (
            <article
              key={idx}
              className="service-card reveal-up"
              style={{ transitionDelay: `${(idx % 3) * 0.12}s` }}
            >
              <div className="service-card-img-wrap">
                <img
                  src={svc.image}
                  alt={language === 'ta' ? svc.titleTa : svc.titleEn}
                  style={{ objectFit: 'cover', objectPosition: svc.imagePosition || 'center center' }}
                  loading="lazy"
                />
              </div>
              <div className="service-copy">
                <div className="service-number">{svc.number}</div>
                <h3>{language === 'ta' ? svc.titleTa : svc.titleEn}</h3>
                <div className="service-tag">
                  {language === 'ta' ? svc.tagTa : svc.tagEn}
                </div>
                <p>{language === 'ta' ? svc.descTa : svc.descEn}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
