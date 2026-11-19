import { getSupabaseServerClient } from './supabase-server'
import {
  toEnquiryRecord,
  toEnquiryDbRow,
  toMenuCategoryRecord,
  toMenuCategoryDbRow,
  toMenuItemRecord,
  toMenuItemDbRow,
  toServiceRecord,
  toServiceDbRow,
  toGalleryRecord,
  toGalleryDbRow,
  toClientRecord,
  toClientDbRow,
  toSiteContentRecord,
  toSiteContentDbRows,
  toSiteSettingsRecord,
  toSiteSettingsDbRow,
  toProposalRecord,
  toProposalDbRow,
  toActivityRecord,
  toActivityDbRow,
  isUUID,
} from './cms-mappers'
import { menuCategories as seedCategories, menuItems as seedItems, MenuItem, MenuCategory } from '../data/menu'
import { servicesData as seedServicesRaw } from '../data/services'

// ============================================================================

export type EnquiryStatus =
  | 'new'
  | 'contacted'
  | 'follow_up'
  | 'quotation_sent'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export type EnquiryPriority = 'high' | 'normal' | 'low'

export interface EnquiryRecord {
  id: string
  name: string
  phone: string
  email?: string
  event_type: string
  other_event_type?: string
  guest_count: number
  event_date: string
  event_time?: string
  location: string
  special_requests?: string
  status: EnquiryStatus
  priority?: EnquiryPriority
  follow_up_date?: string
  follow_up_notes?: string
  admin_notes?: string
  created_at: string
  updated_at?: string
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export interface QuotationItem {
  id?: string
  dishId?: string
  dishName?: string
  nameEn?: string
  dishNameTa?: string
  nameTa?: string
  categoryName?: string
  quantity: number
  unitPrice: number
  unit?: string
  total?: number
  amount?: number
}

export interface QuotationAdditionalCharge {
  id: string
  name?: string
  title?: string
  amount: number
}

export interface ProposalCustomDish {
  id: string
  name: string
  nameTa?: string
  category: string
  description?: string
  notes?: string
}

export interface ProposalMealSession {
  id: string
  name: string // e.g. "Morning Muhurtham Tiffin", "Grand Afternoon Lunch Feast", "Evening Snacks & High Tea"
  mealType: string // "Breakfast" | "Lunch" | "Snacks" | "Dinner" | "High Tea" | string
  servingTime?: string // e.g. "07:30 AM", "12:30 PM", "04:30 PM", "07:30 PM"
  guestCount?: number // session-specific guest count if different from event total
  dishes: QuotationItem[]
  notes?: string
}

export interface QuotationRecord {
  id: string
  quotationNumber: string
  quotationDate?: string
  validUntil?: string
  enquiryId?: string
  enquiryUuid?: string
  legacyEnquiryId?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  eventType: string
  eventDate: string
  eventLocation: string
  guestCount: number
  mealType?: string
  specialRequirements?: string
  sessions?: ProposalMealSession[]
  items: QuotationItem[]
  customDishes?: ProposalCustomDish[]
  serviceInclusions?: string[]
  serviceNotes?: string
  packageAmount?: number
  advanceAmount?: number
  balanceAmount?: number
  paymentDueDate?: string
  paymentNotes?: string
  subtotal?: number
  additionalCharges?: QuotationAdditionalCharge[]
  discountType?: 'flat' | 'percentage'
  discountValue?: number
  discountAmount?: number
  taxEnabled?: boolean
  taxPercent?: number
  taxPercentage?: number
  taxAmount?: number
  grandTotal: number
  notes?: string
  terms?: string
  termsAndConditions?: string
  status: QuotationStatus
  created_at: string
  updated_at?: string
}

export type ProposalRecord = QuotationRecord

export interface ActivityRecord {
  id: string
  type:
    | 'enquiry_new'
    | 'enquiry_status'
    | 'enquiry_priority'
    | 'enquiry_deleted'
    | 'follow_up_scheduled'
    | 'menu_add'
    | 'menu_update'
    | 'category_added'
    | 'category_updated'
    | 'dish_added'
    | 'dish_updated'
    | 'dish_deleted'
    | 'quotation_created'
    | 'quotation_status'
    | 'system'
    | string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface MenuItemRecord extends MenuItem {
  isVeg?: boolean
  priceEstimate?: string
  active?: boolean
  order?: number
}

export interface MenuCategoryRecord extends MenuCategory {
  active?: boolean
  order?: number
}

export interface ServiceRecord {
  id: string
  key: string
  number: string
  titleEn: string
  titleTa: string
  tagEn: string
  tagTa: string
  descEn: string
  descTa: string
  capacity?: string
  leafStyle?: string
  featuredDishes?: { en: string[]; ta: string[] }
  image: string
  imagePosition?: string
  active: boolean
  order: number
}

export interface GalleryRecord {
  id: string
  titleEn: string
  titleTa: string
  categoryEn: string
  categoryTa: string
  url: string
  captionEn: string
  captionTa: string
  objectPosition?: string
  active: boolean
  order: number
}

export interface ClientRecord {
  id: string
  name: string
  category: string
  active: boolean
  order: number
}

export interface SiteContentRecord {
  hero: {
    eyebrowEn: string
    eyebrowTa: string
    titleEn: string
    titleTa: string
    descEn: string
    descTa: string
    btnPlanEn: string
    btnPlanTa: string
    btnWorkEn: string
    btnWorkTa: string
    noteEn: string
    noteTa: string
    promiseStrip: string
  }
  story: {
    eyebrowEn: string
    eyebrowTa: string
    titleEn: string
    titleTa: string
    p1En: string
    p1Ta: string
    p2En: string
    p2Ta: string
    captionEn: string
    captionTa: string
  }
  tribute: {
    eyebrowEn: string
    eyebrowTa: string
    name: string
    taglineEn: string
    taglineTa: string
    descEn: string
    descTa: string
  }
  contact: {
    phonePrimary: string
    phoneSecondary: string
    whatsapp: string
    email: string
    addressEn: string
    addressTa: string
    workingHoursEn: string
    workingHoursTa: string
  }
  registrations: {
    msmeNumber: string
    msmeEnterpriseType: string
    msmeMinistry: string
    msmeStatus: string
    fssaiNumber: string
    fssaiCategory: string
    fssaiValidThrough: string
    fssaiStatus: string
  }
}

export interface SiteSettingsRecord {
  adminPassword?: string
  siteTitle: string
  primaryPhone: string
  whatsappPhone: string
  emailNotifications: boolean
  updatedAt: string
}

export interface CMSData {
  enquiries: EnquiryRecord[]
  menuCategories: MenuCategoryRecord[]
  menuItems: MenuItemRecord[]
  services: ServiceRecord[]
  gallery: GalleryRecord[]
  clients: ClientRecord[]
  content: SiteContentRecord
  settings: SiteSettingsRecord
  quotations: QuotationRecord[]
  activities: ActivityRecord[]
}

// ============================================================================
// Seed Data Initialization
// ============================================================================

const SEED_SERVICES: ServiceRecord[] = [
  {
    id: 'wedding-muhurtham',
    key: 's1',
    number: '01 / TRADITIONAL VIRUNDHU',
    titleEn: 'Wedding & Muhurtham Catering',
    titleTa: 'திருமண & முகூர்த்த விருந்து',
    tagEn: 'Traditional Tamil Banana Leaf Virundhu',
    tagTa: 'பாரம்பரிய தலைவாழை இலை விருந்து',
    descEn: 'Traditional Tamil wedding virundhu served on banana leaves, with rice, sambar, poriyal, vadai, payasam and other vegetarian dishes.',
    descTa: 'சுப முகூர்த்த மதிய வேளையில் தலைவாழை இலை போட்டு தூய நெய், பருப்பு, சாம்பார், பொரியல், கூட்டு, வடை, பாயாசத்துடன் பரிமாறப்படும் மங்களகரமான விருந்து.',
    capacity: '200 to 5,000+ Guests',
    leafStyle: 'Traditional Plantain Leaf Feast',
    featuredDishes: {
      en: ['Pure Ghee Badam Halwa', 'Chinna Vengayam Sambar', 'Tender Nungu Payasam', 'Elaneer Idli'],
      ta: ['பாதாம் அல்வா', 'சின்ன வெங்காய சாம்பார்', 'இளநீர் நுங்கு பாயாசம்', 'இளநீர் இட்லி'],
    },
    image: '/images/services/wedding-muhurtham.jpg',
    imagePosition: 'center center',
    active: true,
    order: 1,
  },
  {
    id: 'reception-catering',
    key: 's2',
    number: '02 / RECEPTION BANQUETS',
    titleEn: 'Wedding Reception Catering',
    titleTa: 'திருமண வரவேற்பு விருந்து',
    tagEn: 'Live Stalls & Grand Reception Buffets',
    tagTa: 'நேரடி கவுண்டர்கள் & வரவேற்பு பஃபே',
    descEn: 'A beautifully arranged South Indian wedding reception buffet with traditional food counters and elegant dining arrangements.',
    descTa: 'நேரடி தவா கவுண்டர்கள், சுவையான பிரியாணி வகைகள், ஸ்பெஷல் தோசைகள், நார்த் இந்தியன் கிரேவிகள் மற்றும் அருமையான டெசர்ட்களுடன் கூடிய நவீன விருந்து.',
    capacity: '300 to 10,000+ Guests',
    leafStyle: 'Live Tawa Counters & Buffet Spread',
    featuredDishes: {
      en: ['Live Bun Parotta Counter', 'Dum Seeraga Samba Biryani', 'Paneer Butter Masala', 'Brownie with Ice Cream'],
      ta: ['பன் புரோட்டா லைவ் கவுண்டர்', 'சீரக சம்பா பிரியாணி', 'பன்னீர் பட்டர் மசாலா', 'ஹாட் பிரவுனி ஐஸ்கிரீம்'],
    },
    image: '/images/services/reception-catering.jpg',
    imagePosition: 'center center',
    active: true,
    order: 2,
  },
  {
    id: 'engagement-catering',
    key: 's3',
    number: '03 / AUSPICIOUS ALLIANCES',
    titleEn: 'Engagement Catering',
    titleTa: 'நிச்சயதார்த்த விருந்து',
    tagEn: 'Traditional Tamil Nichayathartham Feasts',
    tagTa: 'மங்களகரமான நிச்சயதார்த்த வைபவம்',
    descEn: 'Thoughtfully planned catering for Tamil engagements and Nichayathartham ceremonies, with auspicious welcomes, traditional sweets and celebratory feasts.',
    descTa: 'மங்களகரமான நிச்சயதார்த்தம் மற்றும் தாம்பூல மாற்றத்திற்கான பிரத்யேக வரவேற்பு பானங்கள், பாரம்பரிய இனிப்புகள் மற்றும் சுவையான விருந்து உபசரிப்பு.',
    capacity: '100 to 1,500 Guests',
    leafStyle: 'Regal Alliance Feast',
    featuredDishes: {
      en: ['Welcome Elaneer Shake', 'Balaji Laddu', 'Special Kari Dosa', 'Pasi Paruppu Payasam'],
      ta: ['இளநீர் மில்க் ஷேக்', 'பாலாஜி லட்டு', 'கரி தோசை', 'பாசிப்பருப்பு பாயாசம்'],
    },
    image: '/images/services/engagement-catering.jpg',
    imagePosition: 'center 35%',
    active: true,
    order: 3,
  },
  {
    id: 'corporate-events',
    key: 's4',
    number: '04 / CORPORATE HOSPITALITY',
    titleEn: 'Corporate Events',
    titleTa: 'கார்ப்பரேட் & வணிக நிகழ்வுகள்',
    tagEn: 'Professional Gatherings & Executive Dinners',
    tagTa: 'தொழில்முறை நிகழ்வுகள் & நிறுவன விருந்துகள்',
    descEn: 'Thoughtfully prepared catering for corporate meetings, office celebrations, business gatherings and professional events.',
    descTa: 'நிறுவன கூட்டங்கள், அலுவலக கொண்டாட்டங்கள், வணிக சந்திப்புகள் மற்றும் தொழில்முறை நிகழ்வுகளுக்கு நேர்த்தியாக தயாரிக்கப்படும் உணவு உபசரிப்பு.',
    capacity: '100 to 1,000 Guests',
    leafStyle: 'Executive Buffet & Live Counters',
    featuredDishes: {
      en: ['Pallipalayam Veg Roast', 'Cheese Corn Poppers', 'Goli Soda Bar', 'Mulligatawny Soup'],
      ta: ['பள்ளிபாளையம் வறுவல்', 'சீஸ் கான் பால்ஸ்', 'கோலி சோடா பார்', 'முள்ளிக்கத்துவாணி சூப்'],
    },
    image: '/images/services/corporate-events.jpg',
    imagePosition: 'center 20%',
    active: true,
    order: 4,
  },
  {
    id: 'birthday-family-functions',
    key: 's5',
    number: '05 / FAMILY CELEBRATIONS',
    titleEn: 'Birthday Celebrations & Family Functions',
    titleTa: 'பிறந்தநாள் & குடும்ப விசேஷங்கள்',
    tagEn: 'Memorable Moments & Tailored Menus',
    tagTa: 'மகிழ்ச்சியான குடும்பத் தருணங்கள்',
    descEn: 'Make every birthday and family gathering special with delicious food, customised menus and warm hospitality.',
    descTa: 'சுவையான உணவு, தனிப்பயனாக்கப்பட்ட மெனுக்கள் மற்றும் அன்பான விருந்தோம்பலுடன் ஒவ்வொரு பிறந்தநாள் மற்றும் குடும்ப விழாவையும் மறக்க முடியாததாக ஆக்குங்கள்.',
    capacity: '50 to 800 Guests',
    leafStyle: 'Customary Satvik Plantain Feast',
    featuredDishes: {
      en: ['Paruppu Urundai Kuzhambu', 'Avial & Adai', 'Mor Kuzhambu with Vada', 'Claypot Curd Rice'],
      ta: ['பருப்பு உருண்டை குழம்பு', 'அடை அவியல்', 'மோர்க்குழம்பு வடை', 'மண்பானை தயிர்சாதம்'],
    },
    image: '/images/services/birthday-family-functions.jpg',
    imagePosition: 'center center',
    active: true,
    order: 5,
  },
  {
    id: 'special-events-occasions',
    key: 's6',
    number: '06 / SPECIAL OCCASIONS',
    titleEn: 'Special Events & Occasions',
    titleTa: 'சிறப்பு நிகழ்வுகள் & விசேஷங்கள்',
    tagEn: 'Traditional Flavours Tailored to You',
    tagTa: 'உங்கள் நிகழ்விற்கேற்ற பாரம்பரிய சுவை',
    descEn: "Celebrate life's special moments with carefully planned catering and traditional flavours tailored to your occasion.",
    descTa: 'வாழ்வின் சிறப்பான தருணங்களை, உங்கள் நிகழ்விற்கு ஏற்றவாறு திட்டமிடப்பட்ட பாரம்பரிய சுவைகள் மற்றும் அக்கறையான உணவு உபசரிப்புடன் கொண்டாடுங்கள்.',
    capacity: '1,000 to 10,000+ Guests',
    leafStyle: 'High-Volume Synchronized Banquet Halls',
    featuredDishes: {
      en: ['Mass Banquet Management', 'Round-the-clock Hot Feasts', 'Dedicated VIP Leaf Service', 'Zero Delay Service'],
      ta: ['பிரம்மாண்ட மேலாண்மை', 'தாமதமில்லா சுடச்சுட உணவு', 'வி.ஐ.பி வாழை இலை சேவை', 'நேர்த்தியான பரிமாறுதல்'],
    },
    image: '/images/services/special-events-occasions.jpg',
    imagePosition: 'center center',
    active: true,
    order: 6,
  },
]

const SEED_GALLERY: GalleryRecord[] = [
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
    active: true,
    order: 1,
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
    active: true,
    order: 2,
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
    active: true,
    order: 3,
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
    active: true,
    order: 4,
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
    active: true,
    order: 5,
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
    active: true,
    order: 6,
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
    active: true,
    order: 7,
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
    active: true,
    order: 8,
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
    active: true,
    order: 9,
  },
]

const SEED_CLIENTS: ClientRecord[] = [
  { id: 'c-1', name: 'Kongu Convention & Wedding Halls', category: 'Wedding Mandapams', active: true, order: 1 },
  { id: 'c-2', name: 'Grand Regent Banquets Coimbatore', category: 'Luxury Banquets', active: true, order: 2 },
  { id: 'c-3', name: 'Codissia Trade Fair Complex', category: 'Exhibition & Events', active: true, order: 3 },
  { id: 'c-4', name: 'PSG Institutions Alumni Trust', category: 'Educational Institutions', active: true, order: 4 },
  { id: 'c-5', name: 'Texvalley International Trade Center', category: 'Corporate & Trade', active: true, order: 5 },
  { id: 'c-6', name: 'Coimbatore Textile & Spinning Association', category: 'Industrial Groups', active: true, order: 6 },
]

const SEED_ENQUIRIES: EnquiryRecord[] = [
  {
    id: 'enq-1',
    name: 'R. Karthikeyan',
    phone: '9842211223',
    email: 'karthik@example.com',
    event_type: 'Wedding',
    guest_count: 1200,
    event_date: '2026-12-14',
    event_time: 'Morning Muhurtham (07:30 AM - 12:30 PM)',
    location: 'Codissia Hall A, Coimbatore',
    special_requests: 'Require traditional banana leaf service, Elaneer Payasam & Ghee Badam Halwa. Need 4 live coffee counters.',
    status: 'new',
    admin_notes: 'Spoke with groom family. Interested in Grand Muhurtham Virundhu package. Sent draft menu.',
    created_at: '2026-11-14T09:30:00Z',
  },
  {
    id: 'enq-2',
    name: 'Dr. Meenakshi Sundaram',
    phone: '9443355667',
    email: 'meenakshi@gmail.com',
    event_type: 'Reception',
    guest_count: 800,
    event_date: '2026-12-28',
    event_time: 'Evening Reception (06:30 PM - 10:30 PM)',
    location: 'Grand Regent, Avinashi Road, Coimbatore',
    special_requests: 'Live Bun Parotta counter, Special Dosa counter and Hot Brownie Rabri counter.',
    status: 'contacted',
    admin_notes: 'Advance booking discussion ongoing. Date is locked.',
    created_at: '2026-11-13T16:45:00Z',
  },
  {
    id: 'enq-3',
    name: 'S. Balasubramaniam',
    phone: '9080311222',
    email: 'bala@velavan.in',
    event_type: 'Family Function',
    guest_count: 350,
    event_date: '2026-11-25',
    event_time: 'Lunch (11:30 AM - 03:00 PM)',
    location: 'Chettipalayam, Coimbatore',
    special_requests: 'Grahapravesam pure satvik lunch without onion/garlic for morning pooja followed by feast.',
    status: 'confirmed',
    admin_notes: 'Advance received 50%. Raw materials purchase list approved.',
    created_at: '2026-11-12T11:15:00Z',
  },
]

const SEED_CONTENT: SiteContentRecord = {
  hero: {
    eyebrowEn: 'THE ART OF GRAND HOSPITALITY',
    eyebrowTa: 'சிறப்பான விருந்தோம்பல் கலை',
    titleEn: 'Every Celebration Deserves a Grand Feast.',
    titleTa: 'ஒவ்வொரு கொண்டாட்டமும் ஒரு சிறந்த விருந்துக்கு உரியது.',
    descEn: 'Exceptional food. Thoughtful planning. Timeless traditions. We bring the spirit of grand South Indian hospitality to weddings and celebrations of every scale.',
    descTa: 'சிறந்த உணவு. கவனமான திட்டமிடல். காலத்தால் அழியாத பாரம்பரியம். அனைத்து வகையான திருமணங்கள் மற்றும் விசேஷங்களுக்கும் தென்னிந்திய பாரம்பரிய விருந்தோம்பலை வழங்குகிறோம்.',
    btnPlanEn: 'Plan Your Celebration',
    btnPlanTa: 'உங்கள் விழாவை திட்டமிடுங்கள்',
    btnWorkEn: 'Explore Our Work',
    btnWorkTa: 'எங்கள் சேவைகளை காணுங்கள்',
    noteEn: 'TRADITION · TASTE · TOGETHERNESS',
    noteTa: 'பாரம்பரியம் · சுவை · பாசம்',
    promiseStrip: 'CRAFTED WITH CARE ✦ SERVED WITH PRIDE ✦ REMEMBERED FOREVER',
  },
  story: {
    eyebrowEn: 'A LEGACY OF HOSPITALITY',
    eyebrowTa: 'பாரம்பரிய விருந்தோம்பல்',
    titleEn: 'More Than Food. A Celebration of Togetherness.',
    titleTa: 'உணவு மட்டுமல்ல, ஒன்று கூடும் பாசத்தின் கொண்டாட்டம்.',
    p1En: 'At Velavan Catering Services, we create memorable dining experiences for weddings and special occasions through thoughtful preparation, delicious food and gracious hospitality.',
    p1Ta: 'வேலவன் கேட்டரிங் சர்வீஸில், நாங்கள் கவனமான தயாரிப்பு, சுவையான உணவு மற்றும் அன்பான விருந்தோம்பல் மூலம் திருமணங்கள் மற்றும் விசேஷங்களை மறக்க முடியாத விருந்தாக மாற்றுகிறோம்.',
    p2En: 'Rooted in the rich culinary heritage of Kongu Nadu and Tamil Nadu, our passion is serving joy on a fresh plantain leaf.',
    p2Ta: 'கொங்குநாடு மற்றும் தமிழ்நாட்டின் செழுமையான சமையல் பாரம்பரியத்தில் வேரூன்றி, புதிய தலைவாழை இலையில் மகிழ்ச்சியை பரிமாறுவதே எங்களின் பெருமை.',
    captionEn: 'Every detail served with care and warmth.',
    captionTa: 'அன்பும் அக்கறையும் நிறைந்த ஒவ்வொரு உபசரிப்பு.',
  },
  tribute: {
    eyebrowEn: 'THE HEART BEHIND OUR JOURNEY',
    eyebrowTa: 'எங்கள் பயணத்தின் வழிகாட்டி',
    name: 'JAYANTHI',
    taglineEn: 'Her legacy lives on.',
    taglineTa: 'அவர் காட்டிய வழியில் எங்கள் பயணம் தொடர்கிறது.',
    descEn: 'Her dedication, warmth and love for hospitality continue to inspire the values and traditions of Velavan Catering Services.',
    descTa: 'விருந்தோம்பலில் அவர் காட்டிய அர்ப்பணிப்பு, பாசம் மற்றும் அக்கறை என்றும் வேலவன் கேட்டரிங் சர்வீஸின் மூச்சாக வாழ்கிறது.',
  },
  contact: {
    phonePrimary: '+91 90803 09584',
    phoneSecondary: '+91 98422 11223',
    whatsapp: '+91 90803 09584',
    email: 'dhineshkumarctpm@gmail.com',
    addressEn: '15/49, Mariamman Kovil Street, Chettipalayam, Coimbatore – 641201, Tamil Nadu',
    addressTa: '15/49, மாரியம்மன் கோவில் வீதி, செட்டிபாளையம், கோயம்புத்தூர் – 641201, தமிழ்நாடு',
    workingHoursEn: 'Mon - Sun: 7:00 AM – 10:00 PM (IST)',
    workingHoursTa: 'திங்கள் - ஞாயிறு: காலை 7:00 – இரவு 10:00',
  },
  registrations: {
    msmeNumber: 'UDYAM-TN-03-0341714',
    msmeEnterpriseType: 'Micro',
    msmeMinistry: 'Ministry of MSME, Govt. of India',
    msmeStatus: 'Verified & Active',
    fssaiNumber: '12426003001273',
    fssaiCategory: 'State License',
    fssaiValidThrough: '17 August 2027',
    fssaiStatus: 'Licensed & Active',
  },
}

const SEED_SETTINGS: SiteSettingsRecord = {
  siteTitle: 'Velavan Catering Services | Official Admin CMS',
  primaryPhone: '+91 90803 09584',
  whatsappPhone: '+91 90803 09584',
  emailNotifications: true,
  updatedAt: new Date().toISOString(),
}

const SEED_QUOTATIONS: QuotationRecord[] = [
  {
    id: 'qt-2026-001',
    quotationNumber: 'VCS-2026-0001',
    enquiryId: 'enq-1',
    customerName: 'R. Karthikeyan',
    customerPhone: '9842211223',
    customerEmail: 'karthik@example.com',
    eventType: 'Wedding & Muhurtham',
    eventDate: '2026-12-14',
    eventLocation: 'Codissia Hall A, Coimbatore',
    guestCount: 1200,
    mealType: 'Muhurtham Tiffin & Grand Virundhu Lunch',
    sessions: [
      {
        id: 'sess-1',
        name: 'Morning Muhurtham Tiffin',
        mealType: 'Breakfast',
        servingTime: '07:30 AM - 09:30 AM',
        guestCount: 1200,
        notes: 'Hot live tiffin service following Muhurtham ceremony with filter coffee counter',
        dishes: [
          { id: 'qi-1', dishName: 'Traditional Ghee Asoka Halwa', nameEn: 'Traditional Ghee Asoka Halwa', dishNameTa: 'அசோகா அல்வா', nameTa: 'அசோகா அல்வா', categoryName: 'Traditional Sweets', quantity: 1, unitPrice: 0, amount: 0 },
          { id: 'qi-2', dishName: 'Steamed Podi Ghee Mini Idli', nameEn: 'Steamed Podi Ghee Mini Idli', dishNameTa: 'பொடி நெய் மினி இட்லி', nameTa: 'பொடி நெய் மினி இட்லி', categoryName: 'Idli & Morning Tiffin', quantity: 1, unitPrice: 0, amount: 0 },
          { id: 'qi-3', dishName: 'Medu Vadai with Sambar & 3 Chutneys', nameEn: 'Medu Vadai with Sambar & 3 Chutneys', dishNameTa: 'மேது வடை', nameTa: 'மேது வடை', categoryName: 'Starters', quantity: 1, unitPrice: 0, amount: 0 },
          { id: 'qi-coffee', dishName: 'Degree Kumbakonam Filter Coffee', nameEn: 'Degree Kumbakonam Filter Coffee', dishNameTa: 'கும்பகோணம் டிகிரி காபி', nameTa: 'கும்பகோணம் டிகிரி காபி', categoryName: 'Beverages', quantity: 1, unitPrice: 0, amount: 0 },
        ],
      },
      {
        id: 'sess-2',
        name: 'Grand Muhurtham Kalyana Virundhu',
        mealType: 'Lunch',
        servingTime: '12:30 PM - 03:00 PM',
        guestCount: 1200,
        notes: 'Traditional 24-dish plantain leaf feast served hot by uniformed captains',
        dishes: [
          { id: 'qi-4', dishName: 'Special Kongu Chinna Vengaya Sambar Feast Meals', nameEn: 'Special Kongu Chinna Vengaya Sambar Feast Meals', dishNameTa: 'சாம்பார் தலைவாழை விருந்து', nameTa: 'சாம்பார் தலைவாழை விருந்து', categoryName: 'Rice & Rasam', quantity: 1, unitPrice: 0, amount: 0 },
          { id: 'qi-5', dishName: 'Tender Elaneer Payasam', nameEn: 'Tender Elaneer Payasam', dishNameTa: 'இளநீர் பாயாசம்', nameTa: 'இளநீர் பாயாசம்', categoryName: 'Payasam & Desserts', quantity: 1, unitPrice: 0, amount: 0 },
          { id: 'qi-6', dishName: 'Crispy Urulai Roast & Aviyal', nameEn: 'Crispy Urulai Roast & Aviyal', dishNameTa: 'உருளை ரோஸ்ட் & அவியல்', nameTa: 'உருளை ரோஸ்ட் & அவியல்', categoryName: 'Side Dishes', quantity: 1, unitPrice: 0, amount: 0 },
        ],
      },
    ],
    items: [
      { id: 'qi-1', nameEn: 'Traditional Ghee Asoka Halwa', nameTa: 'அசோகா அல்வா', categoryName: 'Traditional Sweets', quantity: 1, unitPrice: 0, amount: 0 },
      { id: 'qi-2', nameEn: 'Steamed Podi Ghee Mini Idli', nameTa: 'பொடி நெய் மினி இட்லி', categoryName: 'Idli & Morning Tiffin', quantity: 1, unitPrice: 0, amount: 0 },
      { id: 'qi-3', nameEn: 'Medu Vadai with Sambar & 3 Chutneys', nameTa: 'மேது வடை', categoryName: 'Starters', quantity: 1, unitPrice: 0, amount: 0 },
      { id: 'qi-4', nameEn: 'Special Kongu Chinna Vengaya Sambar Feast Meals', nameTa: 'சாம்பார் தலைவாழை விருந்து', categoryName: 'Rice & Rasam', quantity: 1, unitPrice: 0, amount: 0 },
      { id: 'qi-5', nameEn: 'Tender Elaneer Payasam', nameTa: 'இளநீர் பாயாசம்', categoryName: 'Payasam & Desserts', quantity: 1, unitPrice: 0, amount: 0 },
    ],
    serviceInclusions: [
      'Authentic Food Preparation',
      'Food Transportation',
      'Buffet Arrangement',
      'Professional Serving Staff',
      'Vessels & Serving Equipment',
      'Table Decoration & Frills',
      'Traditional Banana Leaf Service',
      'Drinking Water & Paper Cups',
      'Dining Area Clearing & Waste Disposal',
    ],
    serviceNotes: '25 Uniformed serving staff, fresh organic plantain leaves, live coffee bar.',
    packageAmount: 420000,
    advanceAmount: 150000,
    balanceAmount: 270000,
    paymentDueDate: '2026-12-12',
    paymentNotes: '50% booking advance; remaining balance prior to dining hall service.',
    taxEnabled: false,
    taxPercent: 5,
    taxAmount: 0,
    grandTotal: 420000,
    notes: 'Pure vegetarian Kongu Nadu traditional feast served hot on fresh banana leaves.',
    termsAndConditions: '1. 50% advance for booking confirmation. 2. Final guest count to be confirmed 48 hours prior. 3. Hall dining setup must be made available 3 hours before serving time.',
    status: 'sent',
    created_at: '2026-11-15T10:00:00.000Z',
  },
  {
    id: 'qt-2026-002',
    quotationNumber: 'VCS-2026-0002',
    enquiryId: 'enq-3',
    customerName: 'S. Balasubramaniam',
    customerPhone: '9080311222',
    eventType: 'Family Function (Grahapravesam)',
    eventDate: '2026-11-25',
    eventLocation: 'Chettipalayam, Coimbatore',
    guestCount: 350,
    mealType: 'Pure Satvik Grahapravesam Lunch',
    sessions: [
      {
        id: 'sess-3',
        name: 'Pure Satvik Housewarming Lunch Virundhu',
        mealType: 'Lunch',
        servingTime: '11:30 AM - 02:30 PM',
        guestCount: 350,
        notes: 'Strict satvik preparation without onion or garlic for religious ceremony',
        dishes: [
          { id: 'qi-21', dishName: 'Pure Ghee Badam Halwa', nameEn: 'Pure Ghee Badam Halwa', dishNameTa: 'பாதாம் அல்வா', nameTa: 'பாதாம் அல்வா', categoryName: 'Traditional Sweets', quantity: 1, unitPrice: 0, amount: 0 },
          { id: 'qi-22', dishName: 'Special Satvik Lunch Virundhu (No Onion/Garlic)', nameEn: 'Special Satvik Lunch Virundhu (No Onion/Garlic)', dishNameTa: 'சாத்விக மதிய விருந்து', nameTa: 'சாத்விக மதிய விருந்து', categoryName: 'Rice & Rasam', quantity: 1, unitPrice: 0, amount: 0 },
          { id: 'qi-23', dishName: 'Palada Pradhaman Payasam', nameEn: 'Palada Pradhaman Payasam', dishNameTa: 'பாலடை பிரதமன்', nameTa: 'பாலடை பிரதமன்', categoryName: 'Payasam & Desserts', quantity: 1, unitPrice: 0, amount: 0 },
        ],
      },
    ],
    items: [
      { id: 'qi-21', nameEn: 'Pure Ghee Badam Halwa', nameTa: 'பாதாம் அல்வா', categoryName: 'Traditional Sweets', quantity: 1, unitPrice: 0, amount: 0 },
      { id: 'qi-22', nameEn: 'Special Satvik Lunch Virundhu (No Onion/Garlic)', nameTa: 'சாத்விக மதிய விருந்து', categoryName: 'Rice & Rasam', quantity: 1, unitPrice: 0, amount: 0 },
      { id: 'qi-23', nameEn: 'Palada Pradhaman Payasam', nameTa: 'பாலடை பிரதமன்', categoryName: 'Payasam & Desserts', quantity: 1, unitPrice: 0, amount: 0 },
    ],
    serviceInclusions: [
      'Authentic Food Preparation',
      'Food Transportation',
      'Buffet Arrangement',
      'Professional Serving Staff',
      'Vessels & Serving Equipment',
      'Traditional Banana Leaf Service',
      'Drinking Water & Paper Cups',
      'Dining Area Clearing & Waste Disposal',
    ],
    serviceNotes: 'Complete satvik dining arrangement with clean banana leaves.',
    packageAmount: 122500,
    advanceAmount: 50000,
    balanceAmount: 72500,
    paymentDueDate: '2026-11-24',
    paymentNotes: 'Advance received; balance settlement on event day.',
    taxEnabled: false,
    taxPercent: 5,
    taxAmount: 0,
    grandTotal: 122500,
    notes: 'Strict satvik preparation for morning housewarming rituals.',
    termsAndConditions: '1. Advance received. 2. Service begins at 11:30 AM.',
    status: 'accepted',
    created_at: '2026-11-14T14:30:00.000Z',
  },
]

const SEED_ACTIVITIES: ActivityRecord[] = [
  {
    id: 'act-1',
    type: 'enquiry_new',
    description: 'New enquiry received from R. Karthikeyan for Wedding (1,200 guests)',
    timestamp: '2026-11-15T09:30:00.000Z',
  },
  {
    id: 'act-2',
    type: 'quotation_created',
    description: 'Quotation #VCS-QT-2026-001 generated for R. Karthikeyan (₹4,20,000)',
    timestamp: '2026-11-15T10:00:00.000Z',
  },
  {
    id: 'act-3',
    type: 'quotation_status',
    description: 'Quotation #VCS-QT-2026-002 marked as accepted by S. Balasubramaniam (₹1,22,500)',
    timestamp: '2026-11-14T17:15:00.000Z',
  },
  {
    id: 'act-4',
    type: 'enquiry_status',
    description: 'Enquiry status for S. Balasubramaniam updated to Confirmed',
    timestamp: '2026-11-14T17:20:00.000Z',
  },
  {
    id: 'act-5',
    type: 'menu_update',
    description: 'Updated menu catalog items across Sweets and Morning Tiffin',
    timestamp: '2026-11-14T11:00:00.000Z',
  },
]

// ============================================================================

// ============================================================================
// File Path & Local Storage Fallback
// ============================================================================


// ============================================================================
// 1. ENQUIRIES — SUPABASE ASYNCHRONOUS DATA ACCESS
// ============================================================================

export async function getEnquiries(): Promise<EnquiryRecord[]> {
  const sb = getSupabaseServerClient()
  const { data, error } = await sb
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[cms-store] Supabase getEnquiries error:', error.message)
    throw new Error(`Failed to fetch enquiries from Supabase: ${error.message}`)
  }

