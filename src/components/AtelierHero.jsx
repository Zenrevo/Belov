import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroBrandAnimation from './HeroBrandAnimation';
import './AtelierHero.css';

const AtelierHero = () => {
  return (
    <section className="atelier-hero">
      <div className="atelier-hero-bg">
        <div className="atelier-overlay"></div>
        <img src="/images/hero.png" alt="Atelier Experience" className="hero-parallax-img" />
      </div>
      
      <div className="atelier-content">
        <div className="container">
          <HeroBrandAnimation />
          
          <div className="atelier-actions animate-fade-in-up delay-2">
            <Link to="/collections" className="btn btn-luxury-primary btn-lg">
              Explore Collection <ArrowRight size={18} className="ml-2" />
            </Link>
            <button className="atelier-play-btn">
              <span className="play-icon"><Play size={16} fill="currentColor" /></span>
              <span>Watch the Runway</span>
            </button>
          </div>
        </div>
      </div>

      <div className="atelier-scroll-hint">
        <div className="scroll-line"></div>
        <span>Scroll to Explore</span>
      </div>
    </section>
  );
};

export default AtelierHero;
