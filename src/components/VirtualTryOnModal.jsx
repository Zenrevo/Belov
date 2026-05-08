import { useEffect, useState } from 'react';
import { useTryOn } from '../context/useTryOn';
import './VirtualTryOnModal.css';

const VirtualTryOnModal = () => {
  const { isTryOnOpen, tryOnProduct, closeTryOn } = useTryOn();
  const [viewMode, setViewMode] = useState('me'); // 'me' or 'model'
  const [fitAdjustment, setFitAdjustment] = useState(50); // 0 (Tight) to 100 (Loose)
  const [generatedProductId, setGeneratedProductId] = useState(null);
  const tryOnProductId = tryOnProduct?.id;

  useEffect(() => {
    if (!isTryOnOpen || !tryOnProductId) return undefined;

    const timer = setTimeout(() => setGeneratedProductId(tryOnProductId), 1400);
    return () => clearTimeout(timer);
  }, [isTryOnOpen, tryOnProductId]);

  if (!isTryOnOpen || !tryOnProduct) return null;

  const isGenerating = generatedProductId !== tryOnProductId;

  const studioPhotos = [
    '/images/hero.png',
    '/images/tailored.png',
    '/images/plus_size_shirt_1777572022906.png'
  ];

  return (
    <div className={`vto-overlay ${isTryOnOpen ? 'open' : ''}`}>
      <div className="vto-modal">
        {/* TOP BAR */}
        <div className="vto-topbar">
          <div className="vto-credits">
            <span className="credits-icon">✦</span>
            <span>8 Try-On Credits Remaining</span>
            <span className="credits-upgrade">Upgrade</span>
          </div>
          <button className="vto-close-btn" onClick={closeTryOn}>✕</button>
        </div>

        <div className="vto-layout">
          {/* LEFT PANEL: Uploads & Adjustments */}
          <div className="vto-left-panel">
            <h3 className="vto-panel-title">Your Studio</h3>
            <div className="vto-thumbnails">
              {studioPhotos.map((photo, index) => (
                <div className={`vto-thumb ${index === 0 ? 'active' : ''}`} key={photo}>
                  <img src={photo} alt={`Uploaded angle ${index + 1}`} />
                </div>
              ))}
              <div className="vto-thumb add-new">
                <span>+</span>
              </div>
            </div>
            <div className="vto-upload-note mt-6">
              <strong>Body calibration</strong>
              <span>3 angles uploaded. Add one more for better sleeve and shoulder prediction.</span>
            </div>
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
                    src={viewMode === 'me' ? '/images/hero.png' : tryOnProduct.image} 
                    alt="Virtual Try On Result" 
                    className="vto-result-img"
                  />
                  <div className="vto-visual-badge">
                    <span>✦ 98% Fit Match</span>
                  </div>
                </div>

                <div className="vto-fit-console">
                  <label className="vto-control-label">Adjust fit</label>
                  <div className="vto-slider-wrap">
                    <span className="vto-slider-label">Tight</span>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={fitAdjustment} 
                      onChange={(e) => setFitAdjustment(e.target.value)} 
                      className="vto-slider"
                    />
                    <span className="vto-slider-label">Loose</span>
                  </div>
                  <div className="vto-toggle mt-4">
                    <button 
                      className={`vto-toggle-btn ${viewMode === 'me' ? 'active' : ''}`}
                      onClick={() => setViewMode('me')}
                    >
                      See on Me
                    </button>
                    <button 
                      className={`vto-toggle-btn ${viewMode === 'model' ? 'active' : ''}`}
                      onClick={() => setViewMode('model')}
                    >
                      See on Model
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Product & Actions */}
          <div className="vto-right-panel">
            <span className="vto-brand">{tryOnProduct.brand}</span>
            <h2 className="vto-product-name">{tryOnProduct.name}</h2>
            <div className="vto-price">₹{tryOnProduct.price.toLocaleString()}</div>
            
            <div className="vto-size-box mt-6">
              <span className="vto-size-label">AI Recommended Size</span>
              <div className="vto-size-value">
                <span>{tryOnProduct.recommendedSize || '2XL'}</span>
                <button className="vto-link-btn">Try different size</button>
              </div>
            </div>

            <div className="vto-actions mt-8">
              <button className="btn btn-luxury-outline w-full" style={{ borderColor: 'var(--border)', color: 'var(--on-surface)' }}>Change color</button>
              <button className="btn btn-luxury-outline w-full mt-3" style={{ borderColor: 'var(--border)', color: 'var(--on-surface)' }}>Save look</button>
              <button className="btn btn-luxury-primary w-full mt-3">Buy now</button>
            </div>
            
            <p className="vto-disclaimer mt-6">
              *The Virtual Atelier uses AI to simulate fabric drape based on your measurements. Actual fit may vary slightly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnModal;