  return (data || []).map(toEnquiryRecord)
}

export async function addEnquiry(
  enquiry: Omit<EnquiryRecord, 'id' | 'created_at'>
): Promise<EnquiryRecord> {
  const legacyId = `enq-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  const recordToInsert: EnquiryRecord = {
    ...enquiry,
    id: legacyId,
    status: enquiry.status || 'new',
    created_at: new Date().toISOString(),
  }

  const sb = getSupabaseServerClient()
  const dbRow = toEnquiryDbRow(recordToInsert)
  dbRow.legacy_id = legacyId

  const { data, error } = await sb
    .from('enquiries')
    .insert(dbRow)
    .select()
    .single()

  if (error) {
    console.error('[cms-store] Supabase addEnquiry error:', error.message)
    throw new Error(`Failed to create enquiry in Supabase: ${error.message}`)
  }

  const saved = toEnquiryRecord(data)

  // Log activity
  try {
    await logActivity(
      'enquiry_new',
      `New enquiry received from ${saved.name} for ${saved.event_type} (${saved.guest_count} guests)`,
      { enquiryId: saved.id, legacyId: saved.id }
    )
  } catch (actErr) {
    console.warn('[cms-store] logActivity for enquiry_new failed:', actErr)
  }

  return saved
}

export async function updateEnquiry(
  id: string,
  updates: Partial<EnquiryRecord>
): Promise<EnquiryRecord | null> {
  const sb = getSupabaseServerClient()

  // Find enquiry by UUID or legacy_id
  const findQuery = isUUID(id)
    ? sb.from('enquiries').select('*').eq('id', id).maybeSingle()
    : sb.from('enquiries').select('*').eq('legacy_id', id).maybeSingle()

  const { data: existing, error: findError } = await findQuery
  if (findError || !existing) {
    console.warn(`[cms-store] Enquiry ${id} not found for update`)
    return null
  }

  const existingRecord = toEnquiryRecord(existing)
  const merged: EnquiryRecord = {
    ...existingRecord,
    ...updates,
    updated_at: new Date().toISOString(),
  }

  const dbRow = toEnquiryDbRow(merged)
  delete dbRow.id
  delete dbRow.legacy_id

  const { data: updated, error: updateError } = await sb
    .from('enquiries')
    .update(dbRow)
    .eq('id', existing.id)
    .select()
    .single()

  if (updateError) {
    console.error('[cms-store] Supabase updateEnquiry error:', updateError.message)
    throw new Error(`Failed to update enquiry in Supabase: ${updateError.message}`)
  }

  return toEnquiryRecord(updated)
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  const sb = getSupabaseServerClient()

  // Find enquiry to resolve primary UUID and legacy ID
  const findQuery = isUUID(id)
    ? sb.from('enquiries').select('id, legacy_id').eq('id', id).maybeSingle()
    : sb.from('enquiries').select('id, legacy_id').eq('legacy_id', id).maybeSingle()

  const { data: existing, error: findError } = await findQuery
  if (findError || !existing) {
    return false
  }

  const enquiryUuid = existing.id
  const legacyId = existing.legacy_id || id

  // Requirement 8: Safely detach linked proposals by setting enquiry_id = NULL, while preserving legacy_enquiry_id
  const { error: detachError } = await sb
    .from('proposals')
    .update({ enquiry_id: null, updated_at: new Date().toISOString() })
    .or(`enquiry_id.eq.${enquiryUuid},legacy_enquiry_id.eq.${legacyId}`)

  if (detachError) {
    console.error('[cms-store] Failed to detach linked proposals:', detachError.message)
    throw new Error(`Failed to detach proposals linked to enquiry: ${detachError.message}`)
  }

  // Delete enquiry
  const { error: deleteError } = await sb
    .from('enquiries')
    .delete()
    .eq('id', enquiryUuid)

  if (deleteError) {
    console.error('[cms-store] Supabase deleteEnquiry error:', deleteError.message)
    throw new Error(`Failed to delete enquiry: ${deleteError.message}`)
  }

  return true
}

// ============================================================================
// 2. PROPOSALS / QUOTATIONS — SUPABASE ASYNCHRONOUS DATA ACCESS
// ============================================================================

/**
 * Observation 3: Safe quotation-number generator with collision check.
 * Generates numbers in format VCS-YYYY-XXXX without colliding with existing rows.
 */
export async function generateUniqueQuotationNumber(): Promise<string> {
  const sb = getSupabaseServerClient()
  const year = new Date().getFullYear()
  const prefix = `VCS-${year}-`

  const { data: rows, error } = await sb
    .from('proposals')
    .select('quotation_number')
    .like('quotation_number', `${prefix}%`)

  if (error) {
    console.warn('[cms-store] Warning checking existing quotation numbers:', error.message)
  }

  const existingSet = new Set<string>()
  let maxSeq = 0

  for (const r of rows || []) {
    if (r.quotation_number) {
      existingSet.add(r.quotation_number)
      const match = r.quotation_number.match(/^VCS-\d{4}-(\d+)$/)
      if (match) {
        const seq = parseInt(match[1], 10)
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq
        }
      }
    }
  }

  let nextSeq = Math.max(maxSeq + 1, (rows?.length || 0) + 1)
  let candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`

  while (existingSet.has(candidate)) {
    nextSeq++
    candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`
  }

  return candidate
}

/**
 * Observation 4: Allow quotation filtering by either enquiry legacy ID or database UUID.
 */
export async function getQuotations(filter?: { enquiryId?: string }): Promise<QuotationRecord[]> {
  const sb = getSupabaseServerClient()
  let query = sb.from('proposals').select('*').order('created_at', { ascending: false })

  let targetUuid: string | undefined = undefined
  let targetLegacyId: string | undefined = undefined

  if (filter?.enquiryId) {
    const rawEnquiryId = filter.enquiryId.trim()

    if (isUUID(rawEnquiryId)) {
      targetUuid = rawEnquiryId
      const { data: enq } = await sb.from('enquiries').select('legacy_id').eq('id', rawEnquiryId).maybeSingle()
      if (enq?.legacy_id) targetLegacyId = enq.legacy_id
    } else {
      targetLegacyId = rawEnquiryId
      const { data: enq } = await sb.from('enquiries').select('id').eq('legacy_id', rawEnquiryId).maybeSingle()
      if (enq?.id) targetUuid = enq.id
    }

    if (targetUuid && targetLegacyId) {
      query = query.or(`enquiry_id.eq.${targetUuid},legacy_enquiry_id.eq.${targetLegacyId}`)
    } else if (targetUuid) {
      query = query.eq('enquiry_id', targetUuid)
    } else if (targetLegacyId) {
      query = query.eq('legacy_enquiry_id', targetLegacyId)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('[cms-store] Supabase getQuotations error:', error.message)
    throw new Error(`Failed to fetch proposals: ${error.message}`)
  }

  const list = (data || []).map(toProposalRecord)

  if (filter?.enquiryId) {
    const raw = filter.enquiryId.trim()
    return list.filter((q) => {
      return (
        q.enquiryId === raw ||
        q.enquiryUuid === raw ||
        q.legacyEnquiryId === raw ||
        (targetUuid && (q.enquiryId === targetUuid || q.enquiryUuid === targetUuid)) ||
        (targetLegacyId && (q.enquiryId === targetLegacyId || q.legacyEnquiryId === targetLegacyId))
      )
    })
  }

  return list
}

export async function getQuotationById(id: string): Promise<QuotationRecord | null> {
  const sb = getSupabaseServerClient()

  const query = isUUID(id)
    ? sb.from('proposals').select('*').eq('id', id).maybeSingle()
    : sb.from('proposals').select('*').or(`legacy_id.eq.${id},quotation_number.eq.${id}`).maybeSingle()

  const { data, error } = await query
  if (error) {
    console.error('[cms-store] getQuotationById error:', error.message)
    return null
  }

  return data ? toProposalRecord(data) : null
}

export async function saveQuotation(
  data: Omit<QuotationRecord, 'id' | 'created_at'> & { id?: string }
): Promise<QuotationRecord> {
  const sb = getSupabaseServerClient()

  // Package-based calculations
  const packageAmount = data.packageAmount !== undefined ? data.packageAmount : (data.grandTotal || 0)
  const advanceAmount = data.advanceAmount || 0
  const balanceAmount = Math.max(0, packageAmount - advanceAmount)
  const grandTotal = data.taxEnabled && data.taxAmount ? packageAmount + data.taxAmount : packageAmount

  // Resolve enquiry UUID if linked
  let resolvedEnquiryUuid: string | undefined = undefined
  if (data.enquiryId) {
    if (isUUID(data.enquiryId)) {
      resolvedEnquiryUuid = data.enquiryId
    } else {
      const { data: enqRow } = await sb
        .from('enquiries')
        .select('id')
        .eq('legacy_id', data.enquiryId)
        .maybeSingle()
      if (enqRow) {
        resolvedEnquiryUuid = enqRow.id
      }
    }
  }

  let record: QuotationRecord

  // Observation 1: Update existing proposals using their actual database UUID primary key
  if (data.id) {
    const findQuery = isUUID(data.id)
      ? sb.from('proposals').select('*').eq('id', data.id).maybeSingle()
      : sb.from('proposals').select('*').or(`legacy_id.eq.${data.id},quotation_number.eq.${data.id}`).maybeSingle()

    const { data: existingDbRow, error: findError } = await findQuery
    if (findError) {
      console.error('[cms-store] saveQuotation find error:', findError.message)
      throw new Error(`Failed to find proposal: ${findError.message}`)
    }

    if (existingDbRow) {
      const actualDbUuid = existingDbRow.id
      const existing = toProposalRecord(existingDbRow)

      record = {
        ...existing,
        ...data,
        packageAmount,
        advanceAmount,
        balanceAmount,
        grandTotal,
        id: existing.id,
        updated_at: new Date().toISOString(),
      }

      const dbRow = toProposalDbRow(record, resolvedEnquiryUuid)
      // Never mutate the primary key UUID during an update
      delete dbRow.id

      // Update strictly using the proposal's actual database UUID primary key
      const { data: savedRow, error: saveErr } = await sb
        .from('proposals')
        .update(dbRow)
        .eq('id', actualDbUuid)
        .select()
        .single()

      if (saveErr) {
        console.error('[cms-store] Supabase update quotation error:', saveErr.message)
        throw new Error(`Failed to update proposal in Supabase: ${saveErr.message}`)
      }

      record = toProposalRecord(savedRow)

      await logActivity(
        'quotation_status',
        `Proposal #${record.quotationNumber} updated (${record.customerName}, ₹${record.grandTotal.toLocaleString('en-IN')})`,
        { quotationId: record.id, proposalUuid: actualDbUuid, status: record.status }
      ).catch(() => {})

      return record
    }
  }

  // Observation 3: Safe quotation-number collision check for new proposals
  const pNumber = data.quotationNumber || (await generateUniqueQuotationNumber())

  const newId = data.id || `pr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  record = {
    ...data,
    id: newId,
    quotationNumber: pNumber,
    packageAmount,
    advanceAmount,
    balanceAmount,
    grandTotal,
    created_at: new Date().toISOString(),
  }

  const dbRow = toProposalDbRow(record, resolvedEnquiryUuid)
  const { data: insertedRow, error: insertErr } = await sb
    .from('proposals')
    .insert(dbRow)
    .select()
    .single()

  if (insertErr) {
    console.error('[cms-store] Supabase insert quotation error:', insertErr.message)
    throw new Error(`Failed to create proposal in Supabase: ${insertErr.message}`)
  }

  record = toProposalRecord(insertedRow)

  await logActivity(
    'quotation_created',
    `Generated catering proposal #${record.quotationNumber} for ${record.customerName} (₹${record.grandTotal.toLocaleString('en-IN')})`,
    { quotationId: record.id }
  ).catch(() => {})

  return record
}

