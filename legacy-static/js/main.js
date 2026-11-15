/**
 * Velavan Catering Services - Main Application Controller
 * Coordinates dual-language toggling (English & Tamil), sticky header, mobile navigation,
 * enquiry form validation, gallery lightbox, WhatsApp integration, and toast notifications.
 */

window.currentLanguage = localStorage.getItem("velavan_lang") || "en";
let currentLightboxIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

/**
 * Initialize application modules
 */
function initApp() {
  // 1. Language Setup
  applyLanguage(window.currentLanguage);

  // 2. Initialize Menu
  if (typeof switchMenuType === "function") {
    switchMenuType("veg");
  }

  // 3. Initialize Public Gallery
  renderPublicGallery();

  // 4. Update Footer Contact Information
  updateContactDisplay();

  // 5. Setup Form Listeners
  setupEnquiryForm();

  // 6. Setup Navigation & Scroll Listeners
  setupNavigation();

  // 7. Setup Modal & Keyboard Handlers
  setupModalsAndKeys();

  // 8. Set Current Year in Footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ==========================================================================
   LANGUAGE TOGGLING (ENGLISH & TAMIL)
   ========================================================================== */
function toggleLanguage() {
  window.currentLanguage = window.currentLanguage === "en" ? "ta" : "en";
  localStorage.setItem("velavan_lang", window.currentLanguage);
  applyLanguage(window.currentLanguage);
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.body.classList.toggle("tamil", lang === "ta");

  // Update elements with data-en / data-ta
  document.querySelectorAll("[data-en]").forEach(el => {
    const text = el.dataset[lang];
    if (text !== undefined) {
      el.innerHTML = text;
    }
  });

  // Update language toggle buttons
  const langToggleBtn = document.getElementById("languageToggle");
  if (langToggleBtn) {
    langToggleBtn.textContent = lang === "en" ? "தமிழ்" : "English";
  }

  const mobileLangBtn = document.getElementById("mobileLanguageToggle");
  if (mobileLangBtn) {
    mobileLangBtn.textContent = lang === "en" ? "தமிழ் பதிப்பிற்கு மாற" : "Switch to English";
  }

  // Update form inputs and placeholders
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  updateFormPlaceholders(t);

  // Re-draw Menu with active language
  if (typeof populateCategoryControls === "function" && typeof drawMenu === "function") {
    populateCategoryControls();
    drawMenu();
  }

  // Re-render Gallery labels
  renderPublicGallery();

  // Update Footer contact texts
  updateContactDisplay();
}

function updateFormPlaceholders(t) {
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const guestsInput = document.getElementById("guests");
  const locationInput = document.getElementById("location");
  const notesInput = document.getElementById("notes");
  const searchInput = document.getElementById("menuSearch");

  if (nameInput) nameInput.placeholder = t.formNamePlaceholder;
  if (phoneInput) phoneInput.placeholder = t.formPhonePlaceholder;
  if (emailInput) emailInput.placeholder = t.formEmailPlaceholder;
  if (guestsInput) guestsInput.placeholder = t.formGuestsPlaceholder;
  if (locationInput) locationInput.placeholder = t.formLocationPlaceholder;
  if (notesInput) notesInput.placeholder = t.formNotesPlaceholder;
  if (searchInput) searchInput.placeholder = t.menuSearchPlaceholder;
}

/* ==========================================================================
   PUBLIC GALLERY & LIGHTBOX
   ========================================================================== */
function renderPublicGallery() {
  const container = document.getElementById("galleryGrid");
  if (!container) return;

  const photos = typeof getStoredGallery === "function" ? getStoredGallery() : DEFAULT_GALLERY_DATA;
  const lang = window.currentLanguage || "en";

  container.innerHTML = photos.map((photo, index) => {
    const title = lang === "ta" ? (photo.titleTa || photo.title) : photo.title;
    const category = lang === "ta" ? (photo.categoryTa || photo.category) : photo.category;
    const fallback = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85";

    return `
      <div class="gallery-item" onclick="openLightbox(${index})" tabindex="0" role="button" aria-label="View ${escapeHtml(title)}">
        <img loading="lazy" src="${escapeHtml(photo.url || fallback)}" alt="${escapeHtml(title)}" onerror="this.onerror=null;this.src='${fallback}';">
        <div class="gallery-overlay">
          <span class="gallery-tag">${escapeHtml(category)}</span>
          <h3 class="gallery-label">${escapeHtml(title)}</h3>
        </div>
      </div>
    `;
  }).join("");
}

function openLightbox(index) {
  const photos = typeof getStoredGallery === "function" ? getStoredGallery() : DEFAULT_GALLERY_DATA;
  if (!photos || !photos[index]) return;

  currentLightboxIndex = index;
  const photo = photos[index];
  const lang = window.currentLanguage || "en";
  const title = lang === "ta" ? (photo.titleTa || photo.title) : photo.title;
  const category = lang === "ta" ? (photo.categoryTa || photo.category) : photo.category;
  const caption = lang === "ta" ? (photo.captionTa || photo.caption) : photo.caption;

  const lightbox = document.getElementById("galleryLightbox");
  const imgEl = document.getElementById("lightboxImg");
  const titleEl = document.getElementById("lightboxTitle");
  const tagEl = document.getElementById("lightboxTag");
  const descEl = document.getElementById("lightboxDesc");

  if (imgEl) imgEl.src = photo.url;
  if (titleEl) titleEl.textContent = title;
  if (tagEl) tagEl.textContent = category;
  if (descEl) descEl.textContent = caption || "";

  if (lightbox) {
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeLightbox() {
  const lightbox = document.getElementById("galleryLightbox");
  if (lightbox) {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function nextLightbox() {
  const photos = typeof getStoredGallery === "function" ? getStoredGallery() : DEFAULT_GALLERY_DATA;
  if (!photos.length) return;
  const nextIdx = (currentLightboxIndex + 1) % photos.length;
  openLightbox(nextIdx);
}

function prevLightbox() {
  const photos = typeof getStoredGallery === "function" ? getStoredGallery() : DEFAULT_GALLERY_DATA;
  if (!photos.length) return;
  const prevIdx = (currentLightboxIndex - 1 + photos.length) % photos.length;
  openLightbox(prevIdx);
}

/* ==========================================================================
   ENQUIRY FORM VALIDATION & LOCALSTORAGE PERSISTENCE
   ========================================================================== */
function setupEnquiryForm() {
  const form = document.getElementById("enquiryForm");
  if (!form) return;

  // Set minimum date to today
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const lang = window.currentLanguage || "en";
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

    // Reset previous errors
    form.querySelectorAll(".field").forEach(f => f.classList.remove("has-error"));
    const statusEl = document.getElementById("formStatus");
    if (statusEl) {
      statusEl.className = "form-status";
      statusEl.textContent = "";
    }

    // Collect values
    const name = (form.name.value || "").trim();
    const phone = (form.phone.value || "").trim();
    const email = (form.email.value || "").trim();
    const eventType = form.event.value;
    const date = form.date.value;
    const guests = form.guests.value;
    const food = form.food.value;
    const location = (form.location.value || "").trim();
    const notes = (form.notes.value || "").trim();

    // Validation checks
    let hasError = false;

    // Name validation
    if (!name || name.length < 2) {
      showFieldError("name", t.formErrorName);
      hasError = true;
    }

    // Phone validation (relaxed international + Indian format: min 10 digits)
    const phoneDigits = phone.replace(/\D/g, "");
    if (!phone || phoneDigits.length < 10) {
      showFieldError("phone", t.formErrorPhone);
      hasError = true;
    }

    // Email validation (if provided)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFieldError("email", t.formErrorEmail);
        hasError = true;
      }
    }

    // Event type validation
    if (!eventType) {
      showFieldError("event", t.formErrorEvent);
      hasError = true;
    }

    // Date validation
    if (date) {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        showFieldError("date", t.formErrorDate);
        hasError = true;
      }
    }

    // Guests validation
    if (!guests || parseInt(guests, 10) <= 0) {
      showFieldError("guests", t.formErrorGuests);
      hasError = true;
    }

    // Location validation
    if (!location) {
      showFieldError("location", t.formErrorLocation);
      hasError = true;
    }

    if (hasError) {
      showToast(lang === "ta" ? "தயவுசெய்து தேவையான அனைத்து விவரங்களையும் சரியாக நிரப்பவும்." : "Please correct the highlighted fields.");
      return;
    }

    // Save Enquiry
    const newEnquiry = {
      id: Date.now(),
      name,
      phone,
      email: email || "—",
      event: eventType,
      date: date || "—",
      guests: parseInt(guests, 10),
      food,
      location,
      notes: notes || "—",
      status: "New",
      created: new Date().toLocaleString()
    };

    const storedEnquiries = typeof getStoredEnquiries === "function" ? getStoredEnquiries() : [];
    storedEnquiries.unshift(newEnquiry);

    if (typeof saveStoredEnquiries === "function") {
      saveStoredEnquiries(storedEnquiries);
    }

    // Feedback
    if (statusEl) {
      statusEl.className = "form-status success";
      statusEl.textContent = t.formSuccess;
    }

    showToast(lang === "ta" ? "உங்கள் விசாரணை மாதிரி பதிவேட்டில் சேமிக்கப்பட்டது!" : "Enquiry saved in browser prototype!");
    form.reset();

    // Reset date min
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.min = today;
    }
  });
}

