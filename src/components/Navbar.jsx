import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronDown, Compass, Heart, Home, Search, ShoppingBag, Sparkles, User, WandSparkles } from 'lucide-react';
import { useTryOn } from '../context/useTryOn';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';
import { categoryMenu } from '../data/products';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { openTryOn } = useTryOn();
  const { isAuthenticated } = useAuth();
  const { summary } = useCart();
  const cartCount = summary?.count || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const launchDemoTryOn = () => openTryOn({ id: 'demo', name: 'Virtual Atelier Demo', brand: 'BELOV', price: 0, image: '/images/hero.png' });
  const submitSearch = (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/collections?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-nav">
        <div className="container nav-inner">
          <div className="nav-left flex items-center">
            <Link to="/" className="nav-brand" id="nav-logo">
              <img src="/full-logo.png" alt="BELOV" className="nav-logo-img" />
            </Link>
            <div className="nav-links flex gap-6 desktop-only">
              <Link to="/collections" className={`nav-link label-caps ${location.pathname === '/collections' ? 'active' : ''}`}>Explore</Link>
              <div className="nav-category-menu">
                <button className="nav-link label-caps nav-category-trigger" aria-haspopup="true">
                  Categories
                  <ChevronDown size={13} aria-hidden="true" />
                </button>
                <div className="nav-category-dropdown">
                  {categoryMenu.map((category) => (
                    <div key={category.id} className="nav-category-group">
                      <Link
                        to={`/collections?category=${encodeURIComponent(category.name)}`}
                        className="nav-category-title"
                      >
                        {category.name}
                      </Link>
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.name}
                          to={`/collections?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(subcategory.name)}`}
                          className="nav-subcategory-link"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <button 
                className="nav-link label-caps bg-transparent border-none cursor-pointer"
                onClick={launchDemoTryOn}
              >
                Virtual Try-On
              </button>
            </div>
          </div>

          <form className="nav-search-field desktop-only" onSubmit={submitSearch}>
            <Search size={16} aria-hidden="true" />
            <input
              id="global-style-search"
              type="search"
              placeholder="Search styles, brands, outfits"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </form>

          <div className="nav-right flex items-center gap-6">
            <div className="nav-credits-wallet desktop-only">
              <Sparkles size={14} aria-hidden="true" />
              <div className="credits-info">
                <span className="credits-count">8/10</span>
                <span className="credits-label">Free Try-Ons</span>
              </div>
            </div>
            
            <button className="nav-icon-btn nav-search-icon desktop-only" id="nav-search" aria-label="Search">
              <Search size={20} aria-hidden="true" />
            </button>
            <Link to={isAuthenticated ? '/profile' : '/auth?mode=login'} className="nav-icon-btn desktop-only" id="nav-profile" aria-label="Profile">
              <User size={20} aria-hidden="true" />
            </Link>
            <Link to="/cart" className="nav-icon-btn nav-cart" id="nav-cart" aria-label="Cart">
              <ShoppingBag size={20} aria-hidden="true" />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>

      <nav className="bottom-nav" aria-label="Primary mobile navigation">
        <Link to="/" className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Home size={19} aria-hidden="true" />
          <span>Home</span>
        </Link>
        <button className="bottom-nav-item" onClick={launchDemoTryOn}>
          <WandSparkles size={19} aria-hidden="true" />
          <span>Try On</span>
        </button>
        <Link to="/collections" className={`bottom-nav-item ${location.pathname === '/collections' ? 'active' : ''}`}>
          <Compass size={19} aria-hidden="true" />
          <span>Explore</span>
        </Link>
        <Link to={isAuthenticated ? '/profile' : '/auth?mode=login'} className="bottom-nav-item">
          <Heart size={19} aria-hidden="true" />
          <span>Saved</span>
        </Link>
        <Link to={isAuthenticated ? '/profile' : '/auth?mode=login'} className={`bottom-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
          <User size={19} aria-hidden="true" />
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
