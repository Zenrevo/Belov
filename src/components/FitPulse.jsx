import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, User, X, RefreshCw } from 'lucide-react';
import './FitPulse.css';

const FitPulse = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsCalibrating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fit-pulse-container ${isOpen ? 'open' : ''}`}>
      <button className="fit-pulse-toggle" onClick={() => setIsOpen(!isOpen)}>
        <div className={`pulse-dot ${isCalibrating ? 'calibrating' : ''}`}></div>
        {isCalibrating ? <RefreshCw size={18} className="animate-spin" /> : <Activity size={18} />}
        <span className="pulse-score">{isCalibrating ? '...' : '92%'}</span>
      </button>

      <div className="fit-pulse-panel">
        <div className="pulse-header">
          <div className="flex items-center gap-3">
            <div className="pulse-avatar">
              <User size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold">Stylist Intelligence</h4>
              <p className="text-[10px] text-muted-foreground">Live Profile Calibration</p>
            </div>
          </div>
          <button className="pulse-close" onClick={() => setIsOpen(false)}>
            <X size={14} />
          </button>
        </div>

        <div className="pulse-content">
          <div className="pulse-stat">
            <div className="pulse-stat-info">
              <span>Overall Fit Match</span>
              <strong>92%</strong>
            </div>
            <div className="pulse-bar"><div className="pulse-bar-fill" style={{ width: '92%' }}></div></div>
          </div>

          <div className="pulse-insight mt-4">
            <ShieldCheck size={16} className="text-teal" />
            <p>Your "Lavender Haze" vibe matches current trending items in your size.</p>
          </div>

          <div className="pulse-actions mt-6">
            <button className="btn btn-luxury-primary w-full text-xs py-2">Optimize Fit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitPulse;