export async function duplicateQuotation(id: string): Promise<QuotationRecord | null> {
  const source = await getQuotationById(id)
  if (!source) return null

  const sb = getSupabaseServerClient()
  // Observation 3: Safe quotation number collision check for duplicated proposals
  const pNumber = await generateUniqueQuotationNumber()

  const newId = `pr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  const duplicated: QuotationRecord = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    quotationNumber: pNumber,
    customerName: `${source.customerName} (Copy)`,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: undefined,
  }

  let resolvedEnquiryUuid: string | undefined = undefined
  if (duplicated.enquiryId) {
    if (isUUID(duplicated.enquiryId)) {
      resolvedEnquiryUuid = duplicated.enquiryId
    } else {
      const { data: enqRow } = await sb
        .from('enquiries')
        .select('id')
        .eq('legacy_id', duplicated.enquiryId)
        .maybeSingle()
      if (enqRow) resolvedEnquiryUuid = enqRow.id
    }
  }

  const dbRow = toProposalDbRow(duplicated, resolvedEnquiryUuid)
  const { data: inserted, error: insertErr } = await sb
    .from('proposals')
    .insert(dbRow)
    .select()
    .single()

  if (insertErr) {
    console.error('[cms-store] Supabase duplicate proposal error:', insertErr.message)
    throw new Error(`Failed to duplicate proposal in Supabase: ${insertErr.message}`)
  }

  const result = toProposalRecord(inserted)

  await logActivity(
    'quotation_created',
    `Duplicated proposal #${source.quotationNumber} to #${result.quotationNumber} (${result.customerName})`,
    { quotationId: result.id }
  ).catch(() => {})

  return result
}

