import fs from 'fs'
import path from 'path'
import { supabase, isSupabaseConfigured, EnquirySubmission } from '@/lib/supabase'
import { menuCategories as seedCategories, menuItems as seedItems, MenuItem, MenuCategory } from '@/data/menu'
import { servicesData as seedServicesRaw } from '@/data/services'

// ============================================================================
// Types
// ============================================================================

export type EnquiryStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled'

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
  admin_notes?: string
  created_at: string
  updated_at?: string
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

// ============================================================================
// File Path & Thread-Safe Local Storage
// ============================================================================

const DATA_DIR = path.join(process.cwd(), 'data')
const CMS_FILE_PATH = path.join(DATA_DIR, 'cms-data.json')

function getInitialCMSData(): CMSData {
  return {
    enquiries: SEED_ENQUIRIES,
    menuCategories: seedCategories.map((c, i) => ({ ...c, active: true, order: i + 1 })),
    menuItems: seedItems.map((item, i) => ({ ...item, isVeg: true, active: true, order: i + 1 })),
    services: SEED_SERVICES,
    gallery: SEED_GALLERY,
    clients: SEED_CLIENTS,
    content: SEED_CONTENT,
    settings: SEED_SETTINGS,
  }
}

/**
 * Loads CMS data synchronously from JSON file with automatic seed creation
 */
export function getCMSData(): CMSData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    if (!fs.existsSync(CMS_FILE_PATH)) {
      const initial = getInitialCMSData()
      fs.writeFileSync(CMS_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8')
      return initial
    }

    const raw = fs.readFileSync(CMS_FILE_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<CMSData>

    // Ensure all entities are present
    const initial = getInitialCMSData()
    return {
      enquiries: parsed.enquiries || initial.enquiries,
      menuCategories: parsed.menuCategories || initial.menuCategories,
      menuItems: parsed.menuItems || initial.menuItems,
      services: parsed.services || initial.services,
      gallery: parsed.gallery || initial.gallery,
      clients: parsed.clients || initial.clients,
      content: { ...initial.content, ...(parsed.content || {}) },
      settings: { ...initial.settings, ...(parsed.settings || {}) },
    }
  } catch (err) {
    console.error('Error reading CMS data from JSON file, returning seed data:', err)
    return getInitialCMSData()
  }
}

/**
 * Writes CMS data atomically to JSON file
 */
export function saveCMSData(data: CMSData): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    const tempPath = `${CMS_FILE_PATH}.tmp`
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8')
    fs.renameSync(tempPath, CMS_FILE_PATH)
    return true
  } catch (err) {
    console.error('Error saving CMS data to JSON file:', err)
    return false
  }
}

// ============================================================================
// Entity CRUD Helpers
// ============================================================================

// Enquiries
export async function getEnquiries(): Promise<EnquiryRecord[]> {
  // If Supabase is configured, attempt fetch from Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data as EnquiryRecord[]
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local file:', e)
    }
  }

  const cms = getCMSData()
  return cms.enquiries
}

