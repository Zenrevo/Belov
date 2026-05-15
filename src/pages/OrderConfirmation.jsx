import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, Clock, MapPin, PackageCheck, ReceiptText, Truck } from 'lucide-react';
import PageTagline from '../components/PageTagline';
import { useNotifications } from '../context/useNotifications';
import { orderApi } from '../lib/api';
import './OrderConfirmation.css';

const statusSteps = [
  {
    status: 'Confirmed',
    title: 'Order confirmed',
    detail: 'Payment and bag details are locked.'
  },
  {
    status: 'Fit checked',
    title: 'Fit checked',
    detail: 'Selected sizes and colors are being verified.'
  },
  {
    status: 'Packed',
    title: 'Packed',
    detail: 'Products are packed with the order invoice.'
  },
  {
    status: 'Shipped',
    title: 'Shipped',
    detail: 'Shipment is moving toward your delivery city.'
  },
  {
    status: 'Out for delivery',
    title: 'Out for delivery',
    detail: 'Courier is on the way to your address.'
  },
  {
    status: 'Delivered',
    title: 'Delivered',
    detail: 'Order has reached you.'
  }
];

const formatMoney = (value = 0) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const formatDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatLabel = (value = '') => (
  value
    ? String(value).replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'Not available'
);

const getActiveStepIndex = (status = 'Confirmed') => {
  const normalized = status.toLowerCase();
  const index = statusSteps.findIndex((step) => normalized.includes(step.status.toLowerCase()));
  return index >= 0 ? index : 0;
};

const OrderConfirmation = () => {
  const { state } = useLocation();
  const { orderId } = useParams();
  const { notify } = useNotifications();
  const [trackedOrder, setTrackedOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(Boolean(orderId && !state?.order));
  const [error, setError] = useState('');
  const order = trackedOrder;
  const items = order?.items || [];
  const activeStepIndex = useMemo(() => getActiveStepIndex(order?.status), [order?.status]);
  const address = order?.shippingAddress || {};

  useEffect(() => {
    if (!orderId || state?.order) return;

    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setLoading(true);
      setError('');
    });
    orderApi.get(orderId)
      .then((response) => {
        if (active) setTrackedOrder(response);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        notify({
          variant: 'error',
          title: 'Order tracking unavailable',
          message: err.message
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [orderId, state?.order, notify]);

  if (loading) {
    return (
      <div className="confirmation-page order-tracking-page">
        <div className="container order-tracking-container">
          <PageTagline page="confirmation" compact />
          <div className="tracking-empty-state">
            <Clock size={28} />
            <h1>Loading order tracking...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="confirmation-page order-tracking-page">
        <div className="container order-tracking-container">
          <PageTagline page="confirmation" compact />
          <div className="tracking-empty-state">
            <ReceiptText size={30} />
            <h1>{error ? 'Order not found' : 'No order selected'}</h1>
            <p>{error || 'Open an order from your profile to track its latest status.'}</p>
            <div className="tracking-actions">
              <Link to="/profile" className="btn btn-primary">Go to profile</Link>
              <Link to="/collections" className="btn btn-secondary">Continue shopping</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page order-tracking-page">
      <div className="container order-tracking-container">
        <PageTagline page="confirmation" compact />

        <section className="tracking-hero animate-fade-in-up">
          <div>
            <span className="label-caps text-accent">Order tracking</span>
            <h1>Order #{order.orderId}</h1>
            <p>
              {items.length} {items.length === 1 ? 'product' : 'products'} being prepared for
              {' '}{address.city || 'your address'}.
            </p>
          </div>
          <div className="tracking-status-card">
            <PackageCheck size={26} />
            <span>Status</span>
            <strong>{order.status}</strong>
            <em>Updated {formatDate(order.createdAt)}</em>
          </div>
        </section>

        <section className="tracking-grid">
          <div className="tracking-panel tracking-timeline-panel">
            <div className="tracking-panel-head">
              <span className="label-caps text-accent">Live status</span>
              <h2>Fulfilment timeline</h2>
            </div>
            <div className="tracking-timeline">
              {statusSteps.map((step, index) => {
                const isDone = index <= activeStepIndex;
                const isCurrent = index === activeStepIndex;
                const Icon = isDone ? CheckCircle2 : Circle;
                return (
                  <div className={`tracking-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`} key={step.status}>
                    <span className="tracking-step-icon">
                      <Icon size={18} />
                    </span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="tracking-panel tracking-summary-panel">
            <div className="tracking-summary-row">
              <ReceiptText size={18} />
              <div>
                <span>Total paid</span>
                <strong>{formatMoney(order.total)}</strong>
              </div>
            </div>
            <div className="tracking-summary-row">
              <Truck size={18} />
              <div>
                <span>Delivery</span>
                <strong>{formatLabel(order.deliveryMethod)}</strong>
                <small>{order.estimatedDelivery}</small>
              </div>
            </div>
            <div className="tracking-summary-row">
              <Clock size={18} />
              <div>
                <span>Payment</span>
                <strong>{formatLabel(order.paymentMethod)}</strong>
                <small>Subtotal {formatMoney(order.subtotal)} · Shipping {formatMoney(order.shipping)}</small>
              </div>
            </div>
            <div className="tracking-summary-row">
              <MapPin size={18} />
              <div>
                <span>Ship to</span>
                <strong>{address.name}</strong>
                <small>
                  {[address.addressLine1, address.addressLine2, address.city, address.state, address.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </small>
              </div>
            </div>
          </aside>
        </section>

        <section className="tracking-panel tracking-products-panel">
          <div className="tracking-panel-head">
            <span className="label-caps text-accent">Product details</span>
            <h2>Items in this order</h2>
          </div>
          <div className="tracking-product-list">
            {items.map((item) => (
              <Link
                key={`${item.productId}-${item.selectedSize}-${item.selectedColor || item.color || ''}`}
                to={`/product/${item.productId}`}
                className="tracking-product-card"
              >
                <span className="tracking-product-image">
                  {item.image ? <img src={item.image} alt={item.name} /> : <PackageCheck size={24} />}
                </span>
                <span className="tracking-product-copy">
                  <small>{item.brand}</small>
                  <strong>{item.name}</strong>
                  <em>{[item.category, item.subcategory].filter(Boolean).join(' · ')}</em>
                  <span>
                    Size {item.selectedSize}
                    {item.recommendedSize ? ` · Recommended ${item.recommendedSize}` : ''}
                    {item.selectedColor || item.color ? ` · ${item.selectedColor || item.color}` : ''}
                  </span>
                </span>
                <span className="tracking-product-meta">
                  <strong>{formatMoney(item.unitPrice * item.quantity)}</strong>
                  <small>Qty {item.quantity}</small>
                  {item.fitMatch && <em>{item.fitMatch}% fit</em>}
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <div className="tracking-actions">
          <Link to="/profile" className="btn btn-primary btn-lg">View all orders</Link>
          <Link to="/collections" className="btn btn-secondary btn-lg">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
