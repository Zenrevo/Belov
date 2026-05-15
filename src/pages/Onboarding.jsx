import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTagline from '../components/PageTagline';
import { useAuth } from '../context/useAuth';
import { useNotifications } from '../context/useNotifications';
import { apiAssetUrl, catalogApi, profileApi } from '../lib/api';
import './Onboarding.css';

const bodyTypes = {
  Women: [
    { id: 'hourglass', label: 'Hourglass' },
    { id: 'pear', label: 'Pear' },
    { id: 'apple', label: 'Apple' },
    { id: 'rectangle', label: 'Rectangle' },
    { id: 'inverted', label: 'Inverted Triangle' },
  ],
  Men: [
    { id: 'trapezoid', label: 'Trapezoid' },
    { id: 'inverted_m', label: 'Inverted Triangle' },
    { id: 'rectangle_m', label: 'Rectangle' },
    { id: 'triangle', label: 'Triangle' },
    { id: 'oval', label: 'Oval' },
  ]
};

const stylePrefs = {
  Women: [
    { name: 'Minimalist', img: '/images/tailored.png' },
    { name: 'Statement', img: '/images/hero.png' },
    { name: 'Classic', img: '/images/evening.png' },
    { name: 'Streetwear', img: '/images/plus_size_kurta_1777572002528.png' },
    { name: 'Festive', img: '/images/kurta_gold.png' },
    { name: 'Workwear', img: '/images/plus_size_coords_1777572038614.png' }
  ],
  Men: [
    { name: 'Minimalist', img: '/images/tailored.png' },
    { name: 'Statement', img: '/images/men_statement.png' },
    { name: 'Classic', img: '/images/plus_size_coords_1777572038614.png' },
    { name: 'Streetwear', img: '/images/men_streetwear.png' },
    { name: 'Workwear', img: '/images/plus_size_shirt_1777572022906.png' },
    { name: 'Travel', img: '/images/men_bohemian.png' }
  ]
};

const skinTones = [
  { id: 'Fair cool', hex: '#F5D7C8' },
  { id: 'Fair warm', hex: '#F0C4A5' },
  { id: 'Light medium', hex: '#DFA078' },
  { id: 'Warm medium', hex: '#B8754E' },
  { id: 'Olive medium', hex: '#9F6C48' },
  { id: 'Deep warm', hex: '#6B3F2B' },
  { id: 'Deep cool', hex: '#3F241C' }
];

const sizeOptions = ['L', 'XL', '2XL', '3XL', '4XL', '5XL'];
const totalSteps = 6;