function showFieldError(fieldId, errorMsg) {
  const inputEl = document.getElementById(fieldId);
  if (!inputEl) return;
  const parentField = inputEl.closest(".field");
  if (parentField) {
    parentField.classList.add("has-error");
    let errorSpan = parentField.querySelector(".field-error-msg");
    if (!errorSpan) {
      errorSpan = document.createElement("div");
      errorSpan.className = "field-error-msg";
      parentField.appendChild(errorSpan);
    }
    errorSpan.textContent = errorMsg;
  }
}

/* ==========================================================================
   WHATSAPP INTEGRATION
   ========================================================================== */
function openWhatsApp() {
  const config = typeof getStoredConfig === "function" ? getStoredConfig() : VELAVAN_DEFAULT_CONFIG;
  const phone = (config.whatsappPhone || "").replace(/\D/g, "");
  const lang = window.currentLanguage || "en";
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const msg = lang === "ta"
    ? "வணக்கம் வேலவன் கேட்டரிங் சர்வீசஸ், எனது விழாவிற்கான கேட்டரிங் விவரங்களை அறிய விரும்புகிறேன்."
    : "Hello Velavan Catering Services, I would like to enquire about catering arrangements for an upcoming celebration.";

  if (!phone || phone.length < 10) {
    showToast(t.whatsappDemoMsg);
    // Open settings tab in admin to configure
    openAdmin();
    switchAdminTab("settings");
    return;
  }

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

/* ==========================================================================
   NAVIGATION, STICKY HEADER & MOBILE DRAWER
   ========================================================================== */
function setupNavigation() {
  const header = document.querySelector(".header");
  const mobileMenu = document.getElementById("mobileMenu");

  // Sticky header shadow on scroll
  window.addEventListener("scroll", () => {
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 30);
    }
  }, { passive: true });

  // Close mobile menu on click of nav items
  document.querySelectorAll("#mobileMenu a").forEach(link => {
    link.addEventListener("click", () => {
      if (mobileMenu) mobileMenu.classList.remove("show");
    });
  });
}

