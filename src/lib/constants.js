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
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    description: 'Draped, festive, evening, and everyday fits.',
    subcategories: [
      { name: 'Kurtas & Sets', image: 'https://images.unsplash.com/photo-1583391733958-d25e07fac044?w=800&q=80' },
      { name: 'Draped Tops', image: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=800&q=80' },
      { name: 'Eveningwear', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80' }
    ]
  },
  {
    id: 'men',
    name: 'Men',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
    description: 'Tailoring, co-ords, overshirts, and travel staples.',
    subcategories: [
      { name: 'Blazers', image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&q=80' },
      { name: 'Co-ords', image: 'https://images.unsplash.com/photo-1602810316693-3667c854239a?w=800&q=80' },
      { name: 'Overshirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=800&q=80' },
      { name: 'Trousers', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80' }
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