export async function updateQuotationStatus(
  id: string,
  status: QuotationStatus
): Promise<boolean> {
  const sb = getSupabaseServerClient()

  // Observation 1: Resolve the actual database UUID primary key for status update
  const findQuery = isUUID(id)
    ? sb.from('proposals').select('*').eq('id', id).maybeSingle()
    : sb.from('proposals').select('*').or(`legacy_id.eq.${id},quotation_number.eq.${id}`).maybeSingle()

  const { data: existingDbRow, error: findError } = await findQuery
  if (findError || !existingDbRow) return false

  const actualDbUuid = existingDbRow.id
  const existing = toProposalRecord(existingDbRow)

  existing.status = status
  existing.updated_at = new Date().toISOString()

  const dbRow = toProposalDbRow(existing)
  delete dbRow.id
  delete dbRow.legacy_id

  // Update strictly using the proposal's actual database UUID primary key
  const { error } = await sb
    .from('proposals')
    .update(dbRow)
    .eq('id', actualDbUuid)

  if (error) {
    console.error('[cms-store] updateQuotationStatus error:', error.message)
    throw new Error(`Failed to update proposal status: ${error.message}`)
  }

  await logActivity(
    'quotation_status',
    `Quotation #${existing.quotationNumber} marked as ${status} (${existing.customerName})`,
    { quotationId: existing.id, proposalUuid: actualDbUuid, status }
  ).catch(() => {})

  if (existing.enquiryId) {
    if (status === 'sent') {
      await updateEnquiry(existing.enquiryId, { status: 'quotation_sent' }).catch(() => null)
    } else if (status === 'accepted') {
      await updateEnquiry(existing.enquiryId, { status: 'confirmed' }).catch(() => null)
    }
  }

  return true
}

