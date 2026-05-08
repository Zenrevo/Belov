import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Heart,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  WandSparkles
} from 'lucide-react';
import Footer from '../components/Footer';
import { useTryOn } from '../context/useTryOn';
import { useCart } from '../context/useCart';
import { marketplaceBrands as fallbackBrands, products as fallbackProducts } from '../data/products';
import { catalogApi } from '../lib/api';
import './ProductDetail.css';

const formatPrice = (price = 0) => `₹${Number(price || 0).toLocaleString('en-IN')}`;

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(() => fallbackProducts.find((item) => item.id === Number(id)) || fallbackProducts[0]);
  const [products, setProducts] = useState(fallbackProducts);
  const [brands, setBrands] = useState(fallbackBrands);

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
  }, [id]);

  return <ProductDetailView key={product.id} product={product} products={products} marketplaceBrands={brands} />;
};

const ProductDetailView = ({ product, products, marketplaceBrands }) => {
  const { openTryOn } = useTryOn();
  const { addToCart } = useCart();
  const brand = marketplaceBrands.find((item) => item.name === product.brand);
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const care = Array.isArray(product.care) ? product.care : [];
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

  const productShots = useMemo(() => {
    const galleryShots = productImages.map((image, index) => ({
      label: index === 0 ? 'Model' : `View ${index + 1}`,
      mode: `product-${index}`,
      image
    }));

    return [
      ...galleryShots,
      { label: 'You', mode: 'you', image: '/images/hero.png' },
      { label: 'Fit', mode: 'fit', image: brand?.image || productImages[0] || product.image }
    ];
  }, [brand?.image, product.image, productImages]);

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

              <img src={currentShot.image} alt={product.name} className="pdp-hero-img" />

              <div className="pdp-floating-proof">
                <Sparkles size={16} />
                <span>{selectedSize} recommended</span>
              </div>

              <div className="pdp-shot-switcher" aria-label="Product view">
                {productShots.map((shot) => (
                  <button
                    key={shot.mode}
                    type="button"
                    className={viewMode === shot.mode ? 'active' : ''}
                    onClick={() => setViewMode(shot.mode)}
                  >
                    <img src={shot.image} alt="" />
                    <span>{shot.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="pdp-buy-rail">
            <div className="pdp-brand-strip">
              <span>{product.brand}</span>
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

            <div className="pdp-signal-grid">
              {fitSignals.map((signal) => (
                <div key={signal.label} className={`pdp-signal ${signal.tone}`}>
                  <span>{signal.label}</span>
                  <strong>{signal.value}</strong>
                </div>
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

            <div className="pdp-service-row">
              <span><Ruler size={15} /> Plus grading</span>
              <span><Truck size={15} /> Fast dispatch</span>
              <span><ShieldCheck size={15} /> Brand verified</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="pdp-intel-section">
        <div className="container pdp-intel-grid">
          <div className="pdp-brand-card">
            <div>
              <span className="pdp-kicker">Brand fit</span>
              <h2>{brand?.name || product.brand}</h2>
            </div>
            <strong>{brand?.fitScore || product.fitMatch}</strong>
            <p>{brand?.specialty || product.subcategory}</p>
            <Link to="/collections">View brand</Link>
          </div>

          <div className="pdp-fit-notes">
            <span className="pdp-kicker">Fit notes</span>
            <div className="pdp-note-grid">
              <div>
                <strong>Shape</strong>
                <span>{product.subcategory}</span>
              </div>
              <div>
                <strong>Movement</strong>
                <span>{product.fabric}</span>
              </div>
              <div>
                <strong>Color</strong>
                <span>{product.color}</span>
              </div>
            </div>
          </div>

          <div className="pdp-detail-card">
            <span className="pdp-kicker">Care</span>
            <div className="pdp-care-list">
              {care.slice(0, 3).map((careItem) => (
                <span key={careItem}>{careItem}</span>
              ))}
            </div>
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
                <div>
                  <span>{item.brand}</span>
                  <h3>{item.name}</h3>
                  <p>{item.fitMatch}% fit · {formatPrice(item.price)}</p>
                </div>
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
