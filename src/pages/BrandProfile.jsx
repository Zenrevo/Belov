import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ruler, Shirt, Sparkles, Star, Store } from 'lucide-react';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { marketplaceBrands as fallbackBrands, products as fallbackProducts } from '../data/products';
import { catalogApi } from '../lib/api';
import './BrandProfile.css';

const formatPrice = (price = 0) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

const getInitials = (name = '') => (
  name
    .replace('&', ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
);

const slugify = (value = '') => (
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
);

const buildFallbackBrand = (brandId) => {
  const brand = fallbackBrands.find((item) => item.id === brandId || slugify(item.name) === brandId) || fallbackBrands[0];
  const products = fallbackProducts.filter((product) => product.brand === brand.name);
  const prices = products.map((product) => product.price);
  const ratings = products.map((product) => product.rating).filter(Boolean);

  return {
    ...brand,
    rating: ratings.length ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)) : 0,
    reviewCount: products.reduce((sum, product) => sum + (product.reviews || 0), 0),
    productTotal: products.length,
    categories: [...new Set(products.map((product) => product.category))],
    subcategories: [...new Set(products.map((product) => product.subcategory))],
    genders: [...new Set(products.map((product) => product.gender))],
    occasions: [...new Set(products.map((product) => product.occasion))],
    collections: [...new Set(products.map((product) => product.collection))],
    availableSizes: [...new Set(products.flatMap((product) => product.sizes || []))],
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0
    },
    bestProduct: [...products].sort((a, b) => b.fitMatch - a.fitMatch)[0],
    products
  };
};

const BrandProfile = () => {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(() => buildFallbackBrand(brandId));
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoading(true);
    });
    catalogApi.brand(brandId)
      .then((response) => {
        if (!active) return;
        setBrand(response);
        setSelectedCategory('All');
      })
      .catch(() => {
        if (!active) return;
        setBrand(buildFallbackBrand(brandId));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [brandId]);

  const products = Array.isArray(brand.products) ? brand.products : [];
  const categoryOptions = useMemo(() => ['All', ...(brand.subcategories || brand.categories || [])], [brand]);
  const visibleProducts = selectedCategory === 'All'
    ? products
    : products.filter((product) => product.subcategory === selectedCategory || product.category === selectedCategory);
  const heroImage = brand.bestProduct?.image || brand.image;

  return (
    <div className="brand-profile-page">
      <section className="brand-profile-hero" style={{ '--brand-hero-image': `url(${heroImage})` }}>
        <div className="container brand-profile-hero-grid">
          <div className="brand-profile-copy">
            <Link to="/collections" className="brand-back-link">
              <ArrowLeft size={16} />
              Explore
            </Link>
            <div className="brand-profile-mark">{getInitials(brand.name)}</div>
            <span className="label-caps text-accent">{brand.specialty} house</span>
            <h1>{brand.name}</h1>
            <p>
              {brand.tags?.slice(0, 3).join(' · ') || 'Curated marketplace brand'} with fit-ranked products,
              live category coverage and plus-size grading signals.
            </p>
          </div>

          <div className="brand-profile-visual">
            <img src={heroImage} alt={brand.name} />
            <div className="brand-profile-proof">
              <Sparkles size={16} />
              <span>{brand.fitScore}% fit confidence</span>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-profile-band">
        <div className="container">
          <div className="brand-stat-grid">
            <div className="brand-stat">
              <Star size={18} />
              <span>Rating</span>
              <strong>{brand.rating || '4.6'}</strong>
              <em>{brand.reviewCount || 0} reviews</em>
            </div>
            <div className="brand-stat">
              <Store size={18} />
              <span>Products</span>
              <strong>{brand.productTotal || products.length}</strong>
              <em>{brand.collections?.length || 1} collections</em>
            </div>
            <div className="brand-stat">
              <Shirt size={18} />
              <span>Categories</span>
              <strong>{brand.subcategories?.length || brand.categories?.length || 0}</strong>
              <em>{brand.genders?.join(' + ') || 'All fits'}</em>
            </div>
            <div className="brand-stat">
              <Ruler size={18} />
              <span>Price</span>
              <strong>{formatPrice(brand.priceRange?.min)}</strong>
              <em>to {formatPrice(brand.priceRange?.max)}</em>
            </div>
          </div>

          <div className="brand-profile-intel">
            <div>
              <span className="label-caps text-accent">Categories available</span>
              <div className="brand-chip-row">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    className={`brand-filter-chip ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="label-caps text-accent">Size range</span>
              <div className="brand-size-row">
                {(brand.availableSizes || []).slice(0, 10).map((size) => (
                  <span key={size}>{size}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm brand-product-section">
        <div className="container">
          <div className="brand-products-head">
            <div>
              <span className="label-caps text-accent">Brand catalog</span>
              <h2>{selectedCategory === 'All' ? 'All products' : selectedCategory}</h2>
            </div>
            <p>{visibleProducts.length} pieces from {brand.name}</p>
          </div>

            <div className="editorial-gallery brand-products-grid">
            {loading
              ? Array(4).fill(0).map((_, index) => <ProductSkeleton key={index} />)
              : visibleProducts.length ? visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              )) : (
                <div className="brand-empty-state">
                  <span className="label-caps text-accent">No products</span>
                  <h3>This category is not live yet.</h3>
                </div>
              )
            }
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BrandProfile;
