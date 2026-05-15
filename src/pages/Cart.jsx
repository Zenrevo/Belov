import { Link } from 'react-router-dom';
import FitPromiseStrip from '../components/FitPromiseStrip';
import PageTagline from '../components/PageTagline';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import './Cart.css';

const Cart = () => {
  const { items: cartItems, summary, updateQuantity, removeItem, isGuestCart } = useCart();
  const { isAuthenticated } = useAuth();

  const updateQty = (item, delta) => {
    updateQuantity(item, Math.max(1, item.quantity + delta));
  };

  const subtotal = summary.subtotal;
  const shipping = summary.shipping;
  const total = summary.total;

  return (
    <div className="cart-page">
      <section className="section-sm">
        <div className="container">
          <PageTagline page="cart" />
          <FitPromiseStrip compact />

          {cartItems.length === 0 ? (
            <div className="text-center p-8">
              <p className="body-lg text-muted">Your bag is empty.</p>
              <Link to="/collections" className="btn btn-primary mt-6">Explore Collections</Link>
            </div>
          ) : (
            <div className="cart-layout">
              {/* Cart Items */}
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.cartItemId || `${item.id}-${item.selectedSize}-${item.selectedColor || item.color}`} className="cart-item flex gap-6">
                    <Link to={`/product/${item.id}`} className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </Link>
                    <div className="cart-item-info flex-1">
                      <div className="flex justify-between">
                        <div>
                          <span className="label-caps-sm text-muted">{item.brand}</span>
                          <Link to={`/product/${item.id}`} className="cart-item-title-link">
                            <h3 className="title-sm mt-1" style={{ fontSize: '1rem' }}>{item.name}</h3>
                          </Link>
                          <p className="body-sm text-muted mt-1">Size: {item.selectedSize} · Color: {item.selectedColor || item.color}</p>
                          {item.fitMatch && <p className="body-sm text-accent mt-1">{item.fitMatch}% Fit Match · {item.gender}</p>}
                        </div>
                        <button className="btn-ghost text-silver" onClick={() => removeItem(item)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="qty-control flex items-center gap-3">
                          <button className="qty-btn" onClick={() => updateQty(item, -1)}>−</button>
                          <span className="body-sm">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQty(item, 1)}>+</button>
                        </div>
                        <span className="title-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="cart-summary">
                <div className="cart-summary-inner p-6">
                  <h3 className="title-sm mb-6">Order Summary</h3>
                  <div className="summary-row flex justify-between mb-3">
                    <span className="body-sm text-muted">Subtotal</span>
                    <span className="body-sm">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="summary-row flex justify-between mb-3">
                    <span className="body-sm text-muted">Shipping</span>
                    <span className="body-sm">{shipping === 0 ? 'Complimentary' : `₹${shipping}`}</span>
                  </div>
                  <hr className="divider" style={{ margin: 'var(--space-4) 0' }} />
                  <div className="summary-row flex justify-between">
                    <span className="title-sm">Total</span>
                    <span className="title-sm">₹{total.toLocaleString()}</span>
                  </div>
                  <div className="cart-fit-note mt-6">
                    <strong>{isGuestCart ? 'Login keeps this cart' : 'Fit check included'}</strong>
                    <span>{isAuthenticated ? 'Each item keeps selected size and fit-match context attached.' : 'You can browse as guest. Login before checkout to save order history.'}</span>
                  </div>
                  <Link to="/checkout" className="btn btn-primary btn-lg w-full mt-6">Proceed to Checkout</Link>
                  <Link to="/collections" className="btn btn-ghost w-full mt-3 text-center" style={{ display: 'block' }}>Continue Shopping</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Cart;
