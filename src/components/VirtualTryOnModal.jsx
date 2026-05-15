import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, WandSparkles, X } from 'lucide-react';
import { apiAssetUrl, tryOnApi, profileApi } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { useNotifications } from '../context/useNotifications';
import { useTryOn } from '../context/useTryOn';
import './VirtualTryOnModal.css';

const VirtualTryOnModal = () => {
  const { isTryOnOpen, tryOnProduct: initialProduct, closeTryOn } = useTryOn();
  const { isAuthenticated } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const [personFile, setPersonFile] = useState(null);
  const [personPreview, setPersonPreview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  
  // Auth state for popup
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authStep, setAuthStep] = useState('request'); // 'request' or 'verify'
  const [authChannel, setAuthChannel] = useState('email');
  const [authDest, setAuthDest] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authDevOtp, setAuthDevOtp] = useState('');

  const { requestOtp, verifyOtp } = useAuth();
  
  const currentProduct = initialProduct;
  const [selectedPersonUrl, setSelectedPersonUrl] = useState('');

  useEffect(() => () => {
    if (personPreview.startsWith('blob:')) URL.revokeObjectURL(personPreview);
  }, [personPreview]);

  useEffect(() => {
    if (isAuthenticated && isTryOnOpen) {
      profileApi.get()
        .then(res => {
          const used = Number(res?.tryOn?.used || 0);
          const limit = Number(res?.tryOn?.limit || 0);
          setCreditsRemaining(Math.max(limit - used, 0));
          if (res?.fitProfile?.photoUrl) {
            const url = apiAssetUrl(res.fitProfile.photoUrl);
            setSelectedPersonUrl(url);
            setPersonPreview(url);
          } else {
            setSelectedPersonUrl('');
            setPersonPreview('');
          }
        })
        .catch(() => {
          setCreditsRemaining(0);
          setSelectedPersonUrl('');
          setPersonPreview('');
        });
    }
  }, [isAuthenticated, isTryOnOpen]);

  const productId = Number.isFinite(Number(currentProduct?.id)) ? Number(currentProduct.id) : 1;

  const studioPhotos = useMemo(() => {
    return personPreview ? [{ id: 'user', url: personPreview, label: 'Your Photo' }] : [];
  }, [personPreview]);

  if (!isTryOnOpen || !currentProduct) return null;

  const handlePersonSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (personPreview.startsWith('blob:')) URL.revokeObjectURL(personPreview);
    const url = URL.createObjectURL(file);
    setPersonFile(file);
    setPersonPreview(url);
    setSelectedPersonUrl(url);
    setError('');
  };

  const handlePredefinedPersonSelect = (url) => {
    setSelectedPersonUrl(url);
    setPersonFile(null); // Reset file if selecting predefined
    setError('');
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setError('Login is required for Vertex try-on.');
      return;
    }
    if (!personFile && !selectedPersonUrl) {
      setError('Upload your profile photo before generating.');
      return;
    }

    setError('');
    setIsGenerating(true);
    try {
      await tryOnApi.create({
        productId,
        personImage: personFile || selectedPersonUrl, // Can be file or URL depending on backend support
        numberOfImages: 1
      });
      notify({
        variant: 'progress',
        title: 'Virtual try-on ready',
        message: 'Result added to the product gallery.'
      });
      closeTryOn();
      navigate(`/product/${productId}`);
    } catch (err) {
      setError(err.message);
      notify({
        variant: 'error',
        title: 'Try-on failed',
        message: err.message
      });
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
      notify({
        variant: 'error',
        title: 'Could not send OTP',
        message: err.message
      });
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
      notify({
        variant: 'error',
        title: 'Login failed',
        message: err.message
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className={`vto-overlay ${isTryOnOpen ? 'open' : ''}`}>
      <div className="vto-modal compact-vto-modal">
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

          <button className="vto-close-btn" onClick={closeTryOn} aria-label="Close try-on">
            <X size={22} />
          </button>
        </div>

        <div className="vto-layout single-panel-layout">
          {/* SINGLE PANEL: Uploads & Adjustments */}
          <div className="vto-single-panel">
            <h2 className="vto-panel-title">Try it on your body</h2>
            <p className="vto-subtitle" style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>Use your saved profile photo or upload a body photo. The result will appear directly in your product gallery.</p>

            <div className="vto-product-preview-card">
              <img src={currentProduct.image} alt={currentProduct.name} />
              <div>
                <span>{currentProduct.brand}</span>
                <strong>{currentProduct.name}</strong>
                <p>
                  {currentProduct.recommendedSize ? `Size ${currentProduct.recommendedSize}` : 'Selected piece'}
                  {currentProduct.fitMatch ? ` · ${currentProduct.fitMatch}% fit` : ''}
                </p>
              </div>
            </div>
            
            <div className="vto-thumbnails mt-6">
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
              <strong>{personFile ? personFile.name : selectedPersonUrl ? 'Ready for generation' : 'Profile photo required'}</strong>
              <span>{selectedPersonUrl ? 'Using your photo as the model.' : 'Upload a clear full-body photo to continue.'}</span>
            </div>
            
            {!isAuthenticated && (
              <div className="vto-auth-prompt mt-4" onClick={() => setIsLoginOpen(true)}>
                <span>✦</span>
                <p>Login to use Vertex Try-On</p>
              </div>
            )}
            
            {error && <p className="vto-error">{error}</p>}
            
            <div className="vto-actions mt-8">
              <button className="btn btn-luxury-primary w-full" onClick={handleGenerate} disabled={isGenerating}>
                <WandSparkles size={16} />
                {isGenerating ? 'Generating...' : 'Generate try-on'}
              </button>
            </div>
            
            <p className="vto-disclaimer mt-6">
              *The Virtual Atelier uses AI to simulate fabric drape on your uploaded photo. Actual fit may vary slightly.
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOnModal;
