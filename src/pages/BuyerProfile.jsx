import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

import { useAuth } from '../context/useAuth';
import { orderApi, profileApi } from '../lib/api';
import { products } from '../data/products';
import './BuyerProfile.css';

const BuyerProfile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const savedItems = products.slice(0, 3);

  useEffect(() => {
    if (!isAuthenticated) return;
    profileApi.get().then(setProfile).catch(() => {});
    orderApi.list().then((response) => setOrders(response.orders || [])).catch(() => {});
  }, [isAuthenticated]);

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
                  <span className="label-caps-sm text-muted">{profile?.gender === 'Men' ? 'Chest (cm)' : 'Bust (cm)'}</span>
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
              {(orders.length ? orders : [{
                orderId: 'BLV-2026-0847',
                items: [{ name: 'Draped Silk Blouse' }, { name: 'Structured Wool Blazer' }],
                createdAt: '28 Apr 2026',
                status: 'Delivered',
                total: 12498
              }]).map((order) => (
                <div key={order.orderId} className="order-item flex justify-between items-center p-6" style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <span className="label-caps-sm" style={{ color: 'var(--teal)' }}>Order #{order.orderId}</span>
                    <p className="body-sm mt-1">{order.items.map((item) => item.name).join(', ')}</p>
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
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BuyerProfile;
