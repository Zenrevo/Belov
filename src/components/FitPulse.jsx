import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Ruler, User, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { catalogApi, profileApi } from '../lib/api';
import './FitPulse.css';

const hasCompleteFitProfile = (fit) => (
  Boolean(fit?.gender && fit?.bodyType && fit?.height && fit?.favoriteCategories?.length)
);

const buildInsight = (fit, topProduct) => {
  const tags = fit?.personaTags || [];
  if (topProduct && tags.length) {
    return `${topProduct.name} from ${topProduct.brand} is a strong match for your ${tags[0].toLowerCase()} profile.`;
  }
  if (topProduct) {
    return `${topProduct.name} · ${topProduct.brand} — ${topProduct.fitMatch}% fit for your saved measurements.`;
  }
  const categories = fit?.favoriteCategories || [];
  if (categories.length) {
    return `Browsing is ranked for ${categories.slice(0, 2).join(' & ')} in size ${fit?.globalSizeId || 'your profile'}.`;
  }
  return 'Explore collections ranked from your fit profile.';
};

const FitPulse = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [topProduct, setTopProduct] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setTopProduct(null);
      return undefined;
    }

    let active = true;
    setLoading(true);

    Promise.all([
      profileApi.get().catch(() => null),
      catalogApi.products().catch(() => ({ products: [] }))
    ])
      .then(([profileResponse, productResponse]) => {
        if (!active) return;
        setProfile(profileResponse);
        const products = productResponse?.products || [];
        const best = products.reduce(
          (current, item) => (item.fitMatch > (current?.fitMatch ?? 0) ? item : current),
          products[0] || null
        );
        setTopProduct(best);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [isAuthenticated]);

  const fit = profile?.fitProfile;
  const tryOn = profile?.tryOn;
  const profileReady = hasCompleteFitProfile(fit);

  const topMatch = topProduct?.fitMatch ?? 0;
  const tryOnRemaining = Math.max(0, (tryOn?.limit ?? 10) - (tryOn?.used ?? 0));
  const tryOnLimit = tryOn?.limit ?? 10;

  const insight = useMemo(() => buildInsight(fit, topProduct), [fit, topProduct]);

  if (authLoading || !isAuthenticated || !profileReady) {
    return null;
  }

  const toggleLabel = loading ? '…' : `${topMatch}%`;

  return (
    <div className={`fit-pulse-container ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        className="fit-pulse-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="fit-pulse-panel"
      >
        <div className={`pulse-dot ${loading ? 'calibrating' : ''}`} />
        <Activity size={18} aria-hidden="true" />
        <span className="pulse-score">{toggleLabel}</span>
      </button>

      <div className="fit-pulse-panel" id="fit-pulse-panel" role="region" aria-label="Fit snapshot">
        <div className="pulse-header">
          <div className="flex items-center gap-3">
            <div className="pulse-avatar">
              <User size={16} aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Your fit snapshot</h4>
              <p className="text-[10px] text-muted-foreground">
                Size {fit?.globalSizeId || '—'} · {fit?.bodyType || 'Profile active'}
              </p>
            </div>
          </div>
          <button type="button" className="pulse-close" onClick={() => setIsOpen(false)} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="pulse-content">
          <div className="pulse-stat">
            <div className="pulse-stat-info">
              <span>Best catalog match</span>
              <strong>{loading ? '…' : `${topMatch}%`}</strong>
            </div>
            <div className="pulse-bar">
              <div className="pulse-bar-fill" style={{ width: loading ? '0%' : `${topMatch}%` }} />
            </div>
          </div>

          <div className="pulse-stat mt-4">
            <div className="pulse-stat-info">
              <span>Try-ons left</span>
              <strong>{tryOnRemaining}/{tryOnLimit}</strong>
            </div>
          </div>

          <div className="pulse-insight mt-4">
            <Ruler size={16} className="text-teal" aria-hidden="true" />
            <p>{loading ? 'Loading your ranked picks…' : insight}</p>
          </div>

          <div className="pulse-actions mt-6 flex flex-col gap-2">
            {topProduct && (
              <Link to={`/product/${topProduct.id}`} className="btn btn-luxury-outline w-full text-xs py-2">
                View top match
              </Link>
            )}
            <Link to="/profile" className="btn btn-luxury-primary w-full text-xs py-2">
              Open fit profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitPulse;
