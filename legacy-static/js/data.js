/**
 * Velavan Catering Services - Data Store
 * Contains scalable seed data for 60+ dishes across 22 categories (11 Veg + 11 Non-Veg),
 * gallery showcase, client partners, default settings, and sample enquiries.
 */

const VELAVAN_DEFAULT_CONFIG = {
  brandName: "Velavan Catering Services",
  brandNameTa: "வேலவன் கேட்டரிங் சர்வீசஸ்",
  tagline: "Grand Feasts, Timeless Hospitality",
  taglineTa: "பிரம்மாண்ட விருந்துகள், காலத்தால் அழியாத விருந்தோம்பல்",
  phone: "+91 98400 12345",
  whatsappPhone: "919840012345", // Format: country code + 10 digits
  email: "enquiry@velavancatering.com",
  address: "Anna Nagar / T. Nagar, Chennai, Tamil Nadu",
  addressTa: "அண்ணா நகர் / தி. நகர், சென்னை, தமிழ்நாடு",
  agencyCredit: "AXY Technologies"
};

const MENU_CATEGORIES = {
  veg: [
    { key: "all", labelEn: "All Categories", labelTa: "அனைத்து வகைகள்" },
    { key: "breakfast", labelEn: "Breakfast", labelTa: "காலை உணவு" },
    { key: "tiffin", labelEn: "Tiffin", labelTa: "சிற்றுண்டி" },
    { key: "meals", labelEn: "Traditional Meals", labelTa: "பாரம்பரிய இலை சாப்பாடு" },
    { key: "starters", labelEn: "Starters", labelTa: "தொடக்க உணவுகள்" },
    { key: "snacks", labelEn: "Snacks", labelTa: "சிற்றுண்டி & மாலை வகைகள்" },
    { key: "rice", labelEn: "Rice Varieties", labelTa: "சாத வகைகள்" },
    { key: "gravies", labelEn: "Gravies & Sambar", labelTa: "குழம்பு & சாம்பார்" },
    { key: "breads", labelEn: "Breads & Roti", labelTa: "ரொட்டி & சப்பாத்தி" },
    { key: "sweets", labelEn: "Sweets", labelTa: "இனிப்புகள்" },
    { key: "desserts", labelEn: "Desserts & Payasam", labelTa: "டெசர்ட்ஸ் & பாயாசம்" },
    { key: "beverages", labelEn: "Beverages", labelTa: "பாரம்பரிய பானங்கள்" }
  ],
  nonveg: [
    { key: "all", labelEn: "All Categories", labelTa: "அனைத்து வகைகள்" },
    { key: "biryani", labelEn: "Biryani Varieties", labelTa: "பிரியாணி வகைகள்" },
    { key: "chicken", labelEn: "Chicken Specialities", labelTa: "கோழி இறைச்சி ஸ்பெஷல்" },
    { key: "mutton", labelEn: "Mutton Delicacies", labelTa: "ஆட்டுக்கறி ஸ்பெஷல்" },
    { key: "fish", labelEn: "Fish Specialities", labelTa: "மீன் வகைகள்" },
    { key: "seafood", labelEn: "Seafood (Prawns & Crab)", labelTa: "கடல் உணவு (இறால் & நண்டு)" },
    { key: "starters", labelEn: "Non-Veg Starters", labelTa: "அசைவ ஸ்டார்ட்டர்ஸ்" },
    { key: "rice", labelEn: "Rice & Kushka", labelTa: "சாதம் & குஷ்கா" },
    { key: "gravies", labelEn: "Gravies & Salna", labelTa: "அசைவ குழம்பு & சால்னா" },
    { key: "special", labelEn: "Chettinad & Kongu Special", labelTa: "செட்டிநாடு & கொங்கு ஸ்பெஷல்" },
    { key: "desserts", labelEn: "Desserts", labelTa: "டெசர்ட்ஸ்" },
    { key: "beverages", labelEn: "Beverages", labelTa: "பானங்கள்" }
  ]
};

