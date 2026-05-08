import { useEffect, useState } from 'react';
import './HeroBrandAnimation.css';

const taglines = [
  {
    title: 'Be Exactly You.',
    desc: 'Fashion that makes every body feel seen, styled, and valued.',
  },
  {
    title: 'Every Body, Elevated.',
    desc: 'Discover fits curated around your body, mood, and personal style.',
  },
  {
    title: 'Elevate Every Look.',
    desc: 'AI-powered recommendations designed for real bodies and real confidence.',
  },
  {
    title: 'Express Every Side of You.',
    desc: 'A marketplace built for inclusive fashion, better fit, and effortless discovery.',
  },
  {
    title: 'Experience Every Fit.',
    desc: 'Virtual try-ons and smart styling that help you choose with confidence.',
  },
];

/**
 * HeroBrandAnimation
 *
 * Animation sequence:
 * 1. Logo fades/slides in: BELOV
 * 2. Extra text letter E appears at the end: BELOVE
 * 3. Hold for a beat
 * 4. Last E drops down and fades out
 * 5. Tagline carousel fades in and rotates
 */
const HeroBrandAnimation = () => {
  // Phases: idle → logo → belove → drop → taglines
  const [phase, setPhase] = useState('idle');
  const [activeTagline, setActiveTagline] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('logo'), 300),
      setTimeout(() => setPhase('belove'), 1800),
      setTimeout(() => setPhase('drop'), 3400),
      setTimeout(() => setPhase('taglines'), 4600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Rotate taglines
  useEffect(() => {
    if (phase !== 'taglines') return;
    const interval = setInterval(() => {
      setActiveTagline((prev) => (prev + 1) % taglines.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className={`hero-brand phase-${phase}`} role="banner" aria-label="BELOV brand animation">
      {/* ── Logo + Animated E ── */}
      <div className="hero-brand__wordmark">
        <img
          src="/full-logo.png"
          alt="BELOV — Fit That Feels Like You"
          className="hero-brand__logo"
          draggable="false"
        />
        <span className="hero-brand__e" aria-hidden="true">E</span>
      </div>

      {/* ── Tagline Carousel ── */}
      <div className="hero-brand__taglines" aria-live="polite">
        {taglines.map((item, idx) => (
          <div
            key={idx}
            className={`hero-brand__slide ${idx === activeTagline ? 'active' : ''}`}
            aria-hidden={idx !== activeTagline}
          >
            <h2 className="hero-brand__tagline-title">{item.title}</h2>
            <p className="hero-brand__tagline-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroBrandAnimation;
