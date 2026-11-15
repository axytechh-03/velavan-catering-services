export interface GalleryItem {
  id: string
  titleEn: string
  titleTa: string
  category: 'muhurtham' | 'feasts' | 'sweets' | 'liveCounters'
  imageUrl: string
  captionEn: string
  captionTa: string
}

export const galleryItems: GalleryItem[] = [
  {
    id: 'g-1',
    titleEn: 'Auspicious Muhurtham Banana Leaf Feast',
    titleTa: 'சுப முகூர்த்த தலைவாழை இலை விருந்து',
    category: 'muhurtham',
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80',
    captionEn: 'Traditional 24-dish South Indian wedding feast served with pure ghee, hot payasam, and crisps on fresh plantain leaves.',
    captionTa: '24 வகை பதார்த்தங்களுடன் தூய நெய், பாயாசம், அப்பளத்துடன் பரிமாறப்படும் மங்களகரமான தலைவாழை இலை விருந்து.',
  },
  {
    id: 'g-2',
    titleEn: 'Live Crispy Dosa & Bun Parotta Counter',
    titleTa: 'நேரடி தோசை & பன் புரோட்டா கவுண்டர்',
    category: 'liveCounters',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
    captionEn: 'Master tawa chefs preparing custom roast dosas, bun parottas, and fiery gravies right in front of wedding guests.',
    captionTa: 'வாடிக்கையாளர் கண்முன்னே சுடச்சுட வார்க்கப்படும் நெய் ரோஸ்ட் மற்றும் பன் புரோட்டா.',
  },
  {
    id: 'g-3',
    titleEn: 'Royal Wedding Sweets & Confections Display',
    titleTa: 'அரச திருமண நெய் சுவீட் அரங்கம்',
    category: 'sweets',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1200&q=80',
    captionEn: 'Artisanal Badam Halwa, Kaju Katlis, and Balaji Laddus decorated with pure silver foil and saffron.',
    captionTa: 'பாதாம் அல்வா, காஜூ கத்லி மற்றும் பாலாஜி லட்டுக்களின் சுவை நிறைந்த அரங்கம்.',
  },
  {
    id: 'g-4',
    titleEn: 'Grand Reception Banquet Buffet Spread',
    titleTa: 'பிரம்மாண்ட திருமண வரவேற்பு பஃபே',
    category: 'feasts',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
    captionEn: 'Lavish evening reception dining setup arranged for thousands of invited guests with floral decor.',
    captionTa: 'ஆயிரக்கணக்கான விருந்தினர்கள் ரசித்து உண்ணும் வகையில் அமைக்கப்பட்ட பிரம்மாண்ட வரவேற்பு அரங்கம்.',
  },
  {
    id: 'g-5',
    titleEn: 'Seeraga Samba Dum Biryani Handi',
    titleTa: 'சீரக சம்பா மண்சட்டி தம் பிரியாணி',
    category: 'feasts',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
    captionEn: 'Slow wood-fired dum cooked Seeraga Samba biryani garnished with fried cashews and fresh mint.',
    captionTa: 'விறகு அடுப்பில் மெதுவாக தம் போடப்பட்ட மணமணக்கும் சீரக சம்பா பிரியாணி.',
  },
  {
    id: 'g-6',
    titleEn: 'Kumbakonam Degree Coffee Live Stall',
    titleTa: 'கும்பகோணம் டிகிரி பில்டர் காபி கவுண்டர்',
    category: 'liveCounters',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    captionEn: 'Traditional brass davarah froth coffee station welcoming guests after the auspicious ceremony.',
    captionTa: 'பித்தளை டபரா செட்டில் மணக்கும் அசல் கும்பகோணம் டிகிரி பில்டர் காபி.',
  },
]
