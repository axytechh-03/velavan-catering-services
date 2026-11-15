# Velavan Catering Services – Next.js, React and TypeScript Website

<p align="center">
  <img src="public/images/logo/logo.png" alt="Velavan Catering Services Logo" width="130" />
</p>

<p align="center">
  <strong>A Premium Next.js, React and TypeScript Web Application | Coimbatore, Tamil Nadu</strong>
</p>

<p align="center">
  A high-performance, fully bilingual (English & Tamil) enterprise catering application built with <strong>Next.js 14 (App Router)</strong>, <strong>React 18</strong>, and <strong>TypeScript 5</strong>, featuring an interactive 14-category menu catalog, 9-photo celebration gallery carousel, customer enquiry CRM, and a comprehensive standalone administration panel.
</p>

---

## 1. Project Overview

**Velavan Catering Services** (`வேலவன் கேட்டரிங் சர்வீஸ்`) is a premier catering enterprise based in Chettipalayam, Coimbatore, Tamil Nadu, specializing in traditional Tamil banana leaf wedding banquets (*Muhurtham Virundhu*), grand reception banquets, engagement ceremonies, and corporate hospitality.

This web application is built strictly as a **modern React and TypeScript application** powered by **Next.js App Router**, featuring:
- **Zero-flicker bilingual support** between English and தமிழ் (Tamil) across all content and menu items.
- **Dynamic 14-category menu catalog** with 151+ prospectus dishes and subtle food-themed decorative vector watermarks.
- **Moments & Memories gallery** with a finite, non-repeating 9-photo slide carousel and fullscreen lightbox.
- **Standalone Administration Panel & CMS** (`/admin` & `/admin/dashboard/*`) completely isolated from the public layout, providing real-time management for bookings, menu items, services, gallery photos, and website copy.
- **Hybrid database layer** featuring local persistent storage with seamless cloud synchronization via Supabase PostgreSQL.

---

## 2. Technology Stack & Architecture

| Technology | Role | Purpose & Implementation |
| :--- | :--- | :--- |
| **Next.js 14** | Application Framework | App Router architecture, Server Components, Route Handlers (`/api/*`), Static Generation, and dynamic routing |
| **React 18** | UI Library | Functional components, custom hooks, Client Components (`'use client'`), and dynamic UI state |
| **TypeScript 5** | Language | Strict type safety across all 57 source files (`.tsx` components and `.ts` logic/types) |
| **Vanilla CSS & Tailwind** | Styling & Theme | Custom royal green (`#153d2d`), warm ivory (`#faf8f1`), and muted gold (`#c4a365`) luxury design system (`app/globals.css`) |
| **Lucide React** | Iconography | Accessible, lightweight SVG icon system for UI controls and administration panel |
| **Framer Motion** | Animations | Smooth entrance transitions, brand loader, and scroll-linked observers |
| **Supabase Client** | Database / Backend | Cloud PostgreSQL client for customer enquiries and content storage with zero-crash local JSON fallback |
| **HTTP-Only Cookies** | Security | Cryptographically secure administrative session verification (`velavan_admin_token`) |

---

## 3. Actual Project Folder Structure

