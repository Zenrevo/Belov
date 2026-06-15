import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Ruler, Shirt, Sparkles, Star, Store } from 'lucide-react';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
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

const BrandProfile = () => {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const products = Array.isArray(brand?.products) ? brand.products : [];
  const categoryOptions = useMemo(() => ['All', ...(brand?.subcategories || brand?.categories || [])], [brand]);

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
        setBrand(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [brandId]);

  if (!brand) {
    return <div className="brand-profile-page" style={{ paddingTop: 100 }}><div className="container">Loading brand...</div></div>;
  }

  const visibleProducts = selectedCategory === 'All'
    ? products
    : products.filter((product) => product.subcategory === selectedCategory || product.category === selectedCategory);
  const heroImage = brand.bestProduct?.image || brand.image;
  const vendorStore = brand.vendorStore;
  const brandStory = vendorStore?.description
    || brand.tags?.slice(0, 3).join(' · ')
    || 'Curated marketplace brand with fit-ranked products and plus-size grading.';

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
            {brand.isVerifiedSeller && (
              <span className="brand-verified-badge">
                <BadgeCheck size={16} /> Verified BELOV seller
              </span>
            )}
            <p>{brandStory}</p>
            {vendorStore && (
              <p className="brand-seller-meta">
                Sold by <strong>{vendorStore.displayName || vendorStore.storeName}</strong>
                {vendorStore.city ? ` · Ships from ${vendorStore.city}, ${vendorStore.state}` : ''}
              </p>
            )}
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
