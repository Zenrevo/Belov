import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, Sparkles, Store, WandSparkles, X } from 'lucide-react';
import Footer from '../components/Footer';
import AtelierHero from '../components/AtelierHero';
import { useTryOn } from '../context/useTryOn';
import { useAuth } from '../context/useAuth';
import { catalogApi } from '../lib/api';
import './Home.css';

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

const occasionMoments = [
  { name: 'Evening', image: '/images/evening.png' },
  { name: 'Festive', image: '/images/kurta_gold.png' },
  { name: 'Executive', image: '/images/tailored.png' },
  { name: 'Weekend', image: '/images/plus_size_shirt_1777572022906.png' }
];

const Home = () => {
  const { openTryOn } = useTryOn();
  const { isAuthenticated } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [recommendedBrands, setRecommendedBrands] = useState([]);
  const heroBrands = brands.slice(0, 12);
  const liveEdit = products.slice(0, 4);

  useEffect(() => {
    Promise.all([
      catalogApi.brands(),
      catalogApi.products()
    ])
      .then(([brandResponse, productResponse]) => {
        setBrands(brandResponse.brands || []);
        setProducts(productResponse.products || []);
      })
      .catch(() => {
        setBrands([]);
        setProducts([]);
      });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      Promise.resolve().then(() => setRecommendedBrands([]));
      return;
    }

    catalogApi.recommendations()
      .then((response) => {
        const rows = (response.brands || []).slice(0, 3).map((brand) => ({
          name: brand.name,
          reason: brand.specialty,
          match: `${brand.score || brand.fitScore}%`
        }));
        setRecommendedBrands(rows.length ? rows : []);
      })
      .catch(() => setRecommendedBrands([]));
  }, [isAuthenticated]);

  const topFit = useMemo(() => (
    products.reduce((best, item) => item.fitMatch > best.fitMatch ? item : best, products[0] || { fitMatch: 0 })
  ), [products]);

  return (
    <div className="home-ai-stylist">
      <AtelierHero />

      <main className="landing-passport">
        <section className="passport-intro">
          <div className="container passport-intro-grid">
            <div className="passport-copy">
              <span className="editorial-tag">Brand passport</span>
              <h2>One profile. Many brands. Better starting points.</h2>
            </div>

            <div className="passport-metrics" aria-label="Marketplace highlights">
              <span><strong>{brands.length}</strong> Brands</span>
              <span><strong>7</strong> Occasions</span>
              <span><strong>{topFit.fitMatch}%</strong> Top match</span>
            </div>
          </div>
        </section>

        <section className="concierge-stage">
          <div className="container concierge-grid">
            <div className="concierge-visual">
              <img className="concierge-main-img" src="/images/hero.png" alt="Curated fashion look" />
              <img className="concierge-float-img one" src="/images/tailored.png" alt="" aria-hidden="true" />
              <img className="concierge-float-img two" src="/images/kurta_gold.png" alt="" aria-hidden="true" />
            </div>

            <div className="concierge-panel">
              <span className="editorial-tag">Fit concierge</span>
              <h2>Recommended brands unlock after login</h2>

              <button
                type="button"
                className={`passport-lock ${isAuthenticated ? '' : 'locked'}`}
                onClick={() => {
                  if (!isAuthenticated) setShowAuthPrompt(true);
                }}
              >
                <span className="passport-lock-list" aria-hidden={!isAuthenticated}>
                  {recommendedBrands.map((brand) => (
                    <span key={brand.name} className="passport-lock-row">
                      <b>{brand.name}</b>
                      <em>{brand.match}</em>
                    </span>
                  ))}
                </span>
                {!isAuthenticated && (
                  <span className="passport-lock-overlay">
                    <LockKeyhole size={22} aria-hidden="true" />
                    <strong>Reveal my brand match</strong>
                    <small>Login or create profile</small>
                  </span>
                )}
              </button>

              <div className="concierge-actions">
                <Link to="/collections" className="btn btn-luxury-primary">Explore brands</Link>
                {products.length > 0 && (
                  <button className="btn btn-luxury-outline" onClick={() => openTryOn(products[0])}>
                    <WandSparkles size={16} aria-hidden="true" />
                    Try first look
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="occasion-runway">
          <div className="container">
            <div className="runway-heading">
              <span className="editorial-tag">Moments</span>
              <Link to="/collections" className="link-arrow">Open explore</Link>
            </div>

            <div className="moment-grid">
              {occasionMoments.map((moment) => (
                <Link
                  key={moment.name}
                  to={`/collections?occasion=${encodeURIComponent(moment.name)}`}
                  className="moment-tile"
                >
                  <img src={moment.image} alt={moment.name} />
                  <span>{moment.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="brand-wall-section">
          <div className="container">
            <div className="brand-wall-heading">
              <span className="editorial-tag">Available houses</span>
              <span>{brands.length} live brands</span>
            </div>

            <div className="home-brand-wall">
              {heroBrands.map((brand, index) => (
                <Link
                  key={brand.id}
                  to={`/collections?brand=${encodeURIComponent(brand.name)}`}
                  className={`home-brand-chip ${index < 3 ? 'featured' : ''}`}
                >
                  <span>{getInitials(brand.name)}</span>
                  <strong>{brand.name}</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="live-edit-section">
          <div className="container">
            <div className="live-edit-heading">
              <span className="editorial-tag">Live edit</span>
              <span>Fit-ranked pieces</span>
            </div>

            <div className="live-edit-grid">
              {liveEdit.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="live-edit-card">
                  <img src={product.image} alt={product.name} />
                  <span>{product.brand}</span>
                  <strong>{product.name}</strong>
                  <em>{product.fitMatch}% match</em>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {showAuthPrompt && (
        <div className="auth-modal-backdrop" role="presentation" onClick={() => setShowAuthPrompt(false)}>
          <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" onClick={(e) => e.stopPropagation()}>
            <button className="auth-modal-close" type="button" aria-label="Close login prompt" onClick={() => setShowAuthPrompt(false)}>
              <X size={18} aria-hidden="true" />
            </button>
            <div className="auth-modal-icon">
              <Sparkles size={24} aria-hidden="true" />
            </div>
            <span className="editorial-tag">Personalized marketplace</span>
            <h2 id="auth-modal-title">Login to reveal your best brands</h2>
            <p>Your fit profile ranks brand houses before you browse.</p>
            <div className="auth-modal-actions">
              <Link to="/auth?mode=register" className="btn btn-luxury-primary">
                <Store size={16} aria-hidden="true" />
                Register / Create profile
              </Link>
              <Link to="/auth?mode=login" className="btn btn-luxury-outline">Login</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
