import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Upload, WandSparkles } from 'lucide-react';
import Footer from '../components/Footer';
import FitPromiseStrip from '../components/FitPromiseStrip';
import PageTagline from '../components/PageTagline';
import { useAuth } from '../context/useAuth';
import { apiAssetUrl, catalogApi, tryOnApi } from '../lib/api';
import './VirtualTryOn.css';

const VirtualTryOn = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [personFile, setPersonFile] = useState(null);
  const [personPreview, setPersonPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [previewMode, setPreviewMode] = useState('product');
  const [error, setError] = useState('');

  useEffect(() => {
    catalogApi.products()
      .then((response) => {
        const rows = response.products || [];
        setProducts(rows);
        if (rows.length) setSelectedProductId(rows[0].id);
      })
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => () => {
    if (personPreview.startsWith('blob:')) URL.revokeObjectURL(personPreview);
  }, [personPreview]);

  const selectedProduct = useMemo(() => (
    products.find((product) => product.id === Number(selectedProductId)) || products[0] || null
  ), [products, selectedProductId]);
  const resultImage = apiAssetUrl(result?.resultImageUrl);
  const activePreviewImage = previewMode === 'result'
    ? resultImage
    : previewMode === 'body'
      ? personPreview
      : selectedProduct?.image;

  const handlePersonSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (personPreview.startsWith('blob:')) URL.revokeObjectURL(personPreview);
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    setPreviewMode('body');
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
    if (!selectedProduct) {
      setError('Select a product before generating.');
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
      setPreviewMode('result');
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
                    setPreviewMode('product');
                    setResult(null);
                  }}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.brand} · {product.name}</option>
                  ))}
                </select>
                  <div className="studio-thumbnails">
                    <button
                      type="button"
                      className={`studio-thumb ${previewMode === 'body' ? 'active' : ''}`}
                      onClick={() => personPreview && setPreviewMode('body')}
                    >
                      <img src={personPreview || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"} alt="Selected body" />
                    </button>
                    <button
                      type="button"
                      className={`studio-thumb ${previewMode === 'product' ? 'active' : ''}`}
                      onClick={() => setPreviewMode('product')}
                    >
                      <img src={selectedProduct?.image || "https://images.unsplash.com/photo-1523381235312-da596d221f22?w=800&q=80"} alt={selectedProduct?.name || 'Selected product'} />
                    </button>
                  <label className="studio-thumb add">
                    <Upload size={22} />
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePersonSelect} hidden />
                  </label>
                </div>
                <div className="tryon-preview-tabs" aria-label="Preview mode">
                  <button
                    type="button"
                    className={previewMode === 'product' ? 'active' : ''}
                    onClick={() => setPreviewMode('product')}
                  >
                    Product
                  </button>
                  <button
                    type="button"
                    className={previewMode === 'body' ? 'active' : ''}
                    disabled={!personPreview}
                    onClick={() => setPreviewMode('body')}
                  >
                    Body
                  </button>
                  <button
                    type="button"
                    className={previewMode === 'result' ? 'active' : ''}
                    disabled={!resultImage}
                    onClick={() => setPreviewMode('result')}
                  >
                    Result
                  </button>
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
                      <img src={activePreviewImage} alt={previewMode === 'product' ? selectedProduct?.name : previewMode === 'body' ? 'Selected body' : 'Try-on result'} className="visualization-img" />
                      <div className="visualization-badge">
                        {previewMode === 'result'
                          ? `✦ ${result?.fitMatch || selectedProduct.fitMatch}% Fit Certainty`
                          : previewMode === 'product'
                            ? selectedProduct?.name
                            : 'Body photo'}
                      </div>
                    </>
                  ) : activePreviewImage ? (
                    <>
                      <img src={activePreviewImage} alt={previewMode === 'product' ? selectedProduct?.name : 'Selected body'} className="visualization-img" />
                      <div className="visualization-badge">
                        {previewMode === 'product' ? selectedProduct?.name : 'Body photo'}
                      </div>
                    </>
                  ) : (
                    <div className="visualization-placeholder">
                      <Sparkles size={48} className="text-muted opacity-20" />
                      <p className="mt-4">Select a product and photo to start the session</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="tryon-controls-card">
                <h3 className="label-caps mb-4">Selected piece</h3>
                {selectedProduct ? (
                  <>
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
                  </>
                ) : (
                  <p className="text-muted text-sm">Select a product to view details</p>
                )}
              </div>
            </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default VirtualTryOn;
