import { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 800); // Wait for fade animation
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`splash-screen ${isExiting ? 'exit' : ''}`}>
      <div className="splash-content">
        <img src="/logo.png" alt="BELOV Brand Mark" className="splash-logo" />
        <div className="splash-loader-bar">
          <div className="splash-loader-progress" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