```text
velavan-catering-services/
├── app/
│   ├── admin/                              # Standalone Admin Portal
│   │   ├── dashboard/                      # Authenticated Admin Dashboard Layout & Pages
│   │   │   ├── clients/page.tsx            # Partner convention centers & mandapams CMS
│   │   │   ├── compliance/page.tsx         # MSME Udyam & FSSAI State License records CMS
│   │   │   ├── contact/page.tsx            # Phone lines, email, and bilingual address CMS
│   │   │   ├── content/page.tsx            # Hero, Our Story & Jayanthi Tribute copy CMS
│   │   │   ├── enquiries/page.tsx          # Full customer booking CRM, notes & CSV export
│   │   │   ├── gallery/page.tsx            # 9 Moments & Memories celebration photographs CMS
│   │   │   ├── layout.tsx                  # Standalone Admin Left Sidebar & Top Toolbar
│   │   │   ├── menu/page.tsx               # 14 Categories & 151+ dishes bilingual CMS
│   │   │   ├── page.tsx                    # Executive Dashboard Overview with 7 KPI cards
│   │   │   ├── services/page.tsx           # 6 Core celebration service cards CMS
│   │   │   └── settings/page.tsx           # Password rotation, storage health & JSON backup
│   │   ├── layout.tsx                      # Root admin layout wrapper (noindex, nofollow)
│   │   └── page.tsx                        # Standalone branded administrator login screen
│   ├── api/                                # Next.js Dynamic Route Handlers
│   │   ├── admin/
│   │   │   ├── check/route.ts              # Session cookie verification
│   │   │   ├── clients/route.ts            # Client venue partners CRUD
│   │   │   ├── content/route.ts            # Website copy content update handler
│   │   │   ├── enquiries/route.ts          # Customer enquiries status & internal notes handler
│   │   │   ├── gallery/route.ts            # Gallery photo captions & toggles CRUD
│   │   │   ├── login/route.ts              # Secure HTTP-only session cookie authentication
│   │   │   ├── logout/route.ts             # Session termination handler
│   │   │   ├── menu/route.ts               # Dishes & categories management CRUD
│   │   │   ├── services/route.ts           # Service cards update handler
│   │   │   ├── settings/route.ts           # Password rotation & cache revalidator
│   │   │   └── stats/route.ts              # Dashboard KPI counters & event distribution
│   │   ├── content/route.ts                # High-speed public dynamic content feed
│   │   └── enquiry/route.ts                # Public booking form submission gateway
│   ├── globals.css                         # Brand design tokens, luxury typography, responsive rules
│   ├── layout.tsx                          # Root application layout with LanguageProvider & AppShell
│   └── page.tsx                            # Public homepage composition
├── components/                             # Reusable React (TSX) Components
│   ├── common/
│   │   ├── BrandLoader.tsx                 # Official Velavan crest loading animation
│   │   └── ScrollAnimationProvider.tsx     # Intersection observer for scroll-triggered reveals
│   ├── layout/
│   │   ├── AppShell.tsx                    # Layout isolation: separates public chrome from admin routes
│   │   ├── Footer.tsx                      # Public footer, contact details, dynamic CMS sync
│   │   ├── Header.tsx                      # Sticky public header with navigation & CTA
│   │   ├── LanguageToggle.tsx              # Bilingual English / தமிழ் switcher
│   │   └── TopBar.tsx                      # Top announcement ticker with phone & license info
│   └── sections/
│       ├── Clients.tsx                     # Partner mandapams and convention centres
│       ├── Enquiry.tsx                     # 9-field booking form with WhatsApp connect
│       ├── Gallery.tsx                     # Finite carousel with in-boundary controls & lightbox
│       ├── Hero.tsx                        # Luxury hero banner with primary booking CTAs
│       ├── MenuSection.tsx                 # 14-category menu catalog with search & watermarks
│       ├── PromiseStrip.tsx                # Brand values marquee strip
│       ├── Registrations.tsx               # MSME Udyam and FSSAI statutory trust cards
│       ├── Services.tsx                    # 6 Core celebration service offerings
│       ├── Story.tsx                       # Culinary heritage narrative
│       ├── Tribute.tsx                     # Founder Jayanthi memorial tribute
│       └── Values.tsx                      # Pillars of pure vegetarian hospitality
├── context/
│   └── LanguageContext.tsx                 # Global bilingual state management (`en` / `ta`)
├── data/
│   ├── cms-data.json                       # Seeded, high-speed atomic JSON persistence store
│   ├── gallery.ts                          # Static fallback gallery photography data
│   ├── menu.ts                             # Static fallback 14-category menu dataset (151+ dishes)
│   ├── services.ts                         # Static fallback service packages and capacities
│   └── translations.ts                     # Comprehensive English & Tamil translation dictionary
├── lib/
│   ├── admin-auth.ts                       # Server-side HTTP-only session cookie verification
│   ├── cms-store.ts                        # Unified data layer (dual JSON / Supabase PostgreSQL sync)
│   ├── supabase.ts                         # Supabase database client configuration
│   └── utils.ts                            # Class name merging and string utility helpers
├── public/
│   ├── favicon.ico
│   ├── icon-192.png
│   └── images/
│       ├── founder/                        # Founder portrait photography
│       ├── gallery/                        # 9 Celebration photographs (gallery-1.jpg - gallery-9.jpg)
│       ├── hero/                           # Hero background photography
│       ├── logo/                           # Official Velavan brand crest and transparent logos
│       ├── menu-watermarks/                # 14 Subtle category-specific SVG watermarks (8% opacity)
│       └── services/                       # 6 Core celebration service photographs
├── supabase/
│   └── migrations/                         # Production SQL migrations with RLS policies
│       ├── 001_initial_schema.sql
│       └── 002_cms_schema.sql
├── .gitattributes                          # GitHub Linguist language detection overrides
├── .gitignore                              # Production exclusions for caches, build artifacts & secrets
├── netlify.toml                            # Netlify deployment configuration
├── next.config.mjs                         # Next.js compiler and image configuration
├── package.json                            # Package dependencies and run scripts
├── postcss.config.js                       # PostCSS configuration
├── tailwind.config.ts                      # Tailwind styling configuration
└── tsconfig.json                           # Strict TypeScript compiler options
```

---

## 4. Key Website Features & Functionality

### 1. Luxury Public Experience (`http://localhost:3000`)
- **Brand Hero Banner:** Celebratory photography, chef emblem, brand promises, and immediate booking CTAs (*Explore Menu* and *Enquire Now*).
- **Heritage & Story:** Detailed narrative honoring authentic Kongu Nadu and Tamil Nadu culinary customs.
- **Founder Tribute:** Dedicated memorial tribute honoring founder Jayanthi's values of selfless hospitality.
- **6 Core Celebration Services:**
  1. *Wedding & Muhurtham Catering (`திருமண & முகூர்த்த விருந்து`)* — Traditional banana leaf virundhu.
  2. *Wedding Reception Catering (`திருமண வரவேற்பு விருந்து`)* — Live tawa counters and banquets.
  3. *Engagement Catering (`நிச்சயதார்த்த விருந்து`)* — Nichayathartham and Thamboolam celebrations.
  4. *Corporate Events (`கார்ப்பரேட் & வணிக நிகழ்வுகள்`)* — Executive lunches and annual conferences.
  5. *Birthday & Family Functions (`பிறந்தநாள் & குடும்ப விசேஷங்கள்`)* — Milestone family feasts.
  6. *Special Events & Occasions (`சிறப்பு நிகழ்வுகள் & விசேஷங்கள்`)* — Housewarmings and celebrations.
