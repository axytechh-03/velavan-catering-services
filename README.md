# Velavan Catering Services – Official Web Platform

Official web platform for **Velavan Catering Services**, a premier traditional South Indian catering service celebrating grand feasts, weddings, betrothals, and family celebrations with timeless hospitality.

Built with **Next.js 14 (App Router)**, **React**, and **TypeScript**.

---

## 🌟 Key Features

1. **Global Bilingual Support (English & தமிழ்)**
   - Instant language switching across all navigation, headings, service descriptions, menu items, form fields, and footer without page reload.
   - Preserves search queries, active menu filters, and current scroll position.
   - Persistent language selection saved across sessions.

2. **Official Brand & Visual Identity**
   - Official Velavan chef logo with circular brand framing and custom loading screen.
   - Traditional South Indian palette: Deep Royal Green (`#0a2a1b`, `#153d2d`), Muted Gold (`#c4a365`), and Warm Ivory (`#faf8f1`).

3. **Authentic Prospectus Menu Catalog**
   - Transcribed directly from the authentic prospectus across 14 comprehensive categories:
     - Traditional Sweets, Aromatic Soups, Welcome Drinks, Idli & Morning Tiffin, Dosas & Live Roasts, Biryanis, Starters, Rotis & Breads, Rich Gravies, Chutneys & Sambars, Rice Specialties, Payasams, Feast Accompaniments, and Pickles & Beverages.
   - Real-time bilingual search matching dish names and ingredients in English and Tamil.
   - Interactive category drilldown view with veg badges and culinary tags.

4. **Celebrations We Cater (6 Core Service Offerings)**
   - Wedding & Muhurtham Catering (`திருமண & முகூர்த்த விருந்து`)
   - Wedding Reception Catering (`வரவேற்பு விருந்து`)
   - Engagement Catering (`நிச்சயதார்த்த விழா`)
   - Corporate Events (`நிறுவன நிகழ்வுகள்`)
   - Pre-Wedding & Family Functions (`குடும்ப & மங்களகரமான விழாக்கள்`)
   - Grand Gatherings & Special Occasions (`பிரம்மாண்ட திருமண கூட்டங்கள்`)

5. **Moments & Memories Animated Gallery**
   - Finite, non-repeating multi-slide carousel showcasing authentic celebration photography.
   - Touch swipe, in-boundary navigation controls, pagination indicators, and high-resolution lightbox modal.

6. **Interactive Catering Enquiry & WhatsApp Connect**
   - Structured 9-field enquiry form with validation (phone numbers, event dates, guest counts).
   - Instant pre-filled WhatsApp message generation connecting directly to customer service.
   - Dual-mode submission: Supabase database sync with automatic local storage backup.

7. **Statutory Business Registrations**
   - **MSME Udyam Registration**: `UDYAM-TN-03-0341714` (Micro Enterprise, Event Catering 56210).
   - **FSSAI Food Safety State License**: `12426003001273`.

8. **Admin Control Centre (`/admin`)**
   - Secure dashboard for enquiry tracking, status updates (`new`, `contacted`, `confirmed`, `cancelled`), filtering, and CSV export.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS (app/globals.css)
- **Icons**: Lucide React
- **Animations**: Framer Motion & CSS keyframe animation system
- **Backend / Database**: Supabase PostgreSQL client (`@supabase/supabase-js`)
- **Deployment**: Netlify / Vercel ready

---

## 📁 Project Folder Structure

```
velavan-catering-services/
├── app/
│   ├── admin/                # Admin control dashboard
│   ├── api/
│   │   ├── admin/check/      # Admin session validation endpoint
│   │   ├── admin/login/      # Admin authentication endpoint
│   │   └── enquiry/          # Enquiry submission endpoint
│   ├── globals.css           # Global design system, typography, animations
│   ├── layout.tsx            # Root layout with providers and metadata
│   └── page.tsx              # Homepage composition
├── components/
│   ├── common/               # Shared components (BrandLoader, ScrollAnimationProvider)
│   ├── layout/               # Header, Footer, TopBar, LanguageToggle
│   └── sections/             # Hero, Story, Tribute, Values, Services,
│                             # Clients, MenuSection, Gallery, Enquiry, Registrations
├── context/
│   └── LanguageContext.tsx   # Bilingual state management (en / ta)
├── data/
│   ├── gallery.ts            # Gallery slide metadata
│   ├── menu.ts               # Complete 14-category prospectus menu dataset
│   ├── services.ts           # Service card content and photography mappings
│   └── translations.ts       # Comprehensive English and Tamil translation dictionaries
├── lib/
│   ├── supabase.ts           # Supabase client setup with safe build-time fallbacks
│   └── utils.ts              # Utility helpers
├── public/
│   ├── favicon.ico
│   ├── icon-192.png
│   └── images/
│       ├── founder/          # Founder portrait photography
│       ├── gallery/          # 9 Moments & Memories celebration photos
│       ├── hero/             # Hero background photography
│       ├── logo/             # Official Velavan brand logos
│       └── services/         # 6 Core celebration photographs
├── supabase/
│   └── migrations/           # Database schema & Row Level Security policies
├── .env.example              # Environment variables template
├── .gitignore                # Git exclusions (secrets, node_modules, build outputs)
├── netlify.toml              # Netlify build configuration
├── next.config.mjs           # Next.js configuration
├── package.json              # Project dependencies and npm scripts
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.ts        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17+ or later
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bhavatarini-08/velavan-catering-services.git
   cd velavan-catering-services
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *(Update `.env.local` with your Supabase credentials and admin password if needed)*

### Local Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Admin portal is accessible at [http://localhost:3000/admin](http://localhost:3000/admin).

### Production Build

Create an optimised production build:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

---

## 🔒 Security & Environment Variables

Never commit `.env` or `.env.local` files containing real secrets to the repository.

| Variable | Description | Required | Default / Fallback |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Optional | `""` (falls back to local storage) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key | Optional | `""` (falls back to local storage) |
| `ADMIN_PASSWORD` | Admin Dashboard Access Password | Optional | `velavan2026` |

---

## 📦 GitHub Repository

- **Repository**: [https://github.com/bhavatarini-08/velavan-catering-services](https://github.com/bhavatarini-08/velavan-catering-services)
- **Default Branch**: `main`
- **Visibility**: Private
