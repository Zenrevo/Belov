import { useState, useEffect } from 'react';
import './HeroTagline.css';

const taglineFrames = [
  {
    line: ['Be', 'Exactly', 'Like', 'Only', 'You'],
    missingE: 'Exact fit',
    proof: 'Size and drape intelligence built around your real proportions.'
  },
  {
    line: ['Be', 'Expressive', 'Like', 'Only', 'You'],
    missingE: 'Expression',
    proof: 'Looks start with your style language, not a generic catalogue.'
  },
  {
    line: ['Be', 'Effortless', 'Like', 'Only', 'You'],
    missingE: 'Ease',
    proof: 'Try-ons, colors, and sizes are tuned before you browse.'
  },
  {
    line: ['Be', 'Empowered', 'Like', 'Only', 'You'],
    missingE: 'Empathy',
    proof: 'Fit confidence for women and men, across body types.'
  },
  {
    line: ['Be', 'Evolved', 'Like', 'Only', 'You'],
    missingE: 'Every body',
    proof: 'A marketplace that makes you the model.'
  }
];

const HeroTagline = () => {
  const [phase, setPhase] = useState('brand');
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const dropTimer = setTimeout(() => setPhase('drop-e'), 1800);
    const expandTimer = setTimeout(() => setPhase('expand'), 3000);

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(expandTimer);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'expand') return undefined;

    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglineFrames.length);
    }, 3600);

    return () => clearInterval(interval);
  }, [phase]);

  const frame = taglineFrames[taglineIndex];

  return (
    <div className="hero-tagline-container" aria-live="polite">
      {phase === 'brand' && (
        <h1 className="hero-belov-text">
          BELOV<span className="dropping-e">E</span>
        </h1>
      )}
      
      {phase === 'drop-e' && (
        <h1 className="hero-belov-text">
          BELOV<span className="dropped-e">E</span>
        </h1>
      )}

      {phase === 'expand' && (
        <div className="hero-expanded-wrap animate-fade-in">
          <div className="hero-missing-e">
            <span className="missing-e-letter">E</span>
            <span>{frame.missingE}</span>
          </div>
          <h1 className="hero-expanded-text">
            {frame.line.map((word, idx) => (
              <span
                key={`${taglineIndex}-${word}-${idx}`}
                className={`tagline-word ${idx === 1 ? 'tagline-e-word' : ''}`}
                style={{ animationDelay: `${idx * 0.12}s` }}
              >
                {word}
              </span>
            ))}
          </h1>
          <p key={`${taglineIndex}-proof`} className="hero-e-proof">{frame.proof}</p>
        </div>
      )}
    </div>
  );
};

export default HeroTagline;
