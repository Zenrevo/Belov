import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

import { useAuth } from '../context/useAuth';
import { useNotifications } from '../context/useNotifications';
import { orderApi, profileApi, catalogApi } from '../lib/api';
import './BuyerProfile.css';

const BuyerProfile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notify } = useNotifications();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [recommendationSections, setRecommendationSections] = useState([]);

  const refreshRecommendations = useCallback(() => {
    catalogApi.recommendations({ perCategory: 4 })
      .then((response) => {
        const sections = response.sections || [];
        setRecommendationSections(sections);
        const firstProducts = sections.flatMap((section) => section.products || []);
        setSavedItems(firstProducts.slice(0, 3));
      })
      .catch(() => {
        setRecommendationSections([]);
        catalogApi.products().then((res) => setSavedItems((res.products || []).slice(0, 3))).catch(() => {});
      });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    profileApi.get().then(setProfile).catch(() => {});
    orderApi.list().then((response) => setOrders(response.orders || [])).catch(() => {});
    refreshRecommendations();
  }, [isAuthenticated, refreshRecommendations]);

  const handleChangeRecommendation = async (section, product) => {
    try {
      await catalogApi.recommendationChoice({
        productId: product.id,
        category: section.id || product.recommendationCategory || product.category,
        action: 'dismissed'
      });
      refreshRecommendations();
      notify({
        variant: 'info',
        title: 'Recommendation refreshed',
        message: `${product.name} will be replaced with another pick.`
      });
    } catch (err) {
      notify({
        variant: 'error',
        title: 'Could not update recommendation',
        message: err.message
      });
    }
  };

  const fit = profile?.fitProfile;
  const tryOn = profile?.tryOn;

  return (
    <div className="profile-page">
      <section className="section-sm">
        <div className="container">
          <div className="profile-header-card flex justify-between items-start">
            <div className="flex gap-6 items-center">
              {fit?.photoUrl && (
                <img src={fit.photoUrl} alt="Profile" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
              )}
              <div>
                <span className="label-caps" style={{ color: 'var(--lavender)' }}>Personal Archive</span>
                <h1 className="headline-md mt-2">Welcome Back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
                <p className="body-sm text-muted mt-2">Built for your measurements, saved looks, and try-on history.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={isAuthenticated ? '/onboarding' : '/auth?mode=login'} className="btn btn-secondary">{isAuthenticated ? 'Edit Profile' : 'Login'}</Link>
              {isAuthenticated && <button className="btn btn-ghost" onClick={logout}>Logout</button>}
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Try-On Credits */}
            <div className="dashboard-panel credits-wallet-panel">
              <div className="credits-wallet-summary">
                <span className="label-caps" style={{ color: 'var(--accent)' }}>Try-On Credits</span>
                <div className="credits-wallet-number">{tryOn?.used ?? 8}</div>
                <p className="body-sm text-muted">You've used {tryOn?.used ?? 8}/{tryOn?.limit ?? 10} free try-ons this month.</p>
              </div>
              <div className="credits-plan-grid">
                <div className="credits-plan-card">
                  <span className="plan-name">Free</span>
                  <strong>10 tries</strong>
                  <span className="plan-price">Included</span>
                </div>
                <div className="credits-plan-card featured">
                  <span className="plan-name">Basic</span>
                  <strong>50 tries</strong>
                  <span className="plan-price">₹199</span>
                </div>
                <div className="credits-plan-card">
                  <span className="plan-name">Pro</span>
                  <strong>120 tries</strong>
                  <span className="plan-price">₹399</span>
                </div>
              </div>
            </div>

            {/* Fit Signature Card */}
            <div className="dashboard-panel fit-signature">
              <div className="flex justify-between items-start">
                <div>
                  <span className="label-caps" style={{ color: 'var(--coral)' }}>Your Fit Signature</span>
                  <h2 className="headline-sm mt-2">Global Size ID</h2>
                  <p className="body-sm text-muted mt-2">Your measurements mapped across all brands.</p>
                </div>
                <div className="size-passport">
                  <span className="passport-size">{fit?.globalSizeId || '2XL'}</span>
                  <span className="label-caps-sm text-muted">Primary Size</span>
                </div>
              </div>
              <div className="measurements-grid">
                <div className="measure-item text-center">
                  <span className="measure-val" style={{ color: 'var(--coral)' }}>{fit?.bust || 96}</span>
                  <span className="label-caps-sm text-muted">{fit?.gender === 'Men' ? 'Chest (cm)' : 'Bust (cm)'}</span>
                </div>
                <div className="measure-item text-center">
                  <span className="measure-val" style={{ color: 'var(--lavender)' }}>{fit?.waist || 84}</span>
                  <span className="label-caps-sm text-muted">Waist (cm)</span>
                </div>
                <div className="measure-item text-center">
                  <span className="measure-val" style={{ color: 'var(--teal)' }}>{fit?.hips || 104}</span>
                  <span className="label-caps-sm text-muted">Hips (cm)</span>
                </div>
                <div className="measure-item text-center">
                  <span className="measure-val" style={{ color: 'var(--peach)' }}>{fit?.height || 165}</span>
                  <span className="label-caps-sm text-muted">Height (cm)</span>
                </div>
              </div>
            </div>
          </div>

          {recommendationSections.length > 0 && (
            <div className="mt-12 profile-recommendations">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="label-caps" style={{ color: 'var(--accent)' }}>Recommended For You</span>
                  <h2 className="headline-sm mt-2">Category picks</h2>
                </div>
                <Link to="/collections" className="btn btn-ghost label-caps">Browse all</Link>
              </div>
              {recommendationSections.map((section) => (
                <section className="recommendation-band" key={section.id}>
                  <div className="recommendation-band-head">
                    <div>
                      <h3>{section.category}</h3>
                      <p>{section.reason}</p>
                    </div>
                    <span>{section.products?.length || 0} picks</span>
                  </div>
                  <div className="recommendation-product-grid">
                    {(section.products || []).map((product) => (
                      <div className="recommendation-product" key={`${section.id}-${product.id}`}>
                        <ProductCard product={product} />
                        <button
                          type="button"
                          className="recommendation-change-btn"
                          onClick={() => handleChangeRecommendation(section, product)}
                        >
                          Change this pick
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Wardrobe */}
          <div className="mt-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="headline-sm">My Wardrobe</h2>
              <Link to="/collections" className="btn btn-ghost label-caps">Browse More →</Link>
            </div>
            <div className="grid grid-3">
              {savedItems.map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className="wardrobe-item card">
                  <div className="wardrobe-img">
                    <img src={p.image} alt={p.name} />
                  </div>
                  <div className="p-4">
                    <span className="label-caps-sm text-muted">{p.brand}</span>
                    <p className="body-sm mt-1">{p.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Order History */}
          <div className="mt-12">
            <h2 className="headline-sm mb-6">Order History</h2>
            <div className="order-list">
              {orders.length ? orders.map((order) => (
                <div key={order.orderId} className="order-item flex justify-between items-center p-6" style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <span className="label-caps-sm" style={{ color: 'var(--teal)' }}>Order #{order.orderId}</span>
                    <div className="profile-order-products mt-2">
                      {order.items.map((item) => (
                        <Link key={`${order.orderId}-${item.productId}`} to={`/product/${item.productId}`}>
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <p className="body-sm text-muted mt-1">Placed on {order.createdAt}</p>
                    <Link to={`/order-confirmation/${order.orderId}`} className="body-sm text-accent mt-1" style={{ display: 'inline-block', fontWeight: 700 }}>
                      Track order
                    </Link>
                  </div>
                  <div className="text-right">
                    <span className="chip chip-teal">{order.status}</span>
                    <p className="body-sm mt-2">₹{order.total.toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <div className="p-6 text-center text-muted">No orders placed yet.</div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BuyerProfile;
