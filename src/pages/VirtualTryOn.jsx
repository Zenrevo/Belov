import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Upload, WandSparkles } from 'lucide-react';
import Footer from '../components/Footer';
import FitPromiseStrip from '../components/FitPromiseStrip';
import PageTagline from '../components/PageTagline';
import { useAuth } from '../context/useAuth';
import { products as fallbackProducts } from '../data/products';
import { apiAssetUrl, catalogApi, tryOnApi } from '../lib/api';
import './VirtualTryOn.css';

const VirtualTryOn = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState(fallbackProducts);
  const [selectedProductId, setSelectedProductId] = useState(fallbackProducts[0]?.id || 1);
  const [personFile, setPersonFile] = useState(null);
  const [personPreview, setPersonPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    catalogApi.products()
      .then((response) => {
        const rows = response.products?.length ? response.products : fallbackProducts;
        setProducts(rows);
        setSelectedProductId(rows[0]?.id || 1);
      })
      .catch(() => setProducts(fallbackProducts));
  }, []);

  useEffect(() => () => {
    if (personPreview.startsWith('blob:')) URL.revokeObjectURL(personPreview);
  }, [personPreview]);

  const selectedProduct = useMemo(() => (
    products.find((product) => product.id === Number(selectedProductId)) || products[0] || fallbackProducts[0]
  ), [products, selectedProductId]);
  const resultImage = apiAssetUrl(result?.resultImageUrl);

  const handlePersonSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (personPreview.startsWith('blob:')) URL.revokeObjectURL(personPreview);
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setError('Login is required for Vertex try-on.');
      return;
    }
    if (!personFile) {
      setError('Upload a body photo before generating.');
      return;
    }

    setError('');
    setIsProcessing(true);
    try {
      const response = await tryOnApi.create({
        productId: selectedProduct.id,
        personImage: personFile,
        numberOfImages: 1
      });
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tryon-page">
      <section className="section-sm">
        <div className="container">
          <PageTagline page="tryon" />
          <FitPromiseStrip compact />
        </div>

        <div className="container">
            <div className="tryon-main-content">
              {/* Studio Selection */}
              <div className="tryon-studio-card">
                <h3 className="label-caps mb-4">Your AI Studio</h3>
                <select
                  className="tryon-product-select"
                  value={selectedProductId}
                  onChange={(event) => {
                    setSelectedProductId(event.target.value);
                    setResult(null);
                  }}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.brand} · {product.name}</option>
                  ))}
                </select>
                <div className="studio-thumbnails">
                  <div className="studio-thumb active"><img src={personPreview || (selectedProduct?.gender === 'Men' ? '/images/plus_size_shirt_1777572022906.png' : '/images/hero.png')} alt="Angle 1" /></div>
                  <div className="studio-thumb"><img src={selectedProduct.image} alt={selectedProduct.name} /></div>
                  <label className="studio-thumb add">
                    <Upload size={22} />
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePersonSelect} hidden />
                  </label>
                </div>
                <button className="btn btn-luxury-primary w-full mt-6" onClick={handleGenerate} disabled={isProcessing}>
                  <WandSparkles size={16} />
                  {isProcessing ? 'Generating...' : 'Run Virtual Try-On'}
                </button>
                {error && <p className="tryon-error">{error}</p>}
              </div>

              {/* Visualization */}
              <div className="tryon-visualization">
                <div className="visualization-container">
                  {isProcessing ? (
                    <div className="loading-overlay">
                      <div className="vto-spinner" />
                      <p className="mt-4 animate-pulse">Analyzing body geometry...</p>
                    </div>
                  ) : resultImage ? (
                    <>
                      <img src={resultImage} alt="Try-On" className="visualization-img" />
                      <div className="visualization-badge">✦ {result?.fitMatch || selectedProduct.fitMatch}% Fit Certainty</div>
                    </>
                  ) : personPreview ? (
                    <>
                      <img src={personPreview} alt="Selected body" className="visualization-img" />
                      <div className="visualization-badge">{selectedProduct.name}</div>
                    </>
                  ) : (
                    <div className="visualization-placeholder">
                      <Sparkles size={48} className="text-muted opacity-20" />
                      <p className="mt-4">Select a photo to start the session</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="tryon-controls-card">
                <h3 className="label-caps mb-4">Selected piece</h3>
                <div className="tryon-product-summary">
                  <img src={selectedProduct.image} alt={selectedProduct.name} />
                  <div>
                    <span>{selectedProduct.brand}</span>
                    <strong>{selectedProduct.name}</strong>
                    <p>Size {selectedProduct.recommendedSize} · {selectedProduct.fitMatch}% fit</p>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to={`/product/${selectedProduct.id}`} className="btn btn-luxury-outline w-full mb-3">View product</Link>
                  <Link to="/collections" className="btn btn-luxury-primary w-full">Explore more</Link>
                </div>
              </div>
            </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default VirtualTryOn;
