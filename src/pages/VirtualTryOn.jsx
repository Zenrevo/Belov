import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Footer from '../components/Footer';
import FitPromiseStrip from '../components/FitPromiseStrip';
import PageTagline from '../components/PageTagline';
import './VirtualTryOn.css';

const VirtualTryOn = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);

  const handleGenerate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setResultImage('/images/hero.png');
    }, 3000);
  };

  return (
    <div className="tryon-page">
      <section className="section-sm">
        <div className="container">
          <PageTagline page="tryon" />
          <FitPromiseStrip compact />
        </div>

        <div className="container">
            <div className="tryon-main-content">
              {/* Studio Selection */}
              <div className="tryon-studio-card">
                <h3 className="label-caps mb-4">Your AI Studio</h3>
                <div className="studio-thumbnails">
                  <div className="studio-thumb active"><img src="/images/hero.png" alt="Angle 1" /></div>
                  <div className="studio-thumb"><img src="/images/tailored.png" alt="Angle 2" /></div>
                  <div className="studio-thumb add"><span className="text-2xl">+</span></div>
                </div>
                <button className="btn btn-luxury-primary w-full mt-6" onClick={handleGenerate} disabled={isProcessing}>
                  {isProcessing ? 'Simulating Fit...' : 'Run Virtual Try-On'}
                </button>
              </div>

              {/* Visualization */}
              <div className="tryon-visualization">
                <div className="visualization-container">
                  {isProcessing ? (
                    <div className="loading-overlay">
                      <div className="vto-spinner" />
                      <p className="mt-4 animate-pulse">Analyzing body geometry...</p>
                    </div>
                  ) : resultImage ? (
                    <>
                      <img src={resultImage} alt="Try-On" className="visualization-img" />
                      <div className="visualization-badge">✦ 98% Fit Certainty</div>
                    </>
                  ) : (
                    <div className="visualization-placeholder">
                      <Sparkles size={48} className="text-muted opacity-20" />
                      <p className="mt-4">Select a photo to start the session</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="tryon-controls-card">
                <h3 className="label-caps mb-4">Drape Controls</h3>
                <div className="control-group">
                  <label className="body-sm mb-2 block">Fabric Tension</label>
                  <input type="range" className="w-full accent-accent" />
                  <div className="flex justify-between text-xs text-muted mt-1">
                    <span>Tight</span>
                    <span>Relaxed</span>
                  </div>
                </div>
                <div className="mt-8">
                  <button className="btn btn-luxury-outline w-full mb-3">Save to Lookbook</button>
                  <button className="btn btn-luxury-primary w-full">Checkout with this Fit</button>
                </div>
              </div>
            </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default VirtualTryOn;
