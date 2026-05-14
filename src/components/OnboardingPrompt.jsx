import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { profileApi } from '../lib/api';
import { WandSparkles, X } from 'lucide-react';
import './OnboardingPrompt.css';

const OnboardingPrompt = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    if (isAuthenticated && !dismissed && location.pathname !== '/onboarding') {
      profileApi.get().then(profile => {
        if (active) {
          // Check if key onboarding fields are missing
          if (!profile.gender || !profile.bodyType || !profile.height) {
            setNeedsOnboarding(true);
          } else {
            setNeedsOnboarding(false);
          }
        }
      }).catch(() => {
        // Assume needs onboarding if profile fetch fails
        if (active) setNeedsOnboarding(true);
      });
    } else {
      setNeedsOnboarding(false);
    }
    
    return () => { active = false; };
  }, [isAuthenticated, dismissed, location.pathname]);

  if (!needsOnboarding) return null;

  return (
    <div className="onboarding-prompt-overlay animate-slide-up">
      <div className="onboarding-prompt-card">
        <button className="prompt-close" onClick={() => setDismissed(true)} aria-label="Close">
          <X size={16} />
        </button>
        <div className="prompt-content">
          <div className="prompt-icon-wrap">
            <WandSparkles size={20} className="text-gold" />
          </div>
          <div className="prompt-text">
            <h4>Complete your Style Profile</h4>
            <p>Unlock personalized fit recommendations and accurate virtual try-ons.</p>
          </div>
          <button className="btn btn-luxury-primary prompt-btn" onClick={() => navigate('/onboarding')}>
            Complete Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPrompt;
