import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  Building2,
  ChevronLeft,
  Factory,
  Heart,
  Info,
  Minus,
  PackageCheck,
  Plus,
  RefreshCw,
  ShoppingBag,
  Star,
  Truck,
  WandSparkles
} from 'lucide-react';
import Footer from '../components/Footer';
import { useTryOn } from '../context/useTryOn';
import { useCart } from '../context/useCart';
import { catalogApi } from '../lib/api';
import './ProductDetail.css';

const formatPrice = (price = 0) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

const COLOR_SWATCHES = {
  antique: '#b8934b',
  beige: '#d7c0a3',
  black: '#1e1b18',
  blue: '#244f86',
  cream: '#efe4cf',
  floral: 'linear-gradient(135deg, #f7f1e8, #c66f78 48%, #4f7d67)',
  gold: '#c9a24a',
  green: '#3f6f55',
  indigo: '#263c73',
  ivory: '#f6efe1',
  multicolour: 'linear-gradient(135deg, #d85c5c, #e6c55b 35%, #3d9b8f 68%, #3a4f86)',
  navy: '#1d2c4a',
  red: '#b33a35',
  taupe: '#8f8172',
  white: '#f7f7f4'
};

const colorSwatch = (color = '') => {
  const normalized = color.toLowerCase();
  const key = Object.keys(COLOR_SWATCHES).find((item) => normalized.includes(item));
  return COLOR_SWATCHES[key] || '#d8c7af';
};

const productCode = (product) => product.productCode || `BLV-${String(product.id).padStart(6, '0')}`;

const reviewSummary = (product) => {
  const total = Number(product.reviews || 0);
  const rating = Number(product.rating || 0);
  return [5, 4, 3, 2, 1].map((stars) => {
    const weight = stars === 5
      ? Math.max(0.48, rating / 5 - 0.12)
      : stars === 4
        ? 0.24
        : stars === 3
          ? 0.13
          : stars === 2
            ? 0.08
            : 0.07;
    return {
      stars,
      count: Math.max(stars === 5 ? 1 : 0, Math.round(total * weight))
    };
  });
};

