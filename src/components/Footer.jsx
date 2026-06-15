import { Link } from 'react-router-dom';
import './Footer.css';

const VENDOR_PORTAL_URL = import.meta.env.VITE_VENDOR_PORTAL_URL || 'http://localhost:5175';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="footer-brand">BELOV</h3>
            <p className="body-sm text-muted mt-3">
              Fit Intelligence for every body. We believe fashion should celebrate 
              who you are, not who you're expected to be.
            </p>
          </div>
          <div className="footer-col">
            <h4 className="label-caps mb-4">The House</h4>
            <ul className="footer-links">
              <li><Link to="/">The Manifesto</Link></li>
              <li><Link to="/">Size Inclusivity</Link></li>
              <li><Link to="/">Sustainability</Link></li>
              <li><Link to="/">Concierge</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="label-caps mb-4">Discover</h4>
            <ul className="footer-links">
              <li><Link to="/collections">Collections</Link></li>
              <li><Link to="/try-on">Virtual Try-On</Link></li>
              <li><Link to="/onboarding">Fit Profile</Link></li>
              <li><a href={VENDOR_PORTAL_URL} target="_blank" rel="noreferrer">Sell on BELOV</a></li>
              <li><Link to="/seller">Seller metrics (demo)</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="label-caps mb-4">Connect</h4>
            <ul className="footer-links">
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Pinterest</a></li>
              <li><a href="#">support@belov.in</a></li>
            </ul>
          </div>
        </div>
        <hr className="divider" />
        <div className="footer-bottom flex justify-between items-center">
          <p className="body-sm text-silver">© 2026 BELOV. All rights reserved.</p>
          <p className="body-sm text-silver">Crafted with Fit Intelligence™</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
