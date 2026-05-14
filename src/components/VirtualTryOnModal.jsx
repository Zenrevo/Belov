import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, WandSparkles, X } from 'lucide-react';
import { apiAssetUrl, catalogApi, tryOnApi } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { useTryOn } from '../context/useTryOn';
import './VirtualTryOnModal.css';

const VirtualTryOnModal = () => {
  const { isTryOnOpen, tryOnProduct: initialProduct, closeTryOn } = useTryOn();
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState('me'); // 'me' or 'model'
  const [personFile, setPersonFile] = useState(null);
  const [personPreview, setPersonPreview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Auth state for popup
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authStep, setAuthStep] = useState('request'); // 'request' or 'verify'
  const [authChannel, setAuthChannel] = useState('email');
  const [authDest, setAuthDest] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authDevOtp, setAuthDevOtp] = useState('');

  const { requestOtp, verifyOtp } = useAuth();
  
  const [productSelection, setProductSelection] = useState({
    sourceId: initialProduct?.id ?? null,
    product: initialProduct
  });
  const [selectedPersonUrl, setSelectedPersonUrl] = useState(initialProduct?.gender === 'Men' ? '/images/plus_size_shirt_1777572022906.png' : '/images/hero.png');

  // Available products for the "Clothes Selector"
  const [allProducts, setAllProducts] = useState([]);

  if (initialProduct && productSelection.sourceId !== initialProduct.id) {
    setProductSelection({
      sourceId: initialProduct.id,
      product: initialProduct
    });
  }

  useEffect(() => {
    catalogApi.products()
      .then(res => setAllProducts(res.products || []))
      .catch(() => {});
  }, []);

  useEffect(() => () => {
    if (personPreview.startsWith('blob:')) URL.revokeObjectURL(personPreview);
  }, [personPreview]);

  const currentProduct = productSelection.product || initialProduct;
  const selectProduct = (product) => {
    setProductSelection({
      sourceId: initialProduct?.id ?? product.id,
      product
    });
  };

  const productId = Number.isFinite(Number(currentProduct?.id)) ? Number(currentProduct.id) : 1;
  const activeResult = (result?.productId === productId && result?.personUrl === selectedPersonUrl) ? result : null;
  const resultImageUrl = apiAssetUrl(activeResult?.resultImageUrl);
  const creditsRemaining = activeResult?.creditsRemaining ?? 10;

  const studioPhotos = useMemo(() => {
    const isMen = currentProduct?.gender === 'Men';
    return [
      { id: 'p1', url: isMen ? '/images/plus_size_shirt_1777572022906.png' : '/images/hero.png', label: 'Model 1' },
      { id: 'p2', url: isMen ? '/images/tailored.png' : '/images/evening.png', label: 'Model 2' },
      { id: 'p3', url: isMen ? '/images/plus_size_coords_1777572038614.png' : '/images/plus_size_kurta_1777572002528.png', label: 'Model 3' },
      ...(personPreview ? [{ id: 'user', url: personPreview, label: 'Your Photo' }] : [])
    ];
  }, [personPreview, currentProduct?.gender]);

  if (!isTryOnOpen || !currentProduct) return null;

  const handlePersonSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (personPreview.startsWith('blob:')) URL.revokeObjectURL(personPreview);
    const url = URL.createObjectURL(file);
    setPersonFile(file);
    setPersonPreview(url);
    setSelectedPersonUrl(url);
    setResult(null);
    setError('');
  };

  const handlePredefinedPersonSelect = (url) => {
    setSelectedPersonUrl(url);
    setPersonFile(null); // Reset file if selecting predefined
    setResult(null);
    setError('');
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setError('Login is required for Vertex try-on.');
      return;
    }
    if (!personFile && !selectedPersonUrl) {
      setError('Select a model or upload a body photo before generating.');
      return;
    }

    setError('');
    setIsGenerating(true);
    try {
      const response = await tryOnApi.create({
        productId,
        personImage: personFile || selectedPersonUrl, // Can be file or URL depending on backend support
        numberOfImages: 1
      });
      setResult({ ...response, productId, personUrl: selectedPersonUrl });
      setViewMode('me');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAuthRequest = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    try {
      const res = await requestOtp({ channel: authChannel, purpose: 'login', [authChannel]: authDest });
      setAuthDevOtp(res.devOtp || '');
      setAuthStep('verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthVerify = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    try {
      await verifyOtp({ channel: authChannel, purpose: 'login', [authChannel]: authDest, otp: authOtp });
      setIsLoginOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className={`vto-overlay ${isTryOnOpen ? 'open' : ''}`}>
      <div className="vto-modal">
        {/* TOP BAR */}
        <div className="vto-topbar">
          <div className="vto-topbar-left">
            {!isAuthenticated ? (
              <button className="vto-login-trigger-btn" onClick={() => setIsLoginOpen(true)}>
                <span className="credits-icon">✦</span>
                Login for Vertex Try-On
              </button>
            ) : (
              <div className="vto-credits-status">
                <span className="credits-icon">✦</span>
                <span>{creditsRemaining} Credits</span>
              </div>
            )}
          </div>
          
          <div className="vto-nav">
            <Link to="/" onClick={closeTryOn}>Home</Link>
            <Link to="/collections" onClick={closeTryOn}>Marketplace</Link>
            <Link to="/profile" onClick={closeTryOn}>Profile</Link>
          </div>

          <button className="vto-close-btn" onClick={closeTryOn} aria-label="Close try-on">
            <X size={22} />
          </button>
        </div>

        <div className="vto-layout">
          {/* LEFT PANEL: Uploads & Adjustments */}
          <div className="vto-left-panel">
            <h3 className="vto-panel-title">Person Selector</h3>
            <div className="vto-thumbnails">
              {studioPhotos.map((photo) => (
                <div 
                  className={`vto-thumb ${selectedPersonUrl === photo.url ? 'active' : ''}`} 
                  key={photo.id}
                  onClick={() => handlePredefinedPersonSelect(photo.url)}
                >
                  <img src={photo.url} alt={photo.label} />
                </div>
              ))}
              <label className="vto-thumb add-new">
                <Upload size={22} />
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePersonSelect} hidden />
              </label>
            </div>
            <div className="vto-upload-note mt-6">
              <strong>{personFile ? personFile.name : 'Ready for generation'}</strong>
              <span>{selectedPersonUrl.startsWith('blob:') ? 'Using your uploaded photo.' : 'Select a model or upload your own.'}</span>
            </div>
            {!isAuthenticated && (
              <div className="vto-auth-prompt mt-4" onClick={() => setIsLoginOpen(true)}>
                <span>✦</span>
                <p>Login to use Vertex Try-On</p>
              </div>
            )}
            {error && <p className="vto-error">{error}</p>}
          </div>

          {/* CENTER: The Experience */}
          <div className="vto-center-panel">
            {isGenerating ? (
              <div className="vto-generating">
                <div className="vto-spinner"></div>
                <p>Generating on your body...</p>
              </div>
            ) : (
              <div className="vto-center-content animate-fade-in">
                <div className="vto-main-visual">
                  <img 
                    src={viewMode === 'me' ? (resultImageUrl || selectedPersonUrl) : currentProduct.image} 
                    alt="Virtual Try On Result" 
                    className="vto-result-img"
                  />
                  <div className="vto-visual-badge">
                    <span>✦ {activeResult?.fitMatch || currentProduct.fitMatch || 98}% Fit Match</span>
                  </div>
                </div>

                <div className="vto-fit-console">
                  <span className="vto-control-label">View</span>
                  <div className="vto-toggle">
                    <button
                      className={`vto-toggle-btn ${viewMode === 'me' ? 'active' : ''}`}
                      onClick={() => setViewMode('me')}
                    >
                      Result
                    </button>
                    <button
                      className={`vto-toggle-btn ${viewMode === 'model' ? 'active' : ''}`}
                      onClick={() => setViewMode('model')}
                    >
                      Product
                    </button>
                  </div>
                  {activeResult?.model?.includes('gemini-') && (
                    <p className="vto-refine-note">Identity refined with Gemini image editing.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Product & Actions */}
          <div className="vto-right-panel">
            <h3 className="vto-panel-title">Clothes Selector</h3>
            
            <div className="vto-clothes-selector mb-6">
              <div className="vto-current-clothes-card">
                <img src={currentProduct.image} alt={currentProduct.name} />
                <div className="vto-current-info">
                  <span className="vto-brand">{currentProduct.brand}</span>
                  <h2 className="vto-product-name-sm">{currentProduct.name}</h2>
                  <div className="vto-price-sm">₹{currentProduct.price.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="vto-clothes-grid mt-4">
                {allProducts.slice(0, 4).map(prod => (
                  <div 
                    key={prod.id} 
                    className={`vto-clothing-thumb ${currentProduct.id === prod.id ? 'active' : ''}`}
                    onClick={() => {
                      selectProduct(prod);
                      setResult(null);
                    }}
                  >
                    <img src={prod.image} alt={prod.name} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="vto-size-box mt-6">
              <span className="vto-size-label">AI Recommended Size</span>
              <div className="vto-size-value">
                <span>{currentProduct.recommendedSize || '2XL'}</span>
              </div>
            </div>

            <div className="vto-actions mt-8">
              <button className="btn btn-luxury-primary w-full" onClick={handleGenerate} disabled={isGenerating}>
                <WandSparkles size={16} />
                {isGenerating ? 'Generating...' : 'Generate try-on'}
              </button>
              <Link
                className="btn btn-luxury-outline w-full mt-3"
                style={{ borderColor: 'var(--border)', color: 'var(--on-surface)' }}
                to={`/product/${currentProduct.id}`}
                onClick={closeTryOn}
              >
                View product
              </Link>
            </div>
            
            <p className="vto-disclaimer mt-6">
              *The Virtual Atelier uses AI to simulate fabric drape based on your measurements. Actual fit may vary slightly.
            </p>
          </div>
        </div>

        {/* LOGIN POPUP OVERLAY */}
        {isLoginOpen && (
          <div className="vto-login-overlay">
            <div className="vto-login-card">
              <button className="vto-login-close" onClick={() => setIsLoginOpen(false)}><X size={20} /></button>
              
              <div className="vto-login-header">
                <span className="label-caps">Authentication</span>
                <h2>Login to Virtual Atelier</h2>
                <p>Access high-fidelity Vertex try-ons and save your fits.</p>
              </div>

              <form onSubmit={authStep === 'request' ? handleAuthRequest : handleAuthVerify}>
                <div className="vto-login-channels mb-4">
                  <button 
                    type="button" 
                    className={authChannel === 'email' ? 'active' : ''} 
                    onClick={() => setAuthChannel('email')}
                  >
                    Email
                  </button>
                  <button 
                    type="button" 
                    className={authChannel === 'phone' ? 'active' : ''} 
                    onClick={() => setAuthChannel('phone')}
                  >
                    Mobile
                  </button>
                </div>

                <div className="vto-login-field mb-4">
                  <input 
                    type={authChannel === 'email' ? 'email' : 'tel'}
                    placeholder={authChannel === 'email' ? 'you@email.com' : '+91 98765 43210'}
                    value={authDest}
                    onChange={(e) => setAuthDest(e.target.value)}
                    required
                  />
                </div>

                {authStep === 'verify' && (
                  <div className="vto-login-field mb-4">
                    <input 
                      type="text"
                      placeholder="6-digit OTP"
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value)}
                      required
                    />
                  </div>
                )}

                {authDevOtp && (
                  <div className="vto-dev-otp">Local OTP: {authDevOtp}</div>
                )}

                {error && <p className="vto-error">{error}</p>}

                <button className="btn btn-luxury-primary w-full" disabled={authLoading}>
                  {authLoading ? 'Please wait...' : authStep === 'request' ? 'Send OTP' : 'Verify & Login'}
                </button>
              </form>

              <div className="vto-login-footer mt-6">
                <p>New to BELOV? <Link to="/auth?mode=register" onClick={closeTryOn}>Create account</Link></p>
                <div className="vto-login-nav mt-4">
                  <Link to="/" onClick={closeTryOn}>Back to Home</Link>
                  <Link to="/collections" onClick={closeTryOn}>Marketplace</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOnModal;
