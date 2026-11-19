'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

export function Enquiry() {
  const { language, t } = useLanguage()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    event: '',
    otherEvent: '',
    date: '',
    guests: '',
    food: 'Vegetarian',
    location: '',
    notes: '',
    _hp: '',
  })

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!formData.name.trim()) {
      setErrorMsg(t.formErrorName)
      return
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg(t.formErrorPhone)
      return
    }

    if (!formData.event) {
      setErrorMsg(t.formErrorEvent)
      return
    }

    if (formData.event === 'Other' && !formData.otherEvent.trim()) {
      setErrorMsg(t.formErrorOtherEvent)
      return
    }

    if (!formData.date) {
      setErrorMsg(t.formErrorDate)
      return
    }

    if (!formData.guests || Number(formData.guests) < 1) {
      setErrorMsg(t.formErrorGuests)
      return
    }

    if (!formData.location.trim()) {
      setErrorMsg(t.formErrorLocation)
      return
    }

    setSubmitting(true)

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      event_type: formData.event,
      other_event_type: formData.event === 'Other' ? formData.otherEvent.trim() : undefined,
      guest_count: parseInt(formData.guests, 10),
      event_date: formData.date,
      location: formData.location.trim(),
      special_requests: `Food: ${formData.food}. Notes: ${formData.notes}`.trim(),
      _hp: formData._hp,
    }

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Failed to submit enquiry. Please try again.')
        return
      }

      // Backup to localStorage
      const existing = JSON.parse(localStorage.getItem('velavan_enquiries') || '[]')
      localStorage.setItem('velavan_enquiries', JSON.stringify([data.data || payload, ...existing]))
      setSuccessMsg(t.formSuccess)
      setFormData({
        name: '',
        phone: '',
        email: '',
        event: '',
        otherEvent: '',
        date: '',
        guests: '',
        food: 'Vegetarian',
        location: '',
        notes: '',
        _hp: '',
      })
    } catch (err: any) {
      console.error('[Enquiry] Submission error:', err)
      setErrorMsg('An unexpected error occurred while submitting. Please call or WhatsApp us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const getWhatsAppUrl = () => {
    const eventName = formData.event === 'Other' ? (formData.otherEvent || 'Event') : (formData.event || 'Celebration')
    const msg = language === 'ta'
      ? `வணக்கம் வேலவன் கேட்டரிங்,\n\nஎனது இல்ல விசேஷத்திற்கு கேட்டரிங் மெனு மற்றும் கட்டண விவரங்கள் தேவைப்படுகின்றன:\n\n• பெயர்: ${formData.name || '-'}\n• விசேஷம்: ${eventName}\n• தேதி: ${formData.date || '-'}\n• விருந்தினர் எண்ணிக்கை: ${formData.guests || '-'}\n• இடம்: ${formData.location || '-'}\n\nநன்றி!`
      : `Hello Velavan Catering,\n\nI would like to inquire about catering services for our upcoming event:\n\n• Name: ${formData.name || '-'}\n• Event: ${eventName}\n• Date: ${formData.date || '-'}\n• Expected Guests: ${formData.guests || '-'}\n• Location: ${formData.location || '-'}\n\nPlease share suitable menu proposals. Thank you!`
    return `https://wa.me/919080309584?text=${encodeURIComponent(msg)}`
  }

  return (
    <section className="section enquiry" id="contact">
      <div className="container enquiry-grid">
        {/* Left: Contact Points & Description */}
        <div className="enquiry-copy reveal-left">
          <div className="eyebrow">
            {t.enquiryEyebrow}
          </div>
          <h2 className="serif">
            {t.enquiryTitle}
          </h2>
          <div className="gold-line"></div>
          <p>{t.enquiryDesc}</p>

          <div className="contact-point">
            <span className="point-bullet">✦</span>
            <div>
              <b>{t.enquiryPoint1Title}</b>
              <span>{t.enquiryPoint1Desc}</span>
            </div>
          </div>
          <div className="contact-point">
            <span className="point-bullet">✦</span>
            <div>
              <b>{t.enquiryPoint2Title}</b>
              <span>{t.enquiryPoint2Desc}</span>
            </div>
          </div>
          <div className="contact-point">
            <span className="point-bullet">✦</span>
            <div>
              <b>{t.enquiryPoint3Title}</b>
              <span>{t.enquiryPoint3Desc}</span>
            </div>
          </div>

          {/* Quick WhatsApp Connect */}
          <div style={{ marginTop: '28px' }}>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{
                background: '#25D366',
                color: '#fff',
                borderColor: '#25D366',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
              }}
            >
              💬 {language === 'ta' ? 'வாட்ஸ்அப்பில் உடனடியாக பேச' : 'Chat Directly on WhatsApp'}
            </a>
          </div>
        </div>

        {/* Right: 9-Field Validated Enquiry Form + Conditional Other Field */}
        <form className="form-card reveal-right" id="enquiryForm" onSubmit={handleSubmit} noValidate>
          {/* Anti-spam honeypot (off-screen, inaccessible to humans and assistive tech) */}
          <div
            style={{
              opacity: 0,
              position: 'absolute',
              top: 0,
              left: '-9999px',
              height: 0,
              width: 0,
              zIndex: -1,
              overflow: 'hidden',
            }}
            aria-hidden="true"
          >
            <label htmlFor="website_field">Leave this empty</label>
            <input
              id="website_field"
              name="_hp"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={formData._hp}
              onChange={(e) => setFormData({ ...formData, _hp: e.target.value })}
            />
          </div>

          <h3>{t.formTitle}</h3>
          <div className="form-grid">
            {/* 1. Customer Name */}
            <div className="field full">
              <label htmlFor="name">{t.formNameLabel}</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder={t.formNamePlaceholder}
              />
            </div>

            {/* 2. Phone Number */}
            <div className="field">
              <label htmlFor="phone">{t.formPhoneLabel}</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder={t.formPhonePlaceholder}
              />
            </div>

            {/* 3. Email Address */}
            <div className="field">
              <label htmlFor="email">{t.formEmailLabel}</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t.formEmailPlaceholder}
              />
            </div>

            {/* 4. Event Type */}
            <div className="field">
              <label htmlFor="event">{t.formEventLabel}</label>
              <select
                id="event"
                name="event"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                required
              >
                <option value="">{t.formEventPlaceholder}</option>
                <option value="Wedding">
                  {language === 'ta' ? 'திருமணம் (Wedding)' : 'Wedding'}
                </option>
                <option value="Reception">
                  {language === 'ta' ? 'வரவேற்பு (Reception)' : 'Reception'}
                </option>
                <option value="Muhurtham">
                  {language === 'ta' ? 'முகூர்த்தம் (Muhurtham)' : 'Muhurtham'}
                </option>
                <option value="Engagement">
                  {language === 'ta' ? 'நிச்சயதார்த்தம் (Engagement)' : 'Engagement'}
                </option>
                <option value="Pre-Wedding">
                  {language === 'ta' ? 'சங்கீத் / நலங்கு (Pre-Wedding)' : 'Pre-Wedding'}
                </option>
                <option value="Corporate Event">
                  {language === 'ta' ? 'நிறுவன நிகழ்வு (Corporate Event)' : 'Corporate Event'}
                </option>
                <option value="Birthday Celebration">
                  {language === 'ta' ? 'பிறந்தநாள் / மணிவிழா' : 'Birthday / Milestone'}
                </option>
                <option value="Family Function">
                  {language === 'ta' ? 'குடும்ப விழா (Family Function)' : 'Family Function'}
                </option>
                <option value="Other">
                  {language === 'ta' ? 'மற்ற நிகழ்வு (Other - கீழே குறிப்பிடவும்)' : 'Other (Specify Below)'}
                </option>
              </select>
            </div>

            {/* 4B. Conditional Other Event Type Field */}
            {formData.event === 'Other' && (
              <div className="field full conditional-field">
                <label htmlFor="otherEvent">
                  {t.formOtherEventLabel}
                </label>
                <input
                  id="otherEvent"
                  name="otherEvent"
                  value={formData.otherEvent}
                  onChange={(e) => setFormData({ ...formData, otherEvent: e.target.value })}
                  required
                  placeholder={t.formOtherEventPlaceholder}
                  style={{ borderColor: 'var(--gold)', background: '#fff' }}
                  autoFocus
                />
              </div>
            )}

            {/* 5. Event Date */}
            <div className="field">
              <label htmlFor="date">{t.formDateLabel}</label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            {/* 6. Expected Guests */}
            <div className="field">
              <label htmlFor="guests">{t.formGuestsLabel}</label>
              <input
                id="guests"
                name="guests"
                type="number"
                min="1"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                required
                placeholder={t.formGuestsPlaceholder}
              />
            </div>

            {/* 7. Food Preference */}
            <div className="field">
              <label htmlFor="food">{t.formFoodLabel}</label>
              <select
                id="food"
                name="food"
                value={formData.food}
                onChange={(e) => setFormData({ ...formData, food: e.target.value })}
              >
                <option value="Vegetarian">
                  {language === 'ta' ? 'தூய சைவம் (Vegetarian)' : 'Vegetarian'}
                </option>
                <option value="Non-Vegetarian">
                  {language === 'ta' ? 'அசைவம் (Non-Vegetarian)' : 'Non-Vegetarian'}
                </option>
                <option value="Both">
                  {language === 'ta' ? 'இருவகை உணவு (Both)' : 'Both (Veg & Non-Veg)'}
                </option>
              </select>
            </div>

            {/* 8. Event Location / Venue */}
            <div className="field full">
              <label htmlFor="location">{t.formLocationLabel}</label>
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder={t.formLocationPlaceholder}
              />
            </div>

            {/* 9. Additional Requirements */}
            <div className="field full">
              <label htmlFor="notes">{t.formNotesLabel}</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t.formNotesPlaceholder}
              />
            </div>
          </div>

          <button
            className="btn"
            type="submit"
            disabled={submitting}
            style={{ width: '100%', marginTop: '16px' }}
          >
            {submitting ? t.formSubmitting : t.formSubmitBtn}
          </button>

          {/* Validation Error Message */}
          {errorMsg && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                background: '#fdf2f2',
                color: '#b83b2e',
                border: '1px solid #f8b4b4',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div
              style={{
                marginTop: '14px',
                padding: '12px 14px',
                background: '#edf7ed',
                color: '#1e4620',
                border: '1px solid #bbf7d0',
                borderRadius: '4px',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              ✓ {successMsg}
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
