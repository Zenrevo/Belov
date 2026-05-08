import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Collections from './pages/Collections';
import ProductDetail from './pages/ProductDetail';
import Onboarding from './pages/Onboarding';
import BuyerProfile from './pages/BuyerProfile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import SellerDashboard from './pages/SellerDashboard';
import NotFound from './pages/NotFound';
import VirtualTryOn from './pages/VirtualTryOn';
import Auth from './pages/Auth';
import VirtualTryOnModal from './components/VirtualTryOnModal';
import { TryOnProvider } from './context/TryOnContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import SplashScreen from './components/SplashScreen';
import FitPulse from './components/FitPulse';
import { useState } from 'react';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      <CartProvider>
        <TryOnProvider>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
          <Router>
            <div className="app-container">
              <Navbar />
              <VirtualTryOnModal />
              <FitPulse />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/profile" element={<BuyerProfile />} />
                  <Route path="/tryon" element={<VirtualTryOn />} />
                  <Route path="/try-on" element={<VirtualTryOn />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </Router>
        </TryOnProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
