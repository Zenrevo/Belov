import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, SlidersHorizontal, Store, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import Footer from '../components/Footer';
import { filters as fallbackFilters, filterLabels, marketplaceBrands as fallbackBrands, products as fallbackProducts } from '../data/products';
import { catalogApi } from '../lib/api';
import './Collections.css';

const filterParamKeys = ['category', 'subcategory', 'gender', 'fabric', 'occasion', 'size', 'priceRange', 'brand', 'collection', 'vibe', 'search'];
const filterOrder = ['gender', 'priceRange', 'brand', 'category', 'subcategory', 'size', 'fabric', 'occasion', 'collection', 'vibe', 'fit'];

const getFiltersFromParams = (searchParams) => (
  filterParamKeys.reduce((acc, key) => {
    const values = searchParams.getAll(key).filter(Boolean);
    if (values.length) acc[key] = values;
    return acc;
  }, {})
);

const getProductValues = (product, category) => {
  if (category === 'size') return product.sizes;
  if (category === 'vibe') return product.vibes || [];
  if (category === 'search') return [product.name, product.brand, product.subcategory, product.category, ...(product.tags || [])];
  if (category === 'fit') return [...(product.tags || []), product.subcategory || '', product.collection || ''];
  if (category === 'priceRange') {
    const price = product.price;
    return [
      price < 2000 && 'Under ₹2,000',
      price >= 2000 && price <= 5000 && '₹2,000 – ₹5,000',
      price > 5000 && price <= 10000 && '₹5,000 – ₹10,000',
      price > 10000 && 'Above ₹10,000'
    ].filter(Boolean);
  }
  return [product[category]].filter(Boolean);
};

