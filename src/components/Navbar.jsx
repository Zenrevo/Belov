import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Compass, Heart, Home, Search, ShoppingBag, Sparkles, User, WandSparkles } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';
import { categoryMenu } from '../lib/constants';
import { catalogApi, profileApi } from '../lib/api';
import { buildSearchSuggestions } from '../lib/searchSuggestions';
import './Navbar.css';

const getSearchInitials = (value = '') => (
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
);

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCatalog, setSearchCatalog] = useState({ products: [], brands: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCatalogLoaded, setSearchCatalogLoaded] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const { summary } = useCart();
  const cartCount = summary?.count || 0;
  const [tryOnCredits, setTryOnCredits] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setTryOnCredits(null);
      return undefined;
    }

    let active = true;
    profileApi.get()
      .then((response) => {
        if (!active) return;
        const used = Number(response?.tryOn?.used ?? 0);
        const limit = Number(response?.tryOn?.limit ?? 10);
        setTryOnCredits({ used, limit, remaining: Math.max(0, limit - used) });
      })
      .catch(() => {
        if (active) setTryOnCredits(null);
      });

    return () => { active = false; };
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    Promise.resolve().then(() => setSearchTerm(params.get('search') || ''));
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchTerm.trim().length < 2 || searchCatalogLoaded || searchLoading) return;

    let active = true;
    Promise.resolve().then(() => {
      if (active) setSearchLoading(true);
    });
    Promise.all([catalogApi.products(), catalogApi.brands()])
      .then(([productResponse, brandResponse]) => {
        if (!active) return;
        setSearchCatalog({
          products: productResponse.products || [],
          brands: brandResponse.brands || []
        });
        setSearchCatalogLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setSearchCatalog({ products: [], brands: [] });
      })
      .finally(() => {
        if (active) setSearchLoading(false);
      });

    return () => { active = false; };
  }, [searchTerm, searchCatalogLoaded, searchLoading]);

  const searchSuggestions = useMemo(() => (
    buildSearchSuggestions({
      query: searchTerm,
      products: searchCatalog.products,
      brands: searchCatalog.brands
    })
  ), [searchTerm, searchCatalog]);

  const runSearch = () => {
    if (!searchTerm.trim()) return;
    setSuggestionsOpen(false);
    navigate(`/collections?search=${encodeURIComponent(searchTerm.trim())}`);
  };
  const submitSearch = (event) => {
    event.preventDefault();
    runSearch();
  };

  const openSuggestion = (suggestion) => {
    setSearchTerm(suggestion.title);
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    navigate(suggestion.to);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      setSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
      return;
    }
    if (!searchSuggestions.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestionIndex((current) => (current + 1) % searchSuggestions.length);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestionIndex((current) => (
        current <= 0 ? searchSuggestions.length - 1 : current - 1
      ));
    }
    if (event.key === 'Enter' && suggestionsOpen && activeSuggestionIndex >= 0) {
      event.preventDefault();
      openSuggestion(searchSuggestions[activeSuggestionIndex]);
    }
  };

  const handleSearchIconClick = () => {
    if (searchTerm.trim()) {
      runSearch();
      return;
    }
    searchInputRef.current?.focus();
    setSuggestionsOpen(true);
  };

  const isHome = location.pathname === '/';
  const navScrolledClass = scrolled || !isHome ? 'scrolled' : '';
  const showSearchSuggestions = suggestionsOpen && searchTerm.trim().length >= 2;

  return (
    <>
      <nav className={`navbar ${navScrolledClass}`} id="main-nav">
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
              <Link to="/try-on" className={`nav-link label-caps ${location.pathname === '/try-on' || location.pathname === '/tryon' ? 'active' : ''}`}>
                Virtual Try-On
              </Link>
            </div>
          </div>

          <form className="nav-search-field desktop-only" onSubmit={submitSearch}>
            <Search size={16} aria-hidden="true" />
            <input
              ref={searchInputRef}
              id="global-style-search"
              type="search"
              placeholder="Search styles, brands, outfits"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSuggestionsOpen(true);
                setActiveSuggestionIndex(-1);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 140)}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
              aria-expanded={showSearchSuggestions}
              aria-controls="global-search-suggestions"
            />
            {showSearchSuggestions && (
              <div className="search-suggestions-panel" id="global-search-suggestions" role="listbox">
                {searchLoading && <div className="search-suggestion-loading">Matching live catalog...</div>}
                {!searchLoading && searchSuggestions.map((suggestion, index) => (
                  <Link
                    key={suggestion.id}
                    to={suggestion.to}
                    className={`search-suggestion-item ${activeSuggestionIndex === index ? 'active' : ''}`}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                    onClick={() => {
                      setSearchTerm(suggestion.type === 'Search' ? searchTerm : suggestion.title);
                      setSuggestionsOpen(false);
                      setActiveSuggestionIndex(-1);
                    }}
                    role="option"
                    aria-selected={activeSuggestionIndex === index}
                  >
                    <span className="search-suggestion-thumb" aria-hidden="true">
                      {suggestion.image ? <img src={suggestion.image} alt="" /> : getSearchInitials(suggestion.title)}
                    </span>
                    <span className="search-suggestion-copy">
                      <strong>{suggestion.title}</strong>
                      <small>{suggestion.subtitle}</small>
                    </span>
                    <span className={`search-suggestion-match ${suggestion.matchType === 'Fuzzy match' ? 'fuzzy' : ''}`}>
                      {suggestion.matchType}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </form>

          <div className="nav-right flex items-center gap-6">
            {isAuthenticated && tryOnCredits && (
              <Link to="/profile" className="nav-credits-wallet desktop-only" aria-label="Try-on credits">
                <Sparkles size={14} aria-hidden="true" />
                <div className="credits-info">
                  <span className="credits-count">{tryOnCredits.remaining}/{tryOnCredits.limit}</span>
                  <span className="credits-label">Free Try-Ons</span>
                </div>
              </Link>
            )}
            
            <button type="button" className="nav-icon-btn nav-search-icon desktop-only" id="nav-search" aria-label="Search" onClick={handleSearchIconClick}>
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
        <Link to="/try-on" className={`bottom-nav-item ${location.pathname === '/try-on' || location.pathname === '/tryon' ? 'active' : ''}`}>
          <WandSparkles size={19} aria-hidden="true" />
          <span>Try On</span>
        </Link>
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