- **Interactive 14-Category Menu Catalog:**
  - 14 distinct categories: *Sweets, Soups, Welcome Drinks, Idli & Morning Tiffin, Crispy Dosas, Biryanis, Starters, Rotis & Breads, Gravies & Curries, Chutneys & Sambars, Rice & Rasam, Payasam & Desserts, Lunch Vegetables, and Beverages & Paan.*
  - Subtle, transparent food-themed background watermarks tailored to each category (5–8% opacity).
  - Real-time bilingual search matching dish titles in both English and Tamil.
  - Category drilldown with active filters, veg badges, and dish count indicators.
- **Moments & Memories Gallery Carousel:**
  - Finite 9-photograph slide carousel with disabled boundary buttons at index 1 and 9.
  - Touch-swipe support on mobile and tablet devices.
  - High-resolution fullscreen lightbox with bilingual captions.
- **Customer Booking & WhatsApp Gateway:**
  - 9-field booking form with real-time field validation.
  - Instant WhatsApp direct booking connector to `+91 90803 09584`.
- **Statutory Trust Credentials:**
  - **MSME Udyam Registration:** `UDYAM-TN-03-0341714` (Micro Enterprise, Event Catering 56210).
  - **FSSAI Food Safety State License:** `12426003001273` (Licensed & Active).

---

## 5. Standalone Administration Panel & CMS (`/admin`)

The administration panel is a completely standalone business management application:
- **Decoupled Architecture:** Through `components/layout/AppShell.tsx`, all public navigation bars, top bars, and footers are eliminated from admin routes.
- **Branded Administrator Login (`/admin`):**
  - Secure authentication checking against hashed credentials or environment variables.
  - Password recovery instructions modal.
  - Sets HTTP-Only secure session cookie `velavan_admin_token`.
- **Executive Dashboard Hub (`/admin/dashboard`):**
  - **7 Summary Metric Cards** with live database counts: Total Enquiries, New Enquiries, Pending Enquiries, Confirmed Enquiries, Menu Categories, Total Dishes, and Gallery Images.
  - **Quick Action Shortcuts:** Direct buttons to Add Dishes, Upload Photos, Add Services, and View Enquiries.
  - **Enquiry Activity Breakdown:** Visual distribution bars by event type.
  - **Recent Enquiries Table:** Customer records with quick status selectors and full **Customer Booking Dossier Modal** (Call, WhatsApp, Email, and Internal Notes).
- **Dedicated Management Modules:**
  - **Menu CMS (`/admin/dashboard/menu`):** Bilingual dish names, descriptions, categories, and active toggles.
  - **Services CMS (`/admin/dashboard/services`):** Service card headings, guest capacities, and leaf styles.
  - **Gallery CMS (`/admin/dashboard/gallery`):** 9 celebration photos, captions, and lightbox previews.
  - **Clients CMS (`/admin/dashboard/clients`):** Partner mandapams and convention venues.
  - **Website Content CMS (`/admin/dashboard/content`):** Hero, Story, and Tribute narrative editor.
  - **Contact Details CMS (`/admin/dashboard/contact`):** Telephone lines, WhatsApp number, email, and bilingual addresses with live footer preview.
  - **Compliance & Food Safety CMS (`/admin/dashboard/compliance`):** Government of India MSME Udyam and FSSAI statutory licenses editor.
  - **Settings & Health (`/admin/dashboard/settings`):** Password rotation, storage health, and JSON data backup snapshot download.

---

## 6. Installation & Development

### Prerequisites
- **Node.js**: `v18.17.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the project root:
```env
# Administrator Security Credentials
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_SESSION_SECRET=your-random-session-secret

# Supabase PostgreSQL Configuration (Optional - Defaults to high-speed local store)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public website, or [http://localhost:3000/admin](http://localhost:3000/admin) to view the admin portal.

### 4. Build for Production
```bash
npm run build
```

### 5. Start Production Server
```bash
npm run start -- -p 3000
```

---

## 7. Repository & GitHub Language Distribution

- **Repository Destination:** [https://github.com/axytechh-03/velavan-catering-services](https://github.com/axytechh-03/velavan-catering-services)
- **Language Composition:** 57 TypeScript source files (`.tsx` and `.ts`), CSS design tokens, and SQL database migrations.
- **Linguist Configuration (`.gitattributes`):** Configured to ensure GitHub naturally recognizes the genuine Next.js TypeScript application source by marking archived static prototypes as vendored/documentation.

---

## 8. License & Ownership

© 2026 Velavan Catering Services. All rights reserved.  
Developed by **AXY Technologies**.
