// Mock product data for BELOV marketplace
export const products = [
  {
    id: 1,
    brand: "BELOV Atelier",
    name: "Draped Silk Blouse",
    gender: "Women",
    subtitle: "Fluidity and grace, redefined",
    price: 4999,
    originalPrice: 6999,
    image: "/images/hero.png",
    category: "Women",
    subcategory: "Draped Tops",
    vibes: ["Date Night", "Office"],
    fitMatch: 98,
    sizes: ["L", "XL", "2XL", "3XL", "4XL"],
    recommendedSize: "2XL",
    color: "Pearl",
    fabric: "Pure Silk",
    occasion: "Evening",
    collection: "The Silk Edit",
    tags: ["Silk", "Draped", "Evening"],
    reviews: 47,
    rating: 4.8,
    description: "A masterfully draped silk blouse that flows with your body's natural movement. Cut from pure mulberry silk with a cowl neckline that flatters every silhouette.",
    care: ["Dry clean only", "Iron on low heat", "Store on padded hanger"],
    sustainability: "Ethically sourced silk, carbon-neutral shipping"
  },
  {
    id: 2,
    brand: "BELOV Atelier",
    name: "Structured Wool Blazer",
    gender: "Men",
    subtitle: "Architectural tailoring for every body",
    price: 7499,
    originalPrice: 9999,
    image: "/images/tailored.png",
    category: "Men",
    subcategory: "Blazers",
    vibes: ["Office", "Date Night"],
    fitMatch: 95,
    sizes: ["XL", "2XL", "3XL", "4XL", "5XL"],
    recommendedSize: "3XL",
    color: "Bone",
    fabric: "Merino Wool",
    occasion: "Executive",
    collection: "Architectural Tailoring",
    tags: ["Wool", "Blazer", "Tailored"],
    reviews: 32,
    rating: 4.9,
    description: "A beautifully structured blazer in soft merino wool. Engineered with our Fit Intelligence to drape naturally across shoulders and torso for masculine and androgynous silhouettes.",
    care: ["Dry clean recommended", "Steam to refresh", "Store buttoned"],
    sustainability: "Sustainably sourced merino, recyclable packaging"
  },
  {
    id: 3,
    brand: "BELOV Atelier",
    name: "Charcoal Evening Gown",
    gender: "Women",
    subtitle: "Timeless silhouettes in deep charcoal",
    price: 8999,
    originalPrice: 12999,
    image: "/images/evening.png",
    category: "Women",
    subcategory: "Eveningwear",
    vibes: ["Date Night"],
    fitMatch: 92,
    sizes: ["L", "XL", "2XL", "3XL", "4XL"],
    recommendedSize: "2XL",
    color: "Charcoal",
    fabric: "Crepe",
    occasion: "Gala",
    collection: "Evening Noir",
    tags: ["Crepe", "Evening", "Gown"],
    reviews: 19,
    rating: 4.7,
    description: "A floor-length evening gown in luxurious crepe. The V-neckline and empire waist create an elongating silhouette that moves beautifully.",
    care: ["Dry clean only", "Hang to store", "Avoid direct sunlight"],
    sustainability: "Low-impact dyes, zero-waste pattern cutting"
  },
  {
    id: 4,
    brand: "Sizeupp",
    name: "Golden Embroidered Kurta Set",
    gender: "Women",
    subtitle: "Heritage craftsmanship meets modern fit",
    price: 5499,
    originalPrice: 7499,
    image: "/images/kurta_gold.png",
    category: "Women",
    subcategory: "Kurtas & Sets",
    vibes: ["Festive"],
    fitMatch: 96,
    sizes: ["XL", "2XL", "3XL", "4XL", "5XL", "6XL"],
    recommendedSize: "3XL",
    color: "Antique Gold",
    fabric: "Silk Blend",
    occasion: "Festive",
    collection: "The Silk Edit",
    tags: ["Ethnic", "Embroidered", "Festive"],
    reviews: 68,
    rating: 4.6,
    description: "A resplendent kurta set in rich antique gold with intricate hand-embroidery. Designed with generous proportions and our signature Fit Intelligence mapping.",
    care: ["Dry clean only", "Store flat", "Keep away from moisture"],
    sustainability: "Handcrafted by artisan cooperatives"
  },
  {
    id: 5,
    brand: "Sizeupp",
    name: "Floral Cotton Straight Kurta",
    gender: "Women",
    subtitle: "Everyday elegance in pure cotton",
    price: 1699,
    originalPrice: 2499,
    image: "/images/plus_size_kurta_1777572002528.png",
    category: "Women",
    subcategory: "Kurtas & Sets",
    vibes: ["Casual"],
    fitMatch: 94,
    sizes: ["L", "XL", "2XL", "3XL", "4XL", "5XL"],
    recommendedSize: "2XL",
    color: "Ivory Floral",
    fabric: "Cotton",
    occasion: "Casual",
    collection: "Architectural Tailoring",
    tags: ["Cotton", "Straight Fit", "Daily"],
    reviews: 124,
    rating: 4.5,
    description: "A breezy straight-cut kurta in premium cotton with a vibrant floral print. Designed for comfortable, all-day wear with side pockets.",
    care: ["Machine wash cold", "Tumble dry low", "Iron medium heat"],
    sustainability: "100% organic cotton, GOTS certified"
  },
  {
    id: 6,
    brand: "BELOV Atelier",
    name: "Navy Co-ords Set",
    gender: "Men",
    subtitle: "Effortless coordination",
    price: 3999,
    originalPrice: 5499,
    image: "/images/plus_size_coords_1777572038614.png",
    category: "Men",
    subcategory: "Co-ords",
    vibes: ["Office", "Streetwear"],
    fitMatch: 91,
    sizes: ["XL", "2XL", "3XL", "4XL"],
    recommendedSize: "2XL",
    color: "Navy",
    fabric: "Ponte",
    occasion: "Workwear",
    collection: "Architectural Tailoring",
    tags: ["Co-ords", "Workwear", "Ponte"],
    reviews: 56,
    rating: 4.4,
    description: "A sleek co-ords set in structured ponte knit. The relaxed top with tailored trousers creates a polished look from desk to dinner for men who want easy fit confidence.",
    care: ["Machine wash gentle", "Lay flat to dry", "Steam to refresh"],
    sustainability: "Recycled polyester blend, BCI cotton"
  },
  {
    id: 7,
    brand: "H&M+",
    name: "Relaxed Linen Overshirt",
    gender: "Men",
    subtitle: "Easy layers with precise shoulder mapping",
    price: 2999,
    originalPrice: 3999,
    image: "/images/plus_size_shirt_1777572022906.png",
    category: "Men",
    subcategory: "Overshirts",
    vibes: ["Casual", "Streetwear"],
    fitMatch: 93,
    sizes: ["L", "XL", "2XL", "3XL", "4XL", "5XL"],
    recommendedSize: "2XL",
    color: "Sage",
    fabric: "Linen Blend",
    occasion: "Weekend",
    collection: "Architectural Tailoring",
    tags: ["Overshirt", "Linen", "Weekend"],
    reviews: 41,
    rating: 4.6,
    description: "A breathable linen overshirt with relaxed ease through the chest and arms, calibrated for shoulder width and midsection comfort.",
    care: ["Machine wash cold", "Hang dry", "Steam lightly"],
    sustainability: "Low-water linen blend, plastic-free packaging"
  },
  {
    id: 8,
    brand: "Urbanic Men",
    name: "Tapered Travel Trousers",
    gender: "Men",
    subtitle: "Room where you need it, shape where you want it",
    price: 2599,
    originalPrice: 3499,
    image: "/images/tailored.png",
    category: "Men",
    subcategory: "Trousers",
    vibes: ["Travel", "Office"],
    fitMatch: 90,
    sizes: ["L", "XL", "2XL", "3XL", "4XL", "5XL"],
    recommendedSize: "3XL",
    color: "Stone",
    fabric: "Stretch Twill",
    occasion: "Travel",
    collection: "Architectural Tailoring",
    tags: ["Trousers", "Stretch", "Travel"],
    reviews: 37,
    rating: 4.4,
    description: "Tapered trousers with stretch recovery and a comfort waistband, recommended by Fit Intelligence for easy movement without a baggy profile.",
    care: ["Machine wash gentle", "Dry inside out", "Iron low"],
    sustainability: "Recycled stretch fibers"
  }
];