const estimateSize = ({ height, weight }) => {
  const meters = Number(height) / 100;
  const bmi = meters > 0 ? Number(weight) / (meters * meters) : 30;
  if (bmi < 27) return 'L';
  if (bmi < 31) return 'XL';
  if (bmi < 35) return '2XL';
  if (bmi < 39) return '3XL';
  if (bmi < 43) return '4XL';
  return '5XL';
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { notify } = useNotifications();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('');
  const [age, setAge] = useState(28);
  const [measurements, setMeasurements] = useState({ height: 165, weight: 70 });
  const [globalSizeId, setGlobalSizeId] = useState('XL');
  const [bodyType, setBodyType] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [styles, setStyles] = useState([]);
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [photosUploaded, setPhotosUploaded] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMagicReveal, setShowMagicReveal] = useState(false);

  useEffect(() => {
    catalogApi.categories()
      .then((response) => setCategories(response.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    profileApi.get()
      .then((profile) => {
        const fit = profile?.fitProfile || {};
        if (fit.gender) setGender(fit.gender);
        if (fit.age) setAge(fit.age);
        if (fit.height || fit.weight) {
          const savedMeasurements = {
            height: fit.height || 165,
            weight: fit.weight || 70
          };
          setMeasurements(savedMeasurements);
          if (!fit.globalSizeId) setGlobalSizeId(estimateSize(savedMeasurements));
        }
        if (fit.globalSizeId) {
          setGlobalSizeId(fit.globalSizeId);
        }
        if (fit.bodyType) setBodyType(fit.bodyType);
        if (fit.skinTone) setSkinTone(fit.skinTone);
        if (fit.stylePreferences?.length) setStyles(fit.stylePreferences);
        if (fit.favoriteCategories?.length) setFavoriteCategories(fit.favoriteCategories);
        if (fit.photoUrl) {
          setPhotoUrl(fit.photoUrl);
          setPhotoPreview(apiAssetUrl(fit.photoUrl));
          setPhotosUploaded(true);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => () => {
    if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  useEffect(() => {
    if (!isGenerating) return;
    const timer = setTimeout(() => {
      setIsGenerating(false);
      setShowMagicReveal(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [isGenerating]);

  const visibleCategories = useMemo(() => {
    const scoped = categories.filter((category) => !gender || category.gender === gender || category.category === gender);
    return scoped.length ? scoped : categories;
  }, [categories, gender]);

  const toggleStyle = (style) => {
    setStyles((prev) => prev.includes(style) ? prev.filter((item) => item !== style) : [...prev, style]);
  };

  const toggleCategory = (categoryId) => {
    setFavoriteCategories((prev) => {
      if (prev.includes(categoryId)) return prev.filter((item) => item !== categoryId);
      return [...prev, categoryId].slice(0, 4);
    });
  };

  const updateMeasurements = (patch) => {
    const next = { ...measurements, ...patch };
    setMeasurements(next);
    setGlobalSizeId(estimateSize(next));
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    setAnalysisMessage('Analyzing skin tone from your profile image...');
    try {
      const upload = await profileApi.uploadPhoto(file);
      setPhotoUrl(upload.photoUrl);
      setPhotosUploaded(true);
      notify({
        title: 'Profile image saved',
        message: 'Skin-tone analysis is running.'
      });
      try {
        const analysis = await profileApi.analyzeSkinTone(file);
        if (analysis.skinTone) {
          setSkinTone(analysis.skinTone);
          setAnalysisMessage(
            analysis.needsConfirmation
              ? `Detected ${analysis.skinTone}. Confirm or adjust it below.`
              : `Detected ${analysis.skinTone}. You can still adjust it.`
          );
          notify({
            variant: 'info',
            title: 'Skin tone detected',
            message: analysis.needsConfirmation
              ? `${analysis.skinTone}. Confirm or adjust it below.`
              : `${analysis.skinTone}. You can still adjust it.`
          });
        } else {
          setAnalysisMessage(analysis.message || 'Confirm your skin tone manually below.');
          notify({
            variant: 'info',
            title: 'Skin tone needs confirmation',
            message: analysis.message || 'Pick the closest tone below.'
          });
        }
      } catch (err) {
        setAnalysisMessage(err.message || 'Skin-tone analysis is unavailable. Confirm manually below.');
        notify({
          variant: 'info',
          title: 'Skin tone needs confirmation',
          message: err.message || 'Analysis is unavailable. Pick the closest tone below.'
        });
      }
    } catch (err) {
      setAnalysisMessage(err.message || 'Photo upload failed. Try another image.');
      notify({
        variant: 'error',
        title: 'Photo upload failed',
        message: err.message || 'Try another image.'
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFinishQuiz = async () => {
    if (!isAuthenticated) {
      notify({
        variant: 'info',
        title: 'Login required',
        message: 'Create an account to save your fit profile.'
      });
      navigate('/auth?mode=register');
      return;
    }

    try {
      const saved = await profileApi.update({
        gender,
        age: Number(age),
        height: Number(measurements.height),
        weight: Number(measurements.weight),
        bodyType,
        skinTone,
        stylePreferences: styles,
        favoriteCategories,
        globalSizeId,
        photosUploaded,
        photoUrl
      });
      setGlobalSizeId(saved?.fitProfile?.globalSizeId || globalSizeId);
      setStep(7);
      setIsGenerating(true);
      notify({
        title: 'Profile completed',
        message: 'Recommendations are now tuned to your fit.'
      });
    } catch (err) {
      notify({
        variant: 'error',
        title: 'Could not save profile',
        message: err.message
      });
    }
  };

  const canContinuePhoto = Boolean(skinTone) && !uploadingPhoto;

  return (
    <div className="onboarding-luxury">
      {step < 7 && (
        <>
          <div className="onboarding-topbar">
            <button className="btn-back" onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}>
              Back
            </button>
            <div className="quiz-progress-wrap" aria-label={`Step ${step} of ${totalSteps}`}>
              <span className="quiz-progress">{step} / {totalSteps}</span>
              <div className="quiz-progress-track">
                <span style={{ width: `${(step / totalSteps) * 100}%` }} />
              </div>
            </div>
            <button className="btn-skip" onClick={() => navigate('/')}>Skip</button>
          </div>

          <div className="quiz-container animate-fade-in">
            <h1 className="quiz-title">Let's find your perfect fit</h1>
            <PageTagline page="onboarding" compact />

            {step === 1 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">Which section do you primarily shop in?</p>
                <div className="quiz-grid-2 mt-8">
                  {['Women', 'Men'].map((item) => (
                    <button
                      key={item}
                      className={`quiz-card ${gender === item ? 'active' : ''}`}
                      onClick={() => { setGender(item); setTimeout(() => setStep(2), 250); }}
                    >
                      <span className={`gender-visual gender-visual-${item.toLowerCase()}`} aria-hidden="true" />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">Add the basics, then confirm the size we should start from.</p>
                <div className="quiz-sliders mt-8">
                  <div className="quiz-number-field">
                    <label htmlFor="age">Age</label>
                    <input id="age" type="number" min="13" max="100" value={age} onChange={(event) => setAge(event.target.value)} />
                  </div>
                  <div className="quiz-slider-group mt-6">
                    <label>Height: <span>{measurements.height} cm</span></label>
                    <input type="range" min="140" max="210" value={measurements.height} onChange={(event) => updateMeasurements({ height: event.target.value })} />
                  </div>
                  <div className="quiz-slider-group mt-8">
                    <label>Weight: <span>{measurements.weight} kg</span></label>
                    <input type="range" min="40" max="180" value={measurements.weight} onChange={(event) => updateMeasurements({ weight: event.target.value })} />
                  </div>
                  <div className="size-confirm-card mt-8">
                    <span>Predicted size</span>
                    <select value={globalSizeId} onChange={(event) => setGlobalSizeId(event.target.value)}>
                      {sizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn btn-luxury-primary w-full mt-10" onClick={() => setStep(3)}>Continue</button>
              </div>
            )}

            {step === 3 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">Which shape best describes your silhouette?</p>
                <div className="quiz-grid-3 mt-8">
                  {(bodyTypes[gender] || bodyTypes.Women).map((bt) => (
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

            {step === 4 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">Choose your favorite clothing categories from the live catalog.</p>
                <div className="category-choice-grid mt-8">
                  {visibleCategories.map((category) => (
                    <button
                      key={category.id}
                      className={`category-choice ${favoriteCategories.includes(category.id) ? 'active' : ''}`}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <span>{category.category}</span>
                      <strong>{category.subcategory}</strong>
                      <em>{category.productCount} pieces</em>
                    </button>
                  ))}
                </div>
                <button className="btn btn-luxury-primary w-full mt-8" disabled={favoriteCategories.length === 0} onClick={() => setStep(5)}>Continue</button>
              </div>
            )}

            {step === 5 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">Upload your profile image, then confirm your skin tone.</p>
                <div className="upload-box mt-8">
                  {photoPreview ? (
                    <img className="profile-photo-preview" src={photoPreview} alt="Profile preview" />
                  ) : (
                    <div className="upload-icon" aria-hidden="true" />
                  )}
                  <p className="upload-text">{photosUploaded ? 'Profile image uploaded' : 'Add your profile image'}</p>
                  <p className="upload-hint">Use a clear front-facing photo with natural light for better analysis.</p>
                  <input
                    type="file"
                    id="profile-photos"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    style={{ display: 'none' }}
                    onChange={handlePhotoSelect}
                  />
                  <label htmlFor="profile-photos" className={`btn ${photosUploaded ? 'btn-luxury-primary' : 'btn-luxury-outline'} mt-4`} style={{ display: 'inline-block', cursor: 'pointer', opacity: uploadingPhoto ? 0.5 : 1 }}>
                    {uploadingPhoto ? 'Uploading...' : photosUploaded ? 'Change Photo' : 'Select Photo'}
                  </label>
                  {analysisMessage && <p className="analysis-message">{analysisMessage}</p>}
                </div>
                <div className="palette-grid mt-8">
                  {skinTones.map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      className={`palette-swatch ${skinTone === tone.id ? 'active' : ''}`}
                      style={{ background: tone.hex }}
                      title={tone.id}
                      aria-label={tone.id}
                      onClick={() => setSkinTone(tone.id)}
                    />
                  ))}
                </div>
                <p className="selected-skin-tone">{skinTone || 'Select your closest tone'}</p>
                <button className="btn btn-luxury-primary w-full mt-8" disabled={!canContinuePhoto} onClick={() => setStep(6)}>Continue</button>
              </div>
            )}

            {step === 6 && (
              <div className="quiz-step">
                <p className="quiz-subtitle">What style persona should recommendations lean toward?</p>
                <div className="style-cards-grid mt-8">
                  {(stylePrefs[gender] || stylePrefs.Women).map((style) => (
                    <button
                      key={style.name}
                      className={`style-card ${styles.includes(style.name) ? 'active' : ''}`}
                      onClick={() => toggleStyle(style.name)}
                    >
                      <img src={style.img} alt={style.name} />
                      <div className="style-card-overlay"><span>{style.name}</span></div>
                    </button>
                  ))}
                </div>
                <button className="btn btn-luxury-primary w-full mt-8" disabled={styles.length === 0} onClick={handleFinishQuiz}>Complete Profile</button>
              </div>
            )}
          </div>
        </>
      )}

      {step === 7 && isGenerating && (
        <div className="quiz-generating">
          <div className="shimmer-ring"></div>
          <h2 className="luxury-h2 mt-6">Generating your style profile...</h2>
          <p className="luxury-subtitle">Calibrating fit, tone, category, and persona signals.</p>
        </div>
      )}

      {step === 7 && showMagicReveal && (
        <div className="quiz-reveal animate-fade-in">
          <div className="reveal-container">
            <div className="reveal-left">
              <span className="luxury-eyebrow text-gold">Your Virtual Atelier is Ready</span>
              <h1 className="luxury-h2">Meet Your AI Stylist</h1>
              <div className="reveal-stats mt-6">
                <div className="reveal-stat">
                  <span className="stat-label">Confirmed Size</span>
                  <span className="stat-value">{globalSizeId}</span>
                </div>
                <div className="reveal-stat">
                  <span className="stat-label">Skin Tone</span>
                  <span className="stat-value">{skinTone || 'Set'}</span>
                </div>
              </div>
              <p className="luxury-body mt-6">
                Your first recommendations are grouped by the categories you selected and ranked for fit, color, and persona.
              </p>
              <button className="btn btn-luxury-primary mt-8" onClick={() => navigate('/profile')}>Go to My Profile</button>
            </div>
            <div className="reveal-right">
              <div className="reveal-avatar-card group">
                <img src={photoPreview || (gender === 'Men' ? '/images/plus_size_shirt_1777572022906.png' : '/images/hero.png')} alt="Your profile" className="reveal-avatar-img" />
                <div className="reveal-badge">{favoriteCategories.length || 1} category picks</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
