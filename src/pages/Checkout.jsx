import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTagline from '../components/PageTagline';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import { orderApi } from '../lib/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState('standard');
  const [payment, setPayment] = useState('card');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const { items: cartItems, summary, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (!user) return;
    Promise.resolve().then(() => {
      setForm(prev => ({
        ...prev,
        firstName: prev.firstName || user.name?.split(' ')[0] || '',
        lastName: prev.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    });
  }, [user]);

  const subtotal = summary.subtotal;
  const shipping = delivery === 'express' ? 499 : 0;
  const total = subtotal + shipping;

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
      return;
    }

    setError('');
    setPlacingOrder(true);
    try {
      const order = await orderApi.create({
        ...form,
        deliveryMethod: delivery,
        paymentMethod: payment
      });
      await refreshCart();
      navigate(`/order-confirmation/${order.orderId}`, { state: { order } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="checkout-page">
      <section className="section-sm">
        <div className="container">
          <PageTagline page="checkout" />

          <div className="checkout-layout">
            {/* Left: Form Steps */}
            <div className="checkout-form">
              {/* Step 1: Contact */}
              <div className="checkout-section">
                <h3 className="title-sm flex items-center gap-2">
                  <span className="step-num" style={{ background: 'var(--gradient-coral)' }}>1</span> Contact Information
                </h3>
                <div className="checkout-fields mt-4">
                  <div className="field-row grid grid-2 gap-4">
                    <div>
                      <label className="input-label">First Name</label>
                      <input type="text" className="input-filled" placeholder="Enter first name" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
                    </div>
                    <div>
                      <label className="input-label">Last Name</label>
                      <input type="text" className="input-filled" placeholder="Enter last name" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="input-label">Email</label>
                    <input type="email" className="input-filled" placeholder="you@email.com" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
                  </div>
                  <div className="mt-4">
                    <label className="input-label">Phone</label>
                    <input type="tel" className="input-filled" placeholder="+91 98765 43210" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery */}
              <div className="checkout-section mt-8">
                <h3 className="title-sm flex items-center gap-2">
                  <span className="step-num" style={{ background: 'var(--gradient-lavender)' }}>2</span> Delivery Method
                </h3>
                <div className="delivery-options mt-4">
                  <button
                    className={`delivery-option ${delivery === 'standard' ? 'active' : ''}`}
                    onClick={() => setDelivery('standard')}
                  >
                    <div>
                      <span className="body-sm" style={{ fontWeight: 600 }}>Standard Delivery</span>
                      <p className="body-sm text-muted">3–5 business days · Carbon neutral</p>
                    </div>
                    <span className="body-sm" style={{ fontWeight: 600 }}>Free</span>
                  </button>
                  <button
                    className={`delivery-option ${delivery === 'express' ? 'active' : ''}`}
                    onClick={() => setDelivery('express')}
                  >
                    <div>
                      <span className="body-sm" style={{ fontWeight: 600 }}>White Glove Express</span>
                      <p className="body-sm text-muted">Next day · Garments arrive pressed on hangers</p>
                    </div>
                    <span className="body-sm" style={{ fontWeight: 600 }}>₹499</span>
                  </button>
                </div>
              </div>

              {/* Step 3: Address */}
              <div className="checkout-section mt-8">
                <h3 className="title-sm flex items-center gap-2">
                  <span className="step-num" style={{ background: 'var(--gradient-teal)' }}>3</span> Shipping Address
                </h3>
                <div className="checkout-fields mt-4">
                  <div>
                    <label className="input-label">Address Line 1</label>
                    <input type="text" className="input-filled" placeholder="House/flat number, street" value={form.addressLine1} onChange={(event) => updateField('addressLine1', event.target.value)} />
                  </div>
                  <div className="mt-4">
                    <label className="input-label">Address Line 2</label>
                    <input type="text" className="input-filled" placeholder="Landmark, area" value={form.addressLine2} onChange={(event) => updateField('addressLine2', event.target.value)} />
                  </div>
                  <div className="field-row grid grid-3 gap-4 mt-4">
                    <div>
                      <label className="input-label">City</label>
                      <input type="text" className="input-filled" placeholder="City" value={form.city} onChange={(event) => updateField('city', event.target.value)} />
                    </div>
                    <div>
                      <label className="input-label">State</label>
                      <input type="text" className="input-filled" placeholder="State" value={form.state} onChange={(event) => updateField('state', event.target.value)} />
                    </div>
                    <div>
                      <label className="input-label">Pincode</label>
                      <input type="text" className="input-filled" placeholder="560001" value={form.pincode} onChange={(event) => updateField('pincode', event.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Payment */}
              <div className="checkout-section mt-8">
                <h3 className="title-sm flex items-center gap-2">
                  <span className="step-num" style={{ background: 'var(--gradient-peach)' }}>4</span> Payment
                </h3>
                <div className="payment-options mt-4 flex gap-3">
                  <button className={`chip ${payment === 'card' ? 'active' : ''}`} onClick={() => setPayment('card')}>Card</button>
                  <button className={`chip ${payment === 'upi' ? 'active' : ''}`} onClick={() => setPayment('upi')}>UPI</button>
                  <button className={`chip ${payment === 'cod' ? 'active' : ''}`} onClick={() => setPayment('cod')}>Cash on Delivery</button>
                </div>
                {payment === 'card' && (
                  <div className="checkout-fields mt-4">
                    <div>
                      <label className="input-label">Card Number</label>
                      <input type="text" className="input-filled" placeholder="4242 4242 4242 4242" />
                    </div>
                    <div className="field-row grid grid-2 gap-4 mt-4">
                      <div>
                        <label className="input-label">Expiry</label>
                        <input type="text" className="input-filled" placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="input-label">CVV</label>
                        <input type="text" className="input-filled" placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && <p className="checkout-care-note" style={{ color: 'var(--error)' }}>{error}</p>}
              <button className="btn btn-gold btn-lg w-full mt-8" onClick={handlePlaceOrder} disabled={placingOrder || cartItems.length === 0}>
                {placingOrder ? 'Placing order...' : `${isAuthenticated ? 'Place Order' : 'Login to Checkout'} · ₹${total.toLocaleString()}`}
              </button>
              <p className="checkout-care-note">
                Your selections are reserved for the next 15 minutes with your fit profile attached.
              </p>
            </div>

            {/* Right: Order Summary */}
            <aside className="checkout-sidebar">
              <div className="checkout-sidebar-inner p-6">
                <h3 className="title-sm mb-6">Your Selection</h3>
                {cartItems.map(item => (
                  <div key={item.id} className="checkout-item flex gap-4 mb-4">
                    <div className="checkout-item-img">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-1">
                      <p className="body-sm" style={{ fontWeight: 500 }}>{item.name}</p>
                      <p className="body-sm text-muted">Size: {item.selectedSize} · {item.color}</p>
                      <p className="body-sm mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <hr className="divider" style={{ margin: 'var(--space-4) 0' }} />
                <div className="flex justify-between mb-2">
                  <span className="body-sm text-muted">Subtotal</span>
                  <span className="body-sm">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="body-sm text-muted">Shipping</span>
                  <span className="body-sm">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <hr className="divider" style={{ margin: 'var(--space-4) 0' }} />
                <div className="flex justify-between">
                  <span className="title-sm">Total</span>
                  <span className="title-sm">₹{total.toLocaleString()}</span>
                </div>
                <div className="checkout-fit-receipt mt-6">
                  <span>Fit receipt</span>
                  <p>2 selected sizes, 96% average fit match, carbon-neutral standard delivery.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Checkout;