const getInitials = (name) => (
  name
    .replace('&', ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
);

const Collections = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('fitMatch');
  const [brandQuery, setBrandQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [loading, setLoading] = useState(true);
  const [minimizedFilters, setMinimizedFilters] = useState({});
  const [catalogProducts, setCatalogProducts] = useState(fallbackProducts);
  const [brands, setBrands] = useState(fallbackBrands);
  const [apiFilters, setApiFilters] = useState(fallbackFilters);
  const products = catalogProducts;
  const marketplaceBrands = brands;
  const filters = apiFilters;
  const activeFilters = useMemo(() => getFiltersFromParams(searchParams), [searchParams]);
  const occasionOptions = useMemo(() => [...new Set(products.map(product => product.occasion))], [products]);
  const selectedOccasion = activeFilters.occasion?.[0] || occasionOptions[0];

  useEffect(() => {
    const serverParams = Object.fromEntries(
      Object.entries(activeFilters).map(([key, values]) => [key, values[0]])
    );

    Promise.resolve().then(() => setLoading(true));
    Promise.all([catalogApi.products(serverParams), catalogApi.brands({ search: brandQuery }), catalogApi.filters()])
      .then(([productResponse, brandResponse, filterResponse]) => {
        setCatalogProducts(productResponse.products || fallbackProducts);
        setBrands(brandResponse.brands || fallbackBrands);
        setApiFilters({ ...fallbackFilters, ...filterResponse });
      })
      .catch(() => {
        setCatalogProducts(fallbackProducts);
        setBrands(fallbackBrands);
        setApiFilters(fallbackFilters);
      })
      .finally(() => setLoading(false));
  }, [activeFilters, brandQuery]);

  const setSingleFilter = (category, value) => {
    const params = new URLSearchParams(searchParams);
    params.delete(category);
    params.append(category, value);
    setSearchParams(params);
  };

  const toggleGroup = (category) => {
    setMinimizedFilters(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleFilter = (category, value) => {
    const params = new URLSearchParams(searchParams);
    const current = params.getAll(category);
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];

    params.delete(category);
    updated.forEach(v => params.append(category, v));
    setSearchParams(params);
  };

  const isActive = (category, value) => (activeFilters[category] || []).includes(value);

  const filteredProducts = (products.length ? products : fallbackProducts).filter((product) => (
    Object.entries(activeFilters).every(([category, values]) => {
      if (!values.length) return true;
      const productValues = getProductValues(product, category);
      return values.some(value => productValues.some(productValue => (
        String(productValue).toLowerCase().includes(String(value).toLowerCase())
      )));
    })
  ));

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'fitMatch') return b.fitMatch - a.fitMatch;
    if (sortBy === 'priceLow') return a.price - b.price;
    if (sortBy === 'priceHigh') return b.price - a.price;
    return 0;
  });

  const selectedOccasionProducts = (products.length ? products : fallbackProducts)
    .filter(product => product.occasion === selectedOccasion)
    .sort((a, b) => b.fitMatch - a.fitMatch);

  const bestFitProduct = selectedOccasionProducts[0] || products[0] || fallbackProducts[0];
  const bestValueProduct = [...selectedOccasionProducts].sort((a, b) => a.price - b.price)[0] || bestFitProduct;

  const brandRecommendations = (marketplaceBrands.length ? marketplaceBrands : fallbackBrands)
    .map((brand) => {
      const brandProducts = products.filter(product => product.brand === brand.name);
      const occasionProducts = brandProducts.filter(product => product.occasion === selectedOccasion);
      const pool = occasionProducts.length ? occasionProducts : brandProducts;
      const bestProduct = [...pool].sort((a, b) => b.fitMatch - a.fitMatch)[0];

      return {
        ...brand,
        bestProduct,
        occasionCount: occasionProducts.length,
        score: bestProduct ? bestProduct.fitMatch + (occasionProducts.length ? 4 : 0) : brand.fitScore
      };
    })
    .sort((a, b) => b.score - a.score);

  const visibleBrands = brandRecommendations.filter((brand) => (
    brand.name.toLowerCase().includes(brandQuery.toLowerCase())
    || brand.specialty.toLowerCase().includes(brandQuery.toLowerCase())
  ));
  const displayedBrands = showAllBrands ? visibleBrands : visibleBrands.slice(0, 5);
  const orderedFilters = filterOrder
    .filter((key) => Array.isArray(filters[key]) && filters[key].length)
    .map((key) => [key, filters[key]]);

  const activeFilterLabels = Object.entries(activeFilters).flatMap(([category, values]) => (
    values.map(value => `${filterLabels[category] || category}: ${value}`)
  ));

  const topBrand = brandRecommendations[0] || fallbackBrands[0];
  const signalCards = [
    { label: 'Fit', value: bestFitProduct.brand, meta: `${bestFitProduct.fitMatch}%`, to: `/product/${bestFitProduct.id}` },
    { label: 'Value', value: bestValueProduct.brand, meta: `₹${bestValueProduct.price.toLocaleString('en-IN')}`, to: `/product/${bestValueProduct.id}` },
    { label: 'Brand', value: topBrand.name, meta: `${Math.min(topBrand.score || topBrand.fitScore, 99)}%`, to: `/brands/${topBrand.id}` }
  ];

  return (
    <div className="collections-page technique-page">
      <section className="brand-console">
        <div className="container">
          <div className="brand-console-top">
            <div className="brand-console-title">
              <span className="label-caps text-accent">Marketplace</span>
              <h1>Brand houses</h1>
            </div>
            <label className="brand-search" htmlFor="brand-search-input">
              <Search size={17} aria-hidden="true" />
              <input
                id="brand-search-input"
                value={brandQuery}
                onChange={(event) => setBrandQuery(event.target.value)}
                placeholder="Search brands"
              />
            </label>
          </div>

          <div className="occasion-strip" aria-label="Choose occasion">
            {occasionOptions.map((occasion) => (
              <button
                key={occasion}
                className={`occasion-choice ${selectedOccasion === occasion ? 'active' : ''}`}
                onClick={() => setSingleFilter('occasion', occasion)}
              >
                {occasion}
              </button>
            ))}
          </div>

          <div className="signal-strip">
            {signalCards.map((signal) => (
              <Link key={signal.label} to={signal.to} className="signal-chip">
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <em>{signal.meta}</em>
              </Link>
            ))}
          </div>

          <div className="brand-wall">
            {displayedBrands.map((brand, index) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.id}`}
                className={`brand-tile ${index < 3 ? 'top-match' : ''}`}
                aria-label={`${brand.name}, ${Math.min(brand.score, 99)} percent match`}
              >
                <span className="brand-logo-mark">{getInitials(brand.name)}</span>
                <span className="brand-tile-name">{brand.name}</span>
                <span className="brand-tile-meta">
                  <b>{Math.min(brand.score, 99)}%</b>
                  <small>{brand.specialty}</small>
                </span>
              </Link>
            ))}
          </div>

          <div className="brand-console-actions">
            <span>{displayedBrands.length} of {visibleBrands.length} matched brands</span>
            {visibleBrands.length > 5 && (
              <button className="grid-optional-toggle" onClick={() => setShowAllBrands(prev => !prev)}>
                <Store size={16} aria-hidden="true" />
                {showAllBrands ? 'Show top 5' : 'See all brands'}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="section-sm optional-grid-section">
        <div className="container">
          <div className="explore-grid-head">
            <div>
              <span className="label-caps text-accent">Explore grid</span>
              <h2>Filter every piece</h2>
            </div>
            <p>Gender, price, brand, category, size and occasion are all mapped into the live catalog.</p>
          </div>

          <div className={`collections-layout optional-grid-layout ${showFilters ? 'filters-open' : 'filters-closed'}`}>
            <aside className={`filters-sidebar ${showFilters ? 'visible' : ''}`}>
              <div className="filters-intro">
                <span className="label-caps text-accent">Filters</span>
              </div>
              {orderedFilters.map(([category, values]) => {
                const isMinimized = minimizedFilters[category];
                return (
                  <div key={category} className="filter-group">
                    <button
                      className="filter-group-header flex justify-between items-center w-full bg-transparent border-none p-0 cursor-pointer mb-3"
                      onClick={() => toggleGroup(category)}
                    >
                      <h4 className="label-caps m-0">{filterLabels[category] || category}</h4>
                      {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                    {!isMinimized && (
                      <div className="filter-chips flex flex-wrap gap-2">
                        {values.map((val) => (
                          <button
                            key={val}
                            className={`chip ${isActive(category, val) ? 'active' : ''}`}
                            onClick={() => toggleFilter(category, val)}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </aside>

            <div className="collections-main">
              <div className="collections-toolbar">
                <button className="filter-toggle-btn" onClick={() => setShowFilters(prev => !prev)}>
                  <SlidersHorizontal size={16} aria-hidden="true" />
                  {showFilters ? 'Hide filters' : 'Show filters'}
                </button>
                <p className="body-sm text-muted">{sortedProducts.length} pieces</p>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="fitMatch">Best Fit Match</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
              {activeFilterLabels.length > 0 && (
                <div className="active-filter-row" aria-label="Active filters">
                  {activeFilterLabels.map(label => (
                    <span key={label} className="active-filter-pill">{label}</span>
                  ))}
                  <button className="clear-filter-btn" onClick={() => setSearchParams({})}>
                    <X size={14} aria-hidden="true" />
                    Clear
                  </button>
                </div>
              )}
              <div className="editorial-gallery collections-grid">
                {loading
                  ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                  : sortedProducts.length > 0 ? sortedProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                  )) : (
                    <div className="empty-collection-state">
                      <span className="label-caps text-accent">No exact match</span>
                      <h3>Try one less filter.</h3>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Collections;
