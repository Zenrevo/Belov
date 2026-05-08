import { useEffect, useState } from 'react';
import './LogoAnimation.css';

const taglines = [
  { title: "Emotional Connection", desc: "Fashion that resonates with your personal story." },
  { title: "Exquisite Fit", desc: "AI-driven precision for every unique curve." },
  { title: "Effortless Curation", desc: "Your digital atelier, tailored to your vibe." },
  { title: "Empowered Confidence", desc: "Designed for the bold, the beautiful, and the real." },
  { title: "Evolutionary Style", desc: "The next generation of inclusive fashion." }
];

const LogoAnimation = () => {
  const [phase, setPhase] = useState('initial'); // initial -> reveal -> belove -> drop -> taglines
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    // Show Logo
    const timer1 = setTimeout(() => setPhase('reveal'), 200);
    // Append E
    const timer2 = setTimeout(() => setPhase('belove'), 1500);
    // Drop E
    const timer3 = setTimeout(() => setPhase('drop'), 2800);
    // Show Taglines
    const timer4 = setTimeout(() => setPhase('taglines'), 3800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'taglines') return undefined;
    
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className={`logo-reveal-container phase-${phase}`}>
      <div className="logo-main-row flex items-end">
        <div className="logo-img-wrapper">
          <img src="/full-logo.png" alt="BELOV" className="brand-logo-img" />
        </div>
        <span className="logo-char char-e-drop">E</span>
      </div>
      
      <div className="tagline-carousel">
        {taglines.map((item, idx) => (
          <div 
            key={idx} 
            className={`tagline-item ${idx === taglineIndex ? 'active' : ''}`}
          >
            <h3 className="tagline-title">
              <span className="text-accent">{item.title.charAt(0)}</span>
              {item.title.slice(1)}
            </h3>
            <p className="tagline-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoAnimation;
