import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Heart,
  ShoppingBag,
  WandSparkles
} from 'lucide-react';
import Footer from '../components/Footer';
import { useTryOn } from '../context/useTryOn';
import { useCart } from '../context/useCart';
import { marketplaceBrands as fallbackBrands, products as fallbackProducts } from '../data/products';
import { catalogApi } from '../lib/api';
import './ProductDetail.css';

const formatPrice = (price = 0) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { isTryOnOpen } = useTryOn();
  const [product, setProduct] = useState(() => fallbackProducts.find((item) => item.id === Number(id)) || fallbackProducts[0]);
  const [products, setProducts] = useState(fallbackProducts);
  const [brands, setBrands] = useState(fallbackBrands);
  const [fetchKey, setFetchKey] = useState(0);

  // Re-fetch product data when the try-on modal closes (to pick up new try-on images)
  const prevTryOnOpen = usePrevious(isTryOnOpen);
  useEffect(() => {
    if (prevTryOnOpen && !isTryOnOpen) {
      setFetchKey((k) => k + 1);
    }
  }, [isTryOnOpen, prevTryOnOpen]);

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
        setProducts(productsResponse.products || fallbackProducts);
        setBrands(brandsResponse.brands || fallbackBrands);
      })
      .catch(() => {
        if (!active) return;
        setProduct(fallbackProducts.find((item) => item.id === Number(id)) || fallbackProducts[0]);
        setProducts(fallbackProducts);
        setBrands(fallbackBrands);
      });

    return () => { active = false; };
  }, [id, fetchKey]);

  return <ProductDetailView key={product.id} product={product} products={products} marketplaceBrands={brands} />;
};

const ProductDetailView = ({ product, products, marketplaceBrands }) => {
  const { openTryOn } = useTryOn();
  const { addToCart } = useCart();
  const brand = marketplaceBrands.find((item) => item.name === product.brand);
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const [selectedSize, setSelectedSize] = useState(product.recommendedSize || sizes[0] || '');
  const [addedToCart, setAddedToCart] = useState(false);
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

  const currentShot = productShots.find((shot) => shot.mode === viewMode) || productShots[0];

  const fitSignals = [
    { label: 'Match', value: `${product.fitMatch}%`, tone: 'gold' },
    { label: 'Size', value: selectedSize || 'Fit check', tone: 'teal' },
    { label: 'Fabric', value: product.fabric, tone: 'rose' },
    { label: 'Occasion', value: product.occasion, tone: 'lavender' }
  ];

  const handleAddToCart = async () => {
    await addToCart(product, selectedSize, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
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

            <div className="pdp-action-grid">
              <button type="button" className="pdp-primary-action" onClick={() => openTryOn(product)}>
                <WandSparkles size={18} />
                Try on
              </button>
              <button type="button" className="pdp-secondary-action" onClick={handleAddToCart}>
                <ShoppingBag size={18} />
                {addedToCart ? 'Added' : 'Bag'}
              </button>
              <button type="button" className="pdp-icon-action" aria-label="Save product">
                <Heart size={18} />
              </button>
            </div>
          </aside>
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