const DEFAULT_MENU_DATA = {
  veg: [
    // Breakfast
    {
      id: "v-bf-1",
      name: "Ghee Mini Podi Idli",
      nameTa: "நெய் மினி பொடி இட்லி",
      desc: "Button steamed rice cakes tossed in freshly ground gun-powder podi and aromatic clarified butter.",
      descTa: "நறுமணமிக்க சுத்தமான நெய் மற்றும் இட்லி பொடியில் புரட்டி எடுக்கப்பட்ட மினி இட்லிகள்.",
      category: "breakfast",
      type: "veg",
      badge: "Breakfast Favorite",
      img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-bf-2",
      name: "Crispy Medu Vada with Trio Chutneys",
      nameTa: "மெது வடை & மூன்று வகை சட்னி",
      desc: "Golden crispy lentil doughnuts flavoured with peppercorns, curry leaves, served with coconut, tomato & mint chutneys.",
      descTa: "மிளகு, கறிவேப்பிலை நறுமணத்துடன் பொன்னிறமாக வறுத்த மெது வடை மற்றும் தேங்காய், தக்காளி, புதினா சட்னிகள்.",
      category: "breakfast",
      type: "veg",
      badge: "Classic",
      img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-bf-3",
      name: "Ghee Cashew Ven Pongal",
      nameTa: "நெய் முந்திரி வெண் பொங்கல்",
      desc: "Velvety rice and moong dal mash tempered with whole Tellicherry pepper, cumin, ginger and roasted cashews.",
      descTa: "சுத்தமான பசு நெய், முழு மிளகு, சீரகம், இஞ்சி மற்றும் வறுத்த முந்திரி தாளித்த நல் வெண் பொங்கல்.",
      category: "breakfast",
      type: "veg",
      badge: "Muhurtham Special",
      img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-bf-4",
      name: "Paper Thin Ghee Roast Dosa",
      nameTa: "நெய் ரோஸ்ட் தோசை",
      desc: "Crisp golden crepe roasted with pure cow's ghee, accompanied by vegetable kurma and sambar.",
      descTa: "சுவையான மொறுமொறு நெய் தோசை, காய்கறி குர்மா மற்றும் மணமணக்கும் சாம்பாருடன்.",
      category: "breakfast",
      type: "veg",
      badge: "Live Counter",
      img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=700&q=80"
    },

    // Tiffin
    {
      id: "v-tf-1",
      name: "Steamed Idiyappam with Coconut Milk",
      nameTa: "இடியாப்பம் & தேங்காய்ப்பால்",
      desc: "Delicate steamed rice string hoppers paired with sweetened cardamom-infused coconut milk and vegetable stew.",
      descTa: "மென்மையான ஆவியில் வெந்த இடியாப்பம், ஏலக்காய் மணக்கும் சுவையான தேங்காய்ப்பால் மற்றும் காய்கறி ஸ்டூ.",
      category: "tiffin",
      type: "veg",
      badge: "Traditional",
      img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-tf-2",
      name: "Rava Kichadi with Medu Pakoda",
      nameTa: "ரவா கிச்சடி & பக்கோடா",
      desc: "Fragrant semolina infused with seasonal vegetables, ginger, ghee and golden cashews.",
      descTa: "காய்கறிகள் மற்றும் நெய் முந்திரி சேர்த்து சுடச்சுட தயாரிக்கப்படும் ரவா கிச்சடி.",
      category: "tiffin",
      type: "veg",
      badge: "Tiffin Special",
      img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-tf-3",
      name: "Fluffy Poori with Potato Masala",
      nameTa: "பூரி & உருளைக்கிழங்கு மசாலா",
      desc: "Puffed golden pooris served with tempered South Indian spiced onion and potato masala.",
      descTa: "உப்பலான பொன்னிற பூரி மற்றும் மென்மையான உருளைக்கிழங்கு வெங்காய மசாலா.",
      category: "tiffin",
      type: "veg",
      badge: "Evergreen",
      img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80"
    },

    // Traditional Meals
    {
      id: "v-ml-1",
      name: "Velavan Grand Kalyana Virundhu",
      nameTa: "வேலவன் கல்யாண தலைவாழை விருந்து",
      desc: "The quintessential 26-item traditional wedding feast served on ceremonial banana leaves with sweet, payasam and appalam.",
      descTa: "பாயாசம், வடை, கூட்டு, பொரியல், குழம்புகள் அடங்கிய 26 வகை பாரம்பரிய கல்யாண தலைவாழை இலை விருந்து.",
      category: "meals",
      type: "veg",
      badge: "Chef Signature",
      img: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-ml-2",
      name: "Thanjavur Royal Vegetarian Feast",
      nameTa: "தஞ்சாவூர் பாரம்பரிய மதிய விருந்து",
      desc: "Heritage recipes featuring drumstick arachivitta sambar, vatha kuzhambu, kootu, poriyal and paruppu nei.",
      descTa: "முருங்கைக்காய் அரைத்துவிட்ட சாம்பார், மணத்தக்காளி வத்தக்குழம்பு மற்றும் பருப்பு நெய்யுடன் கூடிய தஞ்சை விருந்து.",
      category: "meals",
      type: "veg",
      badge: "Heritage",
      img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-ml-3",
      name: "Kongu Naadu Elai Sappadu",
      nameTa: "கொங்கு நாட்டு இலை சாப்பாடு",
      desc: "Authentic countryside delicacies with shallot sambar, greens masiyal, yam roast and native rasam.",
      descTa: "சின்ன வெங்காய சாம்பார், கீரை மசியல், சேனை வறுவல் மற்றும் கொள்ளு ரசத்துடன் கூடிய கொங்கு நாட்டு விருந்து.",
      category: "meals",
      type: "veg",
      badge: "Regional Feast",
      img: "https://images.unsplash.com/photo-1505253758473-96b302d96c9f?auto=format&fit=crop&w=700&q=80"
    },

    // Starters
    {
      id: "v-st-1",
      name: "Crispy Paneer Pepper Fry",
      nameTa: "பன்னீர் மிளகு வறுவல்",
      desc: "Fresh cottage cheese cubes sauteed with cracked black peppercorns, curry leaves and caramelized shallots.",
      descTa: "பிரெஷ் பன்னீர் துண்டுகள், மிளகுத்தூள், கறிவேப்பிலை மற்றும் சின்ன வெங்காயத்தில் வதக்கிய சுவை.",
      category: "starters",
      type: "veg",
      badge: "Popular Starter",
      img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-st-2",
      name: "Baby Corn 65 Crisp",
      nameTa: "பேபி கார்ன் 65",
      desc: "Crispy fried tender baby corn fingers coated in aromatic South Indian spice batter with fried green chillies.",
      descTa: "மொறுமொறுப்பான பேபி கார்ன் மற்றும் பொரித்த பச்சை மிளகாயுடன் கூடிய சிறப்பு 65.",
      category: "starters",
      type: "veg",
      badge: "Crispy Delight",
      img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-st-3",
      name: "Heritage Vazhaipoo Cutlet",
      nameTa: "வாழைப்பூ கட்லெட்",
      desc: "Finely chopped banana blossoms blended with spiced lentils and pan-seared to a crunchy perfection.",
      descTa: "நறுக்கிய வாழைப்பூ மற்றும் மசாலா பருப்பு சேர்த்து தங்க நிறத்தில் சுட்டெடுக்கப்பட்ட பாரம்பரிய கட்லெட்.",
      category: "starters",
      type: "veg",
      badge: "Traditional",
      img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80"
    },

    // Snacks
    {
      id: "v-sn-1",
      name: "Crunchy Masala Vadai",
      nameTa: "பருப்பு மசால் வடை",
      desc: "Chana dal fritters studded with onions, fennel seeds, mint and red chillies.",
      descTa: "சோம்பு, வெங்காயம், புதினா மணத்துடன் மொறுமொறுப்பாக சுட்டெடுக்கப்பட்ட மசால் வடை.",
      category: "snacks",
      type: "veg",
      badge: "Evening Favorite",
      img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-sn-2",
      name: "Chettinad Seeval & Murukku Platter",
      nameTa: "செட்டிநாடு சீவல் & முறுக்கு தட்டு",
      desc: "Traditional assortment of ribbon pakoda, hand-pressed thenkuzhal and spicy seedai.",
      descTa: "பாரம்பரிய முறையில் கைசுத்து முறுக்கு, ரிப்பன் பக்கோடா மற்றும் சீவல் கலவை.",
      category: "snacks",
      type: "veg",
      badge: "Festival Special",
      img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80"
    },

    // Rice Varieties
    {
      id: "v-rc-1",
      name: "Kovil Puliyodharai (Tamarind Rice)",
      nameTa: "கோவில் புளியோதரை",
      desc: "Temple-style tamarind rice simmered in authentic pulikachal with peanuts, sesame oil and roasted red chillies.",
      descTa: "செக்கில் ஆட்டிய நல்லெண்ணெய், புளிக்காய்ச்சல் மற்றும் நிலக்கடலை சேர்த்த பிரசித்தி பெற்ற கோவில் புளியோதரை.",
      category: "rice",
      type: "veg",
      badge: "Devotional Recipe",
      img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-rc-2",
      name: "Royal Bisi Bele Bath with Ghee Kara Boondi",
      nameTa: "பிசிபேளாபாத் & காரா பூந்தி",
      desc: "Karnataka-origin spiced rice, lentil and vegetable medley served piping hot with golden crunchy boondi.",
      descTa: "காய்கறிகள், பருப்பு மசாலா சேர்த்து நெய் மணக்க பரிமாறப்படும் சுடச்சுட பிசிபேளாபாத்.",
      category: "rice",
      type: "veg",
      badge: "Crowd Favorite",
      img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-rc-3",
      name: "Thakkali Sadam (Spiced Tomato Rice)",
      nameTa: "செட்டிநாடு தக்காளி சாதம்",
      desc: "Fragrant ponni rice tempered with juicy country tomatoes, whole spices, mint and ghee.",
      descTa: "நாட்டுத் தக்காளி, பட்டை, கிராம்பு மற்றும் புதினா மணத்துடன் தயாரிக்கப்படும் சுவையான தக்காளி சாதம்.",
      category: "rice",
      type: "veg",
      badge: "Classic",
      img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-rc-4",
      name: "Tempered Curd Rice with Pomegranate",
      nameTa: "தாளித்த மாதுளை தயிர் சாதம்",
      desc: "Creamy set curd rice tempered with mustard, green chillies, ginger, garnished with pomegranate pearls.",
      descTa: "பச்சை மிளகாய், இஞ்சி, கடுகு தாளித்து மாதுளை முத்துக்களுடன் பரிமாறப்படும் குளிர்ந்த தயிர் சாதம்.",
      category: "rice",
      type: "veg",
      badge: "Feast Essential",
      img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80"
    },

    // Gravies
    {
      id: "v-gv-1",
      name: "Tirunelveli Sodhi Kuzhambu",
      nameTa: "திருநெல்வேலி சொதி குழம்பு",
      desc: "Royal mild coconut milk gravy simmered with tender drumsticks, carrots, potatoes and finished with lime juice.",
      descTa: "தேங்காய்ப்பால், முருங்கைக்காய், கேரட் சேர்த்து எலுமிச்சை சாறுடன் சுவை கூட்டப்பட்ட நெல்லை மாப்பிள்ளை சொதி.",
      category: "gravies",
      type: "veg",
      badge: "Royal Special",
      img: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-gv-2",
      name: "Chettinad Ennai Kathirikai Kuzhambu",
      nameTa: "செட்டிநாடு எண்ணெய் கத்திரிக்காய் குழம்பு",
      desc: "Baby brinjals stuffed with freshly ground spice paste and slow-cooked in thick tamarind gravy.",
      descTa: "மசாலா அரைத்து நிரப்பிய பிஞ்சு கத்திரிக்காய்களை நல்லெண்ணெயில் வதக்கி செய்த பாரம்பரிய காரக் குழம்பு.",
      category: "gravies",
      type: "veg",
      badge: "Signature Gravy",
      img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-gv-3",
      name: "Arachivitta Murungaikkai Sambar",
      nameTa: "முருங்கைக்காய் அரைத்துவிட்ட சாம்பார்",
      desc: "Lentil stew cooked with freshly roasted coconut, coriander seeds, dry red chillies and tender drumsticks.",
      descTa: "வறுத்து அரைத்த மசாலா மற்றும் முருங்கைக்காய் சேர்த்து நெய் மணக்க மணக்க சமைத்த கல்யாண சாம்பார்.",
      category: "gravies",
      type: "veg",
      badge: "Kalyana Special",
      img: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80"
    },

    // Breads
    {
      id: "v-br-1",
      name: "Flaky Malabar Parotta with Veg Kurma",
      nameTa: "மலபார் பரோட்டா & காய்கறி குருமா",
      desc: "Multi-layered flaky flatbread hand-stretched and griddled golden, served with aromatic coconut veg kurma.",
      descTa: "மெல்லிய அடுக்கடுக்கான பொன்னிற பரோட்டா மற்றும் நறுமணமிக்க தேங்காய் காய்கறி குருமா.",
      category: "breads",
      type: "veg",
      badge: "Dinner Hit",
      img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-br-2",
      name: "Tandoori Butter Naan & Paneer Butter Masala",
      nameTa: "பட்டர் நான் & பன்னீர் பட்டர் மசாலா",
      desc: "Oven-baked fluffy leavened bread brushed with melted butter, paired with creamy rich cottage cheese gravy.",
      descTa: "தந்தூரி அடுப்பில் சுட்டெடுத்த மிருதுவான பட்டர் நான் மற்றும் க்ரீமியான பன்னீர் பட்டர் மசாலா.",
      category: "breads",
      type: "veg",
      badge: "Live Counter",
      img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=700&q=80"
    },

    // Sweets
    {
      id: "v-sw-1",
      name: "Melt-in-Mouth Ghee Mysore Pak",
      nameTa: "சுத்தமான நெய் மைசூர் பாக்",
      desc: "Heritage sweet crafted with roasted gram flour, pure country ghee and sugar syrup that dissolves instantly on the palate.",
      descTa: "பசு நெய், கடலை மாவு கொண்டு நாவில் கரையும் பதத்தில் தயாரிக்கப்படும் பாரம்பரிய மைசூர் பாக்.",
      category: "sweets",
      type: "veg",
      badge: "Velavan Signature Sweet",
      img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-sw-2",
      name: "Thiruvaiyaru Asoka Halwa",
      nameTa: "திருவையாறு அசோகா அல்வா",
      desc: "Moong dal and wheat halwa simmered with ghee, cardamom and crunchy cashew nuts, silky and rich.",
      descTa: "பாசிப்பருப்பு, சுத்தமான நெய் மற்றும் முந்திரி கொண்டு செய்யப்படும் நயமான திருவையாறு அசோகா அல்வா.",
      category: "sweets",
      type: "veg",
      badge: "Wedding Classic",
      img: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-sw-3",
      name: "Royal Badam Halwa",
      nameTa: "ராயல் பாதாம் அல்வா",
      desc: "Blanched California almonds stone-ground and cooked with saffron, whole milk and pure clarified butter.",
      descTa: "அரைத்த பாதாம் பருப்பு, குங்குமப்பூ மற்றும் நெய் சேர்த்து தயாரிக்கப்படும் அரச விருந்து இனிப்பு.",
      category: "sweets",
      type: "veg",
      badge: "VIP Selection",
      img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80"
    },

    // Desserts
    {
      id: "v-ds-1",
      name: "Tender Coconut (Elaneer) Payasam",
      nameTa: "இளநீர் பாயாசம்",
      desc: "Silky dessert made from sweet tender coconut pulp, condensed milk and aromatic green cardamom.",
      descTa: "இளநீரின் வழுக்கை மற்றும் ஏலக்காய் மணக்கும் பாலில் செய்யப்படும் புத்துணர்ச்சியூட்டும் இளநீர் பாயாசம்.",
      category: "desserts",
      type: "veg",
      badge: "Signature Dessert",
      img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-ds-2",
      name: "Traditional Jaggery Paruppu Payasam",
      nameTa: "வெல்லம் பருப்பு பாயாசம்",
      desc: "Chana dal, roasted moong dal and coconut slivers sweetened with organic palm jaggery.",
      descTa: "பாரம்பரிய நாட்டு வெல்லம், தேங்காய்ப்பால் மற்றும் நெய் முந்திரி தாளித்த சுவையான பருப்பு பாயாசம்.",
      category: "desserts",
      type: "veg",
      badge: "Muhurtham Special",
      img: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80"
    },

    // Beverages
    {
      id: "v-bv-1",
      name: "Kumbakonam Degree Filter Coffee",
      nameTa: "கும்பகோணம் டிகிரி பில்டர் காபி",
      desc: "Strong chicory-blended decoction frothed with boiling farm milk, served in traditional brass davarah and tumbler.",
      descTa: "பித்தளை டவரா தம்பளரில் சுடச்சுட நுரைபொங்க பரிமாறப்படும் மணக்கும் டிகிரி காபி.",
      category: "beverages",
      type: "veg",
      badge: "Tradition in a Cup",
      img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "v-bv-2",
      name: "Chilled Madurai Nannari Sarbath with Sabja",
      nameTa: "நன்னாரி சர்பத் & சப்ஜா விதைகள்",
      desc: "Cooling wild sarsaparilla root syrup blended with fresh lime juice, ice and bloomed basil seeds.",
      descTa: "உடலுக்கு குளிர்ச்சி தரும் நன்னாரி வேர் சாறு, எலுமிச்சை மற்றும் சப்ஜா விதைகள் கலந்த குளிர் பானம்.",
      category: "beverages",
      type: "veg",
      badge: "Welcome Drink",
      img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80"
    }
  ],

  nonveg: [
    // Biryani
    {
      id: "nv-by-1",
      name: "Dindigul Seeraga Samba Mutton Biryani",
      nameTa: "திண்டுக்கல் சீரக சம்பா மட்டன் பிரியாணி",
      desc: "Short-grain aromatic seeraga samba rice cooked with tender baby goat meat, homemade spices and curd on slow charcoal fire.",
      descTa: "நயமான இள ஆட்டுக்கறி, நாட்டு நெய் மற்றும் சீரக சம்பா அரிசியில் கறிவேப்பிலை மணக்க சமைத்த பிரியாணி.",
      category: "biryani",
      type: "nonveg",
      badge: "Grand Signature",
      img: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-by-2",
      name: "Ambur Dum Chicken Biryani",
      nameTa: "ஆம்பூர் தம் சிக்கன் பிரியாணி",
      desc: "Classic Arcot Nawabi recipe with red chilli paste, curd marinated chicken and fragrant samba rice.",
      descTa: "ஆம்பூர் பாணியில் மிளகாய் விழுது, தயிர் மற்றும் சீரக சம்பாவில் தம் போடப்பட்ட சிக்கன் பிரியாணி.",
      category: "biryani",
      type: "nonveg",
      badge: "Nawabi Classic",
      img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-by-3",
      name: "Chettinad Country Chicken Biryani",
      nameTa: "செட்டிநாடு நாட்டுக் கோழி பிரியாணி",
      desc: "Free-range country chicken infused with kalpasi (stone flower), marathi mokku and freshly ground shallot masala.",
      descTa: "நாட்டுக்கோழி, கல்பாசி, மராத்தி மொக்கு மசாலா சேர்த்து கைமணக்க சமைத்த பாரம்பரிய பிரியாணி.",
      category: "biryani",
      type: "nonveg",
      badge: "Chef Special",
      img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-by-4",
      name: "Malabar Tiger Prawns Biryani",
      nameTa: "மலபார் டைகர் இறால் பிரியாணி",
      desc: "Juicy jumbo prawns layered with kaima rice, fried golden onions, cashews, raisins and fragrant spices.",
      descTa: "பெரிய இறால்கள், வறுத்த முந்திரி, உலர் திராட்சை மற்றும் நெய் சாதம் சேர்த்த பிரம்மாண்ட பிரியாணி.",
      category: "biryani",
      type: "nonveg",
      badge: "Seafood Luxury",
      img: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=700&q=80"
    },

    // Chicken
    {
      id: "nv-ch-1",
      name: "Chettinad Kozhi Milagu Varuval",
      nameTa: "செட்டிநாடு கோழி மிளகு வறுவல்",
      desc: "Country chicken pan-roasted with freshly crushed black peppercorns, shallots, garlic and curry leaf aroma.",
      descTa: "கருப்பு மிளகுத்தூள், சின்ன வெங்காயம், பூண்டு மற்றும் கறிவேப்பிலையில் வறுத்தெடுத்த மணக்கும் சிக்கன் வறுவல்.",
      category: "chicken",
      type: "nonveg",
      badge: "All-Time Best Seller",
      img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-ch-2",
      name: "Kongu Naadu Chinthamani Chicken",
      nameTa: "கொங்கு நாட்டு சிந்தாமணி சிக்கன்",
      desc: "Succulent chicken cooked strictly with hand-broken red chillies, shallots and cold-pressed gingelly oil.",
      descTa: "மசாலா தூள் இல்லாமல் காய்ந்த மிளகாய் மற்றும் சின்ன வெங்காயத்தில் வதக்கிய பாரம்பரிய சிந்தாமணி சிக்கன்.",
      category: "chicken",
      type: "nonveg",
      badge: "Kongu Special",
      img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-ch-3",
      name: "Tandoori Murgh Tikka & Mint Dip",
      nameTa: "தந்தூரி சிக்கன் டிக்கா & புதினா சட்னி",
      desc: "Boneless chicken thighs steeped in Kashmiri chilli and spiced Greek yogurt, char-grilled in clay tandoor.",
      descTa: "மண்பானை தந்தூரி அடுப்பில் சுட்டெடுக்கப்பட்ட சுவையான சிக்கன் டிக்கா துண்டுகள்.",
      category: "chicken",
      type: "nonveg",
      badge: "Live Counter",
      img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=700&q=80"
    },

    // Mutton
    {
      id: "nv-mt-1",
      name: "Madurai Mutton Chukka Varuval",
      nameTa: "மதுரை மட்டன் சுக்கா வறுவல்",
      desc: "Tender boneless mutton pieces slow-cooked with roasted spices until completely dry, rich and succulent.",
      descTa: "மதுரை பாணியில் காரசாரமாக நறுமண மசாலாக்களுடன் வறுக்கப்பட்ட மென்மையான மட்டன் சுக்கா.",
      category: "mutton",
      type: "nonveg",
      badge: "Signature Delicacy",
      img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-mt-2",
      name: "Velavan Royal Mutton Nalli Bone Gravy",
      nameTa: "வேலவன் ராயல் மட்டன் நள்ளி எலும்பு குழம்பு",
      desc: "Marrow bones slow-simmered in a rich coriander and shallot broth, meltingly tender and deeply flavorful.",
      descTa: "மட்டன் நள்ளி எலும்புகளை மெதுவாக வேகவைத்து தயாரிக்கப்படும் அடர்த்தியான ராயல் மட்டன் குழம்பு.",
      category: "mutton",
      type: "nonveg",
      badge: "Royal Special",
      img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-mt-3",
      name: "Chettinad Mutton Kola Urundai",
      nameTa: "செட்டிநாடு மட்டன் கோலா உருண்டை",
      desc: "Minced spiced mutton meatballs with poppy seeds and roasted gram, deep-fried to crisp perfection.",
      descTa: "கசகசா, பொட்டுக்கடலை மற்றும் நயமான மட்டன் கொத்துக்கறியில் உருட்டி பொரித்த கோலா உருண்டைகள்.",
      category: "mutton",
      type: "nonveg",
      badge: "Traditional Recipe",
      img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80"
    },

    // Fish
    {
      id: "nv-fs-1",
      name: "Tawa Seer Fish (Vanjaram) Fry",
      nameTa: "வஞ்சிரம் மீன் தவா வறுவல்",
      desc: "Fresh King Fish steaks marinated in chilli-lemon masala and shallow-fried crisp on an iron griddle.",
      descTa: "காரசாரமான எலுமிச்சை மசாலாவில் ஊறிய பிரெஷ் வஞ்சிரம் மீன் தவா வறுவல்.",
      category: "fish",
      type: "nonveg",
      badge: "Feast Favorite",
      img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-fs-2",
      name: "Manpaanai Meen Kuzhambu (Claypot Curry)",
      nameTa: "மண்பானை கிராமத்து மீன் குழம்பு",
      desc: "Heritage fish curry slow-simmered with shallots, garlic cloves, country tomatoes and raw mango in traditional earthen pots.",
      descTa: "மண்பானையில் சின்ன வெங்காயம், பூண்டு மற்றும் மாங்காய் சேர்த்து சமைத்த பாரம்பரிய கிராமத்து மீன் குழம்பு.",
      category: "fish",
      type: "nonveg",
      badge: "Claypot Heritage",
      img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-fs-3",
      name: "Crispy Nethili Pepper Fry",
      nameTa: "மொறுமொறு நெத்திலி மீன் ஃப்ரை",
      desc: "Fresh anchovies coated with ground rice batter and Tellicherry pepper, deep-fried till crunchy.",
      descTa: "மிளகு மற்றும் அரிசி மாவு மசாலாவில் பொரித்தெடுக்கப்பட்ட மொறுமொறு நெத்திலி மீன்.",
      category: "fish",
      type: "nonveg",
      badge: "Crunchy Star",
      img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80"
    },

    // Seafood
    {
      id: "nv-sf-1",
      name: "Chettinad Eraal Thokku (Prawn Roast)",
      nameTa: "செட்டிநாடு இறால் தொக்கு",
      desc: "Tender coastal prawns cooked in a thick spicy onion, tomato and fennel gravy with fresh curry leaves.",
      descTa: "கடல் இறால்கள், சோம்பு, தக்காளி மற்றும் வெங்காயத்தில் வதக்கி சுண்டவைத்த ருசியான இறால் தொக்கு.",
      category: "seafood",
      type: "nonveg",
      badge: "Coastal Special",
      img: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-sf-2",
      name: "Karaikudi Nandu Masala (Crab Roast)",
      nameTa: "காரைக்குடி நண்டு மசாலா",
      desc: "Blue sea crabs simmered in aromatic roasted spices, pepper and fresh grated coconut gravy.",
      descTa: "மிளகு, சீரகம், சோம்பு மற்றும் தேங்காய் அரைத்து ஊற்றி சமைக்கப்பட்ட காரைக்குடி நண்டு மசாலா.",
      category: "seafood",
      type: "nonveg",
      badge: "Spicy Signature",
      img: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=700&q=80"
    },

    // Starters
    {
      id: "nv-st-1",
      name: "Classic Chennai Chicken 65",
      nameTa: "சென்னை கிளாசிக் சிக்கன் 65",
      desc: "Crispy bite-sized chicken marinated with crushed ginger, garlic, red chillies and curry leaves.",
      descTa: "இஞ்சி பூண்டு, எலுமிச்சை மற்றும் கறிவேப்பிலை மணத்தில் பொன்னிறமாக வறுத்த சிக்கன் 65.",
      category: "starters",
      type: "nonveg",
      badge: "Evergreen Hit",
      img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-st-2",
      name: "Crispy Golden Fish Fingers with Tartar Dip",
      nameTa: "ஃபிஷ் ஃபிங்கர்ஸ் & டார்டார் சாஸ்",
      desc: "Crumb-coated boneless fish strips fried crisp and golden, accompanied by zesty homemade herb mayo.",
      descTa: "பிரெட் க்ரம்ப்ஸில் சுற்றப்பட்டு பொரித்தெடுக்கப்பட்ட மீன் துண்டுகள் மற்றும் மூலிகை சாஸ்.",
      category: "starters",
      type: "nonveg",
      badge: "Kids & Youth Favorite",
      img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80"
    },

    // Rice Varieties
    {
      id: "nv-rc-1",
      name: "Nawabi Plain Ghee Kushka Rice",
      nameTa: "நவாபி நெய் குஷ்கா சாதம்",
      desc: "Fragrant biryani rice cooked in chicken broth and whole spices without meat pieces, served with salna.",
      descTa: "சிக்கன் சாறு, நெய் மற்றும் வாசனை மசாலாக்கள் கலந்து தயாரிக்கப்படும் மணம் கமழும் குஷ்கா சாதம்.",
      category: "rice",
      type: "nonveg",
      badge: "Biryani Companion",
      img: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-rc-2",
      name: "Egg & Spring Onion Fried Rice",
      nameTa: "முட்டை ஃப்ரைட் ரைஸ்",
      desc: "Wok-tossed basmati rice with scrambled eggs, scallions and cracked Tellicherry black pepper.",
      descTa: "அதிவேக வோக்கில் முட்டை, வெங்காயத்தாள் மற்றும் மிளகு சேர்த்து வதக்கிய சுவையான ஃப்ரைட் ரைஸ்.",
      category: "rice",
      type: "nonveg",
      badge: "Live Counter",
      img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=80"
    },

    // Gravies
    {
      id: "nv-gv-1",
      name: "Madurai Parotta Salna (Mutton / Chicken)",
      nameTa: "மதுரை பரோட்டா சால்னா",
      desc: "Rich, aromatic and silky meat gravy made with roasted coconut, fennel and poppy seeds, perfect for soaking parottas.",
      descTa: "பரோட்டாவில் ஊறவைத்து சாப்பிட உகந்த தேங்காய், கசகசா அரைத்து சமைத்த மதுரை சால்னா.",
      category: "gravies",
      type: "nonveg",
      badge: "Street Special",
      img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-gv-2",
      name: "Chettinad Kozhi Kuzhambu",
      nameTa: "செட்டிநாடு கோழிக் குழம்பு",
      desc: "Signature countryside chicken gravy cooked with stone flower, cinnamon, cloves and hand-roasted spices.",
      descTa: "கைக்குத்தல் மசாலா மற்றும் நாட்டுக்கோழி கலந்து கிராமத்து மணத்துடன் சமைத்த குழம்பு.",
      category: "gravies",
      type: "nonveg",
      badge: "Signature Gravy",
      img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80"
    },

    // Special Dishes
    {
      id: "nv-sp-1",
      name: "Kongu Naadu Nattu Kozhi Varuval",
      nameTa: "கொங்கு நாட்டு நாட்டுக் கோழி வறுவல்",
      desc: "Tough country chicken slow-roasted with shallots, dried red chillies, garlic and cold-pressed oil until fork tender.",
      descTa: "நாட்டுக்கோழி இறைச்சி, காய்ந்த மிளகாய், நல்லெண்ணெய் சேர்த்து பக்குவமாக வறுத்தெடுத்த நாட்டு வறுவல்.",
      category: "special",
      type: "nonveg",
      badge: "Heritage Delicacy",
      img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-sp-2",
      name: "Velavan Royal Feast Non-Veg Platter",
      nameTa: "வேலவன் ராயல் அசைவ தட்டு",
      desc: "Grand celebratory curation of mutton biryani, chicken sukka, vanjaram fish fry and prawn roast.",
      descTa: "மட்டன் பிரியாணி, சிக்கன் சுக்கா, வஞ்சிரம் வறுவல் மற்றும் இறால் தொக்கு சேர்ந்த பிரம்மாண்ட தட்டு.",
      category: "special",
      type: "nonveg",
      badge: "VIP Banquet",
      img: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=700&q=80"
    },

    // Desserts
    {
      id: "nv-ds-1",
      name: "Tender Coconut Pudding Soufflé",
      nameTa: "இளநீர் புட்டிங்",
      desc: "Delicate melt-in-the-mouth chilled pudding made with fresh tender coconut water and cream.",
      descTa: "குளிர்ந்த இளநீர் மற்றும் பால் க்ரீமில் தயாரிக்கப்படும் மிருதுவான இளநீர் புட்டிங்.",
      category: "desserts",
      type: "nonveg",
      badge: "Cooling Treat",
      img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-ds-2",
      name: "Hot Gulab Jamun with Malai Kulfi",
      nameTa: "குலாப் ஜாமுன் & மலை குல்ஃபி",
      desc: "Warm khoya dumplings soaked in saffron-rose syrup paired with rich frozen malai kulfi slice.",
      descTa: "சுடச்சுட குங்குமப்பூ குலாப் ஜாமுனுடன் குளிர்ந்த மண்பானை குல்ஃபி.",
      category: "desserts",
      type: "nonveg",
      badge: "Grand Finale",
      img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80"
    },

    // Beverages
    {
      id: "nv-bv-1",
      name: "Authentic Madurai Famous Jigarthanda",
      nameTa: "மதுரை ஸ்பெஷல் ஜிகர்தண்டா",
      desc: "Chilled iconic dessert drink made with badam pisin (almond gum), reduced milk malai, nannari syrup and ice cream.",
      descTa: "பாதாம் பிசின், பாலாடை, நன்னாரி சர்பத் மற்றும் ஐஸ்கிரீம் கலந்த உலகப் புகழ்பெற்ற மதுரை ஜிகர்தண்டா.",
      category: "beverages",
      type: "nonveg",
      badge: "Celebrity Drink",
      img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80"
    },
    {
      id: "nv-bv-2",
      name: "Tender Coconut Mint Cooler",
      nameTa: "இளநீர் புதினா கூலர்",
      desc: "Natural tender coconut water blended with garden fresh mint, lime drops and a hint of rock salt.",
      descTa: "இயற்கையான இளநீரில் புதிய புதினா, எலுமிச்சை சாறு சேர்த்து பரிமாறப்படும் புத்துணர்ச்சி பானம்.",
      category: "beverages",
      type: "nonveg",
      badge: "Welcome Sip",
      img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80"
    }
  ]
};