export async function addEnquiry(enquiry: Omit<EnquiryRecord, 'id' | 'created_at'>): Promise<EnquiryRecord> {
  const newRecord: EnquiryRecord = {
    ...enquiry,
    id: `enq-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    status: enquiry.status || 'new',
    created_at: new Date().toISOString(),
  }

  // 1. Save to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('enquiries').insert([newRecord])
    } catch (e) {
      console.error('Failed to sync enquiry to Supabase:', e)
    }
  }

  // 2. Always persist to local CMS Store
  const cms = getCMSData()
  cms.enquiries.unshift(newRecord)
  saveCMSData(cms)

  return newRecord
}

export async function updateEnquiry(
  id: string,
  updates: Partial<EnquiryRecord>
): Promise<EnquiryRecord | null> {
  // Sync to Supabase
  if (isSupabaseConfigured && supabase && !id.startsWith('enq-')) {
    try {
      await supabase.from('enquiries').update(updates).eq('id', id)
    } catch (e) {
      console.error('Failed to update enquiry in Supabase:', e)
    }
  }

  const cms = getCMSData()
  const idx = cms.enquiries.findIndex((e) => e.id === id)
  if (idx === -1) return null

  cms.enquiries[idx] = {
    ...cms.enquiries[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  saveCMSData(cms)
  return cms.enquiries[idx]
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase && !id.startsWith('enq-')) {
    try {
      await supabase.from('enquiries').delete().eq('id', id)
    } catch (e) {
      console.error('Failed to delete enquiry from Supabase:', e)
    }
  }

  const cms = getCMSData()
  const filtered = cms.enquiries.filter((e) => e.id !== id)
  if (filtered.length === cms.enquiries.length) return false

  cms.enquiries = filtered
  saveCMSData(cms)
  return true
}

// Menu Items
export function getMenuData() {
  const cms = getCMSData()
  return {
    categories: cms.menuCategories,
    items: cms.menuItems,
  }
}

export function saveMenuItem(item: MenuItemRecord): MenuItemRecord {
  const cms = getCMSData()
  const existingIdx = cms.menuItems.findIndex((i) => i.id === item.id)

  if (existingIdx >= 0) {
    cms.menuItems[existingIdx] = { ...cms.menuItems[existingIdx], ...item }
  } else {
    cms.menuItems.unshift({
      ...item,
      id: item.id || `dish-${Date.now()}`,
      order: cms.menuItems.length + 1,
      active: item.active !== false,
    })
  }

  saveCMSData(cms)
  return item
}

export function deleteMenuItem(id: string): boolean {
  const cms = getCMSData()
  const filtered = cms.menuItems.filter((i) => i.id !== id)
  if (filtered.length === cms.menuItems.length) return false
  cms.menuItems = filtered
  saveCMSData(cms)
  return true
}

export function saveMenuCategory(category: MenuCategoryRecord): MenuCategoryRecord {
  const cms = getCMSData()
  const existingIdx = cms.menuCategories.findIndex((c) => c.id === category.id)

  if (existingIdx >= 0) {
    cms.menuCategories[existingIdx] = { ...cms.menuCategories[existingIdx], ...category }
  } else {
    cms.menuCategories.push({
      ...category,
      id: category.id || `cat-${Date.now()}`,
      order: cms.menuCategories.length + 1,
      active: true,
    })
  }

  saveCMSData(cms)
  return category
}

// Services
export function getServicesData(): ServiceRecord[] {
  return getCMSData().services
}

export function saveServicesData(services: ServiceRecord[]): boolean {
  const cms = getCMSData()
  cms.services = services
  return saveCMSData(cms)
}

export function saveServiceItem(service: ServiceRecord): ServiceRecord {
  const cms = getCMSData()
  const idx = cms.services.findIndex((s) => s.id === service.id)
  if (idx >= 0) {
    cms.services[idx] = { ...cms.services[idx], ...service }
  } else {
    cms.services.push(service)
  }
  saveCMSData(cms)
  return service
}

// Gallery
export function getGalleryData(): GalleryRecord[] {
  return getCMSData().gallery
}

export function saveGalleryData(gallery: GalleryRecord[]): boolean {
  const cms = getCMSData()
  cms.gallery = gallery
  return saveCMSData(cms)
}

export function saveGalleryItem(item: GalleryRecord): GalleryRecord {
  const cms = getCMSData()
  const idx = cms.gallery.findIndex((g) => g.id === item.id)
  if (idx >= 0) {
    cms.gallery[idx] = { ...cms.gallery[idx], ...item }
  } else {
    cms.gallery.unshift({
      ...item,
      id: item.id || `gal-${Date.now()}`,
      order: cms.gallery.length + 1,
      active: item.active !== false,
    })
  }
  saveCMSData(cms)
  return item
}

export function deleteGalleryItem(id: string): boolean {
  const cms = getCMSData()
  const filtered = cms.gallery.filter((g) => g.id !== id)
  if (filtered.length === cms.gallery.length) return false
  cms.gallery = filtered
  saveCMSData(cms)
  return true
}

// Clients
export function getClientsData(): ClientRecord[] {
  return getCMSData().clients
}

export function saveClientsData(clients: ClientRecord[]): boolean {
  const cms = getCMSData()
  cms.clients = clients
  return saveCMSData(cms)
}

export function saveClientItem(client: ClientRecord): ClientRecord {
  const cms = getCMSData()
  const idx = cms.clients.findIndex((c) => c.id === client.id)
  if (idx >= 0) {
    cms.clients[idx] = { ...cms.clients[idx], ...client }
  } else {
    cms.clients.push({
      ...client,
      id: client.id || `c-${Date.now()}`,
      order: cms.clients.length + 1,
      active: client.active !== false,
    })
  }
  saveCMSData(cms)
  return client
}

export function deleteClientItem(id: string): boolean {
  const cms = getCMSData()
  const filtered = cms.clients.filter((c) => c.id !== id)
  if (filtered.length === cms.clients.length) return false
  cms.clients = filtered
  saveCMSData(cms)
  return true
}

// Content
export function getSiteContentData(): SiteContentRecord {
  return getCMSData().content
}

export function saveSiteContentData(content: Partial<SiteContentRecord>): SiteContentRecord {
  const cms = getCMSData()
  cms.content = {
    ...cms.content,
    ...content,
  }
  saveCMSData(cms)
  return cms.content
}

// Settings
export function getSiteSettingsData(): SiteSettingsRecord {
  return getCMSData().settings
}

export function saveSiteSettingsData(settings: Partial<SiteSettingsRecord>): SiteSettingsRecord {
  const cms = getCMSData()
  cms.settings = {
    ...cms.settings,
    ...settings,
    updatedAt: new Date().toISOString(),
  }
  saveCMSData(cms)
  return cms.settings
}