export async function deleteQuotation(id: string): Promise<boolean> {
  const sb = getSupabaseServerClient()

  // Observation 1: Find existing proposal to resolve primary key UUID
  const findQuery = isUUID(id)
    ? sb.from('proposals').select('id, quotation_number').eq('id', id).maybeSingle()
    : sb.from('proposals').select('id, quotation_number').or(`legacy_id.eq.${id},quotation_number.eq.${id}`).maybeSingle()

  const { data: existing, error: findError } = await findQuery
  if (findError || !existing) return false

  // Delete strictly using the proposal's actual database UUID primary key
  const { error } = await sb
    .from('proposals')
    .delete()
    .eq('id', existing.id)

  if (error) {
    console.error('[cms-store] deleteQuotation error:', error.message)
    throw new Error(`Failed to delete proposal: ${error.message}`)
  }

  return true
}

// ============================================================================
// 3. MENU DATA — SUPABASE ASYNCHRONOUS DATA ACCESS
// ============================================================================

export async function getMenuData(): Promise<{ categories: MenuCategoryRecord[]; items: MenuItemRecord[] }> {
  const sb = getSupabaseServerClient()
  const [catsRes, itemsRes] = await Promise.all([
    sb.from('menu_categories').select('*').order('display_order', { ascending: true }),
    sb.from('menu_items').select('*').order('display_order', { ascending: true }),
  ])

  if (catsRes.error) throw new Error(`Failed to fetch categories: ${catsRes.error.message}`)
  if (itemsRes.error) throw new Error(`Failed to fetch menu items: ${itemsRes.error.message}`)

  return {
    categories: (catsRes.data || []).map(toMenuCategoryRecord),
    items: (itemsRes.data || []).map(toMenuItemRecord),
  }
}
export const getMenuDataAsync = getMenuData

