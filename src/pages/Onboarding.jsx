import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTagline from '../components/PageTagline';
import { useAuth } from '../context/useAuth';
import { profileApi } from '../lib/api';
import './Onboarding.css';

const bodyTypes = [
  { id: 'hourglass', label: 'Hourglass', icon: '/images/body-hourglass.png' }, // Placeholders, we'll use CSS shapes if images missing
  { id: 'pear', label: 'Pear', icon: '/images/body-pear.png' },
  { id: 'apple', label: 'Apple', icon: '/images/body-apple.png' },
  { id: 'rectangle', label: 'Rectangle', icon: '/images/body-rectangle.png' },
  { id: 'inverted', label: 'Inverted Triangle', icon: '/images/body-inverted.png' },
];

const stylePrefs = [
  { name: 'Minimalist', img: '/images/tailored.png' },
  { name: 'Statement', img: '/images/hero.png' },
  { name: 'Classic', img: '/images/evening.png' },
  { name: 'Streetwear', img: '/images/plus_size_kurta_1777572002528.png' },
  { name: 'Bohemian', img: '/images/plus_size_coords_1777572038614.png' }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('');
  const [measurements, setMeasurements] = useState({ height: 165, weight: 70 });
  const [bodyType, setBodyType] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [styles, setStyles] = useState([]);
  const [photosUploaded, setPhotosUploaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMagicReveal, setShowMagicReveal] = useState(false);

  const toggleStyle = (s) => {
    setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleFinishQuiz = async () => {
    if (!isAuthenticated) {
      navigate('/auth?mode=register');
      return;
    }
    await profileApi.update({
      gender,
      height: Number(measurements.height),
      weight: Number(measurements.weight),
      bodyType,
      skinTone,
      stylePreferences: styles,
      photosUploaded
    }).catch(() => {});
    setStep(7); // Loading state
    setIsGenerating(true);
  };

  // Simulate AI Magic Generation
  useEffect(() => {
    if (isGenerating) {
      setTimeout(() => {
        setIsGenerating(false);
        setShowMagicReveal(true);
      }, 3000);
    }
  }, [isGenerating]);

  const skinTones = ['#FAD6D6', '#F5C6B1', '#E3A884', '#C38258', '#8B5433', '#5E3A24', '#3E2112'];

  return (
    <div className="onboarding-luxury">
      
      {/* ── STANDARD QUIZ STEPS ── */}
      {step < 7 && (
        <>
          <div className="onboarding-topbar">
            <button className="btn-back" onClick={() => step > 1 ? setStep(step-1) : navigate('/')}>
              ← Back
            </button>
            <div className="quiz-progress-wrap" aria-label={`Step ${step} of 6`}>
              <span className="quiz-progress">{step} / 6</span>
              <div className="quiz-progress-track">
                <span style={{ width: `${(step / 6) * 100}%` }} />
              </div>
            </div>
            <button className="btn-skip" onClick={() => navigate('/')}>Skip</button>
          </div>

          <div className="quiz-container animate-fade-in">
            <h1 className="quiz-title">Let's find your perfect fit</h1>
            <PageTagline page="onboarding" compact />
            
            {/* Step 1: Gender */}
            {step === 1 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">Which section do you primarily shop in?</p>
                <div className="quiz-grid-2 mt-8">
                  <button className={`quiz-card ${gender === 'Women' ? 'active' : ''}`} onClick={() => { setGender('Women'); setTimeout(() => setStep(2), 300); }}>
                    <span className="gender-visual gender-visual-women" aria-hidden="true" />
                    Women
                  </button>
                  <button className={`quiz-card ${gender === 'Men' ? 'active' : ''}`} onClick={() => { setGender('Men'); setTimeout(() => setStep(2), 300); }}>
                    <span className="gender-visual gender-visual-men" aria-hidden="true" />
                    Men
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Height & Weight */}
            {step === 2 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">What are your basic measurements?</p>
                <div className="quiz-sliders mt-8">
                  <div className="quiz-slider-group">
                    <label>Height: <span>{measurements.height} cm</span></label>
                    <input type="range" min="140" max="210" value={measurements.height} onChange={e => setMeasurements({...measurements, height: e.target.value})} />
                  </div>
                  <div className="quiz-slider-group mt-8">
                    <label>Weight: <span>{measurements.weight} kg</span></label>
                    <input type="range" min="40" max="150" value={measurements.weight} onChange={e => setMeasurements({...measurements, weight: e.target.value})} />
                  </div>
                </div>
                <button className="btn btn-luxury-primary w-full mt-12" onClick={() => setStep(3)}>Continue</button>
              </div>
            )}

            {/* Step 3: Body Type */}
            {step === 3 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">Which shape best describes your silhouette?</p>
                <div className="quiz-grid-3 mt-8">
                  {bodyTypes.map(bt => (
                    <button 
                      key={bt.id} 
                      className={`quiz-card-sm ${bodyType === bt.id ? 'active' : ''}`}
                      onClick={() => setBodyType(bt.id)}
                    >
                      <div className="shape-placeholder"></div>
                      <span>{bt.label}</span>
                    </button>
                  ))}
                </div>
                <button className="btn btn-luxury-primary w-full mt-8" disabled={!bodyType} onClick={() => setStep(4)}>Continue</button>
              </div>
            )}

            {/* Step 4: Skin Tone */}
            {step === 4 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">Select your skin tone for color recommendations</p>
                <div className="palette-grid mt-8">
                  {skinTones.map(tone => (
                    <button 
                      key={tone} 
                      className={`palette-swatch ${skinTone === tone ? 'active' : ''}`}
                      style={{ background: tone }}
                      onClick={() => setSkinTone(tone)}
                    />
                  ))}
                </div>
                <button className="btn btn-luxury-primary w-full mt-10" disabled={!skinTone} onClick={() => setStep(5)}>Continue</button>
              </div>
            )}

            {/* Step 5: Style Preference */}
            {step === 5 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">What's your typical vibe? (Select up to 2)</p>
                <div className="style-cards-grid mt-8">
                  {stylePrefs.map(s => (
                    <button 
                      key={s.name}
                      className={`style-card ${styles.includes(s.name) ? 'active' : ''}`}
                      onClick={() => toggleStyle(s.name)}
                    >
                      <img src={s.img} alt={s.name} />
                      <div className="style-card-overlay"><span>{s.name}</span></div>
                    </button>
                  ))}
                </div>
                <button className="btn btn-luxury-primary w-full mt-8" disabled={styles.length === 0} onClick={() => setStep(6)}>Continue</button>
              </div>
            )}

            {/* Step 6: Upload Photo */}
            {step === 6 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">Upload photos for Virtual Try-On (Optional)</p>
                <div className="upload-box mt-8">
                  <div className="upload-icon" aria-hidden="true" />
                  <p className="upload-text">Drag & drop or click to upload</p>
                  <p className="upload-hint">Upload 3-4 photos. For best results, wear fitted clothing against a plain background.</p>
                  <button className="btn btn-luxury-outline mt-4" onClick={() => setPhotosUploaded(true)}>
                    {photosUploaded ? 'Uploaded (3)' : 'Select Photos'}
                  </button>
                </div>
                <button className="btn btn-luxury-primary w-full mt-8" onClick={handleFinishQuiz}>Complete Profile</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── GENERATING STATE ── */}
      {step === 7 && isGenerating && (
        <div className="quiz-generating">
          <div className="shimmer-ring"></div>
          <h2 className="luxury-h2 mt-6">Generating your style profile...</h2>
          <p className="luxury-subtitle">Analyzing measurements, calibrating fit intelligence...</p>
        </div>
      )}

      {/* ── MAGICAL REVEAL ── */}
      {step === 7 && showMagicReveal && (
        <div className="quiz-reveal animate-fade-in">
          <div className="reveal-container">
            <div className="reveal-left">
              <span className="luxury-eyebrow text-gold">Your Virtual Atelier is Ready</span>
              <h1 className="luxury-h2">Meet Your AI Stylist</h1>
              <div className="reveal-stats mt-6">
                <div className="reveal-stat">
                  <span className="stat-label">Predicted Size</span>
                  <span className="stat-value">XL</span>
                </div>
                <div className="reveal-stat">
                  <span className="stat-label">Body Shape</span>
                  <span className="stat-value">{bodyType || 'Athletic'}</span>
                </div>
              </div>
              <p className="luxury-body mt-6">
                We've curated your first look based on your unique dimensions and {styles[0] || 'Classic'} style preference.
              </p>
              <button className="btn btn-luxury-primary mt-8" onClick={() => navigate('/profile')}>Go to My Profile</button>
            </div>
            <div className="reveal-right">
              <div className="reveal-avatar-card group">
                <img src="/images/hero.png" alt="Your AI Avatar" className="reveal-avatar-img" />
                <div className="reveal-badge">✦ 98% Match</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Onboarding;