export const collections = [
  { id: 'silk', name: 'The Silk Edit', subtitle: 'Fluidity and grace, redefined', image: '/images/silk.png' },
  { id: 'evening', name: 'Evening Noir', subtitle: 'Timeless silhouettes in deep charcoal', image: '/images/evening.png' },
  { id: 'tailoring', name: 'Architectural Tailoring', subtitle: 'Structured perfection for every body', image: '/images/tailored.png' },
];

export const marketplaceBrands = [
  {
    id: 'belov-atelier',
    name: 'BELOV Atelier',
    specialty: 'Drapes',
    image: '/images/hero.png',
    fitScore: 98,
    productCount: 24,
    tags: ['Luxury', 'Drape fit', 'Occasion']
  },
  {
    id: 'sizeupp',
    name: 'Sizeupp',
    specialty: 'Ethnic',
    image: '/images/kurta_gold.png',
    fitScore: 96,
    productCount: 38,
    tags: ['Ethnic', 'Daily wear', 'Extended sizes']
  },
  {
    id: 'hm-plus',
    name: 'H&M+',
    specialty: 'Basics',
    image: '/images/plus_size_shirt_1777572022906.png',
    fitScore: 91,
    productCount: 52,
    tags: ['Basics', 'Casual', 'Street']
  },
  {
    id: 'urbanic-men',
    name: 'Urbanic Men',
    specialty: 'Street',
    image: '/images/plus_size_coords_1777572038614.png',
    fitScore: 89,
    productCount: 31,
    tags: ['Co-ords', 'Streetwear', 'Work casual']
  },
  {
    id: 'gia-curve',
    name: 'Gia Curve',
    specialty: 'Workwear',
    image: '/images/tailored.png',
    fitScore: 88,
    productCount: 44,
    tags: ['Office', 'Classic', 'Curve']
  },
  {
    id: 'alto-moda',
    name: 'Alto Moda',
    specialty: 'Formal',
    image: '/images/evening.png',
    fitScore: 87,
    productCount: 29,
    tags: ['Formal', 'Evening', 'Polish']
  },
  {
    id: 'big-hello',
    name: 'Big Hello',
    specialty: 'Daily',
    image: '/images/plus_size_kurta_1777572002528.png',
    fitScore: 86,
    productCount: 63,
    tags: ['Daily', 'Comfort', 'Value']
  },
  {
    id: 'amydus',
    name: 'Amydus',
    specialty: 'Denim',
    image: '/images/plus_size_shirt_1777572022906.png',
    fitScore: 85,
    productCount: 36,
    tags: ['Denim', 'Casual', 'Fits']
  },
  {
    id: 'lastinch',
    name: 'LastInch',
    specialty: 'Essentials',
    image: '/images/plus_size_coords_1777572038614.png',
    fitScore: 84,
    productCount: 48,
    tags: ['Basics', 'Stretch', 'Daily']
  },
  {
    id: 'faballey-curve',
    name: 'FabAlley Curve',
    specialty: 'Party',
    image: '/images/evening.png',
    fitScore: 83,
    productCount: 41,
    tags: ['Party', 'Trendy', 'Women']
  },
  {
    id: 'curve-story',
    name: 'Curve Story',
    specialty: 'Casual',
    image: '/images/hero.png',
    fitScore: 82,
    productCount: 34,
    tags: ['Casual', 'Prints', 'Easy']
  },
  {
    id: 'all-plus',
    name: 'ALL',
    specialty: 'Core',
    image: '/images/tailored.png',
    fitScore: 82,
    productCount: 58,
    tags: ['Core', 'Work', 'Casual']
  },
  {
    id: 'westside-gia',
    name: 'Westside Gia',
    specialty: 'Smart',
    image: '/images/kurta_gold.png',
    fitScore: 81,
    productCount: 47,
    tags: ['Smart', 'Indian', 'Daily']
  },
  {
    id: 'truebrowns-curve',
    name: 'TrueBrowns Curve',
    specialty: 'Festive',
    image: '/images/kurta_gold.png',
    fitScore: 80,
    productCount: 27,
    tags: ['Festive', 'Ethnic', 'Craft']
  },
  {
    id: 'snitch-plus',
    name: 'SNITCH Plus',
    specialty: 'Shirts',
    image: '/images/plus_size_shirt_1777572022906.png',
    fitScore: 80,
    productCount: 33,
    tags: ['Shirts', 'Street', 'Men']
  },
  {
    id: 'marks-spencer',
    name: 'Marks & Spencer',
    specialty: 'Classic',
    image: '/images/tailored.png',
    fitScore: 79,
    productCount: 40,
    tags: ['Classic', 'Premium', 'Basics']
  },
  {
    id: 'levis-plus',
    name: "Levi's Plus",
    specialty: 'Denim',
    image: '/images/plus_size_coords_1777572038614.png',
    fitScore: 78,
    productCount: 26,
    tags: ['Denim', 'Weekend', 'Casual']
  },
  {
    id: 'oxolloxo-curve',
    name: 'Oxolloxo Curve',
    specialty: 'Prints',
    image: '/images/hero.png',
    fitScore: 77,
    productCount: 35,
    tags: ['Prints', 'Trend', 'Daily']
  },
  {
    id: 'house-of-fett',
    name: 'House of Fett Curve',
    specialty: 'Resort',
    image: '/images/evening.png',
    fitScore: 76,
    productCount: 22,
    tags: ['Resort', 'Occasion', 'Women']
  },
  {
    id: 'nayked-curve',
    name: 'Nayked Curve',
    specialty: 'Lounge',
    image: '/images/plus_size_kurta_1777572002528.png',
    fitScore: 75,
    productCount: 30,
    tags: ['Lounge', 'Soft', 'Daily']
  },
  {
    id: 'rare-rabbit-plus',
    name: 'Rare Rabbit Plus',
    specialty: 'Premium',
    image: '/images/tailored.png',
    fitScore: 74,
    productCount: 18,
    tags: ['Premium', 'Men', 'Formal']
  }
];