export async function saveMenuItem(item: MenuItemRecord): Promise<MenuItemRecord> {
  const sb = getSupabaseServerClient()
  const dbRow = toMenuItemDbRow(item)
  const { data, error } = await sb
    .from('menu_items')
    .upsert(dbRow, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw new Error(`Failed to save menu item in Supabase: ${error.message}`)
  return toMenuItemRecord(data)
}
export const saveMenuItemAsync = saveMenuItem

export async function deleteMenuItem(id: string): Promise<boolean> {
  const sb = getSupabaseServerClient()
  const { error } = await sb.from('menu_items').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete menu item from Supabase: ${error.message}`)
  return true
}
export const deleteMenuItemAsync = deleteMenuItem

export async function saveMenuCategory(category: MenuCategoryRecord): Promise<MenuCategoryRecord> {
  const sb = getSupabaseServerClient()
  const dbRow = toMenuCategoryDbRow(category)
  const { data, error } = await sb
    .from('menu_categories')
    .upsert(dbRow, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw new Error(`Failed to save menu category in Supabase: ${error.message}`)
  return toMenuCategoryRecord(data)
}
export const saveMenuCategoryAsync = saveMenuCategory

// ============================================================================
// 4. SERVICES — SUPABASE ASYNCHRONOUS DATA ACCESS
// ============================================================================

export async function getServicesData(): Promise<ServiceRecord[]> {
  const sb = getSupabaseServerClient()
  const { data, error } = await sb
    .from('services')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw new Error(`Failed to fetch services: ${error.message}`)
  return (data || []).map(toServiceRecord)
}
export const getServicesDataAsync = getServicesData

export async function saveServicesData(services: ServiceRecord[]): Promise<boolean> {
  const sb = getSupabaseServerClient()
  const rows = services.map(toServiceDbRow)
  const { error } = await sb
    .from('services')
    .upsert(rows, { onConflict: 'id' })

  if (error) throw new Error(`Failed to save services array: ${error.message}`)
  return true
}
export const saveServicesDataAsync = saveServicesData

export async function saveServiceItem(service: ServiceRecord): Promise<ServiceRecord> {
  const sb = getSupabaseServerClient()
  const dbRow = toServiceDbRow(service)
  const { data, error } = await sb
    .from('services')
    .upsert(dbRow, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw new Error(`Failed to save service item: ${error.message}`)
  return toServiceRecord(data)
}
export const saveServiceItemAsync = saveServiceItem

// ============================================================================
// 5. GALLERY — SUPABASE ASYNCHRONOUS DATA ACCESS
// ============================================================================

export async function getGalleryData(): Promise<GalleryRecord[]> {
  const sb = getSupabaseServerClient()
  const { data, error } = await sb
    .from('gallery_items')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw new Error(`Failed to fetch gallery items: ${error.message}`)
  return (data || []).map(toGalleryRecord)
}
export const getGalleryDataAsync = getGalleryData

export async function saveGalleryData(gallery: GalleryRecord[]): Promise<boolean> {
  const sb = getSupabaseServerClient()
  const rows = gallery.map(toGalleryDbRow)
  const { error } = await sb
    .from('gallery_items')
    .upsert(rows, { onConflict: 'id' })

  if (error) throw new Error(`Failed to save gallery array: ${error.message}`)
  return true
}
export const saveGalleryDataAsync = saveGalleryData

export async function saveGalleryItem(item: GalleryRecord): Promise<GalleryRecord> {
  const sb = getSupabaseServerClient()
  const dbRow = toGalleryDbRow(item)
  const { data, error } = await sb
    .from('gallery_items')
    .upsert(dbRow, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw new Error(`Failed to save gallery item: ${error.message}`)
  return toGalleryRecord(data)
}
export const saveGalleryItemAsync = saveGalleryItem

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const sb = getSupabaseServerClient()
  const { error } = await sb.from('gallery_items').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete gallery item: ${error.message}`)
  return true
}
export const deleteGalleryItemAsync = deleteGalleryItem

