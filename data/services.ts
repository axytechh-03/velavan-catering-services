export interface ServiceItem {
  id: string
  key: 's1' | 's2' | 's3' | 's4' | 's5' | 's6'
  image: string
  capacity: string
  leafStyle: string
  featuredDishes: { en: string[]; ta: string[] }
}

export const servicesData: ServiceItem[] = [
  {
    id: 'wedding-muhurtham',
    key: 's1',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80',
    capacity: '200 to 5,000+ Guests',
    leafStyle: 'Traditional Plantain Leaf Feast',
    featuredDishes: {
      en: ['Pure Ghee Badam Halwa', 'Chinna Vengayam Sambar', 'Tender Nungu Payasam', 'Elaneer Idli'],
      ta: ['பாதாம் அல்வா', 'சின்ன வெங்காய சாம்பார்', 'இளநீர் நுங்கு பாயாசம்', 'இளநீர் இட்லி'],
    },
  },
  {
    id: 'reception-catering',
    key: 's2',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
    capacity: '300 to 10,000+ Guests',
    leafStyle: 'Live Tawa Counters & Buffet Spread',
    featuredDishes: {
      en: ['Live Bun Parotta Counter', 'Dum Seeraga Samba Biryani', 'Paneer Butter Masala', 'Brownie with Ice Cream'],
      ta: ['பன் புரோட்டா லைவ் கவுண்டர்', 'சீரக சம்பா பிரியாணி', 'பன்னீர் பட்டர் மசாலா', 'ஹாட் பிரவுனி ஐஸ்கிரீம்'],
    },
  },
  {
    id: 'engagement-betrothal',
    key: 's3',
    image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=1200&q=80',
    capacity: '100 to 1,500 Guests',
    leafStyle: 'Regal Alliance Feast',
    featuredDishes: {
      en: ['Welcome Elaneer Shake', 'Balaji Laddu', 'Special Kari Dosa', 'Pasi Paruppu Payasam'],
      ta: ['இளநீர் மில்க் ஷேக்', 'பாலாஜி லட்டு', 'கரி தோசை', 'பாசிப்பருப்பு பாயாசம்'],
    },
  },
  {
    id: 'pre-wedding-functions',
    key: 's4',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    capacity: '100 to 1,000 Guests',
    leafStyle: 'Interactive Chaat & Finger Food Stations',
    featuredDishes: {
      en: ['Pallipalayam Veg Roast', 'Cheese Corn Poppers', 'Goli Soda Bar', 'Mulligatawny Soup'],
      ta: ['பள்ளிபாளையம் வறுவல்', 'சீஸ் கான் பால்ஸ்', 'கோலி சோடா பார்', 'முள்ளிக்கத்துவாணி சூப்'],
    },
  },
  {
    id: 'family-traditional',
    key: 's5',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=80',
    capacity: '50 to 800 Guests',
    leafStyle: 'Customary Satvik Plantain Feast',
    featuredDishes: {
      en: ['Paruppu Urundai Kuzhambu', 'Avial & Adai', 'Mor Kuzhambu with Vada', 'Claypot Curd Rice'],
      ta: ['பருப்பு உருண்டை குழம்பு', 'அடை அவியல்', 'மோர்க்குழம்பு வடை', 'மண்பானை தயிர்சாதம்'],
    },
  },
  {
    id: 'grand-wedding-gatherings',
    key: 's6',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    capacity: '1,000 to 10,000+ Guests',
    leafStyle: 'High-Volume Synchronized Banquet Halls',
    featuredDishes: {
      en: ['Mass Banquet Management', 'Round-the-clock Hot Feasts', 'Dedicated VIP Leaf Service', 'Zero Delay Service'],
      ta: ['பிரம்மாண்ட மேலாண்மை', 'தாமதமில்லா சுடச்சுட உணவு', 'வி.ஐ.பி வாழை இலை சேவை', 'நேர்த்தியான பரிமாறுதல்'],
    },
  },
]