const DEFAULT_GALLERY_DATA = [
  {
    id: "gal-1",
    title: "Grand Wedding Banquet",
    titleTa: "பிரம்மாண்ட திருமண விருந்து",
    category: "Wedding",
    categoryTa: "திருமணம்",
    url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85",
    caption: "Magnificent dining setup designed for 2,500 guests with personalized hospitality.",
    captionTa: "2,500 விருந்தினர்களுக்கான பிரம்மாண்ட உணவு மற்றும் உபசரிப்பு ஏற்பாடு."
  },
  {
    id: "gal-2",
    title: "Traditional Banana Leaf Service",
    titleTa: "தலைவாழை இலை விருந்து உபசரிப்பு",
    category: "Tradition",
    categoryTa: "பாரம்பரியம்",
    url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85",
    caption: "Authentic South Indian Muhurtham virundhu served with traditional hospitality rituals.",
    captionTa: "பாரம்பரிய முறையில் பரிமாறப்படும் மங்களகரமான முகூர்த்த தலைவாழை விருந்து."
  },
  {
    id: "gal-3",
    title: "Live Buffet & Modern Counters",
    titleTa: "நேரடி உணவு மற்றும் பஃபே கவுண்டர்கள்",
    category: "Buffet",
    categoryTa: "பஃபே",
    url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=85",
    caption: "Contemporary live dosa, pasta and chat stations catering to diverse guest palates.",
    captionTa: "விருந்தினர்களைக் கவரும் வகையில் அமைக்கப்பட்ட நவீன நேரடி உணவு கவுண்டர்கள்."
  },
  {
    id: "gal-4",
    title: "Royal Reception Decor & Dining",
    titleTa: "வரவேற்பு மண்டப அலங்காரம் & விருந்து",
    category: "Reception",
    categoryTa: "வரவேற்பு",
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=85",
    caption: "Opulent banquet arrangement with coordinated royal green and gold aesthetic styling.",
    captionTa: "அரச தரம் வாய்ந்த பச்சை மற்றும் தங்க நிற அலங்காரத்துடன் கூடிய வரவேற்பு அரங்கம்."
  },
  {
    id: "gal-5",
    title: "Artisanal Dessert Presentation",
    titleTa: "நேர்த்தியான இனிப்பு பரிமாறுதல்",
    category: "Dessert",
    categoryTa: "இனிப்புகள்",
    url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85",
    caption: "Exquisite display of traditional sweets, soufflés and handcrafted confectionery.",
    captionTa: "விருந்தை இனிமையாக்கும் பாரம்பரிய மற்றும் நவீன இனிப்புகளின் பிரம்மாண்ட அணிவகுப்பு."
  },
  {
    id: "gal-6",
    title: "Live Grills & Charcoal Flavors",
    titleTa: "தந்தூரி மற்றும் நேரடி சுவை கவுண்டர்கள்",
    category: "Live Counter",
    categoryTa: "நேரடி சமையல்",
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85",
    caption: "Master chefs preparing piping hot barbecue delicacies and skewered treats live for guests.",
    captionTa: "விருந்தினர்களுக்கு சுடச்சுட தயாரித்து வழங்கப்படும் சுவையான நேரடி பார்பிகியூ."
  },
  {
    id: "gal-7",
    title: "Corporate Banquet Coordination",
    titleTa: "நிறுவன மாநாட்டு விருந்து",
    category: "Corporate",
    categoryTa: "நிறுவன விழா",
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85",
    caption: "Punctual, hygienic and professional catering management for corporate conferences.",
    captionTa: "கார்ப்பரேட் மாநாடுகள் மற்றும் சந்திப்புகளுக்கான தொழில்முறை உணவு மேலாண்மை."
  },
  {
    id: "gal-8",
    title: "Intimate Family Milestones",
    titleTa: "குடும்ப கொண்டாட்டங்கள்",
    category: "Family",
    categoryTa: "குடும்ப விழா",
    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=85",
    caption: "Heartfelt hospitality and thoughtful dining for silver jubilees, birthdays and baby showers.",
    captionTa: "குடும்ப நிகழ்வுகள் மற்றும் பிறந்தநாள் விழாக்களுக்கான அன்பான உபசரிப்பு."
  }
];