// ============================================================================
// 6. CLIENTS — SUPABASE ASYNCHRONOUS DATA ACCESS
// ============================================================================

export async function getClientsData(): Promise<ClientRecord[]> {
  const sb = getSupabaseServerClient()
  const { data, error } = await sb
    .from('clients')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw new Error(`Failed to fetch clients: ${error.message}`)
  return (data || []).map(toClientRecord)
}
export const getClientsDataAsync = getClientsData

export async function saveClientsData(clients: ClientRecord[]): Promise<boolean> {
  const sb = getSupabaseServerClient()
  const rows = clients.map(toClientDbRow)
  const { error } = await sb.from('clients').upsert(rows, { onConflict: 'id' })
  if (error) throw new Error(`Failed to save clients array: ${error.message}`)
  return true
}
export const saveClientsDataAsync = saveClientsData

export async function saveClientItem(client: ClientRecord): Promise<ClientRecord> {
  const sb = getSupabaseServerClient()
  const dbRow = toClientDbRow(client)
  const { data, error } = await sb
    .from('clients')
    .upsert(dbRow, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw new Error(`Failed to save client item: ${error.message}`)
  return toClientRecord(data)
}
export const saveClientItemAsync = saveClientItem

export async function deleteClientItem(id: string): Promise<boolean> {
  const sb = getSupabaseServerClient()
  const { error } = await sb.from('clients').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete client: ${error.message}`)
  return true
}
export const deleteClientItemAsync = deleteClientItem

// ============================================================================
// 7. SITE CONTENT — SUPABASE ASYNCHRONOUS DATA ACCESS
// ============================================================================

export async function getSiteContentData(): Promise<SiteContentRecord> {
  const sb = getSupabaseServerClient()
  const { data, error } = await sb.from('site_content').select('*')
  if (error) throw new Error(`Failed to fetch site content: ${error.message}`)
  return toSiteContentRecord(data || [])
}
export const getSiteContentDataAsync = getSiteContentData

export async function saveSiteContentData(
  content: Partial<SiteContentRecord>
): Promise<SiteContentRecord> {
  const sb = getSupabaseServerClient()

  // Observation 2: Fetch current content to merge with existing JSONB data instead of replacing entire section
  const { data: existingRows, error: fetchErr } = await sb.from('site_content').select('*')
  if (fetchErr) {
    console.error('[cms-store] saveSiteContentData fetch error:', fetchErr.message)
    throw new Error(`Failed to fetch current site content for merge: ${fetchErr.message}`)
  }

  const existingMap = new Map((existingRows || []).map((r) => [r.key, r.data]))
  const now = new Date().toISOString()
  const rowsToUpsert: Array<{ key: string; section: string; data: any; updated_at: string }> = []

  const sectionKeys: Array<keyof SiteContentRecord> = ['hero', 'story', 'tribute', 'contact', 'registrations']

  for (const section of sectionKeys) {
    if (content[section]) {
      const incoming = content[section]
      const existingData = existingMap.get(section) || {}

      // Deep/shallow merge existing JSONB object with incoming partial data
      const mergedData =
        typeof existingData === 'object' &&
        existingData !== null &&
        typeof incoming === 'object' &&
        incoming !== null &&
        !Array.isArray(incoming)
          ? { ...existingData, ...incoming }
          : incoming

      rowsToUpsert.push({
        key: section,
        section,
        data: mergedData,
        updated_at: now,
      })
    }
  }

  if (rowsToUpsert.length > 0) {
    const { error: upsertErr } = await sb.from('site_content').upsert(rowsToUpsert, { onConflict: 'key' })
    if (upsertErr) {
      console.error('[cms-store] saveSiteContentData upsert error:', upsertErr.message)
      throw new Error(`Failed to save site content: ${upsertErr.message}`)
    }
  }

  return getSiteContentData()
}
export const saveSiteContentDataAsync = saveSiteContentData

// ============================================================================
// 8. SITE SETTINGS — SUPABASE ASYNCHRONOUS DATA ACCESS
// ============================================================================

export async function getSiteSettingsData(): Promise<SiteSettingsRecord> {
  const sb = getSupabaseServerClient()
  const { data, error } = await sb
    .from('admin_settings')
    .select('*')
    .eq('key', 'general')
    .maybeSingle()

  if (error) {
    console.error('[cms-store] getSiteSettingsData error:', error.message)
  }

  return toSiteSettingsRecord(data)
}
export const getSiteSettingsDataAsync = getSiteSettingsData

export async function saveSiteSettingsData(
  settings: Partial<SiteSettingsRecord>
): Promise<SiteSettingsRecord> {
  const sb = getSupabaseServerClient()
  const row = toSiteSettingsDbRow(settings, 'general')
  const { data, error } = await sb
    .from('admin_settings')
    .upsert(row, { onConflict: 'key' })
    .select()
    .single()

  if (error) throw new Error(`Failed to save site settings: ${error.message}`)
  return toSiteSettingsRecord(data)
}
export const saveSiteSettingsDataAsync = saveSiteSettingsData

// ============================================================================
// 9. ACTIVITIES — SUPABASE ASYNCHRONOUS DATA ACCESS
// ============================================================================

export async function getActivities(limit: number = 10): Promise<ActivityRecord[]> {
  const sb = getSupabaseServerClient()
  const { data, error } = await sb
    .from('activities')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[cms-store] getActivities error:', error.message)
    return []
  }

  return (data || []).map(toActivityRecord)
}
export const getActivitiesAsync = getActivities

export async function logActivity(
  type: ActivityRecord['type'],
  description: string,
  metadata?: any
): Promise<void> {
  try {
    const sb = getSupabaseServerClient()
    const dbRow = toActivityDbRow({
      type,
      description,
      metadata,
      timestamp: new Date().toISOString(),
    })

    await sb.from('activities').insert(dbRow)
  } catch (err) {
    console.warn('[cms-store] Failed to log activity in Supabase:', err)
  }
}
export const logActivityAsync = logActivity

// ============================================================================
// 10. COMPOSITE CMS BUNDLE — SUPABASE ASYNCHRONOUS DATA ACCESS
// ============================================================================

export async function getCMSData(): Promise<CMSData> {
  const [
    enquiries,
    menu,
    services,
    gallery,
    clients,
    content,
    settings,
    quotations,
    activities,
  ] = await Promise.all([
    getEnquiries(),
    getMenuData(),
    getServicesData(),
    getGalleryData(),
    getClientsData(),
    getSiteContentData(),
    getSiteSettingsData(),
    getQuotations(),
    getActivities(50),
  ])

  return {
    enquiries,
    menuCategories: menu.categories,
    menuItems: menu.items,
    services,
    gallery,
    clients,
    content,
    settings,
    quotations,
    activities,
  }
}
export const getCMSDataAsync = getCMSData

export async function saveCMSData(data: CMSData): Promise<boolean> {
  await Promise.all([
    saveServicesData(data.services),
    saveGalleryData(data.gallery),
    saveClientsData(data.clients),
    saveSiteContentData(data.content),
    saveSiteSettingsData(data.settings),
  ])
  return true
}
export const saveCMSDataAsync = saveCMSData