export const recommendedBrandPreview = [
  {
    name: 'BELOV Atelier',
    reason: 'High shoulder and drape confidence',
    match: '98%'
  },
  {
    name: 'Sizeupp',
    reason: 'Best festive and cotton kurta grading',
    match: '96%'
  },
  {
    name: 'H&M+',
    reason: 'Easy casual layers in your saved vibe',
    match: '92%'
  }
];

export const occasions = [
  { id: 'gala', name: 'Gala Night', icon: '✦' },
  { id: 'executive', name: 'Executive Suite', icon: '◆' },
  { id: 'weekend', name: 'Weekend Retreat', icon: '◇' },
  { id: 'festive', name: 'Festive Season', icon: '❋' },
  { id: 'casual', name: 'Everyday Style', icon: '○' },
];

export const categoryMenu = [
  {
    id: 'women',
    name: 'Women',
    image: '/images/hero.png',
    description: 'Draped, festive, evening, and everyday fits.',
    subcategories: [
      { name: 'Kurtas & Sets', image: '/images/kurta_gold.png' },
      { name: 'Draped Tops', image: '/images/hero.png' },
      { name: 'Eveningwear', image: '/images/evening.png' }
    ]
  },
  {
    id: 'men',
    name: 'Men',
    image: '/images/tailored.png',
    description: 'Tailoring, co-ords, overshirts, and travel staples.',
    subcategories: [
      { name: 'Blazers', image: '/images/tailored.png' },
      { name: 'Co-ords', image: '/images/plus_size_coords_1777572038614.png' },
      { name: 'Overshirts', image: '/images/plus_size_shirt_1777572022906.png' },
      { name: 'Trousers', image: '/images/tailored.png' }
    ]
  }
];

export const filterLabels = {
  category: 'Category',
  subcategory: 'Sub category',
  gender: 'Gender',
  brand: 'Brand',
  fit: 'Fit',
  fabric: 'Fabric',
  occasion: 'Occasion',
  size: 'Size',
  priceRange: 'Price',
  search: 'Search'
};

export const filters = {
  category: ['Women', 'Men'],
  subcategory: ['Kurtas & Sets', 'Draped Tops', 'Eveningwear', 'Blazers', 'Co-ords', 'Overshirts', 'Trousers'],
  brand: marketplaceBrands.map((brand) => brand.name),
  gender: ['Men', 'Women'],
  fit: ['Relaxed', 'Regular', 'Tailored', 'Oversized'],
  fabric: ['Silk', 'Cotton', 'Wool', 'Crepe', 'Ponte', 'Linen'],
  occasion: ['Evening', 'Executive', 'Casual', 'Festive', 'Weekend'],
  size: ['L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL'],
  priceRange: ['Under ₹2,000', '₹2,000 – ₹5,000', '₹5,000 – ₹10,000', 'Above ₹10,000'],
};
