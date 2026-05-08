import { Link } from 'react-router-dom';
import { useTryOn } from '../context/TryOnContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { openTryOn } = useTryOn();
  
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card" id={`product-${product.id}`}>
      <Link to={`/product/${product.id}`} className="product-card-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.fitMatch && (
          <span className="fit-badge chip-gold">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            {product.fitMatch}% Fit
          </span>
        )}
        {/* Quick actions on hover */}
        <div className="product-card-actions">
          <div className="ai-insight-overlay">
            <span className="text-[10px] font-bold tracking-tighter opacity-70">AI JUSTIFICATION</span>
            <p className="text-[11px] leading-tight font-medium mt-1">Drapes perfectly on athletic frames</p>
          </div>
          <button 
            className="btn btn-sm try-on-quick" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openTryOn(product);
            }}
          >
            Try On
          </button>
        </div>
      </Link>
      <Link to={`/product/${product.id}`} className="product-card-info">
        <div className="product-card-topline">
          <span className="product-card-brand">{product.brand}</span>
          {product.gender && <span className="product-card-gender">{product.gender}</span>}
        </div>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price flex items-center gap-2">
          <span className="price-current">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <>
              <span className="price-original">₹{product.originalPrice.toLocaleString()}</span>
              <span className="price-discount">{discount}% OFF</span>
            </>
          )}
        </div>
        {product.rating && (
          <div className="product-card-rating">
            <span className="rating-badge">★ {product.rating}</span>
            <span className="rating-count">({product.reviews})</span>
          </div>
        )}
        {product.sizes && (
          <p className="product-card-sizes">Sizes: {product.sizes.join(', ')}</p>
        )}
      </Link>
    </div>
  );
};

export default ProductCard;