const customerReviews = (product) => [
  {
    rating: 5,
    name: 'Verified buyer',
    text: `${product.fabric} feels premium and the ${product.subcategory.toLowerCase()} fit is comfortable for ${product.occasion.toLowerCase()} styling.`
  },
  {
    rating: 4,
    name: 'Fit passport user',
    text: `The ${product.color.toLowerCase()} shade looks close to the product photos. Recommended size ${product.recommendedSize} worked well.`
  },
  {
    rating: 5,
    name: 'Marketplace customer',
    text: `Good finish, easy to style, and the ${product.fitMatch}% fit match made the choice simpler.`
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const { isTryOnOpen } = useTryOn();
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [fetchKey, setFetchKey] = useState(0);
  const wasTryOnOpenRef = useRef(false);

  // Re-fetch product data when the try-on modal closes (to pick up new try-on images)
  useEffect(() => {
    if (wasTryOnOpenRef.current && !isTryOnOpen) {
      queueMicrotask(() => setFetchKey((k) => k + 1));
    }
    wasTryOnOpenRef.current = isTryOnOpen;
  }, [isTryOnOpen]);

  useEffect(() => {
    let active = true;
    Promise.all([
      catalogApi.product(id),
      catalogApi.products(),
      catalogApi.brands()
    ])
      .then(([productResponse, productsResponse, brandsResponse]) => {
        if (!active) return;
        setProduct(productResponse);
        setProducts(productsResponse.products || []);
        setBrands(brandsResponse.brands || []);
      })
      .catch(() => {
        if (!active) return;
        setProduct(null);
        setProducts([]);
        setBrands([]);
      });

    return () => { active = false; };
  }, [id, fetchKey]);

  if (!product) {
    return <div className="pdp-page" style={{ paddingTop: 100 }}><div className="container">Loading product...</div></div>;
  }

  return <ProductDetailView key={product.id} product={product} products={products} marketplaceBrands={brands} />;
};

const ProductDetailView = ({ product, products, marketplaceBrands }) => {
  const { openTryOn } = useTryOn();
  const { addToCart } = useCart();
  const brand = marketplaceBrands.find((item) => item.name === product.brand);
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colorOptions = useMemo(() => {
    const values = Array.isArray(product.colors) && product.colors.length ? product.colors : [product.color];
    return values
      .filter(Boolean)
      .map((color) => String(color).trim())
      .filter((color, index, allColors) => allColors.findIndex((item) => item.toLowerCase() === color.toLowerCase()) === index);
  }, [product.color, product.colors]);
  const [selectedSize, setSelectedSize] = useState(product.recommendedSize || sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState('');
  const [viewMode, setViewMode] = useState('product-0');

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const relatedProducts = useMemo(() => {
    const ranked = products
      .filter((item) => item.id !== product.id)
      .map((item) => {
        const score =
          (item.brand === product.brand ? 4 : 0) +
          (item.occasion === product.occasion ? 3 : 0) +
          (item.category === product.category ? 2 : 0) +
          (item.gender === product.gender ? 1 : 0);

        return { ...item, recommendationScore: score };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore || b.fitMatch - a.fitMatch);

    return ranked.slice(0, 4);
  }, [product, products]);

  const productImages = useMemo(() => {
    const images = Array.isArray(product.images) ? product.images : [];
    return [...images, product.image].filter(Boolean).filter((image, index, allImages) => allImages.indexOf(image) === index);
  }, [product.image, product.images]);

  const tryOnImages = useMemo(() => {
    return Array.isArray(product.tryOnImages) ? product.tryOnImages : [];
  }, [product.tryOnImages]);
  const tryOnCountRef = useRef(tryOnImages.length);

  const productShots = useMemo(() => {
    const galleryShots = productImages.map((image, index) => ({
      label: index === 0 ? 'Model' : `View ${index + 1}`,
      mode: `product-${index}`,
      image,
      isTryOn: false
    }));

    const tryOnShots = tryOnImages.map((tryOn, index) => ({
      label: tryOn.userName ? `${tryOn.userName.split(' ')[0]}` : `Try-On`,
      mode: `tryon-${index}`,
      image: tryOn.url,
      isTryOn: true
    }));

    return [...galleryShots, ...tryOnShots];
  }, [productImages, tryOnImages]);

  // Auto-switch to the latest try-on image when it arrives
  useEffect(() => {
    if (tryOnImages.length > tryOnCountRef.current) {
      queueMicrotask(() => setViewMode('tryon-0'));
    }
    tryOnCountRef.current = tryOnImages.length;
  }, [tryOnImages.length]);

  const currentShot = productShots.find((shot) => shot.mode === viewMode) || productShots[0];

  const fitSignals = [
    { label: 'Match', value: `${product.fitMatch}%`, tone: 'gold' },
    { label: 'Size', value: selectedSize || 'Fit check', tone: 'teal' },
    { label: 'Color', value: selectedColor || product.color, tone: 'gold' },
    { label: 'Fabric', value: product.fabric, tone: 'rose' },
    { label: 'Occasion', value: product.occasion, tone: 'lavender' }
  ];

  const specRows = [
    ['Fabric', product.fabric],
    ['Primary color', product.color],
    ['Category', product.category],
    ['Style', product.subcategory],
    ['Occasion', product.occasion],
    ['Collection', product.collection],
    ['Gender', product.gender],
    ['Available sizes', sizes.join(', ')]
  ].filter(([, value]) => value);

  const careRows = Array.isArray(product.care) && product.care.length
    ? product.care
    : ['Machine wash cold', 'Wash inside out', 'Do not bleach'];

  const serviceRows = [
    { icon: Truck, title: 'Delivery', text: product.deliveryPromise || 'Ships from verified marketplace stock in 24-48 hours' },
    { icon: RefreshCw, title: 'Returns', text: product.returnPolicy || 'Easy 7 day returns and exchanges' },
    { icon: BadgeCheck, title: 'Authenticity', text: 'Original catalog product with verified marketplace imagery' }
  ];

  const reviewRows = customerReviews(product);
  const ratingRows = reviewSummary(product);
  const maxRatingCount = Math.max(...ratingRows.map((row) => row.count), 1);
  const customerPhotos = productImages.slice(0, 4);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setCartError('Pick a size before adding to bag.');
      return;
    }
    if (!selectedColor) {
      setCartError('Pick a color before adding to bag.');
      return;
    }

    try {
      setCartError('');
      await addToCart(product, selectedSize, quantity, selectedColor);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1800);
    } catch (error) {
      setCartError(error.message || 'Could not add this product to bag.');
    }
  };

  return (
    <div className="pdp-page">
      <section className="pdp-studio">
        <div className="container pdp-studio-grid">
          <div className="pdp-visual-col">
            <Link to="/collections" className="pdp-back">
              <ChevronLeft size={16} />
              Marketplace
            </Link>

            <div className="pdp-visual-stage">
              <div className="pdp-stage-top">
                <span>{product.collection}</span>
                <span>{product.fitMatch}% fit locked</span>
              </div>

              <div className={`pdp-hero-wrap ${currentShot.isTryOn ? 'tryon' : ''}`}>
                <img src={currentShot.image} alt={product.name} className="pdp-hero-img" />
                {currentShot.isTryOn && (
                  <span className="pdp-tryon-badge">
                    <WandSparkles size={12} />
                    Try-On
                  </span>
                )}
              </div>

              <div className="pdp-shot-switcher" aria-label="Product view">
                {productShots.map((shot) => (
                  <button
                    key={shot.mode}
                    type="button"
                    className={`${viewMode === shot.mode ? 'active' : ''} ${shot.isTryOn ? 'tryon' : ''}`}
                    onClick={() => setViewMode(shot.mode)}
                  >
                    <img src={shot.image} alt="" />
                  </button>
                ))}
                <button
                    type="button"
                    className="pdp-shot-btn-add"
                    onClick={() => openTryOn(product)}
                    title="Try it on your body"
                  >
                    <WandSparkles size={20} />
                </button>
              </div>
            </div>
          </div>

          <aside className="pdp-buy-rail">
            <div className="pdp-brand-strip">
              <Link to={brand?.id ? `/brands/${brand.id}` : '/collections'}>{product.brand}</Link>
              <span>{brand?.specialty || product.category}</span>
            </div>

            <div className="pdp-title-block">
              <p>{product.subtitle}</p>
              <h1>{product.name}</h1>
            </div>

            <div className="pdp-price-band">
              <div>
                <strong>{formatPrice(product.price)}</strong>
                {product.originalPrice && <span>{formatPrice(product.originalPrice)}</span>}
              </div>
              {discount > 0 && <em>{discount}% off</em>}
            </div>

            <div className="pdp-info-tags">
              {fitSignals.map((signal) => (
                <span key={signal.label} className="pdp-info-tag">
                  {signal.label}: <strong>{signal.value}</strong>
                </span>
              ))}
            </div>

            <div className="pdp-size-module">
              <div className="pdp-module-head">
                <span>Pick size</span>
                <strong>{product.recommendedSize} best fit</strong>
              </div>
              <div className="pdp-size-row">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`${selectedSize === size ? 'active' : ''} ${product.recommendedSize === size ? 'recommended' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pdp-purchase-options">
              <div className="pdp-color-module">
                <div className="pdp-module-head">
                  <span>Pick color</span>
                  <strong>{selectedColor || 'Required'}</strong>
                </div>
                <div className="pdp-color-row">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`pdp-color-option ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      <span className="pdp-color-swatch" style={{ background: colorSwatch(color) }} />
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pdp-quantity-module">
                <div className="pdp-module-head">
                  <span>Quantity</span>
                  <strong>{quantity} selected</strong>
                </div>
                <div className="pdp-quantity-stepper" aria-label="Quantity">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(20, value + 1))}
                    disabled={quantity >= 20}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="pdp-purchase-summary">
              <span>{selectedColor}</span>
              <span>{selectedSize}</span>
              <span>Qty {quantity}</span>
            </div>
            {cartError && <p className="pdp-cart-error">{cartError}</p>}

            <div className="pdp-action-grid">
              <button type="button" className="pdp-primary-action" onClick={() => openTryOn(product)}>
                <WandSparkles size={18} />
                Try on
              </button>
              <button
                type="button"
                className="pdp-secondary-action"
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor}
              >
                <ShoppingBag size={18} />
                {addedToCart ? 'Added' : 'Add to bag'}
              </button>
              <button type="button" className="pdp-icon-action" aria-label="Save product">
                <Heart size={18} />
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className="pdp-detail-section">
        <div className="container">
          <div className="pdp-detail-layout">
            <div className="pdp-detail-main">
              <article className="pdp-info-panel">
                <div className="pdp-panel-title">
                  <Info size={18} />
                  <div>
                    <span>Product details</span>
                    <h2>More about this piece</h2>
                  </div>
                </div>
                <p className="pdp-product-description">{product.description}</p>
                <div className="pdp-spec-grid">
                  {specRows.map(([label, value]) => (
                    <div className="pdp-spec-row" key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </article>

              <article className="pdp-info-panel">
                <div className="pdp-panel-title">
                  <PackageCheck size={18} />
                  <div>
                    <span>Material and care</span>
                    <h2>Handle with care</h2>
                  </div>
                </div>
                <div className="pdp-care-grid">
                  {careRows.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                {product.sustainability && <p className="pdp-care-note">{product.sustainability}</p>}
              </article>

              <article className="pdp-info-panel pdp-reviews-panel">
                <div className="pdp-panel-title">
                  <Star size={18} />
                  <div>
                    <span>Ratings and feedback</span>
                    <h2>Customer reviews</h2>
                  </div>
                </div>

                <div className="pdp-rating-block">
                  <div className="pdp-rating-score">
                    <strong>{Number(product.rating || 0).toFixed(1)}</strong>
                    <span><Star size={16} fill="currentColor" /> {product.reviews || 0} verified buyers</span>
                  </div>
                  <div className="pdp-rating-bars">
                    {ratingRows.map((row) => (
                      <div className="pdp-rating-bar" key={row.stars}>
                        <span>{row.stars}</span>
                        <i><b style={{ width: `${Math.min((row.count / maxRatingCount) * 100, 100)}%` }} /></i>
                        <em>{row.count}</em>
                      </div>
                    ))}
                  </div>
                </div>

                {customerPhotos.length > 0 && (
                  <div className="pdp-customer-photos">
                    <span>Customer photos</span>
                    <div>
                      {customerPhotos.map((image) => (
                        <button key={image} type="button" onClick={() => setViewMode(`product-${productImages.indexOf(image)}`)}>
                          <img src={image} alt="" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pdp-review-list">
                  {reviewRows.map((review) => (
                    <div className="pdp-review-card" key={`${review.name}-${review.text}`}>
                      <span>{review.rating}<Star size={11} fill="currentColor" /></span>
                      <p>{review.text}</p>
                      <small>{review.name}</small>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <aside className="pdp-detail-side">
              <article className="pdp-info-panel pdp-brand-card">
                <div className="pdp-panel-title">
                  <Building2 size={18} />
                  <div>
                    <span>Brand information</span>
                    <h2>{product.brand}</h2>
                  </div>
                </div>
                <p>{brand?.specialty || `${product.brand} products curated for fit-led marketplace shopping.`}</p>
                <div className="pdp-brand-meta">
                  <span>{brand?.fitScore || product.fitMatch}% brand fit</span>
                  <span>{brand?.productCount || 1} live products</span>
                </div>
                <Link to={brand?.id ? `/brands/${brand.id}` : `/collections?brand=${encodeURIComponent(product.brand)}`}>
                  Open brand page
                </Link>
              </article>

              <article className="pdp-info-panel">
                <div className="pdp-panel-title">
                  <Truck size={18} />
                  <div>
                    <span>Delivery and service</span>
                    <h2>Before you order</h2>
                  </div>
                </div>
                <div className="pdp-service-list">
                  {serviceRows.map((row) => {
                    const Icon = row.icon;
                    return (
                      <div className="pdp-service-row" key={row.title}>
                        <Icon size={17} />
                        <div>
                          <strong>{row.title}</strong>
                          <p>{row.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="pdp-info-panel">
                <div className="pdp-panel-title">
                  <Factory size={18} />
                  <div>
                    <span>Manufacturer</span>
                    <h2>Seller details</h2>
                  </div>
                </div>
                <div className="pdp-seller-list">
                  <div>
                    <span>Product code</span>
                    <strong>{productCode(product)}</strong>
                  </div>
                  <div>
                    <span>Seller</span>
                    <strong>{product.seller || `${product.brand} Official Store`}</strong>
                  </div>
                  <div>
                    <span>Manufacturer</span>
                    <strong>{product.manufacturer || `${product.brand} Retail Private Limited`}</strong>
                  </div>
                  <div>
                    <span>Country of origin</span>
                    <strong>{product.countryOfOrigin || 'India'}</strong>
                  </div>
                </div>
              </article>
            </aside>
          </div>
        </div>
      </section>

      <section className="pdp-more-section">
        <div className="container">
          <div className="pdp-section-head">
            <span className="pdp-kicker">Best fit next</span>
            <h2>More marketplace picks</h2>
          </div>

          <div className="pdp-related-row">
            {relatedProducts.map((item) => (
              <Link key={item.id} to={`/product/${item.id}`} className="pdp-related-card">
                <img src={item.image} alt={item.name} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