function toggleMobile() {
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu) {
    mobileMenu.classList.toggle("show");
  }
}

/* ==========================================================================
   FOOTER CONTACT UPDATE
   ========================================================================== */
function updateContactDisplay() {
  const config = typeof getStoredConfig === "function" ? getStoredConfig() : VELAVAN_DEFAULT_CONFIG;
  const lang = window.currentLanguage || "en";

  const phoneEl = document.getElementById("footerPhone");
  const emailEl = document.getElementById("footerEmail");
  const addrEl = document.getElementById("footerAddress");

  if (phoneEl) {
    phoneEl.textContent = config.phone || "+91 98400 12345";
    phoneEl.href = `tel:${config.phone || "+919840012345"}`;
  }
  if (emailEl) {
    emailEl.textContent = config.email || "enquiry@velavancatering.com";
    emailEl.href = `mailto:${config.email || "enquiry@velavancatering.com"}`;
  }
  if (addrEl) {
    addrEl.textContent = lang === "ta" ? (config.addressTa || config.address) : config.address;
  }
}

/* ==========================================================================
   MODAL & KEYBOARD LISTENERS
   ========================================================================== */
function setupModalsAndKeys() {
  // ESC key to dismiss modals
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeAdmin();
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      const lightbox = document.getElementById("galleryLightbox");
      if (lightbox && lightbox.classList.contains("open")) {
        nextLightbox();
      }
    } else if (e.key === "ArrowLeft") {
      const lightbox = document.getElementById("galleryLightbox");
      if (lightbox && lightbox.classList.contains("open")) {
        prevLightbox();
      }
    }
  });

  // Admin backdrop click
  const adminModal = document.getElementById("adminModal");
  if (adminModal) {
    adminModal.addEventListener("click", e => {
      if (e.target.id === "adminModal") {
        closeAdmin();
      }
    });
  }

  // Lightbox backdrop click
  const lightbox = document.getElementById("galleryLightbox");
  if (lightbox) {
    lightbox.addEventListener("click", e => {
      if (e.target.id === "galleryLightbox") {
        closeLightbox();
      }
    });
  }
}

/* ==========================================================================
   TOAST NOTIFICATION ENGINE
   ========================================================================== */
let toastTimeout;
function showToast(message, duration = 3200) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>✦</span> <div>${escapeHtml(message)}</div>`;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}
