export interface GalleryItem {
  id: string
  titleEn: string
  titleTa: string
  category: 'muhurtham' | 'feasts' | 'decor' | 'liveCounters' | 'team'
  imageUrl: string
  captionEn: string
  captionTa: string
}

export const galleryItems: GalleryItem[] = [
  {
    id: 'g-1',
    titleEn: 'Auspicious Banana Leaf Virundhu Hospitality',
    titleTa: 'சுப முகூர்த்த தலைவாழை இலை விருந்து உபசரிப்பு',
    category: 'muhurtham',
    imageUrl: '/images/gallery/traditional-banana-leaf-feast.webp',
    captionEn: 'Traditional 24-dish South Indian wedding feast served with pure ghee, hot payasam, and crisps on fresh plantain leaves.',
    captionTa: '24 வகை பதார்த்தங்களுடன் தூய நெய், பாயாசம், அப்பளத்துடன் பரிமாறப்படும் மங்களகரமான தலைவாழை இலை விருந்து.',
  },
  {
    id: 'g-2',
    titleEn: 'Artisanal Vegetable & Fruit Carving Centerpiece',
    titleTa: 'கலைநயமிக்க காய்கறி & பழ அலங்கார அரங்கம்',
    category: 'decor',
    imageUrl: '/images/gallery/artistic-vegetable-carving-display.webp',
    captionEn: 'Magnificent banquet entrance centerpiece sculpted with peacocks, graceful swans, floral motifs, and carved watermelons.',
    captionTa: 'திருமண மண்டப வாயிலில் கண்கவர் மயில்கள், அன்னப் பறவைகள் மற்றும் பழங்களால் செதுக்கப்பட்ட கலைநயமிக்க வரவேற்பு அலங்காரம்.',
  },
  {
    id: 'g-3',
    titleEn: 'Velavan Signature Emblem Fruit Carving',
    titleTa: 'வேலவன் தனித்துவ இலச்சினை தர்பூசணி செதுக்கல்',
    category: 'decor',
    imageUrl: '/images/gallery/velavan-signature-watermelon-carving.webp',
    captionEn: 'Hand-carved royal watermelon emblem showcasing the official Velavan Catering chef crest and executive culinary contact details.',
    captionTa: 'வேலவன் கேட்டரிங் அதிகாரப்பூர்வ இலச்சினை மற்றும் தொடர்பு எண்களுடன் கைவண்ணத்தில் உருவான நேர்த்தியான தர்பூசணி சிற்பம்.',
  },
  {
    id: 'g-4',
    titleEn: 'Illuminated Luxury Buffet & Brass Uruli Service',
    titleTa: 'ஒளிரும் அலங்கார பஃபே & பாரம்பரிய பித்தளை உபசரிப்பு',
    category: 'feasts',
    imageUrl: '/images/gallery/luxury-illuminated-buffet-counter.webp',
    captionEn: 'Warmly illuminated lattice banquet counters featuring traditional brass chafing urns serving fragrant culinary creations.',
    captionTa: 'பாரம்பரிய பித்தளை பாத்திரங்களில் மணமணக்கும் சுவையான பதார்த்தங்களுடன் ஒளிரும் நவீன பஃபே அரங்கம்.',
  },
  {
    id: 'g-5',
    titleEn: 'Live Hot Buffet Culinary Service',
    titleTa: 'சுடச்சுட நேரடி பஃபே உணவு உபசரிப்பு',
    category: 'liveCounters',
    imageUrl: '/images/gallery/live-buffet-hot-service.webp',
    captionEn: 'Our skilled hospitality staff serving piping hot delicacies directly from heavy-gauge traditional brass vessels with genuine warmth.',
    captionTa: 'பித்தளை பாத்திரங்களிலிருந்து விருந்தினர்களுக்கு சுடச்சுட சுவையான உணவுகளை மனநிறைவோடு பரிமாறும் எங்கள் ஊழியர்கள்.',
  },
  {
    id: 'g-6',
    titleEn: 'Traditional South Indian Filter Coffee Stall',
    titleTa: 'பாரம்பரிய மணக்கும் பில்டர் காபி நேரடி அரங்கம்',
    category: 'liveCounters',
    imageUrl: '/images/gallery/traditional-filter-coffee-counter.webp',
    captionEn: 'Freshly decocted Kumbakonam-style filter coffee brewed live with pure milk in stainless steel urns and served in brass davarah cups.',
    captionTa: 'தூய பசும்பாலில் சுடச்சுட வாடிக்கையாளர் கண்முன்னே தயாரிக்கப்படும் மணமணக்கும் கும்பகோணம் டிகிரி பில்டர் காபி அரங்கம்.',
  },
  {
    id: 'g-7',
    titleEn: 'Grand Banquet Dining Hall & Festive Hospitality',
    titleTa: 'பிரம்மாண்ட திருமண மண்டப உணவுக் கூடம்',
    category: 'feasts',
    imageUrl: '/images/gallery/grand-banquet-dining-hall.webp',
    captionEn: 'Spacious banquet hall setup with golden linens, pristine chair covers, and seamless dining hospitality for thousands of wedding guests.',
    captionTa: 'ஆயிரக்கணக்கான விருந்தினர்கள் அமர்ந்து மகிழ்ச்சியோடு உணவருந்தும் வகையில் பொன்நிற அலங்காரத்துடன் கூடிய நேர்த்தியான உணவு அரங்கம்.',
  },
  {
    id: 'g-8',
    titleEn: 'Attentive Velavan Hospitality & Guest Care',
    titleTa: 'கனிவான வேலவன் விருந்தோம்பல் & தொடர் கவனிப்பு',
    category: 'team',
    imageUrl: '/images/gallery/attentive-banquet-hospitality.webp',
    captionEn: 'Attentive service staff in signature embroidered green vests overseeing guest comfort and dining satisfaction across the hall.',
    captionTa: 'வேலவன் கேட்டரிங் பிரத்யேக சீருடையில் விருந்தினர்களின் ஒவ்வொரு தேவையையும் உடனுக்குடன் கவனிக்கும் எங்கள் உபசரிப்பு ஊழியர்.',
  },
  {
    id: 'g-9',
    titleEn: 'Uniformed Service Crew & Food Hygiene Standards',
    titleTa: 'முறையான சீருடை & தூய்மையான உணவு சேவை குழு',
    category: 'team',
    imageUrl: '/images/gallery/professional-service-team-lineup.webp',
    captionEn: 'Disciplined service personnel equipped with hygienic caps, face masks, and spotless uniforms stationed ready for banquet service.',
    captionTa: 'தலைக்கவசம், முகக்கவசம் மற்றும் சீருடையுடன் தூய்மை நெறிமுறைகளை முழுமையாக பின்பற்றி விருந்தினர்களை வரவேற்கும் எங்கள் சிறப்புக் குழு.',
  },
  {
    id: 'g-10',
    titleEn: 'The Complete Velavan Catering Brigade',
    titleTa: 'முழுமையான வேலவன் கேட்டரிங் குடும்பம்',
    category: 'team',
    imageUrl: '/images/gallery/velavan-catering-team-portrait.webp',
    captionEn: 'The proud master chefs, supervisors, banquet leads, and service specialists that make every Velavan event an unforgettable success.',
    captionTa: 'ஒவ்வொரு சுபநிகழ்ச்சியையும் சுவைமிகு வெற்றியாக மாற்றும் வேலவன் கேட்டரிங்கின் தலைமை சமையல் கலைஞர்கள் மற்றும் களப்பணியாளர்கள்.',
  },
  {
    id: 'g-11',
    titleEn: 'Catering Crew Banana Leaf Dining Tradition',
    titleTa: 'பாரம்பரிய இலை விருந்தில் எங்கள் கேட்டரிங் குழு',
    category: 'team',
    imageUrl: '/images/gallery/catering-crew-traditional-meal.webp',
    captionEn: 'Our event culinary crew in ceremonial purple uniforms sharing a traditional South Indian banana leaf feast together.',
    captionTa: 'வேலவன் கேட்டரிங் சிறப்பு ஊதா நிற உடையில் மங்களகரமான தலைவாழை இலை விருந்தை ஒன்றாக ருசிக்கும் எங்கள் பணியாளர் குழு.',
  },
]