const DEFAULT_SAMPLE_ENQUIRIES = [
  {
    id: 1718000000001,
    name: "Dr. K. Rajasekaran",
    phone: "+91 98410 45678",
    email: "rajasekaran@example.com",
    event: "Wedding",
    date: "2026-11-25",
    guests: 1200,
    food: "Both",
    location: "Mayor Ramanathan Chettiar Hall, Chennai",
    notes: "Requires traditional banana leaf virundhu for Muhurtham (veg only) and grand reception buffet with live non-veg counters in the evening.",
    status: "Confirmed",
    created: "01/11/2026, 10:30:15 AM"
  },
  {
    id: 1718000000002,
    name: "Sowmya Venkat",
    phone: "+91 97909 88123",
    email: "sowmya.v@example.com",
    event: "Engagement",
    date: "2026-12-05",
    guests: 350,
    food: "Vegetarian",
    location: "Greenways Heritage Mandapam, Adyar",
    notes: "Looking for traditional South Indian tiffin live counters including mini podi idli, appam and filter coffee stations.",
    status: "Contacted",
    created: "02/11/2026, 02:45:00 PM"
  },
  {
    id: 1718000000003,
    name: "Anand Sundaram",
    phone: "+91 94440 22334",
    email: "anand.s@technology.com",
    event: "Corporate Event",
    date: "2026-11-18",
    guests: 450,
    food: "Both",
    location: "ITC Grand Chola Banquet, Guindy",
    notes: "Annual technology summit gala dinner. Need seated buffet with high hygiene protocols and live dessert counters.",
    status: "New",
    created: "03/11/2026, 09:15:20 AM"
  }
];
