import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import PageTagline from '../components/PageTagline';
import { orderApi } from '../lib/api';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const { orderId } = useParams();
  const [trackedOrder, setTrackedOrder] = useState(state?.order || null);
  const order = trackedOrder;
  const items = order?.items || [
    { name: 'Draped Silk Blouse', selectedSize: '2XL', brand: 'BELOV Atelier' },
    { name: 'Structured Wool Blazer', selectedSize: '3XL', brand: 'BELOV Atelier' }
  ];

  useEffect(() => {
    if (!orderId || state?.order) return;
    orderApi.get(orderId)
      .then(setTrackedOrder)
      .catch(() => {});
  }, [orderId, state?.order]);

  return (
    <div className="confirmation-page">
      <div className="container-narrow text-center">
        <PageTagline page="confirmation" compact />
        <div className="confirmation-content animate-fade-in-up">
          {/* Success Icon */}
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="8 12 11 15 16 9"/>
            </svg>
          </div>

          <h1 className="headline-md mt-6">Order Confirmed</h1>
          <p className="body-lg text-muted mt-3">
            Thank you for choosing BELOV. Your pieces are being prepared with care.
          </p>

          {/* Order Details */}
          <div className="order-card card-glass p-8 mt-8" style={{ textAlign: 'left' }}>
            <div className="flex justify-between items-start">
              <div>
                <span className="label-caps text-accent">Order Number</span>
                <p className="headline-sm mt-1">#{order?.orderId || 'BLV-2026-0848'}</p>
              </div>
              <span className="chip-gold">Confirmed</span>
            </div>
            <hr className="divider" />
            <div className="grid grid-3 gap-6">
              <div>
                <span className="label-caps-sm text-muted">Estimated Delivery</span>
                <p className="body-sm mt-1">{order?.estimatedDelivery || 'May 5 - May 7, 2026'}</p>
              </div>
              <div>
                <span className="label-caps-sm text-muted">Delivery Method</span>
                <p className="body-sm mt-1">{order?.deliveryMethod || 'Standard'} · Carbon Neutral</p>
              </div>
              <div>
                <span className="label-caps-sm text-muted">Total</span>
                <p className="body-sm mt-1">₹{(order?.total || 12498).toLocaleString()}</p>
              </div>
            </div>
            <hr className="divider" />
            <div>
              <span className="label-caps-sm text-muted">Items</span>
              {items.map((item) => (
                <p key={`${item.name}-${item.selectedSize}`} className="body-sm mt-1">
                  {item.name} ({item.selectedSize}, {item.brand})
                </p>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center mt-8">
            <Link to={order?.orderId ? `/order-confirmation/${order.orderId}` : '/profile'} className="btn btn-primary btn-lg">Track Your Order</Link>
            <Link to="/collections" className="btn btn-secondary btn-lg">Continue Shopping</Link>
          </div>

          <p className="body-sm text-muted mt-6">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
